define([
	'controllers/BattleAnimation',
],function(BattleAnimation){
	
/**
 * Chara
 * CharaEffectView
 * HpView
 * CharaView
 *   enemy、memberの基底クラス
 */
	var Chara = Backbone.Model.extend({
		defaults:function(){
			var defaultAttr = {
				action_anim_played_index : "",
				is_action_turn : false,
				damage : 0,
				before_hp : 0,
				disp_turn : 0,
				captured  : 0,
				captured_item : 0,
				condition     : {
					guard       : { state:0, val:0, cnt:0 },
					// 未対応。対応したらコメントを外していく。
					// buff_atk    : { state:0, val:0, cnt:0 },
					// buff_def    : { state:0, val:0, cnt:0 },
					// buff_mag    : { state:0, val:0, cnt:0 },
					// poison      : { state:0, val:0, cnt:0 },
					// paralyze    : { state:0, val:0, cnt:0 },
					// sleep       : { state:0, val:0, cnt:0 },
					// confusion   : { state:0, val:0, cnt:0 },
					// silence     : { state:0, val:0, cnt:0 },
					// berserk     : { state:0, val:0, cnt:0 },
					// recover     : { state:0, val:0, cnt:0 },
					// multi_attack: { state:0, val:0, cnt:0 },
					// atk_guard   : { state:0, val:0, cnt:0 },
					// mag_guard   : { state:0, val:0, cnt:0 },
					// darkness    : { state:0, val:0, cnt:0 },
				},
				img_type   : "s",
				battle_side:"member",
			};
			return _.extend(this.transferAttr(),defaultAttr);
		},
		transferAttr : function(){
			// 以下は戦闘終了後に引き継ぐ or 引き継ぐ可能性のあるもの
			return {
				hp : 0,
				skill_data : {}
			}
		},
		initialize:function(){
			console.log("Chara#initialize");
			// CharaViewとHpViewがリスナー登録。
			this.listenTo(this,"change",this.change)
		},
		
		validate : function(attrs,opt){
			console.info("Chara#validate");
			var diff = _.difference( _.keys(attrs) , _.keys(this.defaults()) );
			if(diff.length>0) throw __.exception("ERR_MODEL_SET_INVALID",diff);
		},
		change:function(model){
			console.log("Chara#change");
			this.validate(model.changed);
			if(_.has(model.changed,"action_anim_played_index")){
			}
		},
		
		isInactive : function(){
			var state = false;
			if( this.get("hp") <= 0 ) state = true;
			if( this.get("captured") ) state = true;
			return state
		},
		isActive : function(){ return !this.isInactive() }, 
		isDeath : function(){ return this.get("hp") <= 0 }, // hp[^a-bA-b_\.]*[<=>].*0 でGrepすればhp比較している箇所が見つかります
		isAlive : function(){ return this.get("hp") >  0 }, 
		isSkillDisable : function(slot){
			console.log("Chara#isSkillDisable");
			var skill_data = this.get("skill_data");
			var data = skill_data[slot];
			return this.get("skill_data")[slot].use_remain <= 0
		},
		isSkillEnable : function(slot){ return !this.isSkillDisable() },
		
		attrEffectValues : function(){
			return [
				/*        無, 火, 水, 雷, 闇, 光 */
				/* 無 */[100,100,100,100,100,100],
				/* 火 */[100,100, 80,200,100,100],
				/* 水 */[100,200,100, 80,100,100],
				/* 雷 */[100, 80,200,100,100,100],
				/* 闇 */[100,100,100,100,100,250],
				/* 光 */[100,100,100,100,250,100],
			]
		},
		physicalAttackDamage : function(target_model){
			var attrData = this.attrEffectValues();
			var self   = this.attributes;
			var target = target_model.attributes;
			var data = {}
				data.atk       = self.atk;
				data.def       = target.def * 0.8;
				data.subtract  = (data.atk - data.def).clamp(0);
				data.abs       = data.atk * 0.1;
				data.total     = data.abs + data.subtract;
				data.attr      = attrData[self.attribute][target.attribute]/100;
				data.attrAfter = data.total * data.attr;
				data.rand      = _.random(0,20);
				data.resultStr = JSON.stringify(data);
			
			var damage = (data.abs + data.subtract) * data.attr + data.rand; 
			if(target.condition.guard.state) damage = damage / 2;
			console.log("Chara#physicalAttack damage : " + data.resultStr,(damage).floor());
			
			return (damage).floor()
		},
		physicalAttack: function(target){
			console.log("Chara#physicalAttack");
			var damage = this.physicalAttackDamage(target) * 2;
			target.set("before_hp", target.get("hp") );
			target.set("hp",  (target.get("hp")-damage).clamp(0, target.get("hp_full"))  );
			target.set("damage", damage );
		},
		attack : function(type, $deferred, data, allies, full_targets){
			console.log("Chara#attacked");
			var target = full_targets.find(function(model){ return model.get("id") == data.target_id });
			if( target.isInactive() ) return;
			
			this.physicalAttack(target);
			
			// save
			$deferred.resolve()
			
			// motion 
			// todo :何のタイプだか分かりにくいので修正する。またdefineにする。
			var side = (type==1)? "member" : "enemy" ;
			App.sound.se(1);
			this.trigger("play_chara_type", "anim_chara_attack", side );
			this.trigger("play_effect_type", "effect_chara_attack", side );
			this.listenToOnce(this,"play_anim_end_effectAttack",function(){
				target.trigger("play_hp_type", "hp_damage");
				target.trigger("play_chara_type", "anim_chara_damage", side );
				target.trigger("play_effect_type", "effect_chara_damage", side );
			})
		},
		
		skillEffectValue : function(target_model,skill_data){
			var attrData = this.attrEffectValues()
			var self = this.attributes;
			var target = target_model.attributes;
			var skill = skill_data;
			var skill_val = (self.mag > target.mag) ? skill.value : ( self.mag/target.mag * 0.5 + 0.5) * skill.value;
			    skill_val *= skill.attr_val[target.attribute]/100
			    skill_val += _.random(0,20);
			return (skill_val).floor()
		},
		skill : function(type, $deferred, data, allies, opponents){
			console.log("Chara#skill",data);
			var skill = this.get("skill_data")[data.skill_slot];
			var _this = this;
			var target_party = (skill.target==1)? allies : opponents;
			
			// 単体
			if(skill.scope == 1){
				var targets = [ target_party.get(data.target_id) ];
			}
			// 全体
			if(skill.scope == 2){
				var targets = _.filter(target_party.models, function(model){ return model.isActive() });
			}
			// 攻撃か回復か
			var direction = (skill.kind == 1) ? -1 : 1;
			
			_.each(targets,function(target,n){
				var damage = this.skillEffectValue(target,skill) * direction * 3;
				target.set("before_hp", target.get("hp") );
				target.set("hp",  (target.get("hp")-damage).clamp(0, target.get("hp_full"))  );
				target.set("damage", damage );
			},this)
			
			// スキル使用可能回数
			this.get("skill_data")[data.skill_slot].use_remain -= 1;
			
			// save
			$deferred.resolve()
			
			// todo :typeが何のタイプだか分かりにくいので修正する。またdefineにする。
			this.trigger("play_chara_type", "anim_chara_skill", {type: type, skill: skill, targets: targets } );
		},
		
		guard : function(type, $deferred){
			console.log("Chara#guard");
			this.attributes.condition.guard.state = 1;
			this.trigger("guard",this);
			
			// save
			$deferred.resolve()
			
			// motion
			// todo :typeが何のタイプだか分かりにくいので修正する。またdefineにする。
			var side = (type==1)? "member" : "enemy" ;
			this.trigger("play_chara_type", "anim_chara_guard", side );
			this.trigger("play_effect_type"  , "effect_chara_guard", side );
		},
		
		turnEnd : function(event){
			console.log("Chara#turnEnd");
			this.trigger("chara_turn_end",event,this);
		},
		beginTurn : function($deferred){
			console.log("Chara#beginTurn");
			var condition = _.cloneDeep( this.get("condition") );
			
			condition.guard.state = 0;
			
			this.set("condition",condition)
			$deferred.resolve();
		},
	});
	
	var CharaEffectView = Backbone.View.extend({
		className:"chara_effect_view",
		events:{
			"play_anim_end" : "playAnimEnd",
		},
		initialize:function(config,option){
			console.log("CharaEffectView#initialize");
			this.template =  _.template( $("#chara_effect_view_template").html() );
			this.$icon_contaner = $('<div class="icon_contaner"></div>');
			this.$el.append( this.$icon_contaner );
			this.chara = option.chara;
			this.stateCheck();
			this.listenTo(this.chara,"change",this.change);
			this.listenTo(this.chara,"play_effect_type",this.addEffect);
			this.listenTo(this.chara,"captured",this.captured);
		},
		change:function(chara){
			console.log("CharaEffectView#change");
			if(_.has(chara.changed,"condition")){
				if(!chara.changed.condition.guard.state){
					this.$icon_contaner.find(".guard_icon").remove();
				}
			}
		},
		playAnimEnd:function(event,anim_name){
			console.log("CharaEffectView#playAnimEnd",anim_name,this.$el.attr("class"))
			this.chara.trigger("play_anim_end_" + anim_name);
		},
		addEffect:function(play_effect_type,side){
			console.log("CharaEffectView#addEffect ",play_effect_type);
			
			var type = play_effect_type;
			var $effect = $('<div class="' + type + ' ' + side + '"></div>');
			var anim = new BattleAnimation();
			
			if(type == "effect_chara_damage"){
				this.$el.append($effect);
				anim.effectHit($effect,this,side);
			}
			if(type == "effect_chara_attack"){
				this.$el.append($effect);
				anim.effectAttack($effect,this,side);
			}
			if(type == "effect_chara_guard"){
				this.guard()
				this.$el.append($effect);
				anim.effectGuard($effect,this,side);
			}
			this.$el.attr("state-death", this.chara.isDeath());
			this.$el.attr("state-captured", !!this.chara.get("captured"));
		},
		stateCheck : function(){
			var condition = this.chara.get("condition");
			if( condition.guard.state ) this.guard();
			if( this.chara.get("captured") ) this.captured();
		},
		guard : function(){
			if( this.$icon_contaner.find(".guard_icon").length > 0 ) return;
			if( this.chara.get("condition").guard.state == 0 ) return;
			var $effect = $('<div class="guard_icon""></div>');
			this.$icon_contaner.prepend($effect);
		},
		captured : function(){
			if( this.$icon_contaner.find(".capture_icon").length > 0 ) return;
			if( !this.chara.get("captured") ) return;
			var $effect = $('<div class="capture_icon_container"><div class="capture_icon packun_' + this.chara.get("captured_item") + '"></div></div>');
			this.$icon_contaner.html($effect); // 他のアイコンを全て消す
		},
		render: function(){
			this.$el.addClass( this.chara.get("battle_side") );
			this.$el.attr("state-death", this.chara.isDeath());
			this.$el.attr("state-captured", !!this.chara.get("captured"));
			return this;
		},
	});
	
	var HpView = Backbone.View.extend({
		className:"hp_view",
		initialize:function(){
			console.log("HpView#initialize");
			this.template =  _.template( $("#hp_view_template").html() );
			//this.listenTo(this.model,"change",this.change)
			this.listenTo(this.model,"play_hp_type",this.playAnim);
		},
		change:function(model){
			console.log("HpView#change");
		},
		playAnim:function(type){
			console.log("HpView#playAnim");
			if(type=="hp_damage"){
				this.damage()
			}
			this.$el.attr("state-death", this.model.isDeath());
			this.$el.attr("state-captured", !!this.model.get("captured"));
		},
		damage:function(){
			console.log("HpView#damage");
			var hp_per = (this.model.get("hp") / this.model.get("hp_full"))*100;
			this.$el.find(".chara_hp_num").html( this.model.get("hp") +'/'+ this.model.get("hp_full") );
			this.$el.find(".chara_hp_bar").css("width", hp_per + '%');
			
			var anim = new BattleAnimation();
			anim.hpDamage(this,hp_per);
			
			if(this.model.isDeath()){
				anim.hpRemove(this);
			}
		},
		render:function(){
			this.$el.attr("state-death", this.model.isDeath());
			this.$el.attr("state-captured", !!this.model.get("captured"));
			var html = this.template( this.model.toJSON() );
			this.$el.html( html );
			return this
		},
	});
	
	var TurnView = Backbone.View.extend({
		className : "turn_view",
		initialize: function(){
			console.log("TurnView#initialize");
			this.template =  _.template( $("#turn_view_template").html() );
			this.listenTo(this.model,"change",this.change)
		},
		change:function(chara){
			if(_.has(chara.changed,"disp_turn")){
				this.render()
			}
		},
		render: function(){
			this.$el.attr("state-death", this.model.isDeath());
			this.$el.attr("state-captured", !!this.model.get("captured"));
			this.$el.html( this.template( this.model.toJSON() ) );
			return this
		},
	})
	
	var CharaView = Backbone.View.extend({
		className:"chara_view",
		events:{
			"play_anim_end" : "animEnd",
		},
		animEnd:function(event,anim_name){
			console.log("CharaView#animEnd");
			this.model.trigger("play_anim_end_" + anim_name);
			this.model.turnEnd(event)
		},
		initialize:function(){
			console.log("CharaView#initialize");
			this.template =  _.template( $("#chara_view_template").html() );
			this.listenTo(this.model,"change",this.change);
			this.listenTo(this.model,"play_chara_type",this.addAnim);
			this.$el.attr("state-death", this.model.isDeath());
			this.$el.attr("state-captured", !!this.model.get("captured"));
			this.$el.attr("state-is_action_turn", !!this.model.get("is_action_turn") );
		},
		change:function(model){
			console.log("CharaView#change");
			if(_.has(model.changed,"hp") && model.isDeath()){
				this.model.trigger("play_chara_type","death")
			}
			if(_.has(model.changed,"is_action_turn")){
				this.$el.attr("state-is_action_turn", model.changed.is_action_turn);
			}
		},
		addAnim:function(anim_type,data){
			console.log("CharaView#addAnim",anim_type);
			var anim = new BattleAnimation();
			if( anim_type == "anim_chara_damage" ){ anim.charaDamage(this,data); }
			if( anim_type == "death"             ){ anim.charaDeath(this,data); }
			if( anim_type == "anim_chara_attack" ){ anim.charaAttack(this,data); }
			if( anim_type == "anim_chara_guard"  ){ anim.charaGuard(this,data); }
			if( anim_type == "anim_chara_skill"  ){ anim.charaSkill(this,data); }
			this.$el.attr("state-death", this.model.isDeath());
			this.$el.attr("state-captured", !!this.model.get("captured"));
		},
		render:function(){
			var html = this.template( this.model.toJSON() );
			this.$el.html( html )
			return this
		},
	});
	
/**
 * Enemys
 * EnemyView
 * EnemysView
 */
	var Enemys = Backbone.Collection.extend({model:Chara});
	var EnemyView = CharaView.extend({ className:"chara_view enemy_view member" });
	var EnemysView = Backbone.View.extend({
		//id:"battle_enemys_view",
		el:"#battle_enemys_view",
		className: "enemy charas_view",
		initialize:function(){
			console.log("EnemysView#initialize");
			this.enemy_views        = [];
			this.hp_views           = [];
			this.turn_views         = [];
			this.chara_effect_views = [];
		},
		getCollisionWidth : function(){
			return (320/this.collection.length).ceil();
		},
		charaPositionForLeftOrigin   : function(model){
			return this.getCollisionWidth() * model.get("position");
		},
		charaPositionForCenterOrigin : function(model){
			return this.charaPositionForLeftOrigin(model) + (this.getCollisionWidth()/2);
		},
		getCharaView : function(model){
			return this.enemy_views[ model.get("id") ];
		},
		getCharaEffectView : function(model){
			return this.chara_effect_views[ model.get("id") ];
		},
		render:function(){
			console.log("EnemysView#render");
			var $chara_list_container        = this.$el.find(".chara_list_container");
			var $hp_list_container           = this.$el.find(".hp_list_container");
			var $turn_list_container         = this.$el.find(".turn_list_container");
			var $chara_effect_list_container = this.$el.find(".chara_effect_list_container");
			var collision_width = this.getCollisionWidth();
			this.collection.models.sort(function(a,b){ return b.get("priority") - a.get("priority") });
			this.collection.each(function(model,n){
				
				var pos_center = this.charaPositionForCenterOrigin(model) + "px";
				var pos_left   = this.charaPositionForLeftOrigin(model) + "px";
				var width      = collision_width+"px";
				var id         = model.get("id");
				
				//モンスター画像
				var enemyView = new EnemyView({model:model});
				this.enemy_views[id] = enemyView;
				enemyView.$el.css({ left: pos_center, width: width})
				$chara_list_container.append(enemyView.render().el)
				
				//HPバー
				var hpView = new HpView({model:model});
				this.hp_views[id] = hpView;
				hpView.$el.css({ left: pos_left, width: width})
				$hp_list_container.append(hpView.render().el)
				
				//ターン数
				var turnView = new TurnView({model:model});
				this.turn_views[id] = turnView;
				turnView.$el.css({ left: pos_left, width: width, top:"78px" , position: "absolute"})
				$turn_list_container.append(turnView.render().el)
				
				//エフェクト用のviewを用意
				var charaEffectView = new CharaEffectView( {}, {chara: model});
				this.chara_effect_views[id] = charaEffectView;
				charaEffectView.render().$el.css({ left: pos_left, width: width})
				$chara_effect_list_container.append(charaEffectView.el)
				
			},this)
			
			return this
		},
	});
	
/**
 * Members
 * MemberView
 * MembersView
 */
	var Members = Backbone.Collection.extend({model:Chara});
	var MemberView = CharaView.extend({ className:"chara_view member_view member" });
	var MembersView = Backbone.View.extend({
		//id:"battle_members_view",
		el:"#battle_members_view",
		className: "member charas_view",
		initialize:function(){
			console.log("MembersView#initialize");
		},
		render:function(){
			console.log("MembersView#render");
			this.$el.css({left:((5-this.collection.length)*32)+"px"})
			var $chara_list_container        = this.$el.find(".chara_list_container");
			var $hp_list_container           = this.$el.find(".hp_list_container");
			var $turn_list_container         = this.$el.find(".turn_list_container");
			var $chara_effect_list_container = this.$el.find(".chara_effect_list_container");
			this.collection.comparator = "position";
			this.collection.sort();
			this.collection.each(function(model,n){
				
				//モンスター画像
				var memberView = new MemberView({model:model});
				memberView.$el.css({ left: (64*n)+"px" })
				$chara_list_container.append(memberView.render().el)
				
				//HPバー
				var hpView = new HpView({model:model});
				hpView.$el.css({ left: (64*n)+"px" })
				$hp_list_container.append(hpView.render().el)
				
				//ターン数
				var turnView = new TurnView({model:model});
				turnView.$el.css({ left: (64*n+51)+"px"})
				$turn_list_container.append(turnView.render().el)
				
				//エフェクト用のviewを用意
				var charaEffectView = new CharaEffectView( {}, {chara: model} );
				charaEffectView.render().$el.css({ left: (64*n)+"px" })
				$chara_effect_list_container.append(charaEffectView.el)
				
			},this)
			
			return this
		},
	});
	
	return {
		Chara           : Chara,
		CharaEffectView : CharaEffectView,
		HpView          : HpView,
		CharaView       : CharaView,
		Enemys          : Enemys,
		EnemyView       : EnemyView,
		EnemysView      : EnemysView,
		Members         : Members,
		MemberView      : MemberView,
		MembersView     : MembersView,
	};
})

