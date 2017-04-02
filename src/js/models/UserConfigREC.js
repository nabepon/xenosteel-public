define(["models/PcREC"],function(PcREC){
	
	var UserConfigREC = Backbone.Model.extend({
		constructor:function(){
			if(!UserConfigREC.instance){
				UserConfigREC.instance = this;
				Backbone.Model.apply(UserConfigREC.instance,arguments);
			}
			return UserConfigREC.instance;
		},
		localStorage : new Backbone.LocalStorage("UserConfigREC"),
		defaults    :function(){
			this.pc = new PcREC;
			return{
				id :this.pc.get("id"),
				sound        : 1,
				battle_speed : 1,
				page_elem_num: 50,
				card_sort_key: "power",
			}
		},
		initialize:function(option){
			console.log("UserConfigREC#initialize");
			this.fetch();
			this.listenTo(this.pc,"reset_data",this.resetData);
			this.listenTo(this.pc,"fetch_user_id",this.fetchUserId);
			this.listenTo(this.pc,"change_user_id",this.changeUserId);
			this.save();
		},
		fetchUserId  : function(id){ console.log("UserConfigREC#fetchUserId",arguments); this.set("id",id).fetch() },
		changeUserId : function(id){ console.log("UserConfigREC#changeUserId",arguments); this.set("id",id).save() },
		resetData : function(pc_id,is_data_delete){
			this.destroy();
			this.attributes = (is_data_delete) ? {} : this.defaults();
			this.set("id",pc_id);
			this.save();
		},
	});
	
return UserConfigREC;

});
