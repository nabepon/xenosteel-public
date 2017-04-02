define([
	"models/PcREC",
	"models/Mate",
	"controllers/CardPage",
""],function(PcREC,Mate,CardPage){
	 
	/*
	* 合成画面
	* 
	* 表示するテンプレートを変更
	* 表示するメンバーを6に変更
	* 合成するボタンと処理の追加
	*/
	
	var cardPage = new CardPage();
	
	var SelectView = cardPage.SelectView.extend({
		events: function(){
			return _.extend( {"ftap #mix_btn" :"mixBtn"}, cardPage.SelectView.prototype.events.call(this) );
		},
		render:function(){
			this.$el.html( this.template({type:"mix_select"}) );
			return this
		},
		initMemberList : function(){
			return this.makeEmptyMemberList(6);
		},
		mixBtn:function(){
			var select_members = _.map( this.members.models ,function(member,n){ return member.get("data").id; });
			var base_member = select_members[0];
			var mat_member  = _.compact(select_members.slice(1));
			var preview     = this.mate.mixResult(this.pc,base_member,mat_member);
			if(preview.is_max_level && !preview.is_limit_level){ App.popup.message({message:"これ以上合成できません。<br/>限界突破でレベル上限を解放できます。"}); return; }
			if(preview.is_max_level &&  preview.is_limit_level){ App.popup.message({message:"これ以上合成できません。"}); return; }
			if( preview.money_not_enough ){ App.popup.message({message:"コインが不足しているため、実行できません"}); return; }
			if( preview.contain_base     ){ App.popup.message({message:"ベースに設定しているモンスターが含まれているため、実行できません。"}); return; }
			if( preview.contain_fav      ){ App.popup.message({message:"お気に入りに設定しているモンスターが含まれているため、実行できません。"}); return; }
			if( preview.contain_deck     ){ App.popup.message({message:"デッキ編成されているモンスターが含まれているため、実行できません。"}); return; }
			
			var message = (preview.contain_limit)? '<i class="caution">素材に限界突破したモンスターがいます。<br/><br/></i>合成しますか？'
			            : (preview.contain_rare_max >= df.RARITY_SR)? '<i class="caution">素材にSR以上のモンスターがいます。<br/><br/></i>合成しますか？'
			            : '合成しますか？';
			
			App.popup.confirm({
				title     : "合成確認",
				message   : message,
				view_class: "mix_confirm",
			}).done(_.bind(function(){
				var result = this.mate.mix(this.pc,base_member,mat_member);
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

