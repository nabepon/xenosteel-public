define([
	"models/PcREC",
""],function(PcREC){
	
	var ShopRecoverView = Backbone.View.extend({
		tagName:"div",
		render:function(){
			var pc = new PcREC;
			var res = {
				mate_num   :_.size(pc.get("mate_list")),
				mate_max   :pc.get("mate_max"),
				gacha_point:pc.getItem( df.ITEM_GACHA_POINT ),
				game_money :pc.getItem( df.ITEM_GAME_MONEY ),
				real_money :pc.getItem( df.ITEM_REAL_MONEY ),
				deck       :pc.get("deck"),
				members    :_.map(pc.get("deck"),function(id,n){ if(!id){ return } return pc.getMateData(id) }),
			}
			this.$el.html( __.template("shop/recover",res) );
			return this
		},
		setupView:function(){
			__.scroller.create("shop_index_list",{scrollbars:true});
		},
	});
	
	return ShopRecoverView;
	
})

