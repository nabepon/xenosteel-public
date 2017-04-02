define([
	"models/PcREC",
	"models/ShopREC",
	"models/Twitter",
	"models/Quest",
],function(PcREC,ShopREC,Twitter,Quest){
	
	var CLEAR_TOTAL   = 0;
	var CLEAR_DAY     = 1;
	var CLEAR_TIME    = 2;
	var CLEAR_COMEBACK= 3;
	var PROGRESS      = 4;
	var CANCEL_TIME   = 5;
	var GUERRILLA_END = 6;
	
	var QUEST_WORLD = 1;
	
	var MissionREC = Backbone.Model.extend({
		constructor:function(){
			if(!MissionREC.instance){
				MissionREC.instance = this;
				Backbone.Model.apply(MissionREC.instance,arguments);
			}
			return MissionREC.instance;
		},
		localStorage : new Backbone.LocalStorage("MissionREC"),
		defaults    :function(){
			this.pc = new PcREC;
			return {
				id :this.pc.get("id"),
				mission_state : {},
				current_mission_list : [],
				last_reset_time : 0,
				last_guerrilla_check_time : 0,
			}
		},
		defaultState : function(){
			return [0,0,0,0,0,0,0];
		},
		initialize:function(option){
			console.log("MissionREC#initialize");
			this.fetch();
			this.listenTo(this.pc,"reset_data",this.resetData);
			this.listenTo(this.pc,"fetch_user_id",this.fetchUserId);
			this.listenTo(this.pc,"change_user_id",this.changeUserId);
			this.save();
			
			_.bindAll(this,"afterBegin","beforeEnd","inPeriod","meetKey","meetKeyForDay","meetKeyForTotal","notClearDay","notClearTotal","notClearComeback","notClearComebackCnt3","afterCancelForDay","afterCancelForTime","afterFailedForTime")
			var mission_data   = this.addNextIdAndDefaultState(st.MissionData);
			this.mission_data  = _(mission_data).sort(function(a,b){ return b.id - a.id }).groupBy("kind").valueOf();
			this.updateList();
		},
		fetchUserId  : function(id){ console.log("MissionREC#fetchUserId",arguments); this.set("id",id).fetch() },
		changeUserId : function(id){ console.log("MissionREC#changeUserId",arguments); this.set("id",id).save() },
		resetData : function(pc_id,is_data_delete){
			this.destroy();
			this.attributes = (is_data_delete) ? {} : this.defaults();
			this.set("id",pc_id);
			this.save();
		},
		
		/*************************************************
		**- define
		*************************************************/
		CLEAR_TOTAL   :CLEAR_TOTAL   ,
		CLEAR_DAY     :CLEAR_DAY     ,
		CLEAR_TIME    :CLEAR_TIME    ,
		CLEAR_COMEBACK:CLEAR_COMEBACK,
		PROGRESS      :PROGRESS      ,
		CANCEL_TIME   :CANCEL_TIME   ,
		GUERRILLA_END :GUERRILLA_END ,
		
		/*************************************************
		**- utils
		*************************************************/
		// current_mission_listにstateを追加したデータを返す
		getMissionDataList: function(){
			this.updateList();
			var current_mission_list = _.cloneDeep( this.get("current_mission_list") );
			return _.map( current_mission_list, function(data){
				var state = this.get("mission_state")[data.id];
				return _.extend( {state: _.cloneDeep(state) }, data );
			},this)
		},
		
		// next_idの追加と、stateに初期値の設定
		addNextIdAndDefaultState: function(st_mission_data){
			var mission_state = this.get("mission_state");
			_.each(st_mission_data,function(data,key){ data.next_id = [] });
			_.each(st_mission_data,function(data,key){
				// st.MissionDataにnext_idを追加する
				_.each(data.key_id,function(key){ if(key) st_mission_data[key].next_id.push(data.id); })
				
				// mission_stateにdefaultStateを追加する
				if(!mission_state[key]) mission_state[key] = this.defaultState();
			},this);
			return st_mission_data;
		},
		
		// 1日経過でCLEAR_DAYを0にリセット
		resetClearDay: function(){
			var reset_day = __.moment( this.get("last_reset_time") ).format("YYYY-MM-DD");
			var today = __.moment().format("YYYY-MM-DD");
			if( __.moment(reset_day).valueOf() < __.moment(today).valueOf() ){
				_.each(this.get("mission_state"), function(data){
					data[CLEAR_DAY] = 0;
					//data[PROGRESS] = 0;
				})
				this.set("last_reset_time", __.baseTime() ).save();
			}
		},
		
		// 1日経過でCLEAR_DAYを0にリセット
		resetClearComeback: function(term){
			if(term < 7*24*60*60*1000) return;
			_.each(this.get("mission_state"), function(data){
				data[CLEAR_COMEBACK] = 0;
			})
			this.save();
		},
		
		//cancel
		cancel: function(mission_id){
			this.get("mission_state")[mission_id][CANCEL_TIME] = __.baseTime();
			this.omitMission(mission_id);
			this.save();
		},
		
		//ミッションの削除
		omitMission: function(mission_id){
			var mission_list = _.filter(this.get("current_mission_list"), function(data){ return data.id != mission_id })
			this.set("current_mission_list",mission_list);
		},
		
		//クリア判定結果を追加
		checkClear: function(mission){
			var state = this.get("mission_state")[mission.id];
			console.log("MissionREC#checkClear [state,mission]",state,mission);
			if(state[PROGRESS] >= mission.progress_max && !mission.is_clear){
				mission.is_clear = 1;
				console.log("MissionREC#checkClear CLEAR! [state,mission]",state,mission);
			}
		},
		
		//Progressを追加
		incProgress: function(mission,cnt){
			console.log("MissionREC#incProgress [mission,cnt]",mission,cnt)
			if(mission.is_clear) return;
			var state = this.get("mission_state")[mission.id];
			state[PROGRESS] += cnt;
		},
		
		//Progressを任意の値にset
		setProgress: function(mission,cnt){
			if(mission.is_clear) return;
			var state = this.get("mission_state")[mission.id];
			state[PROGRESS] = cnt;
		},
		
		//clear、報酬受け取り処理
		clear: function(mission_id){
			console.log("MissionREC#clear [mission_id]",mission_id);
			var mission_data = _.find(this.mission_list, function(data){ return data.id == mission_id });
			var reward_data  = __.excelArrayToJSON(mission_data, ["reward_type","reward_id","reward_vol"])
			_.each(reward_data,function(reward){
				this.pc.addItem(reward.reward_id, reward.reward_vol, reward.reward_type)
			},this)
			this.omitMission(mission_id);
			
			var state = this.get("mission_state")[mission_id];
			    state[CLEAR_TOTAL]    += 1;
			    state[CLEAR_COMEBACK] += 1;
			    state[CLEAR_DAY]       = 1;
			    state[PROGRESS]        = 0;
			
			this.pc.save();
			this.save();
		},
		
		//debug
		testClear: function(mission_id){
			var state = this.get("mission_state")[mission_id];
			var mission = _.find(this.mission_list, function(mission){ return mission.id == mission_id });
			state[PROGRESS] = mission.progress_max;
			this.checkClear(mission);
		},
		
		/*************************************************
		**- predicate
		* filterの判定メソッド
		*************************************************/
		// 開始期間チェック
		afterBegin : function(data){ return !(data.begin && __.baseTime() < __.moment(data.begin).valueOf()) },
		
		// 終了期間チェック
		beforeEnd : function(data){ return !(data.end   && __.moment(data.end).valueOf() < __.baseTime()) },
		
		// 期間内チェック
		inPeriod : function(data){ return (this.afterBegin(data) && this.beforeEnd(data)) },
		
		// KeyIdの条件を満たして(meet)いるかチェック
		meetKey : function(data,type,cnt){
			var key_ids = _.compact(data.key_id);
			//console.log(key_ids);
			if(key_ids.length == 0) return 1;
			
			var judge_result = 1;
			_.each(key_ids,function(key){
				if(this.get("mission_state")[key][type] < cnt) judge_result = 0;
			},this)
			return judge_result;
		},
		
		// KeyIdの条件を、今日満たしたかチェック
		meetKeyForDay        : function(data){ return this.meetKey(data, CLEAR_DAY  , 1) },
		
		// KeyIdの条件を、今までに満たしたことがあるかチェック
		meetKeyForTotal      : function(data){ return this.meetKey(data, CLEAR_TOTAL, 1) },
		
		// 今日クリアしていないもののみ
		notClearDay          : function(data){ return this.get("mission_state")[data.id][CLEAR_DAY] == 0 },
		
		// 今までクリアしたことがないもののみ
		notClearTotal        : function(data){ return this.get("mission_state")[data.id][CLEAR_TOTAL] == 0 },
		
		// 今までクリアしたことがないもののみ
		notClearComeback     : function(data){ return this.get("mission_state")[data.id][CLEAR_COMEBACK] == 0 },
		
		// いままでのクリア回数3以下のもののみ
		notClearComebackCnt3 : function(data){ return this.get("mission_state")[data.id][CLEAR_COMEBACK] < 3 },
		
		// cancelしたものを翌日復活させる
		afterCancelForDay  : function(data){
			var cancel_time = this.get("mission_state")[data.id][CANCEL_TIME];
			var cancel_day  = __.moment(cancel_time).format("YYYY-MM-DD");
			var today       = __.moment().format("YYYY-MM-DD");
			return (cancel_time == 0 || __.moment(cancel_day).valueOf() < __.moment(today).valueOf() )
		},
		
		// cancelしたものを一定時間後復活させる
		afterCancelForTime : function(data){
			var compare_time = 6*60*60*1000; // 6時間後
			var cancel_time  = this.get("mission_state")[data.id][CANCEL_TIME];
			return (__.baseTime() - cancel_time > compare_time)
		},
		
		// ミッション失敗判定
		afterFailedForTime : function(data){ return this.afterCancelForTime(data) },
		
		//kind内で有効なNextIdが存在しないもののみにする
		emptyNextIdWithKind: function(data){
			var has_next_id = 0;
			_.each(data.next_id,function(id){
				if(this.mission_data[id].kind == data.kind){
					has_next_id = 1;
				}
			},this)
			return (has_next_id)?0:1;
		},
		
		
		/*************************************************
		**- updateList
		*************************************************/
		updateList: function(){
			console.log("MissionREC#updateList")
			this.resetClearDay();
			this.mission_list_data = {}
			
			var mission_data = this.mission_data;
			var tutorial     = _(mission_data.TUTORIAL).filter(this.meetKeyForTotal).filter(this.notClearComeback).first();
			var tutorial_ad  = _(mission_data.TUTORIAL_AD).filter(this.meetKeyForDay).filter(this.notClearComebackCnt3).filter(this.notClearDay).first();
			var guerrilla    = _(mission_data.GUERRILLA).filter(this.meetKeyForDay).filter(this.notClearDay).filter(this.afterFailedForTime).shuffle().first();
			var event_list   = _(mission_data.EVENT).filter(this.inPeriod).filter(this.meetKeyForTotal).filter(this.notClearTotal).shuffle().slice(0,3).value();
			var event_list   = _(mission_data.EVENT).filter(this.inPeriod).filter(this.meetKeyForTotal).filter(this.notClearTotal).value();
			var routine      = _(mission_data.ROUTINE).filter(this.meetKeyForDay).filter(this.notClearDay).first();
			var count        = _(mission_data.COUNT).filter(this.meetKeyForTotal).filter(this.notClearDay).filter(this.afterCancelForTime).shuffle().first();
			var wanted       = _(mission_data.WANTED).filter(this.afterCancelForTime).shuffle().first();
			//var wanted       = _(mission_data.WANTED).filter(this.afterCancelForTime).filter(function(data){ return data.type_str == "SLAY_CARD_ATTR" }).first();
			var book         = _(mission_data.BOOK).filter(this.meetKeyForTotal).filter(this.notClearTotal).first();
			var conversion   = _(mission_data.CONVERSION).filter(this.meetKeyForTotal).filter(this.notClearTotal).filter(this.afterCancelForDay).first();
			
			    tutorial     =                         this.createMission("TUTORIAL"   , tutorial   );
			    if(appenv.BUILD_LEVEL == appenv.DEBUG_BUILD) tutorial = false;
			    tutorial_ad  =                         this.createMission("TUTORIAL_AD", tutorial_ad);
			    guerrilla    = (tutorial)? undefined : this.createMission("GUERRILLA"  , guerrilla  );
			    event_list   =                         this.createMission("EVENT"      , event_list );
			    routine      =                         this.createMission("ROUTINE"    , routine    );
			    count        =                         this.createMission("COUNT"      , count      );
			    wanted       = (tutorial)? undefined : this.createMission("WANTED"     , wanted     );
			    book         = (tutorial)? undefined : this.createMission("BOOK"       , book       );
			    conversion   = (tutorial)? undefined : this.createMission("CONVERSION" , conversion );
			    
			this.mission_list_data = {
				tutorial   : tutorial   ,
				tutorial_ad: tutorial_ad,
				guerrilla  : guerrilla  ,
				event_list : event_list ,
				routine    : routine    ,
				count      : count      ,
				wanted     : wanted     ,
				book       : book       ,
				conversion : conversion ,
			}
			
			this.mission_list = _.compact( [].concat([tutorial, tutorial_ad, guerrilla]).concat(event_list).concat([routine, count, wanted, book, conversion]) );
			this.set("current_mission_list", this.mission_list);
		},
		
		//ミッションの存在判定を行う
		createMission: function(kind, mission){
			var mission = _.cloneDeep(mission);
			var current_list = _.filter(this.get("current_mission_list"), function(data){ return data.kind == kind });
			
			if(kind == "GUERRILLA") return this.createMissionGuerrilla(mission,current_list);
			if(kind == "WANTED"   ) return this.createMissionWanted(mission, current_list);
			if(kind == "COUNT"    ) return this.createMissionCount(mission, current_list);
			if(kind == "EVENT"    ) return this.createMissionEvent(mission, current_list);
			
			return (current_list.length > 0)? current_list[0]: mission;
		},
		
		//ゲリラミッションの加工
		createMissionGuerrilla: function(mission, current_list){
			var current = current_list[0];
			var now = __.baseTime();
			
			// 発生中のミッションがあり、ゲリラ終了前なら現在のものを返す。
			// ミッションがなかったらundefinedを返す
			// 最後のゲリラ発生チェックから12時間経過していなかったらundefinedを返す
			if(current_list.length > 0 && now < current.guerrilla_end) return current;
			if(!mission) return;
			if( __.baseTime() - this.get("last_guerrilla_check_time") < 8*60*60*1000 ) return;
			
			// ここまで抜けたら、新規ミッション作成とゲリラ発生時刻を保存
			// 半分の確率でmissionデータを作成する
			this.set("last_guerrilla_check_time", __.baseTime() );
			var is_create = _.random(0,1);
			if(is_create){
				mission.guerrilla_end = now + 3*60*60*1000;
				return mission;
			}
		},
		
		//Countミッションの加工
		createMissionCount: function(mission, current_list){
			if(current_list.length > 0) return current_list[0];
			if(!mission) return 
			
			var progress_data  = JSON.parse(mission.type_data);
			var clear_total    = this.get("mission_state")[mission.id][CLEAR_TOTAL];
			var progress_index = Math.min(clear_total, progress_data.length-1);
			mission.progress_max = progress_data[progress_index];
			return mission
		},
		//Wantedミッションの加工
		createMissionWanted: function(mission, current_list){
			if(current_list.length > 0) return current_list[0];
			if(!mission) return 
			
			var type_data = mission.type_data.split("/");
			var progress_data  = JSON.parse(type_data[0]);
			var progress_index =_.random(0,progress_data.length-1);
			mission.progress_max = progress_data[progress_index];
			if(mission.type_str=="SLAY_CARD_LEVEL" ) mission = this.addWantedDataSlayCardLevel(mission);
			if(mission.type_str=="SLAY_CARD_ATTR"  ) mission = this.addWantedDataSlayCardAttr(mission);
			if(mission.type_str=="SLAY_CARD_RARITY") mission = this.addWantedDataSlayCardRarity(mission);
			return mission
		},
		addWantedDataSlayCardLevel: function(mission){
			var type_data = mission.type_data.split("/");
			var type = type_data[1];
			mission.level = 1;
			if(type == "current_quest"){
				var pc = new PcREC;
				var available_quest = pc.get("quest_status")[QUEST_WORLD].available_quest;
				var quest = new Quest;
				mission.level = quest.getQuestInfo(available_quest).level;
			}else{
				mission.level = type.toNumber();
			}
			return mission
		},
		addWantedDataSlayCardAttr: function(mission){
			var type = mission.type_data.split("/")[1];
			mission.attr = (type == "random")? _.random(1,5): type.toNumber();
			return mission
		},
		addWantedDataSlayCardRarity: function(mission){
			var type_data = mission.type_data.split("/");
			mission[ type_data[1] ]  = 1; // is_under is_equal is_upperのどれかを1にする
			mission.rarity = type_data[2].toNumber();
			return mission
		},
		
		//Eventミッション加工
		createMissionEvent: function(mission_list, current_list){
			if(current_list.length > 0) return current_list;
			
			mission_list = _.map(mission_list,function(mission){
				
				     if(mission.type_str=="PLAY_QUEST_ID"      ) mission = this.addEventdDataPlayQuestId(mission);
				else if(mission.type_str=="CLEAR_QUEST_ID"     ) mission = this.addEventdDataClearQuestId(mission);
				else if(mission.type_str=="SLAY_CARD_UNIQU"    ) mission = this.addEventdDataSlayCardUniqu(mission);
				else if(mission.type_str=="SLAY_CARD_ID"       ) mission = this.addEventdDataSlayCardId(mission);
				else if(mission.type_str=="SLAY_CARD_LEVEL"    ) mission = this.addEventdDataSlayCardLevel(mission);
				else if(mission.type_str=="SLAY_CARD_ATTR"     ) mission = this.addEventdDataSlayCardAttr(mission);
				else if(mission.type_str=="SLAY_CARD_RARITY"   ) mission = this.addEventdDataSlayCardRarity(mission);
				else if(mission.type_str=="CAPTURE_CARD_UNIQU" ) mission = this.addEventdDataCaptureCardUniqu(mission);
				else if(mission.type_str=="CAPTURE_CARD_ID"    ) mission = this.addEventdDataCaptureCardId(mission);
				else if(mission.type_str=="CAPTURE_CARD_ATTR"  ) mission = this.addEventdDataCaptureCardAttr(mission);
				else if(mission.type_str=="CAPTURE_CARD_RARITY") mission = this.addEventdDataCaptureCardRarity(mission);
				
				return mission
			},this)
			return mission_list
		},
		addEventdDataPlayQuestId: function(mission){
			mission.quest_id = mission.type_data.split("/")[0].toNumber();
			return mission
		},
		addEventdDataClearQuestId: function(mission){
			mission.quest_id = mission.type_data.split("/")[0].toNumber();
			return mission
		},
		addEventdDataSlayCardUniqu: function(mission){
			var type_data = mission.type_data.split("/");
			mission.quest_id = type_data[0].toNumber();
			mission.card_id = type_data[1].toNumber();
			return mission
		},
		addEventdDataSlayCardId: function(mission){
			mission.card_id = mission.type_data.split("/")[0].toNumber();
			return mission
		},
		addEventdDataSlayCardLevel: function(mission){
			mission.level = mission.type_data.split("/")[0].toNumber();
			return mission
		},
		addEventdDataSlayCardAttr: function(mission){
			mission.attr = (mission.type_data=="random")? _.random(1,5): mission.type_data.split("/")[0].toNumber();
			return mission
		},
		addEventdDataSlayCardRarity: function(mission){
			var type_data = mission.type_data.split("/");
			mission.rarity = type_data[0].toNumber();
			mission[ type_data[1] ] = 1;
			return mission
		},
		addEventdDataCaptureCardUniqu : function(mission){ return this.addEventdDataSlayCardUniqu(mission)  },
		addEventdDataCaptureCardId    : function(mission){ return this.addEventdDataSlayCardId(mission)     },
		addEventdDataCaptureCardAttr  : function(mission){ return this.addEventdDataSlayCardAttr(mission)   },
		addEventdDataCaptureCardRarity: function(mission){ return this.addEventdDataSlayCardRarity(mission) },
		
		
		/*************************************************
		**- checkProcess
		*************************************************/
		checkProcess: function(process_type,data){
			console.log("MissionREC#checkProcess [process_type,data]",process_type,data)
			// todo;findではなくfilterにする必要有り
			var target_list = _.filter(this.get("current_mission_list"), function(data){ return data.type_str == process_type });
			if(target_list.length == 0) return;
			
			_.each(target_list,function(mission){
				process_type = (this.processList[process_type])? process_type : "INC_PROGRESS";
				_.bind(this.processList[process_type],this)(mission, data);
			},this)
			
			this.save();
		},
		processList: {
			CURRENT_AREA: function(mission,quest_id){
				var pc = new PcREC;
				var available_quest = pc.get("quest_status")[QUEST_WORLD].available_quest;
				var play_area      = (quest_id.toNumber()/1000).floor()
				var available_area = (available_quest/1000).floor()
				if(play_area == available_area){
					this.incProgress(mission, 1);
					this.checkClear(mission);
				}
			},
			PLAY_QUEST_ID: function(mission,quest_id){
				if(mission.quest_id == quest_id){
					this.incProgress(mission, 1);
					this.checkClear(mission);
				}
			},
			CLEAR_QUEST_ID: function(mission,data){
				var quest_id = data[0];
				var result = data[1];
				if(mission.quest_id == quest_id && result == df.QUEST_RESULT_CLEAR){
					this.incProgress(mission, 1);
					this.checkClear(mission);
				}
			},
			CAPTURE_CARD: function(mission,get_member_list){
				this.incProgress(mission, get_member_list.length);
				this.checkClear(mission);
			},
			REVIEW_APP: function(mission,capture_num){
				var shop = new ShopREC;
				this.incProgress(mission, shop.get("is_reviewed")?1:0);
				this.checkClear(mission);
			},
			COMP_CARD: function(mission){
				var zukan_num = _.reduce(this.pc.get("zukan_flag"),function(sum,flag){ if(flag){sum++}; return sum },0);
				this.setProgress(mission, zukan_num);
				this.checkClear(mission);
			},
			SELL_CARD: function(mission,result){
				this.incProgress(mission, result.sell_materials.length );
				this.checkClear(mission);
			},
			
			SLAY_CARD_LEVEL: function(mission, battle_data, list_type){
				if(!list_type) list_type = "enemy_list";
				var need_lvl = mission.level;
				var cnt = 0;
				_.each(battle_data[list_type],function(enemy){
					if(enemy.lvl >= need_lvl) cnt += 1;
				})
				this.incProgress(mission, cnt);
				this.checkClear(mission);
			},
			SLAY_CARD_ATTR: function(mission, battle_data, list_type){
				if(!list_type) list_type = "enemy_list";
				var need_attr = mission.attr;
				var cnt = 0;
				_.each(battle_data[list_type],function(enemy){
					if(enemy.attribute == need_attr) cnt += 1;
				})
				this.incProgress(mission, cnt);
				this.checkClear(mission);
			},
			SLAY_CARD_RARITY: function(mission, battle_data, list_type){
				if(!list_type) list_type = "enemy_list";
				var need_rarity = mission.rarity;
				var cnt = 0;
				_.each(battle_data[list_type],function(enemy){
					if(mission.is_under){
						if(enemy.rarity <= need_rarity) cnt += 1;
					}else if(mission.is_upper){
						if(enemy.rarity >= need_rarity) cnt += 1;
					}else{
						if(enemy.rarity == need_rarity) cnt += 1;
					}
				})
				this.incProgress(mission, cnt);
				this.checkClear(mission);
			},
			SLAY_CARD_ID: function(mission, battle_data, list_type){
				if(!list_type) list_type = "enemy_list";
				var need_card_id = mission.card_id;
				var cnt = 0;
				_.each(battle_data[list_type],function(enemy){
					if(enemy.card_id == need_card_id) cnt += 1;
				})
				this.incProgress(mission, cnt);
				this.checkClear(mission);
			},
			SLAY_CARD_UNIQU: function(mission, battle_data, list_type){
				if(!list_type) list_type = "enemy_list";
				var need_quest_id = mission.quest_id;
				if(battle_data.quest_id != need_quest_id) return;
				
				var need_card_id = mission.card_id;
				var cnt = 0;
				_.each(battle_data[list_type],function(enemy){
					if(enemy.card_id == need_card_id) cnt += 1;
				})
				this.incProgress(mission, cnt);
				this.checkClear(mission);
			},
			CAPTURE_CARD_LEVEL : function(mission, battle_data){ _.bind(this.processList.SLAY_CARD_LEVEL ,this)(mission, battle_data, "captured_list") },
			CAPTURE_CARD_ATTR  : function(mission, battle_data){ _.bind(this.processList.SLAY_CARD_ATTR  ,this)(mission, battle_data, "captured_list") },
			CAPTURE_CARD_RARITY: function(mission, battle_data){ _.bind(this.processList.SLAY_CARD_RARITY,this)(mission, battle_data, "captured_list") },
			CAPTURE_CARD_ID    : function(mission, battle_data){ _.bind(this.processList.SLAY_CARD_ID    ,this)(mission, battle_data, "captured_list") },
			CAPTURE_CARD_UNIQU : function(mission, battle_data){ _.bind(this.processList.SLAY_CARD_UNIQU ,this)(mission, battle_data, "captured_list") },
			INC_PROGRESS : function(mission){
				this.incProgress(mission,1);
				this.checkClear(mission);
			},
		},
		
		/*************************************************
		**- MissionDetailのresponse
		*************************************************/
		defaultResponse: function(mission){
			var state = this.get("mission_state")[mission.id];
			return _.extend({
				num     : mission.progress_max,
				progress: state[PROGRESS],
			}, _.cloneDeep(mission));
		},
		detailResponseList: {
			CURRENT_AREA: function(mission,quest_id){
				var pc = new PcREC;
				var available_quest = pc.get("quest_status")[1].available_quest;
				var quest_data = st.QuestListData[available_quest];
				return _.extend(this.defaultResponse(mission), { area_name: quest_data.area_name })
			},
			PLAY_QUEST_ID: function(mission){
				var quest = new Quest;
				var quest_name = quest.getQuestInfo(mission.quest_id).data.dungeon_name;
				var world_id = (mission.quest_id/1000000000).floor();
				var area_id = (mission.quest_id).toString();
				    area_id = area_id.slice(area_id.length-9,area_id.length-6).toNumber()
				var area_name = quest.get("area_data")[world_id][area_id][0].area_name;
				
				return _.extend(this.defaultResponse(mission), { area_name: area_name, quest_name: quest_name })
			},
			CLEAR_QUEST_ID: function(mission){
				return _.bind(this.detailResponseList.PLAY_QUEST_ID,this)(mission)
			},
			SLAY_CARD_LEVEL : function(mission){
				return _.extend(this.defaultResponse(mission), { level: mission.level })
			},
			SLAY_CARD_ATTR  : function(mission){
				return _.extend(this.defaultResponse(mission), { attr: __.helper.attrText(mission.attr) })
			},
			SLAY_CARD_RARITY: function(mission){
				return _.extend(this.defaultResponse(mission), { rarity: __.helper.rarityShortText(mission.rarity) })
			},
			SLAY_CARD_ID : function(mission){
				return _.extend(this.defaultResponse(mission), { card_name : _.cloneDeep(st.CardData[mission.card_id]).name })
			},
			SLAY_CARD_UNIQU : function(mission){
				return _.extend( _.bind(this.detailResponseList.PLAY_QUEST_ID ,this)(mission), {
					card_name : _.cloneDeep(st.CardData[mission.card_id]).name,
				})
			},
			CAPTURE_CARD_LEVEL : function(mission){ return _.bind(this.detailResponseList.SLAY_CARD_LEVEL ,this)(mission) },
			CAPTURE_CARD_ATTR  : function(mission){ return _.bind(this.detailResponseList.SLAY_CARD_ATTR  ,this)(mission) },
			CAPTURE_CARD_RARITY: function(mission){ return _.bind(this.detailResponseList.SLAY_CARD_RARITY,this)(mission) },
			CAPTURE_CARD_ID    : function(mission){ return _.bind(this.detailResponseList.SLAY_CARD_ID    ,this)(mission) },
			CAPTURE_CARD_UNIQU : function(mission){ return _.bind(this.detailResponseList.SLAY_CARD_UNIQU ,this)(mission) },
			
			CONNECT_TWITTER: function(mission){
				App.mission.checkProcess("CONNECT_TWITTER");
				return this.defaultResponse(mission);
			},
			DEFAULT_RESPONSE: function(mission){
				return this.defaultResponse(mission);
			},
		},
	});
	
return MissionREC;

});

