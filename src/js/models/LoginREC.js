define([
	"models/PcREC",
	"models/PresentREC"
],function(PcREC,PresentREC){
	
	var TYPE_MORNING   = 0;
	var TYPE_NOON      = 1;
	var TYPE_EVENING   = 2;
	var TYPE_NIGHT     = 3;
	
	var PERIOD_LATE    = 5;
	var PERIOD_MORNING = 10;
	var PERIOD_NOON    = 14;
	var PERIOD_EVENING = 20;
	var PERIOD_NIGHT   = 24;
	
	var PERIOD_LIST    = ["10:00:00", "14:00:00", "20:00:00", "05:00:00"];
	
	var LoginREC = Backbone.Model.extend({
		constructor:function(){
			if(!LoginREC.instance){
				LoginREC.instance = this;
				Backbone.Model.apply(LoginREC.instance,arguments);
			}
			return LoginREC.instance;
		},
		defaults: function(){
			this.pc = new PcREC;
			return{
				id :this.pc.get("id"),
				last_login_count_time : 1000000000,
				next_login_count_time : 1000000000,
				next_login_bonus_time : 1000000000,
				login_day_count       : 0,
				chain_login_day_count : 1,
				bonus_count_logs      : [0,0,0,0],
			}
		},
		localStorage : new Backbone.LocalStorage("LoginREC"),
		initialize : function(){
			console.log("LoginREC#initialize");
			this.pc = new PcREC;
			this.listenTo(this.pc,"reset_data",this.resetData);
			this.fetch();
		},
		resetData : function(pc_id,is_data_delete){
			this.destroy();
			this.attributes = (is_data_delete) ? {} : this.defaults();
			this.set("id",pc_id);
			this.save();
		},
		check: function(){
			console.log("LoginREC#check");
			var is_count = this.checkLoginCount();
			var is_get   = this.checkLoginBonus();
			this.save();
			return is_get;
		},
		checkLoginCount: function(){
			var next_login_count_time = this.get("next_login_count_time");
			if(__.baseTime() >= next_login_count_time ){
				var count = this.get("login_day_count") + 1;
				this.set("login_day_count", count );
				this.set("next_login_count_time", this.getNextLoginCountTime() );
				this.set("last_login_count_time", __.baseTime() );
				
				var chain = this.get("chain_login_day_count") + 1;
				if( this.get("next_login_count_time") - next_login_count_time > 24*60*60*1000) chain = 1;
				this.set("chain_login_day_count", chain );
				
				console.log("LoginREC#checkLoginCount [count,chain]", count,chain );
				
				App.mission.resetClearComeback( this.get("next_login_count_time") - next_login_count_time );
				App.mission.checkProcess("LOGIN");
				//App.mission.checkProcess("CHAIN_LOGIN", chain);
				
				return {
					count:count,
					chain:chain,
				}
			}
			return false
		},
		checkLoginBonus: function(){
			if(__.baseTime() >= this.get("next_login_bonus_time") ){
				var next_time = this.getNextLoginBonusTime();
				var zone      = this.getCurrentZone();
				this.get("bonus_count_logs")[zone] += 1;
				this.set("next_login_bonus_time", next_time );
				this.addLoginBonus();
				App.mission.checkProcess("LOGIN_BONUS");
				console.log("LoginREC#checkLoginBonus ログボ！", "now:"+__.moment().format("MM/DD HH:mm") ,"next:"+__.moment(next_time).format("MM/DD HH:mm"), zone, this.get("bonus_count_logs") );
				return {
					time_type: zone,
				}
			}
			return false
		},
		getNextLoginCountTime: function(){
			var hour     = __.moment().hour();
			var today    = __.moment().format("YYYY-MM-DDT");
			var tomorrow = __.moment().add(1,"d").format("YYYY-MM-DDT");
			var next = (hour < 5) ? today + "05:00:00" : tomorrow + "05:00:00";
			return __.moment(next).valueOf();
		},
		getNextLoginBonusTime: function(){
			var hour     = __.moment().hour();
			var today    = __.moment().format("YYYY-MM-DDT");
			var tomorrow = __.moment().add(1,"d").format("YYYY-MM-DDT");
			var next = (hour < PERIOD_LATE   ) ? today + PERIOD_LIST[TYPE_NIGHT]   
			         : (hour < PERIOD_MORNING) ? today + PERIOD_LIST[TYPE_MORNING]      
			         : (hour < PERIOD_NOON   ) ? today + PERIOD_LIST[TYPE_NOON]     
			         : (hour < PERIOD_EVENING) ? today + PERIOD_LIST[TYPE_EVENING]       
			         : (hour < PERIOD_NIGHT  ) ? tomorrow + PERIOD_LIST[TYPE_NIGHT]
			         : "";
			return __.moment(next).valueOf();
		},
		getCurrentZone: function(){
			var hour = __.moment().hour();
			if(hour < PERIOD_LATE   ) return TYPE_NIGHT;
			if(hour < PERIOD_MORNING) return TYPE_MORNING;
			if(hour < PERIOD_NOON   ) return TYPE_NOON;
			if(hour < PERIOD_EVENING) return TYPE_EVENING;
			if(hour < PERIOD_NIGHT  ) return TYPE_NIGHT;
		},
		addLoginBonus: function(){
			var zone = this.getCurrentZone();
			var bonus_list = [ 
				df.ITEM_SET_LOGIN_BONUS_MORNING,
				df.ITEM_SET_LOGIN_BONUS_NOON,
				df.ITEM_SET_LOGIN_BONUS_EVENING,
				df.ITEM_SET_LOGIN_BONUS_NIGHT
			];
			var messages = [
				"朝のログインボーナスです",
				"昼のログインボーナスです",
				"夕のログインボーナスです",
				"夜のログインボーナスです",
			]
			var present = new PresentREC();
			present.addSetItem({ message: messages[zone] }, bonus_list[zone]).save();
		},
	});
	
return LoginREC;

});
