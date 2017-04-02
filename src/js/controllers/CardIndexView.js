define([
	"models/PcREC",
""],function(PcREC){
	
	var CardIndexView = Backbone.View.extend({
		tagName:"div",
		events:{
			"ftap .deck": "showDeckDetail",
		},
		showDeckDetail: function(){
			var response = {
				members: this.getMembers(),
			};
			var popup = App.popup.message({
				title:"デッキ詳細",
				message:__.template("card/deck_detail",response),
				yes:{label:"閉じる"},
			}).done(_.bind(this.deckResetConfirm,this));
		},
		getMembers: function(){
			var pc = new PcREC;
			return _.map(pc.get("deck"),function(id,n){ if(!id){ return } return pc.getMateData(id) })
		},
		render:function(){
			var pc = new PcREC;
			var res = {
				mate_num   :_.size(pc.get("mate_list")),
				mate_max   :pc.get("mate_max"),
				gacha_point:pc.getItem( df.ITEM_GACHA_POINT ),
				game_money :pc.getItem( df.ITEM_GAME_MONEY ),
				real_money :pc.getItem( df.ITEM_REAL_MONEY ),
				deck       :pc.get("deck"),
				members    :this.getMembers(),
			}
			this.$el.html( __.template("card/index",res) );
			return this
		},
		setupView:function(){
			__.scroller.create("card_index_list",{scrollbars:true});
		},
	});
	
	return CardIndexView;
	
})

