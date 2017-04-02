define(["models/PcREC"],function(PcREC){
	
	var ShopREC = Backbone.Model.extend({
		constructor:function(){
			if(!ShopREC.instance){
				ShopREC.instance = this;
				Backbone.Model.apply(ShopREC.instance,arguments);
			}
			return ShopREC.instance;
		},
		localStorage : new Backbone.LocalStorage("ShopREC"),
		defaults    :function(){
			this.pc = new PcREC;
			return{
				id :this.pc.get("id"),
				last_report_time       : 0,
				bug_report_count       : 0,
				last_tweet_arbeit_time : 0,
				tweet_arbeit_count     : 0,
				is_reviewed : 0,
			}
		},
		initialize:function(option){
			console.log("ShopREC#initialize");
			this.fetch();
			this.listenTo(this.pc,"reset_data",this.resetData);
			this.listenTo(this.pc,"fetch_user_id",this.fetchUserId);
			this.listenTo(this.pc,"change_user_id",this.changeUserId);
			this.save();
		},
		fetchUserId  : function(id){ console.log("ShopREC#fetchUserId",arguments); this.set("id",id).fetch() },
		changeUserId : function(id){ console.log("ShopREC#changeUserId",arguments); this.set("id",id).save() },
		resetData : function(pc_id,is_data_delete){
			this.destroy();
			this.attributes = (is_data_delete) ? {} : this.defaults();
			this.set("id",pc_id);
			this.save();
		},
	});
	
return ShopREC;

});
