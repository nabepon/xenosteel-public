define([
	"models/PcREC",
""],function(PcREC){
	
	var Billing = Backbone.Model.extend({
		initialize:function(config){
			console.log("####init###")
			console.log(config)
			if(typeof inappbilling == "undefined"){
				console.error("inappbilling is not defined")
			}
			this.set("product_list",config.produt_ids);
		},
		defaults:function(){
			return {
				product_list :[],
				initializing:false,
				buying:false,
				available_product_list:[],
			}
		},
		//init
		init : function(){
			this.set("initializing",true)
			inappbilling.init(
				_.bind(this.successInit,this),
				_.bind(this.failInit,this),
				{showLog:true},
				this.get("product_list")
			)
		},
		successInit : function(data){
			console.debug("#### SUCCESS Init ####");
			this.initLoadProducts()
		},
		failInit : function(error){
			console.debug("#### FAIL Init ####")
			console.debug("ERROR: " + error )
			this.trigger("failBilling",arguments)
			alert("ERROR: \r\n"+error );
		},
		
		//initLoadProducts
		initLoadProducts : function(){
			inappbilling.getAvailableProducts(
				_.bind(this.successInitLoadProducts,this),
				_.bind(this.failinitLoadProducts,this)
			)
		},
		successInitLoadProducts : function(available_product_list){
			console.debug("#### SUCCESS getAvailableProducts ####")
			console.debug(JSON.stringify(available_product_list));
			this.set("available_product_list",available_product_list)
			this.executeTransaction();
		},
		failinitLoadProducts: function(error){
			console.debug("#### FAIL getAvailableProducts ####")
			console.debug("ERROR: " + error )
			this.trigger("failBilling",arguments)
			alert("ERROR: \r\n"+error );
		},
		
		//executeTransaction
		executeTransaction : function(){
			console.log("### executeTransaction start ###");
			inappbilling.getPurchases(
				_.bind(this.successExecuteTransaction,this),
				_.bind(this.failExecuteTransaction,this)
			)
		},
		successExecuteTransaction : function(items){
			console.log("#### SUCCESS GetPurchases ####")
			console.log(JSON.stringify(items));
			this.consume_list = items;
			this.consume_cnt  = 0;
			this.checkConsumePurchase()
		},
		failExecuteTransaction : function(error){
			console.log("#### FAIL GetPurchases ####")
			console.log("ERROR: " + error )
			this.trigger("failBilling",arguments)
			alert("ERROR: \r\n"+error );
		},
		
		//consumePurchase
		consumePurchase : function (productId) {
			inappbilling.consumePurchase(
				_.bind(this.checkConsumePurchase,this),
				_.bind(this.failConsumePurchase,this),
				productId
			)
		},
		checkConsumePurchase : function(){
			console.log("### SUCCESS ConsumePurchase ###")
			var cnt = this.consume_cnt;
			console.log("this.consume_list.length > cnt : " + this.consume_list.length + " > " + cnt);
			if(this.consume_list.length > cnt){
				/*
				orderId: "12999763169054705758.1370533565906823"
				packageName: "com.phonegap.xenosteel"
				productId: "xeno_test_10000"
				purchaseState: 0
				purchaseTime: 1390151669987
				purchaseToken: "aulbcakevldwwxmwgihptnyx.AO-J1OxUchFOpTLpndrM6WDAwqiPaD3_QkAGNsKdAugNLV6h_xl3M92yl4g6Qqupi6zkXjFyZTDaoMBViLUJ3KNMAu5SwSQq0cRUAiHw8pPlJtgG6EjYagGHsTo-R9GZc4XiAbsx7sw6"
				*/
				this.trigger("successBuy",this.consume_list[cnt])
				this.consume_cnt += 1;
				this.consumePurchase(this.consume_list[cnt].productId);
			}else{
				this.finishConsume();
			}
		},
		finishConsume:function(){
			console.log("### BillingREC : finishConsume start ###");
			if(this.get("initializing")){
				this.set("initializing",false)
				this.trigger("finishInit",this.get("available_product_list"))
			}else if(this.get("buying")){
				this.set("buying",false)
				this.trigger("finishBuy")
			}
		},
		failConsumePurchase : function(error){
			console.debug("#### FAIL ConsumePurchase ####")
			console.debug("ERROR: " + error )
			this.trigger("failBilling",arguments)
			alert("ERROR: \r\n"+error );
		},
		
		//buy
		buy : function(product_id){
			this.set("buying",true);
			inappbilling.buy(
				_.bind(this.successBuy,this),
				_.bind(this.failBuy,this),
				product_id
			)
		},
		successBuy : function(productId){
			console.log("### SUCCESS Buy ###");
			this.executeTransaction()
		},
		failBuy : function(error){
			console.debug("#### FAIL BUY ####")
			console.debug("ERROR: " + JSON.stringify(arguments))
			if(/1005/.test(error)){
				this.trigger("failBilling","cancel")
			}else{
				this.trigger("failBilling",arguments)
				alert("ERROR: \r\n"+error );
			}
		},
	});
	
	return Billing;
})

