define(["models/PcREC"],function(PcREC){
	
	var AnalyzeREC = Backbone.Model.extend({
		constructor:function(){
			if(!AnalyzeREC.instance){
				AnalyzeREC.instance = this;
				Backbone.Model.apply(AnalyzeREC.instance,arguments);
			}
			return AnalyzeREC.instance;
		},
		localStorage : new Backbone.LocalStorage("AnalyzeREC"),
		defaults    :function(){
			this.pc = new PcREC;
			return{
				id :this.pc.get("id"),
			}
		},
		initialize : function(){
			console.log("AnalyzeREC#initialize");
			if(__.info.is_phonegap){
				if(!window.plugins) window.plugins = {};
				if(window.plugins.gaPlugin){
					this.gaPlugin = window.plugins.gaPlugin;
				}else{
					var noop = function(){};
					this.gaPlugin = {
						init       :noop,
						trackEvent :noop,
						trackPage  :noop,
						setVariable:noop,
						exit       :noop,
					};
				}
				this.gaPlugin.init(this.successInit, this.errorInit, "UA-47247527-1", 10);
			}
			this.pc = new PcREC;
			this.listenTo(this.pc,"reset_data",this.resetData);
			this.listenTo(this.pc,"fetch_user_id",this.fetchUserId);
			this.listenTo(this.pc,"change_user_id",this.changeUserId);
			this.fetch();
			this.save();
		},
		fetchUserId  : function(id){ console.log("AnalyzeREC#fetchUserId",arguments); this.set("id",id).fetch() },
		changeUserId : function(id){ console.log("AnalyzeREC#changeUserId",arguments); this.set("id",id).save() },
		resetData : function(pc_id,is_data_delete){
			this.destroy();
			this.attributes = (is_data_delete) ? {} : this.defaults();
			this.set("id",pc_id);
			this.save();
		},
		successInit:function(data){
			console.log("AnalyzeREC#successInit")
			console.log(data)
		},
		errorInit:function(data){
			console.log("AnalyzeREC#errorInit")
			console.log(data)
		},
		checkNoop : function(callback){
			if(callback == undefined || callback == ""){
				return function(){}
			}else{
				return callback
			}
		},
		trackEvent : function(success, fail, category, eventAction, eventLabel, eventValue){
			if(!__.info.is_phonegap){ return }
			var success = this.checkNoop(success);
			var fail = this.checkNoop(fail);
			this.gaPlugin.trackEvent(success, fail, category, eventAction, eventLabel, eventValue);
		},
		trackPage : function(success, fail, pageURL){
			if(!__.info.is_phonegap){ return }
			var success = this.checkNoop(success);
			var fail = this.checkNoop(fail);
			
			this.gaPlugin.trackPage(success, fail, pageURL);
		},
		setVariable : function(success, fail, index, value){
			if(!__.info.is_phonegap){ return }
			var success = this.checkNoop(success);
			var fail = this.checkNoop(fail);
			
			this.gaPlugin.setVariable(success, fail, index, value)
		},
		exit : function(success, fail){
			if(!__.info.is_phonegap){ return }
			var success = this.checkNoop(success);
			var fail = this.checkNoop(fail);
			
			this.gaPlugin.exit(success, fail)
		},
	});
	
return AnalyzeREC;

});
