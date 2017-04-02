define([
	"models/Mate",
	"models/PcREC",
	"models/CaveREC",
""],function(Mate,PcREC,CaveREC){
	
	var BattleREC = Backbone.Model.extend({
		constructor:function(){
			if(!BattleREC.instance){
				BattleREC.instance = this;
				Backbone.Model.apply(BattleREC.instance,arguments);
			}
			return BattleREC.instance;
		},
		defaults    : function(){
			this.pc = new PcREC;
			return{
				id :this.pc.get("id"),
				turn_list     :[],
				next_turn_list:[],
				current_turn  :0,
				total_new_turn:0,
				total_turn    :0,
				members       :[],
				enemys        :[],
				is_default    :true,
				item_data     :{},
				is_boss       :0,
				is_got_reward :0,
			}
		},
		localStorage : new Backbone.LocalStorage("BattleREC"),
		initialize : function(){
			console.log("BattleREC#initialize");
			this.mate = new Mate;
			this.cave = new CaveREC;
			this.fetch();
			this.set("members", this.get("members").sort(function(a,b){ return b.position - a.position }) )
			this.listenTo(this.pc,"reset_data",this.resetData);
			this.listenTo(this.pc,"fetch_user_id",this.fetchUserId);
			this.listenTo(this.pc,"change_user_id",this.changeUserId);
			this.save();
		},
		fetchUserId  : function(id){ console.info("BattleREC#fetchUserId",arguments); this.set("id",id).fetch() },
		changeUserId : function(id){ console.info("BattleREC#changeUserId",arguments); this.set("id",id).save() },
		resetData : function(pc_id,is_data_delete){
			this.destroy();
			this.attributes = (is_data_delete) ? {} : this.defaults();
			this.set("id",pc_id);
			this.save();
		},
		validate : function(attrs,opt){
			console.info("BattleREC#validate");
			if( this.get("id") != this.pc.get("id") ){
				return "id compere is not pc id :" + this.get("id") + "-"  + this.pc.get("id");
			}
			var diff = _.difference( _.keys(attrs) , _.keys(this.defaults()) );
			if(_.compact(diff).length>0) throw __.exception("ERR_MODEL_SET_INVALID",diff);
		},
		error : function(model,error,opt){
			console.error("BattleREC#error",error);
		},
		getCurrentTurn:function(){
			if(this.get("turn_list").length - 1 < this.get("current_turn") ){
				console.error("BattleREC#getCurrentTurn 最後のターンが終了しています");
				return -1;
			}else{
				return this.get("turn_list")[ this.get("current_turn") ];
			}
		},
		incTurn:function(){
			this.set("current_turn", this.get("current_turn") + 1 );
			this.set("total_turn"  , this.get("total_turn") + 1 );
			return this
		},
		getLastActionMember : function(){
			var current_turn = this.get("current_turn");
			var list = _.filter(this.get("turn_list"),function(turn,n){ return current_turn>=n && turn.turn_type=="player" });
			var turn = (list.length>0)? _.last(list) : _.find(this.get("turn_list"),function(turn){ return turn.turn_type=="player" }) ;
			return _.find(this.get("members"),function(member){ return member.id==turn.id });
		},
		getDispTurnData : function(members, enemys){
			//var members        = this.get("members");
			//var enemys         = this.get("enemys");
			var turn_list      = this.get("turn_list");
			var current_turn   = this.get("current_turn");
			var disp_turn_data = _.reduce(turn_list,function(result,turn,n){
				if(n<current_turn) return result;
				
				var side = (turn.turn_type=="player")? members : enemys ;
				var chara = side.get(turn.id);
				if(chara.isInactive()) return result;
				
				result.push({
					id : turn.id,
					turn_type : turn.turn_type,
					disp_num : result.length,
				})
				return result
			},[]);
			return disp_turn_data
		},
		//save:function(){
		//	//保存したくないのでオーバーライド
		//},
		createEnemyParty:function(enemy_ids,lvl_data){
			__.checkType("undefined",[enemy_ids,lvl_data]);
			
			//lvl_dataは数字、または配列で渡す。数字の場合、enemyと同じ長さの配列を作成する。
			if(_.isNumber(lvl_data)){
				lvl_data = _.map(new Array(enemy_ids.length),function(){ return lvl_data })
			}
			if(enemy_ids.length != lvl_data.length){ throw "createEnemyParty : 敵の数とレベルデータの数が一致しません"; }
			
			var enemys = _.map(enemy_ids,function(enemy_id,n){
				var enemy_data = this.createEnemyData(enemy_id,lvl_data[n])
				enemy_data.id = n+1;
				return enemy_data;
			},this)
			
			console.log("BattleREC#createEnemyParty [enemys]", enemys);
			return enemys;
		},
		createEnemyData:function(enemy_id,lvl){
			if(!_.has(st.CardSeedData,enemy_id)){ throw "enemy_id " + enemy_id + "が見つかりません"; }
			
			var enemy_data = st.CardSeedData[enemy_id];
			if(lvl > st.CardData[enemy_data.card_id].lvl_max){
				lvl = st.CardData[enemy_data.card_id].lvl_max;
				console.warn("BattleREC#createEnemyData enemyに指定されたlvlがCardDataのlvl_maxをオーバーしています");
			}
			var enemy      = this.mate.createMate(enemy_data.id, {lvl:lvl});
			var add_data   = this.mate.makeMateStatus(enemy);
			var card_data  = _.clone(st.CardData[enemy.card_id]);
			var offset_status = {
				atk : ( enemy.atk     * (enemy_data.pow_ofs[0] + 100) / 100 ).floor(),
				def : ( enemy.def     * (enemy_data.pow_ofs[1] + 100) / 100 ).floor(),
				mag : ( enemy.mag     * (enemy_data.pow_ofs[2] + 100) / 100 ).floor(),
				hp  : ( enemy.hp_full * (enemy_data.pow_ofs[3] + 100) / 100 ).floor(),
				img_type :"l",
				battle_side :"enemy",
			}
			
			return _.extend(card_data,enemy,add_data,offset_status);
		},
		
		//ターンデータを作成する
		createTurn:function(members, enemys){
			console.log("BattleMgr#createTurn");
			//戦闘に参加してるモンスターだけにする
			var members = members.filter(function(chara){ return chara.isActive() });
			var enemys  = enemys.filter(function(chara){ return chara.isActive() });
			
			//敵、味方のターンデータ作成
			var members_turn = this.assignTurn( members          , this.lotTurn(members.length), "player" );
			var enemys_turn  = this.assignTurn( _.shuffle(enemys), this.lotTurn(enemys.length ), "enemy"  );
			
			//敵、味方のターンデータを結合、lotでソートして順序決定
			//自分を必ず一番にする
			members_turn[0].lot = -1;
			var turn_list = _.union(members_turn,enemys_turn).sort(function(a,b){ return a.lot - b.lot });
			console.info("BattleREC#createTurn [turn_list]",turn_list)
			
			if(this.get("turn_list").length == 0){
				//現在のターンデータが無かったらそこに保存し、
				//次のターンデータを作るためにもう一度createTurnを実行する
				this.set("turn_list", turn_list );
				this.createTurn(members, enemys);
				return
			}else{
				this.set("next_turn_list", turn_list );
				this.set("current_turn", 0 );
				this.set("total_new_turn", this.get("total_new_turn") + 1 );
				this.save();
				return
			}
		},
		lotTurn:function(num){
			console.log("BattleMgr#lotTurn");
			var lot_list = _.map(new Array(num),function(){ return _.random(1,100) })
			return lot_list.sort(function(a,b){ return a - b })
		},
		assignTurn:function(members,lots,type){
			console.log("BattleMgr#assignTurn");
			//memberにターン順を付加したオブジェクトを返す
			return _.map(lots,function(lot,n){
				return {
					lot  :lot,
					id   :members[n].id,
					turn_type :type,
				}
			});
		},
		
		// 敵を捕まえる処理
		captureRate : function(item_id,enemy){
			var rarity_data = {
				1 :{ name: "N" , base:   0, coefficient: 1.00, adjust: 0 },
				2 :{ name: "R" , base: -10, coefficient: 0.40, adjust: 0 },
				3 :{ name: "SR", base: -40, coefficient: 0.10, adjust: 0 },
				4 :{ name: "UR", base: -80, coefficient: 0.02, adjust: 0 },
			}
			var packun_data = {
				50 :{ name: "ノーマル", base:  0, coefficient: 1, adjust: 0 },
				51 :{ name: "スーパー", base: 10, coefficient: 2, adjust: 2 },
				52 :{ name: "ドラゴン", base: 40, coefficient: 8, adjust:10 },
			}
			var hp        = enemy.get("hp")/enemy.get("hp_full") * 100;
			var rarity    = rarity_data[enemy.get("rarity")];
			var packun    = packun_data[item_id];
			var rare_val  = st.CardSeedData[enemy.get("card_seed_id")].get_rate;
			
			var kakuritsu = ((100 - hp + rarity.base + packun.base) * rarity.coefficient * packun.coefficient + rarity.adjust + packun.adjust)*rare_val;
			    kakuritsu = kakuritsu.floor().clamp(0,10000);
			console.log("BattleMgr#captureRate 捕獲確率:" + (kakuritsu/100) + "%");
			return kakuritsu;
		},
		capture : function(item_id, enemy_id, enemys){
			if(this.attributes.item_data[item_id] <= 0){
				// todo throwにし、アイテム不足ダイアログを別途作る
				console.error("アイテムが足りません");
				return false
			}
			this.attributes.item_data[item_id] -= 1;
			var enemy = enemys.get(enemy_id);
			
			var kakuritsu = this.captureRate(item_id,enemy);
			var lot       = _.random(1,10000);
			var result    = (kakuritsu>=lot);
			
			if(result){
				enemy.set("captured",1);
				enemy.set("captured_item",item_id);
				this.set("enemys", enemys.toJSON());
			}
			this.save();
			App.mission.checkProcess("USE_PACKUN");
			
			return result
		},
		
		// 戦闘終了処理
		// members, enemysはBattleManagerに保存しているデータを渡す
		battleResult : function(result, members, enemys){
		
			// 使用アイテム処理
			this.cave.set("item_data", _.cloneDeep(this.get("item_data")) );
			
			// hpやスキルの状態をコピー
			var cave_members = this.cave.get("members");
			members.each(function(member){
				var cave_member = _.find(cave_members,function(cave_member){ return cave_member.id == member.id });
				_.each(member.transferAttr(),function(attr,key){
					cave_member[key] = _.cloneDeep(member.attributes[key]);
				})
			})
			
			if(result=="win"){
				// 敵の獲得処理
				var get_enemy_list = this.getCaptureList(enemys);
				var get_enemys = _.reduce(get_enemy_list,function(result,enemy,n){
					result.push({
						card_seed_id : enemy.get("card_seed_id"),
						lvl          : enemy.get("lvl"),
						skill        : [enemy.get("skill_data")[0].id, enemy.get("skill_data")[1].id],
						individual   : enemy.get("individual"),
						time         : __.baseTime(),
					})
					return result
				},[])
				var cave_result = this.cave.get("result");
				cave_result.get_member_list = cave_result.get_member_list.concat(get_enemys);
				
				//討伐報酬処理
				var get_win_reward = this.getBattleReward(enemys);
				_.each(get_win_reward, function(num,key){
					this.cave.addGetItem(key,num);
				},this)
			}
			
			this.cave.save();
		},
		getCaptureList : function(enemys){
			return enemys.filter(function(enemy){ return enemy.get("captured") == 1 })
		},
		getBattleReward : function(enemys){
			var rewards = {}
			rewards[df.ITEM_GAME_MONEY]
			var game_money = _.reduce(enemys.toJSON(),function(sum,enemy){
				var sell_price = this.mate.getSellPrice(enemy);
				return sum + (sell_price/10).floor();
			},0,this)
			if(game_money) rewards[df.ITEM_GAME_MONEY] = game_money;
			
			return rewards
		},
	});
	
	return BattleREC;
});





