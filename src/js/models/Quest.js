define([],function(){
	
	var Quest = Backbone.Model.extend({
		constructor:function(){
			// シングルトン
			if(!Quest.instance){
				Quest.instance = this;
				Backbone.Model.apply(Quest.instance,arguments);
			}
			return Quest.instance;
		},
		defaults    : function(){ return this.defaultAttr() },
		defaultAttr : function(){
			var world_data = _.groupBy(st.QuestListData,function(data){ return data.world_id; });
			var area_data = _.reduce(world_data,function(result,world,id){
				result[id] = _.groupBy(world,function(data){ return data.area_id; });
				return result
			},{})
			
			//下2ケタを除いたID一覧を作成
			//key_quest==0は除外ために必要な処理
			var quest_list = _.sortBy(st.QuestListData, function(data){ return data.id });
			var group_ids = []
			for(var i in quest_list){
				if(quest_list[i].key_quest!=0 && quest_list[i].world_id!=99 ){
					group_ids.push( (quest_list[i].id/1000).floor() );
				}
			}
			group_ids = _.uniq(group_ids).sort();
			
			var quest_play_status = _.reduce(st.QuestListData,function(result,quest,id){
				result[id] = {
					clear:0,
					play:0,
					fail:0,
				}
				return result
			},{})
			
			return {
				id:1,
				world_data:world_data,
				area_data :area_data,
				group_ids :group_ids,
				quest_play_status:quest_play_status,
			}
		},
		initialize:function(){
			window.App.data.quest = this.attributes;
		},
		updateQuest:function(){
			//クエストの状態の更新はPcRECで行う
		},
		getAvailableScenario:function(world_id,quest_status,quest_play){
			//quest_status = {
			//	clear_ids       : [1010101,1010102,1010201],
			//	available_quest : 10101,
			//	available_world : 1,
			//	available_area  : 2,
			//	available_group : 1,
			//}
			if(quest_status==undefined){ throw "Quest#getAvailableScenario quest_statusがundefined"; }
			var status = _.cloneDeep(quest_status);
			
			console.log("Quest#getAvailableScenario [quest_status]",status);
			
			// 有効なエリアの、key_questのみ抽出
			var available_area_data = this.get("area_data")[world_id][status.available_area];
			available_area_data = _.filter(available_area_data,function(area){ return area.key_quest == 1 });
			console.log("Quest#getAvailableScenario [available_area_data]",available_area_data);
			
			// 現在のグループを全てクリアしているかチェック
			var available_group_data = _.groupBy(available_area_data,function(data){ return data.group_id })[status.available_group];
			var is_clear_key_quest = 1;
			for(var i in available_group_data){
				if(!quest_play[ available_group_data[i].id ] || !quest_play[ available_group_data[i].id ].clear ){
					is_clear_key_quest = 0;
				}
			}
			
			var next_quest_id = status.available_quest;
			if( is_clear_key_quest ){
				var current_group_index = _.indexOf(this.get("group_ids"), (status.available_quest/1000).floor()); //group_idsの中で何番にavailable_questがあるか調べる
				var world_check = ( this.get("group_ids")[current_group_index + 1] /1000000).floor();
				
				if(status.available_world != world_check){
					// worldをクリアしていたら、クリアフラグだけ立てて次のクエストには進まない
					status.is_world_clear = 1;
				}else{
					//グループをクリアしていたら次のidへ。
					var next_quest_id = (this.get("group_ids")[current_group_index + 1] + "001").toNumber();
					if(st.QuestListData[next_quest_id] == undefined  ){ throw "ダンジョンID 1 がありません"; }
					if(st.QuestListData[next_quest_id].key_quest == 0){ throw "クエストタイプが 0 です。"; }
					status.clear_ids = [];
				}
			}
			
			var ret = {
				clear_ids          : status.clear_ids,
				available_quest    : next_quest_id,
				available_group    : next_quest_id.toString().slice(-6,-3).toNumber(),
				available_area     : next_quest_id.toString().slice(-9,-6).toNumber(),
				available_world    : (next_quest_id/1000000000).floor(),
				is_available_world : status.is_available_world,
				is_world_clear     : status.is_world_clear,
			}
			
			return ret;
		},
		
		createQuestList : function(current_world,current_area,quest_status){
			if(current_world == undefined){ current_world = 1 };
			if(current_area  == undefined){ current_area = 1  };
			if(quest_status  == undefined){
				alert("createQuestList : quest_statusがundefinedです")
				var available_area   = 1;
				var available_group  = 1;
			}else{
				var available_area   = quest_status.available_area;
				var available_group  = quest_status.available_group;
			}
			
			//ワールドセレクト機能をつけるときはここを変更
			var area_list = _.reduce(this.get("area_data")[current_world],function(result,data){
				if( data[0].area_id <= available_area ){
					result[data[0].area_id] = data[0];
				}
				return result
			},{});
			
			//有効なクエスト一覧を作成
			var group_data = _.groupBy(this.get("area_data")[current_world][current_area],function(data){ return data.group_id; });
			var quest_list = _.reduce(group_data,function(result,data){
				for(var i in data){
					if( data[i].area_id < available_area ){
						result[data[i].id] = data[i];
					}else if( data[i].area_id == available_area && data[i].group_id <= available_group ){
						result[data[i].id] = data[i];
					}
				}
				return result
			},{});
			
			
			var quest_data = {
				world_data:this.get("world_data"),
				area_data :this.get("area_data")[current_world] ,
				area_list :_.cloneDeep(area_list ),
				group_data:_.cloneDeep(group_data),
				quest_list:_.cloneDeep(quest_list),
			}
			console.log("Quest#createQuestList [quest_data]",_.cloneDeep(quest_data));
			
			return quest_data;
		},
		appendPlayStatus:function(pc_quest_play_data,quest_data){
			__.checkType("undefined",[pc_quest_play_data,quest_data]);
			
			
			//空データを作成、playデータを付加
			var quest_play_status = this.get("quest_play_status");
			_.extend(quest_play_status,pc_quest_play_data);
			
			//作ったデータからarea状況を判定
			var area_play_status = _.reduce(quest_data.area_data,function(result,area,id){
				result[id] = {
					clear:1,
					play:1,
				}
				for(var i in area){
					var quest_id = area[i].id;
					//1つでもクリアしてないものがあったらフラグを下げる
					if(quest_play_status[quest_id].clear == 0){
						result[id].clear = 0;
					}
					//1つでもプレイしてないものがあったらフラグを下げる
					if(quest_play_status[quest_id].play == 0){
						result[id].play = 0;
					}
				}
				return result
			},{})
			
			//ステータスを付加する
			_.map(quest_data.quest_list,function(data,id){
				data.clear_flag = quest_play_status[id].clear;
				data.play_flag  = quest_play_status[id].play;
			})
			_.map(quest_data.area_list,function(data,id){
				data.clear_flag = area_play_status[id].clear;
				data.play_flag  = area_play_status[id].play;
			})
			
			console.log("Quest#appendPlayStatus [quest_play_status,area_play_status,quest_data]", [quest_play_status,area_play_status,quest_data]);
			
			return quest_data
		},
		/**
		 * その階のfloorデータを取得
		 * @memberof Quest
		 * @function getFloorData
		 */
		getFloorData:function(quest_id,floor_now){
			var quest_data = st.QuestListData[ quest_id ];
			var current_floor = 0;
			for(var i=0;i<quest_data.floor.length;i++){
				if( floor_now <= quest_data.floor[i] ){
					current_floor = i;
					break
				}
			}
			console.log("Quest#getFloorData [quest_id,current_floor]",[quest_id,current_floor]);
			var floor_data = {
				floor      : quest_data.floor[current_floor],
				level      :quest_data.level[current_floor],
				cave_map_id:quest_data.cave_map_id[current_floor],
				scratch_id :(quest_id*1000) + current_floor,
			}
			return floor_data
		},
		
		/**
		 * クエストの基本情報を返す
		 * @memberof Quest
		 * @function getFloorData
		 */
		getQuestInfo:function(quest_id){
			var quest_data = st.QuestListData[quest_id]
			
			// 最大フロア数
			var floor_max = quest_data.floor_max
			
			// 最大難易度
			var level = _.max(quest_data.level,function(level){ return level })
			
			// 敵情報取得。{card_id:int, card_data:object}で返す。
			var scrach_data_ids = _.reduce(quest_data.floor, function(result,floor,n){
				if(floor!=0) result.push(quest_id + n.pad(3));
				return result
			},[])
			var scrach_data_all = _.reduce(scrach_data_ids,function(result,id){
				return result.concat( st.CaveScratchDataMin[id] );
			},[])
			var scrach_data_enemy = _.reduce(scrach_data_all,function(result,data){
				if(data[1] == df.EVENT_ENEMY || data[1] == df.EVENT_MIMIC || data[1] == df.EVENT_BOSS){
					_.map( data[2].split("/") ,function(enemy){
						var seed_id = enemy.split("_")[0];
						var card_id = st.CardSeedData[seed_id].card_id;
						result[card_id] = {card_id:card_id, card_data: st.CardData[card_id] };
					})
				}
				return result;
			},{})
			var enemys = _.values(scrach_data_enemy).sort(function(a,b){ return a.card_id - b.card_id });
			
			var first_reward = __.excelArrayToJSON(quest_data,["first_reward_id", "first_reward_type", "first_reward_vol"]);
			var reward       = __.excelArrayToJSON(quest_data,["reward_id"      , "reward_type"      , "reward_vol"      ]);
			
			return {
				data        : quest_data,
				enemys      : enemys,
				floor_max   : floor_max,
				level       : level,
				first_reward: first_reward,
				reward      : reward,
			}
		},
		
	});
	
return Quest;

});
