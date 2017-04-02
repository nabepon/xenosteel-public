define([
	'models/DebugConsole',
	'models/BattleREC',
	'models/BattleManager',
	'controllers/BattleAnimation',
	'controllers/BattleChara',
	'controllers/BattleSystemView',
],function(DebugConsole,BattleREC,BattleManager,BattleAnimation,BattleChara,BattleSystemView){
	
/**
 * BattleView
 * バトル全体のview
 */
	var BattleView = Backbone.View.extend({
		//el:"#battle_container",
		events:{
			"ftap":"click"
		},
		initialize:function(option){
			console.log("BattleView#initialize");
			App.data.battleView = this;
			this.battle = new BattleREC;
			this.canvasBg = option.canvasBg;
		},
		click:function(){
			console.log("BattleView#click");
			this.battleMgr.click();
		},
		setupBattleClasses : function(members,enemys){
			this.members       = new BattleChara.Members( members );
			this.membersView   = new BattleChara.MembersView({collection:this.members});
			this.enemys        = new BattleChara.Enemys( enemys );
			this.enemysView    = new BattleChara.EnemysView({collection:this.enemys});
			this.command       = new BattleSystemView.Command({},{members:this.members, enemys:this.enemys});
			this.battleLogView = new BattleSystemView.BattleLogView({model:this.command});
			this.commandView   = new BattleSystemView.CommandView({model:this.command});
			this.turnChangeView= new BattleSystemView.TurnChangeView({model:this.command});
			this.skillView     = new BattleSystemView.SkillView({model:this.command});
			this.captureView   = new BattleSystemView.CaptureView({model:this.command, enemysView:this.enemysView});
			this.battleMgr     = new BattleManager({},{members:this.members, enemys:this.enemys, command:this.command});
			this.battleAnim    = new BattleAnimation();
			this.battleAnim.battleLogView = this.battleLogView;
		},
		setupResumeBattleScene:function(){
			console.log("BattleView#setupResumeBattleScene");
			if( this.battle.get("is_default") ){ throw "バトルデータがありません"; }
			this.setupBattleClasses( this.battle.get("members"), this.battle.get("enemys") );
			this.listenTo(this.battleMgr,"battle_end",this.battleEnd)
			this.listenTo(this.battleMgr,"battle_start",this.battleResume)
			this.listenTo(this.command,"showBattleDebugView",this.showBattleDebugView)
			return this
		},
		setupStartBattleScene:function(members,enemys,item_data,is_boss){
			console.log("BattleView#setupStartBattleScene",enemys,item_data);
			
			//debug用。hpを全回復する
			//_.each(members,function(member,n){ member.hp = member.hp_full });
			
			//ポジションのデータなど作成
			_.each(members,function(member,n){ member.position = member.pos }); //ポジションをmodelに保存しておく
			members.sort(function(a,b){ return a.pos - b.pos });
			_.each(enemys,function(enemy,n){ enemy.position = n }); //ポジションをmodelに保存しておく
			enemys.sort(function(a,b){ return a.size - b.size });   //プライオリティのため、sizeでソート
			_.each(enemys,function(enemy,n){ enemy.priority = n }); //プライオリティをmodelに保存しておく
			
			//属性を初期化する
			this.battle.attributes = this.battle.defaults();
			this.battle.attributes.is_default= false;
			this.battle.attributes.members   = members;
			this.battle.attributes.enemys    = enemys;
			this.battle.attributes.item_data = item_data;
			this.battle.attributes.is_boss   = is_boss;
			
			//シーンのセットアップ
			this.setupBattleClasses(members,enemys);
			this.listenTo(this.battleMgr,"battle_end",this.battleEnd)
			this.listenTo(this.battleMgr,"battle_start",this.battleStart)
			this.listenTo(this.command,"showBattleDebugView",this.showBattleDebugView)
			
			//ターン生成。saveもこの中で行う
			this.battle.createTurn(this.members,this.enemys);
			
			//this.battleMgr.next();
			
			return this
		},
		battleResume:function(nextAction){
			console.log("BattleView#battleResume");
			App.popup.message({message:"戦闘を再開します！"}).done(nextAction)
			this.battleAnim.jc.start();
			//this.battleAnim.jc.on("onFrame",function(){ console.log("onFrame") });
		},
		battleStart:function(nextAction){
			console.log("BattleView#battleStart");
			var enemys = _.cloneDeep(this.battle.attributes.enemys).sort(function(a,b){ return a.position - b.position });
			var name_text = _.reduce(enemys,function(result,enemy){ return result + enemy.name + "<br/>" },"");
			App.popup.message({title: "モンスターがあらわれた", message:name_text + "に遭遇した！"}).done(nextAction)
			this.battleAnim.jc.start();
			//this.battleAnim.jc.on("onFrame",function(){ console.log("onFrame") });
		},
		battleEnd:function(){
			console.log("BattleView#battleEnd");
			this.battleAnim.jc.stop();
			this.remove();
		},
		showBattleDebugView : function(){
			var devcon = new DebugConsole;
			devcon.showBattleDebugView(this)
		},
		render:function(){
			console.log("BattleView#render");
			this.$el.find(".battle_canvas_bg"       ).append( this.canvasBg                    )
			this.$el.find("#battle_members_view"    ).append( this.membersView.render().el     )
			this.$el.find("#battle_enemys_view"     ).append( this.enemysView.render().el      )
			this.$el.find("#battle_turn_change_view").append( this.turnChangeView.render().el  )
			this.$el.find("#battle_log_view"        ).append( this.battleLogView.render().el  )
			this.$el.find("#battle_command_view"    ).append( this.commandView.render(true).el )
			
			return this;
		}
	});
	
	return BattleView;
})

