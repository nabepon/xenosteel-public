define([
	"models/GachaDraw",
	"models/GachaListData",
	"models/PcREC",
	"models/Mate",
	"models/CaveMapREC",
	"models/CaveREC",
	"models/BattleREC",
	"models/Quest",
""],function(GachaDraw,GachaListData,PcREC,Mate,CaveMapREC,CaveREC,BattleREC,Quest){
	
	var SampleQuestData = Backbone.View.extend({
		tagName:"div",
		initialize:function(){
			this.quest   = new Quest;
			this.battle  = new BattleREC;
			this.cave    = new CaveREC;
			this.caveMap = new CaveMapREC;
		},
		createResponse:function(){
			var caveScratchDataAll = this.caveMap.makeCaveScratchDataAll()
			var questDispData = _.reduce(st.QuestListData,function(result,data,id){
				var floor_num = 1;
				var floor_data_num = 0;
				var floor_data_list = [];
				for(var i=0;i<data.floor.length;i++){
					var end_floor = data.floor[i];
					if(end_floor > data.floor_max){ end_floor = data.floor_max };
					var floor_data = {
						scratch_id  : id + (i).pad(3),
						start_floor : floor_num,
						end_floor   : end_floor,
						floor_num   : data.floor[i] + 1,
						rate_max    :_.reduce(scratch_data,function(sum,data){ sum += data.rate; return sum },0),
						level       : data.level[i],
						cave_map_id : data.cave_map_id[i],
						floor_max   : data.floor_max,
					};
					
					var scratch_data = caveScratchDataAll[floor_data.scratch_id];
					var rate_max = _.reduce(scratch_data,function(sum,data){ sum += data.rate; return sum },0)
					var events = _.groupBy(scratch_data,function(data){ return data.event_type })
					
					floor_data.rate_max =rate_max;
					floor_data.events   ={
						money    :events[ 1],
						kiseki   :events[ 2],
						gacha_pt :events[ 3],
						drop_item:events[ 9],
						trap     :events[10],
						enemy    :events[11],
					}
					floor_data.rates    ={
						money    :_.reduce(events[ 1],function(sum,data){ sum += data.rate; return sum },0) / rate_max  * 100,
						kiseki   :_.reduce(events[ 2],function(sum,data){ sum += data.rate; return sum },0) / rate_max  * 100,
						gacha_pt :_.reduce(events[ 3],function(sum,data){ sum += data.rate; return sum },0) / rate_max  * 100,
						drop_item:_.reduce(events[ 9],function(sum,data){ sum += data.rate; return sum },0) / rate_max  * 100,
						trap     :_.reduce(events[10],function(sum,data){ sum += data.rate; return sum },0) / rate_max  * 100,
						enemy    :_.reduce(events[11],function(sum,data){ sum += data.rate; return sum },0) / rate_max  * 100,
					}
					
					floor_data_list.push(floor_data);
					if(data.floor[i] >= data.floor_max){ break }
				}
				
				result[id] = {
					id:id,
					world:data.world_id,
					area :data.area_id,
					group:data.group_id,
					quest:data.quest_id,
					name :data.dungeon_name,
					floor_data:floor_data_list,
				};
				
				return result
			},{})
			return {questDispData:questDispData};
		},
		render:function(){	
			
			var enemys = this.battle.createEnemyParty([10010000,10020000],[10,100]);
			console.log("SampleQuestData#render [enemys]",enemys);
			
			var response = this.createResponse();
			console.log("SampleQuestData#render [response]",response);
			
			this.$el.html( __.template("sample/quest_data",response) );
			return this;
		},
	});
	
	return SampleQuestData;
	
})

