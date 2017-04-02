define([
	"models/PcREC",
	"models/Mate",
	"models/Quest",
	"models/CaveMapREC",
],function(PcREC,Mate,Quest,CaveMapREC){
	
	// todo CaveMapRECとscratchデータのIDが一致するかバリデーションする
	
	/**
	 * ダンジョン情報のmodel。シングルトン。
	 * @class CaveREC
	 */
	var CaveREC = Backbone.Model.extend({
		constructor:function(){
			// シングルトン
			if(!CaveREC.instance){
				CaveREC.instance = this;
				Backbone.Model.apply(CaveREC.instance,arguments);
			}
			return CaveREC.instance;
		},
		defaults    : function(){ return this.defaultAttr() },
		defaultAttr : function(){
			var mate = new Mate;
			var member_default = mate.defaultAttr();
			member_default.status = {atk:-10,def:-10};
			this.pc = new PcREC;
			var defaultItemData = function(){
				var data = {};
				data[df.ITEM_GAME_MONEY]      = {point:0,time:0};
				data[df.ITEM_GACHA_POINT]     = {point:0,time:0};
				data[df.ITEM_REAL_MONEY_FREE] = {point:0,time:0};
				return data;
			}
			return {
				id            :this.pc.get("id") ,
				quest_id      :1,
				start_data    :{},
				item_data     :{},
				first_touch   :0,
				start_scratch :{id:"1-1",x:1,y:1},
				member_max    :4,
				member_num    :1,
				floor_before  :0,
				floor_now     :1,
				open_num      :0,
				close_num     :0,
				positive_num  :0,
				positive_open :0,
				negative_num  :0,
				negative_open :0,
				difficulty    :0,
				result        :{
					got_phrase_data:[], 
					got_item_data  :defaultItemData(),
					lost_item      :defaultItemData()                                                                                                                                          ,
					get_member_list:[
						// 以下の4つを保存
						// { card_seed_id: 0, lvl: 0, skill: [], individual: [] },
					],
					get_treasure      :0,
					enemy_win_count   :0,
					enemy_escape      :0,
					open_event        :[], //{type:1,id:0}
					is_clear          :0,
					clear_reward      :[],
					clear_first_reward:[],
				},
				status        :{
					item_effect:{},
					play:df.STATE_CAVE_BEFORE,
					play_result:0, //0:あきらめ 1クリア 2:全滅
				},
				members       :{"1":member_default},
				members_start :{"1":member_default},
				scratches     :{"1-1":{oepn:0,show:0},"1-2":{oepn:0,show:1},"1-3":{oepn:1,show:1},"1-4":{oepn:2,show:0},},
			}
		},
		validate : function(attrs,opt){
			if( this.get("id") != this.pc.get("id") ){
				return "id compere is not pc id :" + this.get("id") + "-"  + this.pc.get("id");
			}
			var diff = _.difference( _.keys(attrs) , _.keys(this.defaults()) );
			if(_.compact(diff).length>0) return __.exception("ERR_MODEL_SET_INVALID",diff);
		},
		error:function(model,e){
			console.error("CaveREC#error [model,e]",[model,e]);
		},
		localStorage : new Backbone.LocalStorage("CaveREC"),
		/**
		 * ダンジョンのinitialize処理。fetchでロードする。
		 * @memberof CaveREC
		 * @function initialize
		 */
		initialize : function(){
			console.log("CaveREC#initialize");
			this.pc = new PcREC;
			this.mate = new Mate;
			this.quest = new Quest;
			this.caveMap = new CaveMapREC;
			this.fetch();
			this.listenTo(this,"invalid",this.error);
			this.listenTo(this.pc,"reset_data",this.resetData);
			this.listenTo(this.pc,"fetch_user_id",this.fetchUserId);
			this.listenTo(this.pc,"change_user_id",this.changeUserId);
			this.save();
		},
		fetchUserId  : function(id){ console.log("CaveREC#fetchUserId",arguments); this.set("id",id).fetch() },
		changeUserId : function(id){ console.log("CaveREC#changeUserId",arguments); this.set("id",id).save() },
		resetData : function(pc_id,is_data_delete){
			this.destroy();
			this.attributes = (is_data_delete) ? {} : this.defaults();
			this.set("id",pc_id);
			this.save();
		},
		define:{
			PLAY_BEFORE:1,
			PLAY_NOW   :2,
			PLAY_AFTER :3,
			BATTLE_OFF :4,
			BATTLE_ON  :5,
		},
		/**
		 * ダンジョン情報をdefaultAttrでreset
		 * @memberof CaveREC
		 * @function reset
		 */
		reset : function(){
			this.attributes = {};
			this.attributes = this.defaultAttr();
			return this;
		},
		/**
		 * 1スクラッチの履歴を記録(this.attributes.result.open_event)
		 * @memberof CaveREC
		 * @function scratchLogger
		 */
		scratchLogger:function(scratch){
			console.log("CaveREC#scratchLogger [scratch]",scratch);
			//this.attributes.result.open_event.push({ type:scratch.get("event_type"),id:scratch.get("event_id") })
			this.attributes.result.open_event.push({ type:scratch.get("event_type"),data:scratch.get("event_data") })
		},
		createMemberParty:function(){
			var members = {};
			_( this.pc.get("deck") ).compact().each(function(id,n){
				members[id] = this.pc.getMateData(id,false);
				members[id].pos = n;
			},this)
			this.set("members",members);
			this.set("members_start",_.cloneDeep(members));
		},
		createItemData: function(){
			var item_data = {}
				item_data[df.ITEM_PACKUN_NORMAL] = this.pc.getItem(df.ITEM_PACKUN_NORMAL);
				item_data[df.ITEM_PACKUN_SUPER]  = this.pc.getItem(df.ITEM_PACKUN_SUPER);
				item_data[df.ITEM_PACKUN_DRAGON] = this.pc.getItem(df.ITEM_PACKUN_DRAGON);
			this.set("item_data",item_data)
		},
		addGetItem : function(item_id,item_num){
			var got_item_data = this.attributes.result.got_item_data;
			if( _.has(got_item_data,item_id) ){
				got_item_data[item_id].point += item_num;
			}else{
				got_item_data[item_id] = {id: item_id, point : item_num};
			};
			console.log("CaveREC#addGetItem [item_id,got_item_data]", [item_id,got_item_data])
		},
		addGetPhrase : function(item_id,item_num){
			this.attributes.result.got_phrase_data.push(item_id);
			console.log("CaveREC#addGetItem [item_id,got_phrase_data]",[item_id, this.attributes.result.got_phrase_data])
		},
	});
	
	return CaveREC;
});





