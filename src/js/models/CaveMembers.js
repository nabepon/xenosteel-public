define([
],function(){
	
	/**
	 * ダンジョン内の仲間のコレクション
	 * @class CaveMembers
	 */
	var CaveMember = Backbone.Model.extend({});
	var CaveMembers = Backbone.Collection.extend({
		constructor:function(){
			if(!CaveMembers.instance){
				CaveMembers.instance = this;
				Backbone.Collection.apply(CaveMembers.instance,arguments);
			}
			return CaveMembers.instance;
		},
		model:CaveMember,
	});
	
	return CaveMembers;
});





