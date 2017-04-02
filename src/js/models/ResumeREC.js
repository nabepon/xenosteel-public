define([
	"models/BattleREC",
	"models/CaveREC",
	"models/CaveMapREC",
	"models/CaveManager",
	"models/DeckREC",
	"models/PcREC",
],function(
	BattleREC,
	CaveREC,
	CaveMapREC,
	CaveManager,
	DeckREC,
	PcREC
){
	
	var ResumeREC = Backbone.Model.extend({
		constructor:function(){
			if(!ResumeREC.instance){
				ResumeREC.instance = this;
				Backbone.Model.apply(ResumeREC.instance,arguments);
			}
			return ResumeREC.instance;
		},
		defaults    : function(){ return this.defaultAttr() },
		defaultAttr : function(){
			this.pc = new PcREC;
			return{
				id :this.pc.get("id"),
				status : df.RESUME_CREATE_NEW_DATA,
			}
		},
		localStorage : new Backbone.LocalStorage("ResumeREC"),
		initialize : function(){
			console.log("ResumeREC#initialize");
			this.battle  = new BattleREC;
			this.cave    = new CaveREC;
			this.caveMap = new CaveMapREC;
			this.caveMgr = new CaveManager;
			this.deck    = new DeckREC;
			this.pc      = new PcREC;
			this.set("id",this.pc.get("id"))
			this.fetch();
			this.listenTo(this.battle ,"Resume",this.changeBattleStatus);
			this.listenTo(this.cave   ,"Resume",this.changeCaveStatus);
			this.listenTo(this.caveMap,"Resume",this.changeCaveMapStatus);
			this.listenTo(this.caveMgr,"Resume",this.changeCaveMgrStatus);
			this.listenTo(this.deck   ,"Resume",this.changeDeckStatus);
			this.listenTo(this.pc     ,"Resume",this.changePcStatus);
			this.listenTo(this.pc,"reset_data",this.resetData);
			this.listenTo(this.pc,"fetch_user_id",this.fetchUserId);
			this.listenTo(this.pc,"change_user_id",this.changeUserId);
			this.save();
		},
		validate : function(attrs,opt){
		},
		error : function(model,error,opt){
			console.log("ResumeREC#error");
		},
		fetchUserId  : function(id){ console.log("ResumeREC#fetchUserId",arguments); this.set("id",id).fetch() },
		changeUserId : function(id){ console.log("ResumeREC#changeUserId",arguments); this.set("id",id).save() },
		resetData : function(pc_id,is_data_delete){
			this.destroy();
			this.attributes = (is_data_delete) ? {} : this.defaults();
			this.set("id",pc_id);
			this.save();
		},
		changeBattleStatus :function(type){
			
			if(type == "battleEnd"){
				console.log("ResumeREC#changeBattleStatus battleEnd");
				this.cave.attributes.status.play = df.STATE_CAVE_NOW;
				this.set("status",df.RESUME_CAVE)
				this.cave.save();
				this.save();
			}else{
				console.log("ResumeREC#changeBattleStatus battleStart");
				this.cave.attributes.status.play = df.RESUME_BATTLE;
				this.set("status",df.RESUME_BATTLE)
				this.cave.save();
				this.save();
			}
		},
		changeCaveStatus   :function(model){
			
		},
		changeCaveMapStatus:function(model){
			
		},
		changeCaveMgrStatus:function(type){
			if(type == "gameNext"){
				this.cave.attributes.status.play = df.STATE_CAVE_NOW;
				this.set("status",df.RESUME_CAVE)
			}
			if(type == "gameResult"){
				this.cave.attributes.status.play = df.STATE_CAVE_AFTER;
				this.set("status",df.RESUME_CAVE_RESULT)
			}
			if(type == "gameEnd"){
				this.cave.attributes.status.play = df.STATE_CAVE_BEFORE;
				this.set("status",df.RESUME_VIEW_AREA_SELECT)
			}
			this.save();
		},
		changeDeckStatus   :function(model){
			
		},
		changePcStatus     :function(model){
			
		},
		
	});
	
	return ResumeREC;
});





