define([
	"models/Mate"
],function(Mate){
	
	var DeckREC = Backbone.Model.extend({
		constructor:function(){
			if(!DeckREC.instance){
				DeckREC.instance = this;
				Backbone.Model.apply(DeckREC.instance,arguments);
			}
			return DeckREC.instance;
		},
		defaults    : function(){ return this.defaultAttr() },
		defaultAttr : function(){
			return {
				member : [0,0,0,0,0],
			}
		},
		localStorage : new Backbone.LocalStorage("DeckREC"),
		initialize : function(config,option){
			console.log("DeckREC#initialize");
			this.pc = option.pc;
			this.set("id",option.pc_id);
			this.fetch();
			//var deck = [0,0,0,0,0];
			//var mate_list = _.values(this.pc.get("mate_list"))
			//var max_length = Math.min(deck.length, mate_list.length);
			//for(var i=0;i<max_length;i++){ deck[i] = mate_list[i].id }
			//this.set("member",deck);
			this.listenTo(this.pc,"reset_data",this.resetData);
			this.listenTo(this.pc,"fetch_user_id",this.fetchUserId);
			this.listenTo(this.pc,"change_user_id",this.changeUserId);
		},
		fetchUserId  : function(id){ console.log("DeckREC#fetchUserId",arguments); this.set("id",id).fetch() },
		changeUserId : function(id){ console.log("DeckREC#changeUserId",arguments); this.set("id",id).save() },
		resetData : function(pc_id,is_data_delete){
			this.destroy();
			this.attributes = (is_data_delete) ? {} : this.defaults();
			this.set("id",pc_id);
			this.save();
		},
		validate : function(attrs,opt){
		},
		error : function(model,error,opt){
			console.error("DeckREC#error [model,error,opt]",[model,error,opt]);
		},
	});
	
	return DeckREC;
});





