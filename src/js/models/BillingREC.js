define([
	"models/BillingForGooglePlay",
	"models/BillingForAppStore",
""],function(BillingForGooglePlay,BillingForAppStore){
	
	/**
	 * Billing情報のmodel。
	 * @class BillingREC
	 */
	var BillingREC = Backbone.Model.extend({
		constructor:function(){
			if(!BillingREC.instance){
				BillingREC.instance = this;
				Backbone.Model.apply(BillingREC.instance,arguments);
			}
			return BillingREC.instance;
		},
		defaults : function(){
			var prepaid_list = []
			if(!__.info.is_phonegap){
				prepaid_list = [
					{orderId: "1000000098883856",point: 500,pointMax: 500,productId: "xeno_test_10000",purchaseTime: 1390168668001},
					{orderId: "1000000098883858",point: 500,pointMax: 500,productId: "xeno_test_10000",purchaseTime: 1390168673697},
					{orderId: "1000000098883861",point: 500,pointMax: 500,productId: "xeno_test_10000",purchaseTime: 1390168679903},
				]
			}
			/* available_product_listのios、android両方で有効なプロパティ
			description: "テスト用アイテム説明"
			price: "￥500"
			productId: "xeno_test_10000"
			title: "テスト用アイテム"
			*/
			return{
				id :"default",
				buy_finish : true,
				available_product_list : [],
				buy_id : "",
				prepaid_list : prepaid_list,
				invalid_prepaid_list : [],
			}
		},
		localStorage : new Backbone.LocalStorage("BillingREC"),
		initialize : function(config,option){
			console.log("BillingREC#initialize");
			__.checkHas(option,["pc_id"]);
			this.set("id",option.pc_id)
			this.pc = option.pc;
			this.fetch();
			var list = ["xeno_test_10000","xeno_test_10001","android.test.purchased","android.test.canceled","android.test.item_unavailable"];
			if(__.info.is_android)  this.billing = new BillingForGooglePlay({produt_ids:list});
			if(__.info.is_ios)      this.billing = new BillingForAppStore({produt_ids:list});
			if(!__.info.is_phonegap){
				var DummyBilling = Backbone.Model.extend({ init:function(){}, buy:function(){} });
				this.billing = new DummyBilling({produt_ids:list})
			};
			this.listenTo(this.billing,"finishInit" ,this.finishInit)
			this.listenTo(this.billing,"successBuy" ,this.successBuy)
			this.listenTo(this.billing,"finishBuy"  ,this.finishBuy)
			this.listenTo(this.billing,"failBilling",this.failBilling)
			this.listenTo(this.pc,"reset_data",this.resetData);
			this.listenTo(this.pc,"fetch_user_id",this.fetchUserId);
			this.listenTo(this.pc,"change_user_id",this.changeUserId);
			this.checkEnablePrepaid();
			this.save();
		},
		fetchUserId  : function(id){ console.info("BillingREC#fetchUserId",arguments); this.set("id",id).fetch() },
		changeUserId : function(id){ console.info("BillingREC#changeUserId",arguments); this.set("id",id).save() },
		resetData : function(pc_id,is_data_delete){
			this.destroy();
			this.attributes = (is_data_delete) ? {} : this.defaults();
			this.set("id",pc_id);
			this.save();
		},
		validate : function(attrs,opt){
		},
		checkConnection:function(){
			if( navigator.connection.type == Connection.UNKNOWN || navigator.connection.type == Connection.NONE){
				this.failBilling();
				return false
			}else{
				return true
			}
		},
		init : function(){
			console.log("### BillingREC : init start ###");
			if(!this.checkConnection()){ return }
			this.billing.init()
		},
		finishInit:function(available_product_list){
			this.set("available_product_list",available_product_list);
			this.set("buy_id","");
			this.save();
			this.trigger("finishInit");
		},
		buy : function(buy_id){
			// 購入を開始する。初期化時に購入処理が終わっていないものは無くなっているはずなので、
			// そのまま購入処理へ遷移する。
			console.log("### BillingREC : buy start ###");
			if(!this.checkConnection()){ return }
			this.set("buy_id",buy_id);
			this.save();
			this.billing.buy(this.get("buy_id"))
		},
		successBuy : function(buy_data){
			/*
				購入が完了し、Transactionの数が1以上になっている状態
				successBuy()の呼び出しのあとあと、
				それぞれのbillingクラスの中でTransactionを処理するようになっている。
				Transactionが2つ以上ある場合、その分だけこのsuccessBuyが呼ばれる。
				全てのTransactionを処理したら、AndroidではfinishBuyイベントを発火させる。
				iOSではPaymentTransactionStateFinishedにどのタイミングでなるのか不明なので不明。
			*/
			console.log("### givePurchaseItems ###");
			var product_data = _.find(st.ProductData,function(data){ return data.product_id == "xeno_test_10000" })
			var prepaid = {
				point       :product_data.point,
				pointMax    :product_data.point,
				purchaseTime:buy_data.purchaseTime,
				productId   :buy_data.productId,
				orderId     :buy_data.orderId
			};
			this.get("prepaid_list").push(prepaid);
			this.save();
			App.mission.checkProcess("BUY_REAL_MONEY");
			this.trigger("successBuy")
			//商品受け渡し
			//buy_dataの整形が未完了。iosの方をandroidにあわせる。
		},
		finishBuy : function(){
			this.trigger("finishBuy")
		},
		failBilling : function(type,msg_str){
			if(type == "cancel"){
				var msg = "購入をキャンセルしました"
			}else{
				var msg = "通信エラーが起きました。通信環境のいい場所でご利用ください。"
			}
			this.trigger("failBilling",type);
			alert(msg + " : " + msg_str);
			//error処理を書く
		},
		
		//prepaid関連
		checkEnablePrepaid : function(){
			var check_time = __.baseTime();
			var prepaid_data = _.reduce(this.get("prepaid_list"), function(result,prepaid){
				if( (prepaid.purchaseTime + 14688000000 <= check_time) || prepaid.point == 0){
					result.disables.push(prepaid)
				}else{
					result.enables.push(prepaid)
				}
				return result
			},{ enables:[], disables:[] });
			
			var invalid_prepaid_list = this.get("invalid_prepaid_list").concat(prepaid_data.disables);
			this.set("invalid_prepaid_list",invalid_prepaid_list);
			
			var valid_prepaid_list = prepaid_data.enables.sort(function(a,b){ return a.purchaseTime - b.purchaseTime })
			this.set("prepaid_list", valid_prepaid_list);
			
			//this.save();
		},
		getMoney : function(){
			this.checkEnablePrepaid();
			var total_money = _.reduce(this.get("prepaid_list"), function(sum,prepaid){ return (sum + prepaid.point) },0)
			return total_money
		},
		useMoney : function(val){
			this.checkEnablePrepaid();
			var prepaid_list = this.get("prepaid_list");
			var remain_val = val;
			_.each(prepaid_list,function(prepaid){
				if(remain_val <= 0){ return }
				if(prepaid.point <= remain_val){
					remain_val -= prepaid.point;
					prepaid.point = 0;
				}else{
					prepaid.point -= remain_val;
					remain_val = 0;
				}
			})
			return remain_val
		},
	});
	
	return BillingREC;
});





