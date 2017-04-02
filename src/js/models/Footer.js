define([
],function(){
	
	var Footer = Backbone.Model.extend({
		constructor:function(){
			// ƒVƒ“ƒOƒ‹ƒgƒ“
			if(!Footer.instance){
				Footer.instance = this;
				Backbone.Model.apply(Footer.instance,arguments);
			}
			return Footer.instance;
		},
		defaults:function(){
			return {
				active : 0,
				disp : 1,
				present_num : 0,
			}
		},
	});
	
	return Footer;
});





