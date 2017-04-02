define(["models/PcREC"],function(PcREC){
	
	var TwitterREC = Backbone.Model.extend({
		constructor:function(){
			if(!TwitterREC.instance){
				TwitterREC.instance = this;
				Backbone.Model.apply(TwitterREC.instance,arguments);
			}
			return TwitterREC.instance;
		},
		localStorage : new Backbone.LocalStorage("TwitterREC"),
		defaults    :function(){
			this.pc = new PcREC;
			return{
				id :this.pc.get("id"),
				screen_name:"",
				token_data : {},
				token_set:[],
				is_connected:false,
				post_log : {},
			}
		},
		initialize:function(option){
			console.log("TwitterREC#initialize");
			this.fetch();
			this.save();
		},
	});
	
return TwitterREC;

});
