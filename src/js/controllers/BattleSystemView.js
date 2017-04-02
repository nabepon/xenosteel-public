define([
	'models/BattleREC',
	'models/BattleManager',
	'controllers/BattleAnimation',
	'controllers/BattleChara',
	'controllers/PopupHowtoList',
	'controllers/PopupCardDetailView',
],function(BattleREC,BattleManager,BattleAnimation,BattleChara,PopupHowtoList,PopupCardDetailView){
	
/**
 * BattleLogView
 */
	var BattleLogView = Backbone.View.extend({
		//id: "log_message_view",
		el:"#battle_log_view",
		initialize: function(){
			this.template =  _.template( $("#battle_log_view_template").html() );
			this.messages = ["モンスターがあらわれた",""];
		},
		addMessageGuard: function(chara){
			var name = chara.get("name");
			this.add(name + "は防御した");
		},
		addMessageAttack: function(chara){
			var name = chara.get("name");
			this.add(name + "の攻撃！");
		},
		addMessageDamage: function(chara,damage_num){
			var name = chara.get("name");
			var damage = (damage_num).toString().replace("-","");
			this.add(name + " に " + damage + " ダメージ")
		},
		add: function(message){
			if(!message) return;
			this.messages.shift();
			this.messages.push(message);
			this.render();
		},
		render: function(){
			var html = this.template({messages: this.messages });
			this.$el.html(html);
			return this
		},
	});
	
/**
 * Command
 * CommandView
 */
	var Command = Backbone.Model.extend({
		defaults:function(){
			return {
				hide : false,
				disable : false,
				member_select_disable   : true,
				enemy_select_disable    : true,
				command_capture_disable : true,
				command_guard_disable   : true,
				command_howto_disable   : true,
				command_skill_1_disable : true,
				command_skill_2_disable : true,
				current_member_id:0,
				members:{},
				enemys:{},
				turn_type:"",
				turn_change:false,
			}
		},
		initialize:function(prop,option){
			console.log("Command#initialize");
			this.members = option.members;
			this.enemys  = option.enemys;
			this.listenTo(this,"change",this.change)
		},
		change:function(model){
			console.log("Command#change");
			var diff = _.difference( _.keys(model.changed) , _.keys(this.defaults()) );
			if(diff.length>0) throw __.exception("ERR_MODEL_SET_INVALID",diff);
		},
		disableCommand : function(){
			console.log("Command#disableCommand");
			this.attributes.disable                 = true;
			this.attributes.member_select_disable   = true;
			this.attributes.enemy_select_disable    = true;
			this.attributes.command_attack_disable  = true;
			this.attributes.command_capture_disable = true;
			this.attributes.command_guard_disable   = true;
			this.attributes.command_skill_disable   = true;
			this.attributes.command_howto_disable   = true;
			this.trigger("disable_command");
		},
		enableCommand : function(){
			console.log("Command#enableCommand");
			this.attributes.disable                 = false;
			this.attributes.member_select_disable   = false;
			this.attributes.enemy_select_disable    = false;
			this.attributes.command_attack_disable  = false;
			this.attributes.command_capture_disable = false;
			this.attributes.command_guard_disable   = false;
			this.attributes.command_skill_disable   = false;
			this.attributes.command_howto_disable   = false;
			this.trigger("enable_command");
		},
	});
	
	var CommandView = Backbone.View.extend({
		//id:"battle_command_view",
		el:"#battle_command_view",
		events:{
			"ftap .command_member_select" :"memberSelect",
			"ftap .command_enemy_select"  :"enemySelect",
			"ftap .command_member_detail" :"memberDetail",
			"ftap .command_howto"  :"howto",
			"ftap .command_attack" :"attack",
			"ftap .command_capture":"capture",
			"ftap .command_guard"  :"guard",
			"ftap .command_skill"  :"skill",
			"ftap .command_debug"  :"debug",
		},
		initialize:function(){
			console.log("CommandView#initialize");
			this.template =  _.template( $("#battle_command_view_template").html() );
			this.battle = new BattleREC;
			this.listenTo(this.model,"disable_command",this.disableCommand)
			this.listenTo(this.model,"enable_command",this.enableCommand)
			this.listenTo(this.model,"change",this.change)
		},
		disableCommand : function(){
			console.log("CommandView#disableCommand");
			this.$el.find(".battle_command_container, .target_select_view").attr("state-enable",false);
		},
		enableCommand : function(){
			console.log("CommandView#enableCommand");
			this.render();
		},
		change:function(model){
			console.log("CommandView#change");
			if(_.has(model.changed,"member_select_disable")){
				this.$el.find(".target_select_view.member").attr("state-enable", !model.changed.member_select_disable );
			}
			if(_.has(model.changed,"enemy_select_disable")){
				this.$el.find(".target_select_view.enemy").attr("state-enable", !model.changed.enemy_select_disable );
			}
		},
		memberSelect:function(e){
			console.log("CommandView#memberSelect",e);
			var target_id = $(e.currentTarget).data("member_id");
			if(this.model.get("member_select_disable")){ console.log("member_select_disable"); return }
			App.sound.se(1)
			this.model.trigger("input_command_member_select",{target_id:target_id});
		},
		enemySelect:function(e){
			console.log("CommandView#enemySelect",e);
			var target_id = $(e.currentTarget).data("enemy_id");
			if(this.model.get("enemy_select_disable")){ console.log("enemy_select_disable"); return }
			App.sound.se(1)
			this.model.trigger("input_command_enemy_select",{target_id:target_id});
		},
		memberDetail:function(e){
			console.log("CommandView#memberDetail",e);
			if(App.popups.length > 0) return;
			App.sound.se(1)
			var target_id = $(e.currentTarget).data("member_id");
			var card_data = _.find(this.model.members.toJSON(),function(data){ return data.id == target_id })
			var popupView = new PopupCardDetailView({ card_data:card_data, type_battle:true })
			App.popup.add(popupView);
		},
		howto: function(e){
			console.log("CommandView#howto",e);
			if(this.model.get("command_howto_disable")){ console.log("command_howto_disable"); return }
			PopupHowtoList.show(df.HELP_BATTLE);
		},
		attack:function(e){
			console.log("CommandView#attack",e);
			var target_id = $(e.currentTarget).data("enemy_id");
			if(this.model.get("command_attack_disable")){ console.log("command_attack_disable"); return }
			if(this.model.enemys.get(target_id).isInactive()){ console.log("target isInactive()"); return }
			this.model.trigger("input_command","command_type_attack",{target_id:target_id})
		},
		capture:function(){
			console.log("CommandView#capture");
			if(this.model.get("command_capture_disable")){ console.log("command_capture_disable"); return }
			this.model.trigger("input_command","command_type_capture")
		},
		guard:function(){
			console.log("CommandView#guard");
			if(this.model.get("command_guard_disable")){ console.log("command_guard_disable"); return }
			this.model.trigger("input_command","command_type_guard")
		},
		skill:function(e){
			console.log("CommandView#skill");
			if(this.model.get("command_skill_disable")){ console.log("command_skill_disable"); return }
			this.model.trigger("input_command","command_type_skill", { skill_slot: $(e.currentTarget).data().skillSlot })
		},
		response:function(){
			console.log("CommandView#response");
			return {
				enemys : this.model.enemys.toJSON().sort(function(a,b){ return a.position - b.position }),
				members: this.model.members.toJSON(),
				member : this.battle.getLastActionMember(),
			};
		},
		render:function(is_disable){
			console.log("CommandView#render");
			this.$el.html( this.template(this.response()) );
			if( is_disable == true ){
				this.$el.find(".battle_command_container").attr("state-enable",false);
			}
			this.$el.find(".target_select_view.member").attr("state-enable",false);
			
			return this
		},
		debug : function(){
			this.model.trigger("showBattleDebugView");
		},
	});
	
/**
 * TurnChangeView
 */
	var TurnChangeView = Backbone.View.extend({
		//id:"battle_turn_change_view",
		el:"#battle_turn_change_view",
		events:{
			"play_anim_end" : "animEnd",
		},
		animEnd:function(event,anim_name){
			console.log("TurnChangeView#animEnd");
			this.model.trigger("play_anim_end_" + anim_name);
			this.model.trigger("turnChangeEnd");
			this.deferred.resolve();
		},
		initialize:function(){
			console.log("TurnChangeView#initialize");
			this.template =  _.template( $("#battle_turn_change_view_template").html() );
			this.battle = new BattleREC;
			this.listenTo(this.model,"turn_change",this.turnChange)
		},
		turnChange:function(deferred){
			console.log("TurnChangeView#turnChange");
			this.deferred = deferred;
			var anim = new BattleAnimation();
			anim.turnChange(this, this.battle.get("total_new_turn"));
		},
		render:function(){
			console.log("TurnChangeView#render");
			return this
		},
	})
	
/**
 * SkillView
 */
	var SkillView = Backbone.View.extend({
		id:"skill_view",
		template: "", // 今はPopup制御のため無し。後で作りなおす。
		events:{
			"play_anim_end" : "animEnd",
		},
		animEnd:function(event,anim_name){
		},
		initialize:function(){
			console.log("SkillView#initialize");
			this.battle = new BattleREC;
			this.listenTo(this.model,"skill_confirm",this.skillConfirm);
		},
		skillConfirm : function(side, $deferred, data, members, enemys, chara){
			console.log("SkillView#skillConfirm");
			/*
			* スキル説明
			* target: 1:味方 2:敵 3:敵味方両方
			* kind  : スキルのタイプ。今は攻撃だけなので1のみ。 
			* attr  : 0:無 1:火 2:水 3:雷 4:闇 5:光 
			* scope : 1:1体 2:全体 3:ランダム
			*/
			if( chara.isSkillDisable(data.skill_slot) ){
				$deferred.reject();
				App.popup.message({title:"使用できません",message:"スキル残り使用回数がありません。"})
				return;
			}
			
			var skill = chara.get("skill_data")[data.skill_slot];
			var command = this.model;
			var charaSkill = function(){ chara.skill(side, $deferred, data, members, enemys, chara) };
			console.log("SkillView#skillConfirm skill_data", skill, data, side);
			
			// 全体対象スキル
			if(skill.scope==2){
				var popup = App.popup.confirm({ message:"【"+skill.name+"】を使用します<br/>全体をターゲットにします", yes:{label:"　使用する　"}, no :{label:"　キャンセル　"} }).done(function(){
					charaSkill();
				}).always(function(){ command.enableCommand() });
				popup.view.$el.addClass("skill_confirm_popup")
			}
			
			// 個別対象スキル
			if(skill.scope==1){
				var popup = App.popup.message({ message:"【"+skill.name+"】を使用します<br/>ターゲットを選択してください", yes:{label:"キャンセル"} }).done(function(){ command.enableCommand() })
				var target_type = (skill.target==1)? "member" : "enemy";
				popup.view.$el.addClass("skill_select_popup")
				              .addClass("select_" + target_type)
				              .prepend('<div class="black_screen_1"></div><div class="black_screen_2"></div>');
				command.set(target_type + "_select_disable",false); // 対象選択ができるようにする
				
				this.listenToOnce(command,"input_command_"+target_type+"_select",function(data2){
					_.extend(data,data2);
					console.log("SkillView#skillConfirm on input_command_"+target_type+"_select",data);
					popup.view.close();
					command.disableCommand();
					charaSkill();
				})
			}
		},
	})
	
/**
 * CaptureView
 */
	var CaptureView = Backbone.View.extend({
		id:"capture_view",
		template: "", // 今はPopup制御のため無し。後で作りなおす。
		events:{
			"play_anim_end" : "animEnd",
		},
		animEnd:function(event,anim_name){
		},
		initialize:function(options){
			console.log("CaptureView#initialize");
			this.options = options;
			this.battle = new BattleREC;
			this.listenTo(this.model,"capture_confirm",this.captureConfirm);
		},
		captureConfirm : function($deferred, enemys, chara){
			console.log("CaptureView#captureConfirm");
			this.stopListening(this.model,"input_command_enemy_select");
			var command = this.model;
			var popup = App.popup.message({ message:'<div class="capture_confirm_container"></div>', yes:{label:"キャンセル"} });
			var item_data = this.battle.get("item_data");
			var response = { item : item_data };
			popup.done(_.bind(function(){
				command.enableCommand();
				this.stopListening(this.model,"input_command_enemy_select");
			},this))
			popup.view.$el.find(".capture_confirm_container").append( __.template("battle/capture_confirm_inner",response) )
			
			popup.view.$el.find(".item").on("ftap",_.bind(function(e){
				var item_id = $(e.currentTarget).data("item_id");
				if(item_data[item_id]){
					popup.view.close();
					this.selectCaptureMessage($deferred, enemys, chara, item_id);
				}else{
					App.popup.message({message: "パックンを所持していません" });
				}
			},this))
		},
		selectCaptureMessage: function($deferred, enemys, chara, item_id){
			console.log("CaptureView#selectCaptureTarget",item_id);
			var _this = this;
			var command = this.model;
			
			if( appenv.BUILD_LEVEL == appenv.DEBUG_BUILD ){
				var rate_list = enemys.map(function(enemy){ return [enemy.get("position"), _this.battle.captureRate(item_id,enemy)]; });
				    rate_list.sort(function(a,b){ return a[0] - b[0] });
				    rate_list = _.map(rate_list,function(rate){ return (rate[1]/100)  + "%" })
				var debug_text = "デバッグ表示確率：" + rate_list.join(" ");
			}else{
				var debug_text = "";
			}
			
			var popup = App.popup.message({ message:"【"+st.ItemData[item_id].name+"】を使用します<br/>ターゲットを選択してください<br/>" + debug_text, yes:{label:"キャンセル"} })
			popup.always(function(){ command.disableCommand() })
			popup.done(function(){ _this.captureConfirm($deferred, enemys, chara) })
			popup.view.$el.addClass("capture_target_select_popup")
			              .prepend('<div class="black_screen_1"></div><div class="black_screen_2"></div>');
			command.set("enemy_select_disable",false); // 対象選択ができるようにする
			this.waitSelectCaptureTarget($deferred, enemys, chara, item_id, popup);
		},
		waitSelectCaptureTarget : function($deferred, enemys, chara, item_id, popup){
			this.listenToOnce(this.model,"input_command_enemy_select",_.bind(function(data){
				console.log("CaptureView#waitSelectCaptureTarget on input_command_enemy_select",data);
				var target = enemys.get(data.target_id);
				if(target.isInactive()){
					console.log("SkillView#waitSelectCaptureTarget on ターゲットは戦闘不参加です");
					this.waitSelectCaptureTarget($deferred, enemys, chara, item_id, popup);
					return
				}else{
					var result = this.battle.capture(item_id, data.target_id, enemys);
					popup.view.close();
					this.captureResult($deferred, enemys, chara, item_id, result, target);
				}
			},this))
		},
		captureResult : function($deferred, enemys, chara, item_id, result, target){
			/*
			* todo :
			*  jchronoでアニメーションを入れる
			*  画面が見えない間にキャラの見た目を変える
			*  キャラの状態を変え終わったらturnEndする
			*/
			var captureEnd = function(){
				$deferred.resolve();
				chara.turnEnd();
				target.trigger("captured");
			}
			var target_pos = this.options.enemysView.charaPositionForCenterOrigin(target);
			var targetView = this.options.enemysView.getCharaView(target);
			var anim = new BattleAnimation();
			anim.effectCapture(item_id, result, target, targetView, target_pos, function(){ captureEnd() });
		},
	})
	
	
	return {
		BattleLogView  :BattleLogView,
		Command        :Command,
		CommandView    :CommandView,
		TurnChangeView :TurnChangeView,
		SkillView      :SkillView,
		CaptureView    :CaptureView,
	};
})

