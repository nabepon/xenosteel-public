define([
],function(){
	
	var BattleSkill = Backbone.Model.extend({
		constructor:function(){
			if(!BattleSkill.instance){
				BattleSkill.instance = this;
				Backbone.Model.apply(BattleSkill.instance,arguments);
			}
			return BattleSkill.instance;
		},
		initialize:function(prop,option){
			this.enemys  = option.enemys;
			this.members = option.members;
		},
		skill : function(id){
			return _.bind(this.aiData[id],this);
		},
		skillData : {
			0 : function(){
				return this.randomCommand([60,10,15,15]);
			}
		}
	});
	
	return BattleSkill;
})

