define([
	"models/PcREC",
	"models/Quest",
	"models/CaveREC",
	"models/CaveMapREC",
	"models/CaveManager",
	"controllers/Animations",
],function(PcREC,Quest,CaveREC,CaveMapREC,CaveManager,Animations){
	
	var CaveResultView = Backbone.View.extend({
		id:"cave_result_view",
		tagName:"div",
		events:{
			"ftap .result_btn": "next"
		},
		initialize:function(){
			this.pc = new PcREC;
			this.quest = new Quest;
			this.cave = new CaveREC;
			this.caveMap = new CaveMapREC;
			this.caveMgr = new CaveManager;
		},
		next: function(){
			this.caveMgr.trigger("Resume","gameEnd");
			App.router.navigate("/html/Quest/selectArea",{trigger:true});
			this.cave.destroy();
			this.caveMap.destroy();
		},
		response:function(){
			var play_result = this.cave.get("status").play_result;
			var quest_id    = this.cave.get("quest_id");
			var quest_play  = this.pc.attributes.quest_play;
			var result      = this.cave.toJSON().result;
			var response = {
				dungeon_name  : st.QuestListData[quest_id].dungeon_name,
				play_result   : (play_result == df.QUEST_RESULT_CLEAR) ? "clear" : "fail" ,
				result        : result,
				exist_reward  : (result.clear_first_reward.length>0 || result.clear_reward.length>0)? 1 : 0,
				is_first_clear: (play_result == 1 && quest_play[quest_id].clear == 1),
				coin          : (result.got_item_data[df.ITEM_GAME_MONEY] )?result.got_item_data[df.ITEM_GAME_MONEY].point :0,
				real_money    : (result.got_item_data[df.ITEM_REAL_MONEY] )?result.got_item_data[df.ITEM_REAL_MONEY].point :0,
				gacha_pt      : (result.got_item_data[df.ITEM_GACHA_POINT])?result.got_item_data[df.ITEM_GACHA_POINT].point:0,
				phrase        : result.got_phrase_data.length,
				capture_num   : result.get_member_list.length,
				battle_cnt    : result.enemy_win_count,
			};
			return response;
		},
		render:function(){
			console.log("CaveResultView#render [this.cave, this.caveMap]",[this.cave, this.caveMap]);
			this.$el.html( __.template("cave/cave_result_view",this.response()) );
			
			this.$el.find(".result .num").css("opacity",0);
			this.$el.find(".clear_reward_container").css("opacity",0);
			this.$el.find(".result_btn").css("opacity",0);
			
			return this;
		},
		setupView:function(){
			var result_anim = new App.anim.CaveResult({ $target: this.$el });
			result_anim.render();
		},
	});
	
	
	return CaveResultView;
})

