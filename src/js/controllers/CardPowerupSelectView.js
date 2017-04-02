define([
	"models/PcREC",
	"models/Mate",
	"controllers/CardPage",
	"controllers/CardFavSelectView",
""],function(PcREC,Mate,CardPage,CardFavSelectView){
	
	/*
	* 強化画面
	*/
	
	var cardPage = new CardFavSelectView();
	
	// メンバー部分を一人にし、強化ボタンに変更
	var MemberView   = cardPage.MemberView.extend({
		// オーバーライド分
		render:function(){
			var data = this.model.attributes.data;
			this.$el.attr("state-contain_deck",!!data.contain_deck)
			        .attr("state-selected"    ,!!data.selected    )
			        .attr("state-fav"         ,!!data.fav         )
			        
			if( this.model.get("isEmpty") ){
				this.$el.html( '<div class="card_container"></div>' );
				var btn1 = $('<a id="powerup_btn"      class="powerup_btn noselect cmn_btn_1  "><i>強化</i></a>')
				var btn2 = $('<a id="goto_limitup_btn" class="goto_limitup_btn cmn_btn_1 "><i>限界<br/>突破</i></a>')
				this.$el.append( btn1 ).append( btn2 )
			}else{
				var data = this.model.attributes.data;
				this.$el.html( __.template("card/card_container",this.response(data)) )
				
				if(data.levelmax){
					var btn1 = $('<a id="powerup_btn"      class="powerup_btn levelmax cmn_btn_1 "><i>レベルMAX</i></a>')
					var btn2 = $('<a id="goto_limitup_btn" class="goto_limitup_btn cmn_btn_1 "><i>限界<br/>突破</i></a>')
				}else{
					var btn1 = $('<a id="powerup_btn"      class="powerup_btn cmn_btn_1 "><i>強化</i></a>')
					var btn2 = $('<a id="goto_limitup_btn" class="goto_limitup_btn cmn_btn_1 "><i>限界<br/>突破</i></a>')
				}
				
				this.$el.append( btn1 ).append( btn2 )
			}
			return this;
		},
	});
	
	// 表示するテンプレートを変更
	// powerupBtnの処理追加
	var SelectView = cardPage.SelectView.extend({
		
		// オーバーライド分
		MemberView:MemberView,
		events: function(){
			return _.extend({
				"ftap #powerup_btn"      :"powerupBtn",
				"ftap #goto_limitup_btn" :"gotoLimitupBtn",
			},cardPage.SelectView.prototype.events.call(this) );
		},
		render:function(){
			this.$el.html( this.template({type:"powerup_select"}) );
			return this
		},
		// 指定したカードをメンバーに含まれた状態に
		initMemberList : function(){
			var ini_members = this.makeEmptyMemberList(1);
			if(this.request.query.id){
				ini_members[0].isEmpty = 0;
				ini_members[0].data = this.pc.getMateData(this.request.query.id,false);
			}
			return ini_members;
		},
		
		// 追加分
		powerupBtn:function(){
			var select_members = _.map( this.members.models ,function(member,n){ return member.get("data").id; });
			var base_member    = select_members[0];
			if(!base_member){ App.popup.message({message:"モンスターが選択されていません"}); return; }
			var preview        = this.mate.powerupResult(this.pc,base_member);
			if(preview.is_max_level && !preview.is_limit_level){ App.popup.message({message:"これ以上強化できません。<br/>限界突破でレベル上限を解放できます。"}); return; }
			if(preview.is_max_level &&  preview.is_limit_level){ App.popup.message({message:"これ以上強化できません。"}); return; }
			if(preview.money_not_enough){ App.popup.message({message:"コインが不足しています"}); return; }
			
			App.popup.confirm({
				title     :"モンスター強化",
				message   :"レベルアップしますか？<br/>所持コイン：" + this.pc.getItem( df.ITEM_GAME_MONEY ) + "<br/>消費コイン：" + preview.need_game_money,
				view_class:"powerup_confirm",
			}).done(_.bind(function(){
				var result = this.mate.powerup(this.pc,base_member);
				this.pc.save();
				
				this.members.first().set("data", this.pc.getMateData(base_member) );
				this.addChangeCheckList(select_members);
				this.updateCardList();
				this.membersView.render();
				this.pageView.update();
				this.cardListView.render();
				this.infoView.render();
				
				var anim = new App.anim.Powerup({ before:result.before, after:result.after });
				App.popup.add(anim,{view_class:"powerup_anim"});
				App.mission.checkProcess("POWERUP_CARD");
			},this))
		},
		gotoLimitupBtn:function(){
			var select_members = _.map( this.members.models ,function(member,n){ return member.get("data").id; });
			var base_member    = select_members[0];
			if(!base_member){ App.popup.message({message:"モンスターが選択されていません"}); return; }
			var preview        = this.mate.limitupResult(this.pc,base_member);
			if(preview.is_max_limit){ App.popup.message({message:"これ以上限界突破できません。"}); return; }
			
			App.popup.confirm({title:"限界突破合成",message:"限界突破合成の画面に遷移します。<br/><br/>同じモンスターを合成することで、モンスターの最大レベルを上げることができます。"})
			.done(_.bind(function(){
				var select_members = _.map( this.members.models ,function(member,n){ return member.get("data").id; });
				var base_member = select_members[0];
				App.router.navigate("/html/Card/limitupSelect?id="+ base_member,{trigger:true})
			},this))
		},
	});
	var CardPage = function(){
		return {
			MemberView  :MemberView,
			SelectView  :SelectView,
		}
	};
	return CardPage;
})

