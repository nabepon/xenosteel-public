define([
	"models/PcREC",
	"models/Mate",
	"controllers/CardPage",
""],function(PcREC,Mate,CardPage){
	 
	/*
	* 売却画面
	*/
	
	var cardPage = new CardPage();
	
	// 表示するテンプレートを変更
	// sellBtnの処理追加
	var SelectView = cardPage.SelectView.extend({
		// オーバーライド分
		events: function(){
			return _.extend( {"ftap #sell_btn" :"sellBtn"}, cardPage.SelectView.prototype.events.call(this) );
		},
		render:function(){
			this.$el.html( this.template({type:"sell_select"}) );
			return this
		},
		filter:function(mate){
			var pc_deck = this.pc.get("deck");
			if(mate.fav || _.contains(pc_deck, mate.id)){
				return false
			}else{
				return true
			}
		},
		initMemberList : function(){
			return this.makeEmptyMemberList(6);
		},
		
		// 追加分
		sellBtn:function(){
			var select_members = _.map( this.members.models ,function(member,n){ return member.get("data").id; });
			if(_.compact(select_members).length === 0){ App.popup.message({message:"モンスターが選択されていません"}); return; }
			var preview        = this.mate.sellResult(this.pc, select_members );
			if( preview.is_have_not_all ){ App.popup.message({message:"所持モンスターが1体もいなくなるため、実行できません。"}); return; }
			if( preview.contain_fav     ){ App.popup.message({message:"お気に入りに設定しているモンスターが含まれているため、実行できません。"}); return; }
			if( preview.contain_deck    ){ App.popup.message({message:"デッキ編成されているモンスターが含まれているため、実行できません。"}); return; }
			
			var message = (preview.contain_limit)? '<i class="caution">素材に限界突破したモンスターがいます。<br/><br/></i>売却しますか？<br/>入手コイン：' + preview.get_game_money
			            : (preview.contain_rare_max >= df.RARITY_SR)? '<i class="caution">素材にSR以上のモンスターがいます。<br/><br/></i>売却しますか？<br/>入手コイン：' + preview.get_game_money
			            : '売却しますか？<br/>入手コイン：' + preview.get_game_money;
			
			App.popup.confirm({
				title     : "売却確認",
				message   : message,
				view_class: "sell_confirm",
			}).done(_.bind(function(){
				var result = this.mate.sell(this.pc, select_members );
				this.pc.save()
				
				this.resetMembers();
				this.addChangeCheckList(select_members);
				this.updateCardList();
				this.membersView.render();
				this.pageView.update();
				this.cardListView.render();
				this.updateTarget();
				this.infoView.render();
				
				App.popup.message({message:"売却しました<br/>"})
				App.mission.checkProcess("SELL_CARD", result);
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

