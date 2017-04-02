define([
	"models/PcREC",
	"models/BillingREC",
	"controllers/ShopIndexView",
""],function(PcREC,BillingREC,ShopIndexView){
	
	var ShopRealMoneyView = Backbone.View.extend({
		tagName:"div",
		initialize:function(){
			this.pc = new PcREC;
			this.billingREC = new BillingREC({pc_id:this.pc.get("id"),pc:this.pc});
			this.listenTo(this.billingREC,"successBuy" ,this.successBuy );
			this.listenTo(this.billingREC,"finishBuy"  ,this.finishBuy  );
			this.listenTo(this.billingREC,"failBilling",this.failBilling);
		},
		events:{
			//"ftap a"                :"sample",
			"ftap .init"                :"init",
			"ftap .getAvailableProducts":"getAvailableProducts",
			"ftap .getPurchases"        :"getPurchases",
			"ftap .buy"                 :"buy",
			"ftap .consumePurchase"     :"consumePurchase",
			"ftap .item_btn"            :"itemBtn",
		},
		init                :function(){ this.billingREC.init()                 },
		getAvailableProducts:function(){ this.billingREC.getAvailableProducts() },
		getPurchases        :function(){ this.billingREC.getPurchases()         },
		buy                 :function(){ this.billingREC.buy("xeno_test_10000") },
		consumePurchase     :function(){ this.billingREC.consumePurchase()      },
		
		itemBtn:function(e){
			App.views.indicator.show();
			App.sound.se(1);
			var _this = this;
			var id = $(e.currentTarget).data("id");
			setTimeout(function(){ _this.billingREC.buy(id) },0)
		},
		successBuy:function(){
			navigator.notification.alert("通信に時間がかかることがあります。\nしばらくお待ちください。",function(){},"購入完了処理中です")
		},
		finishBuy:function(){
			App.views.indicator.hide();
		},
		failBilling:function(){
			App.views.indicator.hide();
		},
		sample:function(e){
			var $target = $(e.currentTarget)
			console.log("ShopRealMoneyView#sample [$target.data('num')]",$target.data("num"));
		},
		response:function(){
			var shopIndexView = new ShopIndexView();
			var base_response = shopIndexView.response()
			var res = {
				product_list: this.billingREC.get("available_product_list"),
			}
			return _.extend(base_response,res)
		},
		render:function(){
			this.$el.html( __.template("shop/real_money",this.response()) );
			return this
		},
		setupView:function(){
			__.scroller.create("shop_index_list",{scrollbars:true});
		},
	});
	
	return ShopRealMoneyView;
	
})

