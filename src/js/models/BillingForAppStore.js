define([
	"models/PcREC",
""],function(PcREC){
	
	var Billing = Backbone.Model.extend({
		initialize:function(config){
			if(typeof storekit == "undefined"){
				console.error("storekit is not defined")
			}
			this.set("product_list",config.produt_ids);
		},
		defaults:function(){
			return {
				product_list :[],
				buying:false,
			}
		},
		//init
		init : function(){
			console.log("BillingAppStore : " + "init_start");
			storekit.init({
				noAutoFinish: true,
				debug:    true, // Enable IAP messages on the console
				ready:    _.bind(this.successInit,this),
				purchase: _.bind(this.successBuy,this),
				restore:  _.bind(this.restore,this),
				error:    _.bind(this.error,this),
				failedTransaction:_.bind(this.failedTransaction,this),
				finish:   _.bind(this.finish,this),
			});
		},
		successInit:function(){
			console.debug("#### SUCCESS Init ####");
			this.initLoadProducts()
		},
		
		//successInitLoadProducts
		initLoadProducts:function(){
			console.log("BillingAppStore : " + "initLoadProducts");
			// Once setup is done, load all product data.
			storekit.load(
				this.get("product_list"),
				_.bind(this.successInitLoadProducts,this)
			);
		},
		successInitLoadProducts : function(products, invalidIds){    
			console.log("#### SUCCESS successInitLoadProducts ####")       
			console.log(JSON.stringify(products));                         
			//GooglePlayにあわせる                                         
			// AppAtoreの場合  {        "id":"xeno_test_10000", "title":"", "price":"￥500", "description":"" }
			// GooglePlayの場合{ "productId":"xeno_test_10000", "title":"", "price":"￥104", "description": "", "type":"inapp", "price_amount_micros":990000, "price_currency_code": "USD" }
			_.each(products,function(product){ product.productId = product.id; })
			this.set("available_product_list",products)
			this.trigger("finishInit",products)
		},
		
		//buy
		buy:function (product_id) {
			this.set("buying",true)
			console.log("BillingAppStore : " + "buy");
			storekit.purchase(product_id);
		},
		successBuy : function(transactionId, productId, receipt){
			console.log("### SUCCESS Buy ###")
			console.log("successBuy / " + transactionId +" : "+ productId +" : "+ receipt )
			this.getReceipts(transactionId,_.bind(function(data){
				this.trigger("successBuy",data);
				storekit.finish(transactionId);
			},this))
		},
		getReceipts:function(transactionId,callback){
			storekit.loadReceipts(_.bind(function(receipts){
				this.successGetReceipts(receipts,transactionId,callback)
			},this));
		},
		successGetReceipts : function (receipts,transactionId,callback) {
			console.log("#### loadReceipts ####")
			//var productReceipt = receipts.forProduct("xeno_test_10000"); // null or base64 encoded receipt (iOS < 7)
			var productReceipt = receipts.forTransaction(transactionId);
			productReceipt = productReceipt.decodeBase64().replace(/" = "/g,'" : "').replace(/";/g,'",'); //'コメント回避
			productReceipt = eval("(" + productReceipt + ")");
			productReceipt["purchase-info"] = eval("(" + productReceipt["purchase-info"].decodeBase64().replace(/" = "/g,'" : "').replace(/";/g,'",') + ")"); //'コメント回避
			console.log("productReceipt : " + JSON.stringify(productReceipt));
			
			var ret = {
				purchaseToken:"",
				originalTransactionId:productReceipt["purchase-info"]["original-transaction-id"],
				purchaseTime         :parseInt( productReceipt["purchase-info"]["purchase-date-ms"] ),
				productId            :productReceipt["purchase-info"]["product-id"],
				orderId              :productReceipt["purchase-info"]["transaction-id"],
			}
			//this.trigger("successGetPurchases",[ret])
			callback(ret)
		},
		
		//consumePurchase
		finishConsume:function (productId,transactionId) {
			storekit.finish(transactionId)
		},
		
		//onError
		error:function (errorCode, errorMessage) {
			console.log('Error: ' + errorCode + '\r\n' + errorMessage)
			this.trigger("failBilling",errorCode,errorMessage);
		},
		failedTransaction:function(transactionIdentifier, productId, errorCode, errorText){
			//alert("failedTransaction");
			storekit.finish(transactionIdentifier);
			console.log('Error: ' + errorCode + '\r\n' + errorText)
			this.trigger("failBilling",errorCode,"failedTransaction transactionIdentifier:" + transactionIdentifier + " productId : " + productId);
		},
		finish:function(transactionIdentifier, productId){
			console.log('finish transaction')
			if(this.get("buying")){
				this.set("buying",false)
				this.trigger("finishBuy");
			}
			this.trigger("finishTransaction");
		},
		
		//restore
		restore:function(){},
	});
	
	return Billing;
})
