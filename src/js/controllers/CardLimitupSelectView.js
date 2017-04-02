define([
	"models/PcREC",
	"models/Mate",
	"controllers/CardPage",
""],function(PcREC,Mate,CardPage){
	 
	/*
	* 限界突破合成画面
	*/
	
	var cardPage = new CardPage();
	
	// ベースのモンスターを外せないようにreturnする
	var MemberView   = cardPage.MemberView.extend({
		tapMember:function(){
			if(this.model.id == 0){ return }
			cardPage.MemberView.prototype.tapMember.call(this);
		},
		tapRemove:function(){
			if(this.model.id == 0){ return }
			cardPage.MemberView.prototype.tapRemove.call(this);
		},
		response:function(data){
			var res = {
				selected:0,
				fav:0,
			}
			res = _.extend(res,data);
			return res;
		},
		render:function(){
			var data = this.model.attributes.data;
			if(this.model.id==0){
				if( this.model.get("isEmpty") ){
					this.$el.html( '<div class="member card_bg card_bg_m '+this.addTargetClass()+'"></div>');
				}else{
					var hp_bar = '<div class="hp_bar_container"><div class="hp_bar" style="width:' + this.model.get("data").hp_per * 100 + '%;"></div></div>'
					this.$el.html( '<div class="member card_bg '+this.addTargetClass()+'"><img src="'+__.path.card("s",this.model.attributes.data.gra_id)+'">' + hp_bar + '</div>' );
				}
			}else{
				this.$el.attr("state-contain_deck",!!data.contain_deck)
				        .attr("state-selected"    ,!!data.selected    )
				        .attr("state-fav"         ,!!data.fav         )
				if( this.model.get("isEmpty") ){
					this.$el.html( '<div class="card_container"></div>' );
				}else{
					this.$el.html( __.template("card/card_container",this.response(data)) )
				}
			}
			return this;
			
		},
	});
	
	 
		
		
	
	/**
	 * モンスター一覧のView
	 * @memberof CardPage
	 * @attribute CardListView
	 */
	var CardListView = cardPage.CardListView.extend({
		addEmptyMessage: function(){
			this.$el.append('\
				<div class="limitup_select is_empty_list">\
					限界突破の合成素材にできるモンスターがいません。\
					素材には同じ種類のモンスターが必要です。<br/>\
					<br/>\
					また、お気に入り設定されているモンスター、およびデッキに編成されているモンスターは表示されません。<br/>\
				</div>\
				<a class="trigger_back_key back_btn cmn_btn_1" data-back-default="/html/Card/powerupSelect"><i>戻る</i></a>\
			')
		},
	});
	
	// 表示するテンプレートを変更
	// mixBtnの処理追加
	var SelectView = cardPage.SelectView.extend({
		MemberView:MemberView,
		CardListView:CardListView,
		events: function(){
			return _.extend( {"ftap #limitup_btn" :"limitupBtn"}, cardPage.SelectView.prototype.events.call(this) );
		},
		render:function(){
			this.$el.html( this.template({type:"limitup_select"}) );
			return this
		},
		// 指定したカードをメンバーに含まれた状態に
		initMemberList : function(){
			var ini_members = this.makeEmptyMemberList(2);
			ini_members[0].isEmpty = 0;
			ini_members[0].data = this.pc.getMateData(this.request.query.id,false);
			return ini_members;
		},
		//イベントを起こさせて無理やりupdateする。お気に入りと同じでなんとか修正したい。
		updateTarget:function(){
			this.members.models[1].set("target",0);
			this.members.models[1].set("target",1);
		},
		// ベースと同じカードIDのみにする
		filter:function(mate){
			if( mate.id == this.request.query.id ){ //自分は除外
				return false
			}else if( mate.fav ){ //お気に入りモンスターは除外
				return false
			}else if( _.contains(this.pc.deck.get("member"), mate.id) ){ //デッキに含む場合は除外
				return false
			}else if(mate.card_id == this.pc.get("mate_list")[this.request.query.id].card_id ){
				return true
			}else{
				return false
			}
		},
		// ベースカードを選択状態に
		setInitMembersStatus:function(cardList){
			cardList.each(function(card){
				if(this.request.query.id == card.id){
					card.set("selected",1);
				}
			},this);
			
			// 選択状態がselect_1になるよう更新
			this.updateCardList(true);
		},
		// ベースカードをタップしても反応しないようにする
		rejectTapCard:function(model){
			if(model.id == this.request.query.id){
				return true
			}else{
				return false
			}
		},
		// limitupBtn
		limitupBtn:function(){
			var select_members = _.map( this.members.models ,function(member,n){ return member.get("data").id; });
			var base_member = select_members[0];
			var mat_member  = _.compact(select_members.slice(1));
			var preview     = this.mate.limitupResult(this.pc,base_member,mat_member);
			if( preview.is_max_limit     ){ App.popup.message({message:"これ以上限界突破できません。"}); return; }
			if( preview.contain_base     ){ App.popup.message({message:"ベースに設定しているモンスターが含まれているため、実行できません。"}); return; }
			if( preview.contain_fav      ){ App.popup.message({message:"お気に入りに設定しているモンスターが含まれているため、実行できません。"}); return; }
			if( preview.contain_deck     ){ App.popup.message({message:"デッキ編成されているモンスターが含まれているため、実行できません。"}); return; }
			if( preview.money_not_enough ){ App.popup.message({message:"コインが不足しているため、実行できません"}); return; }
			
			var message = (preview.contain_limit)? '<i class="caution">素材に限界突破したモンスターがいます。<br/><br/></i>限界突破合成しますか？'
			            : (preview.contain_rare_max >= df.RARITY_SR)? '<i class="caution">素材にSR以上のモンスターがいます。<br/><br/></i>限界突破合成しますか？'
			            : '限界突破合成しますか？';
			
			App.popup.confirm({
				title     : "限界突破合成",
				message   : message,
				view_class: "limitup_confirm",
			}).done(_.bind(function(){
				var result = this.mate.limitup(this.pc,base_member,mat_member);
				this.pc.save();
				
				this.resetMembers();
				this.members.first().set({ "data": this.pc.getMateData(base_member), "isEmpty": 0 });
				this.addChangeCheckList(select_members);
				this.updateCardList();
				this.membersView.render();
				this.pageView.update();
				this.cardListView.render();
				this.updateTarget();
				this.infoView.render();
				
				var anim = new App.anim.Limitup({ before:result.before, after:result.after });
				App.popup.add(anim,{view_class:"limitup_anim"});
				App.mission.checkProcess("LIMITUP_CARD");
			},this));
		},
	});
	var CardPage = function(){
		return {
			SelectView  :SelectView,
		}
	};
	return CardPage;
})

