define([
	"models/PcREC",
	"controllers/ShopIndexView",
""],function(PcREC,ShopIndexView){
	
	var ShopPackunView = Backbone.View.extend({
		tagName:"div",
		events:{
			"ftap .buy_packun":"buyCinform",
		},
		buyCinform:function(e){
			var id = $(e.currentTarget).data("id");
			var shop_item = st.PackunShopData[id];
			var need_item = st.ItemData[shop_item.need_item];
			var buy_item  = st.ItemData[shop_item.item_id];
			App.popup.confirm({
				title:"パックン購入",
				message:need_item.name + "を" + shop_item.price + "使って<br/>" + buy_item.name + "を" + shop_item.num + "個購入しますか？",
			}).done(function(){
				var pc = new PcREC;
				if(pc.getItem(shop_item.need_item) < shop_item.price){
					App.popup.message({message:need_item.name + "が不足しています"});
					return
				}
				pc.addItem(shop_item.item_id, shop_item.num);
				pc.useItem(shop_item.need_item, shop_item.price);
				App.popup.message({message:"購入しました"}).done(function(){
					App.router.navi.Shop.packun();
					if(shop_item.item_id == df.ITEM_PACKUN_NORMAL) App.mission.checkProcess("BUY_PACKUN_NORMAL");
					if(shop_item.item_id == df.ITEM_PACKUN_SUPER)  App.mission.checkProcess("BUY_PACKUN_SUPER");
					if(shop_item.item_id == df.ITEM_PACKUN_DRAGON) App.mission.checkProcess("BUY_PACKUN_DRAGON");
				});
			});
		},
		response : function(){
			var shopIndexView = new ShopIndexView();
			var base_response = shopIndexView.response()
			
			//shop用のデータ加工
			var packun_data = _.groupBy(st.PackunShopData,function(data){ return data.item_id });
			_.each(packun_data,function(data){
				data.sort(function(a,b){ return a.priority - b.priority })
			});
			var packun_keys = _.keys(packun_data).sort(function(a,b){
				return packun_data[a][0].priority - packun_data[b][0].priority 
			});
			
			var pc = new PcREC;
			var res = {
				packun_data:packun_data,
				packun_keys:packun_keys,
			}
			return _.extend(base_response,res)
		},
		render:function(){
			this.$el.html( __.template("shop/packun",this.response()) );
			return this
		},
		setupView:function(){
			__.scroller.create("shop_index_list",{scrollbars:true});
		},
	});
	
	return ShopPackunView;
	
})
