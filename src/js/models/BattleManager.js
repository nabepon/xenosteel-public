define([
	'models/BattleREC',
	'models/BattleEnemyAi',
	'controllers/BattleAnimation',
],function(BattleREC,BattleEnemyAi,BattleAnimation){
/**
 * BattleState
 * 状態管理のためのクラス
 */
	var BattleState = Backbone.Model.extend({
		
		//抽象メソッド
		click        :function(){ console.log("BattleState#click"); this.startBattle() },
		commandEvent :function(){},
		next         :function(){ console.log("BattleState#next"); this.startBattle() },
		animEndEnemy :function(){},
		animEndMember:function(){},
		
		//抽象メソッドをリセット
		resetAbstract:function(){
			console.log("BattleState#resetAbstract");
			this.click         = function(){};
			this.commandEvent  = function(){};
			this.next          = function(){};
			this.animEndEnemy  = function(){};
			this.animEndMember = function(){};
		},
		
		//オーバーライド用する処理メンバ
		beginBattleDisp :function($deferred){ $deferred.resolve(); /* $deferredを渡して、本来の処理が終わったらresolveする */ },
		beginNextTurn   :function($deferred){ $deferred.resolve(); /* $deferredを渡して、本来の処理が終わったらresolveする */ },
		battleResult    :function(result){ /* "lose" or "win" */ },
		loseResult      :function(){},
		checkTurn       :function(){ return false },
		memberCombat    :function(){},
		enemyCombat     :function(){},
		checkAbleAnimEndEnemy :function(){ return false },
		checkAbleAnimEndMember:function(){ return false },
		
		//状態メソッド
		startBattle:function(){
			console.info("--------------- BattleState#startBattle ---------------");
			
			//戦闘の準備をし、nextActionをbattleViewにイベントで投げてを実行してもらう。
			
			this.resetAbstract();
			
			var nextAction = _.bind(function(){
				console.log("BattleState#startBattle#nextAction");
				if(this.battle.get("turn_list")[0].turn_type=="enemy"){
					var _this = this;
					setTimeout(function(){
						_this.next = _this.nextTurn;
						_this.next();
					},1000)
				}else{
					this.next = this.nextTurn;
					this.next();
				}
			},this)
			
			this.trigger("battle_start",nextAction)
			
			return
		},
		nextTurn:function(){
			console.log("BattleState#nextTurn");
			
			//行動中の CharaView で play_anim_end が発火すると
			//    trigger("play_anim_end") > CharaView#animEnd > Chara#turnEnd > trigger("chara_turn_end") >
			//    BattleMgr#animEndMember > BattleState#checkAnimEndMember > BattleState#nextTurn
			//    と辿ってこの処理へ移る。どのcharaもplay_anim_endを発火するので、checkAbleAnimEndMemberで行動キャラ判定をする。
			
			//自分か敵のタンーンか判断し
			//$.Deferredで演出の完了を待ったあと、
			//自分だったらコマンドのみ受け付ける状態にして終了
			//敵だったら敵の攻撃処理へ移る
			this.resetAbstract();
			
			var $deferred = new $.Deferred;
			var turn_type = this.checkTurn();
			var disp_turn_data = this.battle.getDispTurnData(this.members,this.enemys);
			
			this.command.disableCommand(); //commandを利かなくし、レンダリング
			this.members.each(function(chara){
				var turn = _.find(disp_turn_data,function(data){ return chara.id==data.id && data.turn_type=="player" });
				var turn_num = (typeof turn=="undefined")? -1 : turn.disp_num;
				chara.set("disp_turn",turn_num);
				chara.set("is_action_turn", (turn_num==0) );
			})
			this.enemys.each(function(chara){
				var turn = _.find(disp_turn_data,function(data){ return chara.id==data.id && data.turn_type=="enemy" });
				var turn_num = (typeof turn=="undefined")? -1 : turn.disp_num;
				chara.set("disp_turn",turn_num);
				chara.set("is_action_turn", (turn_num==0) );
			})
			
			if( turn_type == "player" ){
				this.beginNextTurn($deferred);
				$deferred.done(_.bind(function(){
					this.command.enableCommand(); //commandを有効にし、レンダリング
					var turn = this.battle.getCurrentTurn();
					this.members.each(function(member){
						//攻撃ターンのモンスターにフラグを立てる
						member.set("is_action_turn", (turn.id==member.get("id")) );
					})
					this.commandEvent = this.inputCommand;
				},this))
			}else if( turn_type == "enemy" ){
				this.beginNextTurn($deferred);
				$deferred.done(_.bind(function(){
					this.next = this.enemyTurn;
					this.next();
				},this))
			}else if( turn_type == "battle_win" ){
				this.battleResult("win");
			}else if( turn_type == "battle_lose" ){
				this.battleResult("lose");
			}else{
				console.error("BattleState#nextTurn 不明なターン状態です");
			}
		},
		inputCommand:function(type,data){
			console.log("BattleState#inputCommand");
			//受け付けたコマンドの処理をし、
			//クリックするか自分のアニメーションが終わったら次のターンへ
			if( this.checkAbleCommand(type,data) ){
				this.resetAbstract();
				this.command.disableCommand(); //commandを利かなくし、レンダリング
				this.members.each(function(member){ member.set("is_action_turn",false) }) //攻撃ターンフラグをリセット
				this.commandEvent = this.inputCommand;
				this.animEndMember = this.checkAnimEndMember;
				this.memberCombat(type,data);
			}
		},
		enemyTurn  :function(){
			console.log("BattleState#enemyTurn");
			//敵の攻撃処理をし、
			//クリックするか敵のアニメーションが終わったら次のターンへ
			
			this.resetAbstract();
			//this.click = this.nextTurn; //攻撃を飛ばせない方がリズムが良さそうなので消しておく
			this.next = this.nextTurn;
			this.animEndEnemy = this.checkAnimEndEnemy;
			this.enemyCombat();
		},
		checkAnimEndMember:function(event,model){
			console.log("BattleState#checkAnimEndMember");
			// 味方の攻撃演出の終了イベント chara_turn_endで呼ばれる
			// タップでスキップすることによる、複数の味方の同時攻撃演出があるなごりで、
			// どの味方の攻撃演出かを判定するために checkAbleAnimEndMember がある。
			// 最後に攻撃した味方のアニメーション終了であれば次へ
			
			if( this.checkAbleAnimEndMember(event,model) ){
				this.resetAbstract();
				this.click   = this.nextTurn;
				this.next    = this.nextTurn;
				this.next();
			}
		},
		checkAnimEndEnemy:function(event,model){
			console.log("BattleState#checkAnimEndEnemy");
			// 敵の攻撃演出の終了イベント chara_turn_endで呼ばれる
			// タップでスキップすることによる、複数の敵の同時攻撃演出があるなごりで、
			// どの敵の攻撃演出かを判定するために checkAbleAnimEndEnemy がある。
			// 最後に攻撃した敵のアニメーション終了であれば次へ
			
			if( this.checkAbleAnimEndEnemy(event,model) ){
				this.resetAbstract();
				this.click   = this.nextTurn;
				this.next    = this.nextTurn;
				this.next();
			}
		},
	});
	
	
/**
 * BattleMgr
 * BattleView
 */
	var BattleMgr = BattleState.extend({
		defaults:function(){
			return {
				turn_list:[],
				turn_status:"",
				is_turn_change:false,
			}
		},
		initialize:function(prop,option){
			console.log("BattleMgr#initialize",this,arguments);
			App.data.battleMgr = this;
			this.battle  = new BattleREC;
			this.enemys  = option.enemys;
			this.members = option.members;
			this.command = option.command;
			this.listenTo(option.command ,"input_command" ,_.bind(function(event,model){ this.commandEvent(event,model)  },this))
			this.listenTo(option.members ,"chara_turn_end",_.bind(function(event,model){ this.animEndMember(event,model) },this))
			this.listenTo(option.enemys  ,"chara_turn_end",_.bind(function(event,model){ this.animEndEnemy(event,model)  },this))
		},
		checkAbleAnimEndMember:function(event,model){
			var judge = (model.get("action_anim_played_index") == this.battle.get("total_turn") ) ? true : false ;
			console.log("BattleMgr#checkAbleAnimEndMember", judge , model.get("action_anim_played_index") , this.battle.get("total_turn"));
			return judge
		},
		checkAbleAnimEndEnemy:function(event,model){
			var judge = (model.get("action_anim_played_index") == this.battle.get("total_turn") ) ? true : false ;
			console.log("BattleMgr#checkAbleAnimEndEnemy", judge , model.get("action_anim_played_index") , this.battle.get("total_turn"));
			return judge
		},
		checkAbleCommand:function(type,data){
			console.log("BattleMgr#checkAbleCommand",type,data,this.battle.get("current_turn"),this.battle.get("turn_list"),turn);
			
			if(type == "command_type_attack"){
				var target = this.enemys.get(data.target_id);
				if(target.isInactive() && type == "attack"){
					console.log("BattleMgr#checkAbleCommand 非アクティブの敵には攻撃できません")
					return false
				}
			}
			
			var turn = this.battle.getCurrentTurn();
			if(turn == -1){
				return false
			}
			
			if(turn.turn_type != "player" ){
				console.log("BattleMgr#checkAbleCommand 自分のターンではありません")
				return false
			}
			
			return true
		},
		
		//stateの処理系
		
		//次のターンデータへ移行
		switchNextTurn:function(){
			console.log("BattleMgr#switchNextTurn");
			this.battle.set("turn_list", this.battle.get("next_turn_list") );
		},
		
		//次ターンに行く前の処理
		beginNextTurn :function($deferred){
			console.log("BattleMgr#beginNextTurn");
			var _this = this;
			var $deferred_charaBeginTurn = new $.Deferred;
			
			// Turn切り替え演出
			if(this.get("is_turn_change")){
				// TurnChangeView#turnChangeへ
				this.command.trigger("turn_change",$deferred_charaBeginTurn);
				this.set("is_turn_change",false)
			}else{
				$deferred_charaBeginTurn.resolve();
			}
			
			// beginTurn実行
			$deferred_charaBeginTurn.done(function(){
				var turn = _this.battle.getCurrentTurn();
				var turn_type = _this.checkTurn();
				var chara = (turn_type=="player")? _this.members.get(turn.id) : chara = _this.enemys.get(turn.id) ;
				chara.beginTurn($deferred)
			})
		},
		//勝利か敗北かチェックし、
		//自分のターンか敵ターンかチェック
		checkTurn:function(){
			console.log("BattleMgr#checkTurn");
			
			//どちらかが全滅していたら終了
			var turn_type = "";
			var check_members = this.members.filter(function(model){ return model.isActive() });
			var check_enemys  = this.enemys.filter(function(model){ return model.isActive() });
			if( check_members.length <= 0 ){ return "battle_lose"; }
			if( check_enemys.length  <= 0 ){ return "battle_win";  }
			
			//ターンが消化しきっていたら新規作成とターンチェンジフラグを設定
			if(this.battle.get("turn_list").length <= this.battle.get("current_turn") ){
				this.set("is_turn_change",true)
				this.switchNextTurn();
				this.battle.createTurn(this.members, this.enemys);
			}
			
			//現在のターン情報を取得
			var turn = this.battle.getCurrentTurn();
			if(turn == -1){ return }
			var chara = (turn.turn_type=="player")? this.members.get(turn.id) : this.enemys.get(turn.id) ;
			if( chara.isInactive() ){
				console.log("BattleMgr#checkTurn 非アクティブなのでスキップします");
				this.battle.incTurn().save();
				return this.checkTurn();
			}
			return turn.turn_type
		},
		
		// 次ターンへの進行処理と保存を行う、$deferredオブジェクトを返す
		createSaveCombatDeferred : function(chara){
			var $deferred = new $.Deferred;
				$deferred.done( _.bind(function(){
					console.log("BattleMgr#createSaveCombatDeferred#done");
					this.battle.incTurn();
					this.battle.set("members", this.members.toJSON() )
					this.battle.set("enemys" , this.enemys.toJSON() )
					this.battle.save();
					chara.set("action_anim_played_index", this.battle.get("total_turn") );
				},this) );
				$deferred.fail( _.bind(function(){
					console.log("BattleMgr#createSaveCombatDeferred#fail");
					this.nextTurn();
				},this) );
				
			return $deferred
		},
		
		//自分の攻撃処理
		memberCombat:function(event_type,data){
			console.log("BattleMgr#memberCombat",event_type);
			var turn = this.battle.getCurrentTurn();
			var chara = this.members.get(turn.id);
			var $deferred = this.createSaveCombatDeferred(chara);
			var side = 1;
			
			if(event_type == "command_type_attack"){
				chara.attack(side, $deferred, data, this.members, this.enemys);
				return
			}
			if(event_type == "command_type_guard"){
				chara.guard(side, $deferred);
				return
			}
			if(event_type == "command_type_capture"){
				// input_commandでis_action_turnがfalseになるので戻す
				chara.set("is_action_turn",true);
				this.command.trigger("capture_confirm",$deferred,this.enemys,chara)
				return
			}
			if(event_type == "command_type_skill"){
				// input_commandでis_action_turnがfalseになるので戻す
				chara.set("is_action_turn",true);
				this.command.trigger("skill_confirm",side, $deferred, data, this.members, this.enemys, chara)
				return
			}
			console.error("BattleMgr#memberCombat 不正な味方コマンドです ", event_type);
		},
		
		//敵の攻撃処理
		enemyCombat:function(data){
			console.log("BattleMgr#enemyCombat");
			var turn = this.battle.getCurrentTurn();
			var chara = this.enemys.get(turn.id);
			var ai = new BattleEnemyAi({},{ members:this.members, enemys:this.enemys });
			var command = ai.decideCommand(turn,chara,data);
			console.log("BattleMgr#enemyCombat#command ",command);
			
			if(command.type == "atk"){
				this.enemyAttack(turn,chara,data);
				return
			}
			if(command.type == "guard"){
				this.enemyGuard(turn,chara,data)
				return
			}
			if(command.type == "skill1"){
				this.enemyAttack(turn,chara,data);
				return
			}
			if(command.type == "skill2"){
				this.enemyAttack(turn,chara,data);
				return
			}
			console.error("BattleMgr#enemyCombat 不正な敵コマンドです ", command.type, command);
		},
		enemyAttack:function(turn,chara,data){
			console.log("BattleMgr#enemyAttack");
			var $deferred = this.createSaveCombatDeferred(chara);
			var side = 2;
			
			var anim = new BattleAnimation();
			anim.jc.animate({
				duration: anim.jc.frameToTime(7),
				onEnd : _.bind(function(){
					var members = _.filter(this.members.models, function(model){ return model.isActive() });
					var target  = members[_.random(0, members.length-1)];
					data = { target_id: target.get("id") };
					chara.attack(side, $deferred, data, this.enemys, this.members);
				},this)
			})
		},
		enemyGuard : function(turn,chara,data){
			console.log("BattleMgr#enemyGuard");
			var $deferred = this.createSaveCombatDeferred(chara);
			var side = 2;
			
			chara.guard(side, $deferred);
		},
		
		// 戦闘終了処理
		battleResult : function(result){
			this.battle.battleResult(result, this.members, this.enemys);
			
			if( this.battle.get("is_got_reward") ){
				App.popup.message({ view_class: "battle_result_popup", title:"モンスターをやっつけた！",message: '勝利しました！<br/>'}).done(_.bind(function(){
					this.trigger("battle_end",result,this.battle.get("is_boss"));
				},this))
				return
			}
			
			if(result=="win"){
				var get_text = '';
				var reward_data   = this.battle.getBattleReward(this.enemys);
				var captured_list = this.battle.getCaptureList(this.enemys);
				this.battle.set("is_got_reward",1).save();
				
				var battle_data = {
					enemy_list   : this.enemys.toJSON(),
					captured_list: _.map(captured_list, function(enemy){ return enemy.toJSON() }),
					quest_id     : this.battle.cave.get("quest_id"),
				}
				App.mission.checkProcess("BATTLE_WIN");
				App.mission.checkProcess("SLAY_CARD_LEVEL"    , battle_data);
				App.mission.checkProcess("SLAY_CARD_ATTR"     , battle_data);
				App.mission.checkProcess("SLAY_CARD_RARITY"   , battle_data);
				App.mission.checkProcess("SLAY_CARD_ID"       , battle_data);
				App.mission.checkProcess("SLAY_CARD_UNIQU"    , battle_data);
				App.mission.checkProcess("CAPTURE_CARD_LEVEL" , battle_data);
				App.mission.checkProcess("CAPTURE_CARD_ATTR"  , battle_data);
				App.mission.checkProcess("CAPTURE_CARD_RARITY", battle_data);
				App.mission.checkProcess("CAPTURE_CARD_ID"    , battle_data);
				App.mission.checkProcess("CAPTURE_CARD_UNIQU" , battle_data);
				
				_.each(reward_data,function(num,key){ get_text += '<i class="reward">' + __.helper.itemName(df.DATA_TYPE_ITEM, key, num) + '</i>を てにいれた！<br/>'; })
				_.each(captured_list,function(enemy){ get_text += '<i class="reward">' + enemy.get("name") + '</i>を ゲットした！<br/>'; })
				if(!get_text) get_text = '勝利しました！<br/>';
				
				App.popup.message({ view_class: "battle_result_popup", title:"モンスターをやっつけた！",message: get_text}).done(_.bind(function(){
					this.trigger("battle_end",result,this.battle.get("is_boss"));
				},this))
			}
			
			if(result=="lose"){
				this.trigger("battle_end",result,this.battle.get("is_boss"))
			}
		},
	});
	
	return BattleMgr;
})

