define([
	"models/Mate",
	"models/DeckREC",
	"models/Quest",
	"models/BillingREC",
],function(Mate,DeckREC,Quest,BillingREC){
	
	/**
	 * プレイヤー情報のmodel。シングルトン。
	 * @class PcREC
	 */
	var PcREC = Backbone.Model.extend({
		constructor:function(){
			// シングルトン
			if(!PcREC.instance){
				PcREC.instance = this;
				Backbone.Model.apply(PcREC.instance,arguments);
			}
			return PcREC.instance;
		},
		defaults    : function(){ return this.defaultAttr() },
		default_attr_cash : 0,
		defaultItem: function(id){
			return {
				num : 0,
				flag: 0,
			}
		},
		defaultQuestPlay: function(id){
			return {
				clear:0,
				fail:0,
				play:0
			}
		},
		defaultGacha: function(id){
			return {
				id: id,
				draw_cnt: 0,
				total_draw_cnt: 0,
				last_draw_time: 0,
				last_check_time: 0,
				last_revival_time: 0,
			}
		},
		defaultAvailableWorldData: function(){
			var world_data = _.reduce(st.QuestListData,function(result,data){
				if(data.world_name) result.push(data);
				return result;
			},[])
			var available_world_data = _.reduce(world_data,function(result,data){
				result[data.world_id] = {
					available_area:1,
					available_group:1,
					available_quest:data.id,
					available_world:data.world_id,
					is_available_world:(data.world_id > 100 || data.world_id == 1)? 1 : 0,
					is_world_clear: 0,
					clear_ids:[]
				}
				return result
			},{});
			
			console.log("PcREC#defaultAttr [available_world_data]",available_world_data);
			return available_world_data;
		},
		defaultInitQuestPlay : function(available_world_data){
			return _.reduce(available_world_data,function(result,available_world){
				result[ available_world.available_quest ] = this.defaultQuestPlay();
				return result
			},{},this);
		},
		defaultAttr : function(){
			if(this.default_attr_cash){ return _.cloneDeep(this.default_attr_cash) }
			
			// todo ガチャデータが追加になったときのtestを書く
			var gacha_status = _(st.GachaListData).reduce(function(result,gacha,key){
				result[key] = this.defaultGacha(gacha.id);
				return result;
			},{},this);
			var mate            = new Mate;
			var start_mates     = mate.createMates(this,[{ card_seed_id: 10010000, lvl:10, individual: [50, 50, 50, 50] }]);
			var zukan_flag      = _.map(new Array( 201), function(){ return 0 });
			_.each(start_mates,function(data,n){ zukan_flag[ st.CardData[ data.card_id ].zukan_no ] = 1; })
			var item_data       = _.reduce(st.ItemData , function(result,data,key){
				result[key]      = this.defaultItem()
				result[key].num  = data.default_point
				result[key].flag = (data.default_point)?1:0;
				return result
			},{},this);
			var phrase_list     = _.map(new Array(1001), function(data,n){ return [n,0,0,0,0] }); // id, flag, have_num, get_date, fav_state
			
			var available_world_data = this.defaultAvailableWorldData();
			var init_quest_play = this.defaultInitQuestPlay(available_world_data);
			
			var ret = {
				name                  : "default_user",
				save_id               : "1",
				id                    : localStorage.device_id + "_" + localStorage.save_id,
				chara_type            : 2,
				create_time           : __.baseTime(),
				last_login_time       : 0,
				next_login_bonus_time : 0,
				login_count           : 0,
				mate_max              : df.MATE_MAX,
				deck                  : [0,0,0,0,0],
				quest_status          : available_world_data,
				current_world         : 1,
				quest_play            : init_quest_play,
				zukan_flag            : zukan_flag,
				item_data             : item_data, // todo item所持上限チェック作成
				phrase_list           : phrase_list,
				mate_list             : start_mates,
				result                : {},
				gacha_status          : gacha_status,
			}
			
			this.default_attr_cash = ret;
			return _.cloneDeep(ret);
		},
		localStorage : new Backbone.LocalStorage("PcREC"),
		/**
		 * PcRECのinitialize処理。fetchでロードする。
		 * @memberof PcREC
		 * @function initialize
		 */
		initialize : function(){
			console.log("PcREC#initialize");
			this.fetch();
			this.billing = new BillingREC({},{pc_id: this.get("id"), pc: this});
			this.mate    = new Mate;
			this.quest   = new Quest;
			this.deck    = new DeckREC({},{ pc_id:this.get("id"), pc:this });
			this.listenTo(this.deck,"sync",this.syncDeck   );
			this.listenTo(this,"destroy"  ,this.syncDestroy);
			this.listenTo(this,"invalid"  ,this.error      );
			this.syncDeck();
			this.save();
		},
		save : function(){
			PcREC.__super__.save.apply(this, arguments);
			this.trigger("on_save",this);
		},
		syncDestroy:function(){
			this.deck.destroy();
		},
		syncDeck:function(){
			this.attributes.deck = this.deck.attributes.member;
		},
		getDeck:function(){
			//syncしてるのでどちらでもいい気がするが、バグの原因になりそう
			return this.attributes.deck
			return this.deck.attributes.member;
		},
		setDeck:function(member){
			this.deck.set("member",member);
			return this.deck;
		},
		validate : function(attrs,opt){
			var pc_defaults = this.defaultAttr();
			//PcRECの型チェック
			if( __.compareAttrType( pc_defaults , attrs ) ){
				return __.compareAttrType( pc_defaults , attrs );
			};
			//deckチェック
			if( pc_defaults.deck.length != attrs.deck.length ){
				return "デッキlengthが " + attrs.deck.length + "つ になっています"
			}
			for(var i in attrs.deck ){
				if( typeof attrs.deck[i] != "number" ){
					return "デッキに数字以外が含まれています :" + attrs.deck;
				}
			}
			//deck内のmate存在チェック
			var mate_ids = _.map(this.attributes.mate_list,function(mate){ return mate.id });
			if( _.compact(mate_ids).length <= 0){ return "味方が1体もいなくなります" }
			for(var i in attrs.deck ){
				if( attrs.deck[i] == 0){ continue }
				if( !_.contains(mate_ids , attrs.deck[i]) ){
					console.error("mate_ids",attrs.deck,mate_ids);
					return "deck内:" + i + " ID:" + attrs.deck[i] + "は仲間に存在しません"
				}
			}
			//id重複チェック
			var mate_list_ids = _(this.attributes.mate_list).groupBy(function(n){ return n.id; }).value();
			for(var i in mate_list_ids){
				if(mate_list_ids[i].length !== 1){
					return "PcREC#addMates 'id' is a 'duplicate'" 
				};
			};
			
			//mate_listの型チェック
			var mate = new Mate;
			var default_attr = mate.defaultAttr();
			var default_skill_attr = mate.defaultSkillAttr();
			var mate_list = this.attributes.mate_list;
			// forinにする
			for(var i=0; i<mate_list.length;i++){
				//デフォルトの属性チェック
				if( __.compareAttrType( default_attr , mate_list[i] ) ){
					return __.compareAttrType( default_attr , mate_list[i] );
				};
				//skillの属性チェック
				for(var j=0; j<mate_list[i].skill.length;j++){
					if( __.compareAttrType( default_skill_attr , mate_list[i].skill[j] ) ){
						return __.compareAttrType( default_skill_attr , mate_list[i].skill[j] );
					};
				};
			};
		},
		error : function(model,error,opt){
			console.error("PcREC#error [model,error,opt]",[model,error,opt]);
		},
		/**
		 * 所持アイテムのgetter、setter。お金やガチャポイントも。
		 * @example
		 *     pc.getItem( df.ITEM_GAME_MONEY );
		 */
		 /*
		getItem(df.ITEM_REAL_MONEY) : 無料、有料の合計値を返す  
		getItem(df.ITEM_REAL_MONEY_COST) : 有料の合計を返す  
		getItem(df.ITEM_REAL_MONEY_FREE) : 無料の値を返す
		*/
		getItem:function(item_id){
			__.checkType({number:[item_id]});
			if(!this.attributes.item_data[item_id]){
				 this.attributes.item_data[item_id] = this.defaultItem();
			}
			if(item_id == df.ITEM_REAL_MONEY){
				return this.attributes.item_data[df.ITEM_REAL_MONEY_FREE].num + this.billing.getMoney();
			}
			if(item_id == df.ITEM_REAL_MONEY_COST){
				return this.billing.getMoney();
			}
			return this.attributes.item_data[item_id].num;
		},
		setItem:function(item_id,val){
			__.checkType({number:[item_id,val]});
			if(!this.attributes.item_data[item_id]){
				 this.attributes.item_data[item_id] = this.defaultItem();
			}
			if(val < 0){ throw "item valがマイナス値です"; }
			if(item_id == df.ITEM_REAL_MONEY){ var msg = "ITEM_REAL_MONEYにsetすることはできません"; alert(msg); throw msg; }
			if(item_id == df.ITEM_REAL_MONEY_COST){ var msg = "ITEM_REAL_MONEY_COSTにsetすることはできません"; alert(msg); throw msg; }
			this.attributes.item_data[item_id].num = val;
			if(val > 0){
				this.attributes.item_data[item_id].flag = 1;
			}
		},
		addItem:function(item_id,val,type){
			if(type == df.DATA_TYPE_ITEM || type == undefined){
				this.setItem(item_id, this.getItem(item_id) + val);
				
			}else if(type == df.DATA_TYPE_PHRASE){
				this.addPhrase(item_id, val);
				
			}else if(type == df.DATA_TYPE_ITEM_SET){
				this.addItemSet(item_id);
				
			}else if(type == df.DATA_TYPE_CARD_SEED){
				var card_data = {
					card_seed_id:item_id,
					lvl         :val,
					individual  :[50,50,50,50],
				}
				var new_mate_list = this.mate.createMates(this,card_data);
				this.addMates(new_mate_list);
			}
			
			return this
		},
		addItemSet:function(item_set_id){
			var data = st.ItemSetData[item_set_id];
			for(var i in data.data_type){
				this.addItem(data.item_id[i], data.item_num[i], data.data_type[i]);
			}
		},
		useItem : function(item_id,val){
			//saveまで行うので注意する
			__.checkType({number:[item_id,val]});
			if(val < 0){ throw "item valがマイナス値です"; }
			if(item_id == df.ITEM_REAL_MONEY_FREE){ throw "useItemにITEM_REAL_MONEY_FREEを指定することはできません"; }
			if(item_id == df.ITEM_REAL_MONEY_COST){ throw "useItemにITEM_REAL_MONEY_COSTを指定することはできません"; }
			
			if(item_id == df.ITEM_REAL_MONEY){
				if(this.getItem(df.ITEM_REAL_MONEY) < val){ throw "魔石が足りません"; }
				var remain_cost = this.billing.useMoney(val);
				this.setItem(df.ITEM_REAL_MONEY_FREE, this.getItem(df.ITEM_REAL_MONEY_FREE) - remain_cost)
			}else{
				this.setItem(item_id,this.getItem(item_id) - val);
			}
			this.save()
			this.billing.save()
			return
		},
		getPrepaidMoney:function(){
			var prepaids = this.billing.get("prepaid_list");
		},
		addPhrase:function(item_id,val){
			var sum = this.attributes.phrase_list[item_id][2] + val;
			this.setPhrase(item_id,sum);
		},
		setPhrase:function(item_id,val){
			__.checkType({number:[item_id,val]});
			if(val < 0){ throw "item valがマイナス値です"; }
			// [id, flag, num, date, fav_state]
			if(val > 0){
				this.attributes.phrase_list[item_id][1] = 1;
			}
			this.attributes.phrase_list[item_id][2] = val;
			this.attributes.phrase_list[item_id][3] = __.baseTime();
		},
		
		// Card関連
		/**
		 * 所持モンスターの最大IDを取得
		 * @memberof PcREC
		 * @function largestMateId
		 */
		largestMateId:function(){
			var desc_id_list = _(this.attributes.mate_list).sortBy(function(a) { return a.id*-1 ; }).value();
			if(_.isEmpty(desc_id_list)){
				return 0;
			}else{
				return desc_id_list[0].id;
			}
		},
		/**
		 * モンスター所持上限チェック
		 * @memberof PcREC
		 * @function checkMateMax
		 * @chainable
		 */
		checkMateMax:function(){
			if( _(this.attributes.mate_list).size() >= this.attributes.mate_max){
				throw "PcREC#addMates 'mate_num' is greater than 'mate_max'";
			}
			return this
		},
		/**
		 * モンスター追加処理。save()は行わない。
		 * @memberof PcREC
		 * @function addMates
		 * @param new_mate_list {array} 
		 * @chainable
		 */
		addMates:function(new_mate_list){
			var largest_mate_id = this.largestMateId();
			_(new_mate_list).each( function(new_mate,key){
				this.attributes.zukan_flag[ st.CardData[ new_mate.card_id ].zukan_no ] = 1;
			},this );
			_( this.attributes.mate_list ).extend( new_mate_list )
			return this
		},
		/**
		 * 所持モンスターデータの取得。
		 * @memberof PcREC
		 * @function getMateData
		 * @param id {int}  
		 * @param [is_all] {bool} falseで返すデータが少なくなる。defaultでtrue。
		 */
		getMateData:function(id,is_all){
			var mate_data = this.get("mate_list")[id];
			if(mate_data == undefined){ throw "id" + id + " の仲間が見つかりません" };
			
			//追加データ
			var add_data = this.mate.makeMateStatus(mate_data);
			
			//デッキ含みデータ追加
			var pc_deck = this.get("deck");
			add_data.contain_deck = 0;
			for(var i=0;i<pc_deck.length;i++){
				if(pc_deck[i] == mate_data.id){ add_data.contain_deck = 1; continue; }
			}
			
			var card_data = _.clone(st.CardData[mate_data.card_id]);
			
			return _.extend(card_data,mate_data,add_data);
		},
		/**
		 * クエストリストを更新する。クリアカウントなどもここで行う。
		 * @memberof PcREC
		 */
		updateQuest:function(quest_data){
			//updateして終了
			var quest_status = this.get("quest_status");
			for(var i in quest_status){
				quest_status[i] = this.quest.getAvailableScenario( i, quest_status[i], this.get("quest_play") );
			}
			// this.defaultAvailableWorldDataは、Dataが追加された時用の対応
			this.set("quest_status", _.extend(this.defaultAvailableWorldData(), quest_status) );
			return this
		},
		
		resetPcData:function(user_id,is_data_delete){
			this.destroy();
			this.attributes = (is_data_delete) ? {} : this.defaults();
			this.attributes.id = user_id;
			this.save();
			this.trigger("reset_data",this.get("id"),is_data_delete);
		},
	});
	
	return PcREC;
});





