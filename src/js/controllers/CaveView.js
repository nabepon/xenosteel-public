define([
	"models/DebugConsole",
	"models/PcREC",
	"models/Quest",
	"models/BattleREC",
	
	"models/CaveREC",
	"models/CaveMapREC",
	"models/CaveMembers",
	"models/CaveManager",
	"models/CaveScratch",
	
	"controllers/CaveBgView",
	"controllers/CaveScratchesView",
	"controllers/BattleView",
	
	"controllers/PopupHowtoList",
	"controllers/PopupCardDetailView"
],function(
	DebugConsole,
	PcREC,
	Quest,
	BattleREC,
	
	CaveREC,
	CaveMapREC,
	CaveMembers,
	CaveManager,
	CaveScratch,
	
	CaveBgView,
	CaveScratchesView,
	BattleView,
	
	PopupHowtoList,
	PopupCardDetailView
){
	
	// todo BgViewで飾りオブジェクトを入れる
	
	
	// リザルトを表示
	var InfoView = Backbone.View.extend({
		id:"info_view",
		tagName:"div",
		events:{
			"ftap .menu_btn ":"menu",
			"ftap .info_btn ":"info",
			"ftap .howto_btn":"howto",
		},
		initialize:function(options){
			this.cave    = new CaveREC;
			this.caveMap = new CaveMapREC;
			this.quest   = new Quest;
			this.options = options;
		},
		menu: function(){
			var _this = this;
			var data = this.cave.toJSON();
			var html = __.template("cave/menu_view",{
				cave       : data,
				item_data  : data.item_data,
				result     : data.result,
				phrase_list: _.values(data.result.got_phrase_data).sort(function(a,b){ return a.time < b.time }).slice(0,3),
				member_list: _.values(data.result.get_member_list).sort(function(a,b){ return a.time < b.time }).slice(0,5),
			});
			var popup = App.popup.confirm({ view_class: "cave_menu_view", message: html, no:{label:"閉じる"}, yes:{label:"諦める"} }).done(function(){
				App.popup.confirm({ title: "諦めますか？", message: "ここまでに獲得したモンスターと<br/>アイテムを持ち帰ります", no:{label:"閉じる"}, yes:{label:"諦める"} }).done(function(){
					_this.cave.attributes.status.play_result = df.QUEST_RESULT_GIVEUP;
					_this.options.caveMgr.gameEnd()
				});
			})
			popup.view.$el.on("ftap",".more_phrase",function(){ _this.morePhrase() })
			popup.view.$el.on("ftap",".more_card",function(){ _this.moreCard() })
		},
		morePhrase: function(){
			var data = this.cave.toJSON();
			var phrase_list = _.values(data.result.got_phrase_data).sort(function(a,b){ return a.time < b.time });
			var html = __.template("cave/menu_more_phrase", {phrase_list: phrase_list});
			var popup = App.popup.message({ view_class: "more_get_phrase_list_view",title: "入手フレーズ一覧", message: html, yes:{label:"閉じる"} })
			__.scroller.create("more_get_phrase_list");
		},
		moreCard: function(){
			var member_list = _.values(this.cave.attributes.result.get_member_list).sort(function(a,b){ return a.time < b.time });
			var html = __.template("cave/menu_more_card", {member_list: member_list});
			var popup = App.popup.message({ view_class: "more_get_card_list_view",title: "入手モンスター一覧", message: html, yes:{label:"閉じる"} })
			__.scroller.create("more_get_card_list");
		},
		info: function(){
			var quest_id = this.cave.get("quest_id");
			var response = this.quest.getQuestInfo(quest_id);
			App.popup.message({title:response.data.dungeon_name, message:__.macro("quest_base_info",response), yes:{label:"閉じる"} })
		},
		howto: function(){ PopupHowtoList.show(df.HELP_DUNGEON); },
		render:function(){
			var response = {
				quest_data: st.QuestListData[ this.cave.get("quest_id") ],
				cave      : this.cave.attributes,
				cave_map  : this.caveMap.attributes,
			}
			this.$el.html( __.template("cave/info_view",response) )
			return this;
		},
		
	})
	// リザルトを表示
	var EventInfoView = Backbone.View.extend({
		id:"event_info_view",
		tagName:"div",
		initialize:function(){
			this.cave = new CaveREC;
			this.caveMap = new CaveMapREC;
		},
		render:function(){
			var response = {
				quest_data: st.QuestListData[ this.cave.get("quest_id") ],
				cave      : this.cave.attributes,
				cave_map  : this.caveMap.attributes,
			}
			this.$el.html( __.template("cave/event_info_view",response) )
			return this;
		},
		
	})
	
	
	// パーティを表示
	var MemberView = Backbone.View.extend({
		tagName:"div",
		className:"member_view",
		initialize:function(){
			this.cave = new CaveREC;
			this.listenTo(this.model,"change",this.change)
		},
		events:{
			"ftap":"cardDetail",
		},
		change:function(model){
			if(model.changed.hp <= 0){
				this.$el.attr("state-death",true);
			}
			this.render();
		},
		cardDetail:function(){
			if(App.popups.length > 0) return;
			if(App.resume.get("status") != df.RESUME_CAVE) return;
			
			var popupView = new PopupCardDetailView({ card_data:this.model.toJSON(), type_dungeon:true })
			App.popup.add(popupView);
		},
		render:function(){
			if(this.model.get("hp") <= 0){
				this.$el.attr("state-death",true);
			}
			var response = {
				member:this.model.attributes,
			}
			this.$el.html( __.template("cave/member_view",response) )
			//console.log("MemberView#render")
			return this
		},
	})
		
	// パーティを表示
	var MembersView = Backbone.View.extend({
		id:"members_view",
		className:"charas_view member",
		tagName:"div",
		initialize:function(){
			this.cave = new CaveREC;
			this.caveMap = new CaveMapREC;
			this.collection = new CaveMembers;
		},
		render:function(){
			this.$el.empty();
			this.collection.reset( _.values(this.cave.get("members")) )
			this.collection.comparator = "pos";
			this.collection.sort();
			this.collection.each(function(member){
				var memberView = new MemberView({model:member});
				this.$el.append( memberView.render().el );
			},this);
			console.info("MembersView#render", this.collection.toJSON() )
			
			return this;
		},
	})
	
	// 各種Viewをまとめてレンダリングする
	var StageView = Backbone.View.extend({
		id:"stage_view",
		className:"extend-battle_view",
		tagName:"div",
		initialize:function(){
			
			this.chip_size = 60;
			var chips_class = {
				block      : "b",
				wall       : "w",
				floor      : "f",
				scratch_obj: "s",
				anchor     : "a",
				row        : "r",
				column     : "c",
				event_type : "e",
				object_type: "o",
			};
			
			this.pc               = new PcREC;
			this.quest            = new Quest;
			this.battle           = new BattleREC;
			this.cave             = new CaveREC;
			this.caveMap          = new CaveMapREC;
			this.caveMgr          = new CaveManager;
			this.scratch          = new CaveScratch({chip_size:this.chip_size});
			this.bgView           = new CaveBgView({chips_class:chips_class, chip_size:this.chip_size});
			this.scratchesView    = new CaveScratchesView.ScratchesView({model:this.scratch, chips_class:chips_class});
			this.infoView         = new InfoView({caveMgr:this.caveMgr});
			this.eventInfoView    = new EventInfoView;
			this.membersView      = new MembersView;
			App.data.cave_rec     = this.cave;
			App.data.cavemap_rec  = this.caveMap;
			App.data.cave_manager = this.caveMgr;
			App.data.cave_bg_view = this.bgView;
			
			this.eventInfoView.listenTo(this.cave,"sync",this.eventInfoView.render);
			this.listenTo(this.caveMgr,"gameNext",this.gameNextRender);
			this.listenTo(this.caveMgr,"enemyEvent",this.battleStart);
			this.listenTo(this.bgView,"createdBg",this.createdBg);
		},
		startQuest:function(req){
			this.caveMgr.gameStart( (req.query.id).toNumber() );
			return this
		},
		resumeQuest:function(req){
			//fetchで何も処理しなくてもresumeになる。背景はレンダリングする。
			$('#map_view_hide_screen').show();
			App.views.indicator.show();
			this.bgView.render();
			return this
		},
		gameNextRender:function(e){
			this.infoView.render();
			this.scratchesView.render(e) 
			this.membersView.render(e)
			$('#map_view_hide_screen').show();
			App.views.indicator.show();
			this.bgView.render(e);
		},
		battleStart:function(event_data,is_boss){
			
			//キャラデータ準備
			var members = _.values( _.cloneDeep(this.cave.get("members")) );
			var enemys  = this.battle.createEnemyParty(event_data.enemy_ids,event_data.enemy_lvls);
			if(members.length <= 0){ alert("デッキメンバーがいません"); return }
			var item_data = _.cloneDeep(this.cave.get("item_data"));
			
			//戦闘作成＆画面作成
			
			$("#battle_view").hide().html( __.template("battle/battle") );
			App.views.battle = new BattleView({ el:"#battle_container" , canvasBg : this.bgView.cacheBgImg });
			App.views.battle.setupStartBattleScene(members,enemys,item_data,is_boss);
			
			//レジュームステータス保存
			this.battle.trigger("Resume");
			
			this.gotoBattleScene(is_boss)
		},
		createdBg:function(){
			this.scrollerRefresh()
			$('#map_view_hide_screen').hide();
			App.views.indicator.hide()
			if(this.cave.get("status").play != df.RESUME_BATTLE){
				this.animFloorChange()
				return
			}
			this.battleResume()
		},
		battleResume:function(){
			//check
			if(this.cave.get("status").play != df.RESUME_BATTLE){ return }
			
			//戦闘resume＆画面作成
			$("#battle_view").hide().html( __.template("battle/battle") );
			App.views.battle = new BattleView({ el:"#battle_container" , canvasBg : this.bgView.cacheBgImg });
			App.views.battle.setupResumeBattleScene();
			
			this.gotoBattleScene()
		},
		gotoBattleScene:function(is_boss){
			var _this = this;
			
			//画面に暗幕を敷いたあと実行する処理
			var nextAction = _.bind(function(){
				//viewを隠し、戦闘画面作成
				this.$el.css("display","none");
				this.$el.find("#scratch_view").find(".open_anim").removeClass("open_anim");
				App.views.battle.render();
				$("#battle_view").show();
				
				//戦闘終了したら画面を削除
				this.listenToOnce(App.views.battle.battleMgr,"battle_end",function(result,is_boss){
					console.info("--------------- StageView#gotoBattleScene event BATTLE_END ---------------");
					_this.battle.trigger("Resume","battleEnd");
					_this.eventInfoView.render();
					_this.membersView.render();
					if(result=="win"){
						_this.cave.attributes.result.enemy_win_count += 1;
						_this.infoView.render();
					}else{
						_this.cave.attributes.result.enemy_escape += 1;
					}
					
					$("#stage_view").css("display","block");
					App.views.battle.remove();
					if(result=="win" && is_boss){
						this.caveMap.set("is_boss_defeated",1).save();
						this.caveMgr.gameNext();
					}
					this.caveMgr.checkState();
				})
			},this)
			
			//画面に暗幕を敷いたあと、1000ms後に実行する処理
			var nextAction2 = _.bind(function(){ App.views.battle.battleMgr.next(); },this)
			
			if(!is_boss){
				var anim = new App.anim.EnemyEncounter( {nextAction :nextAction,nextAction2:nextAction2} );
				App.popup.add(anim)
			}else{
				var anim = new App.anim.BossEncounter( {nextAction :nextAction,nextAction2:nextAction2} );
				App.popup.add(anim,{view_class:"encounterboss_anim"});
			}
			
		},
		animFloorChange:function(){
			if( this.cave.get("floor_before") > 0 && this.cave.get("status").play == df.STATE_CAVE_NOW ){
				var anim = new App.anim.FloorChange({before:this.cave.get("floor_before"), after:this.cave.get("floor_now")});
				this.listenToOnce(anim,"close",_.bind(function(){
					if( this.caveMap.get("is_exist_boss") ) App.popup.message({message:"強敵の気配がする……"})
				},this))
				window.other_anim = _.filter(App.popup.collection.models,function(model){ return model.view.$el.hasClass("floor_change_anim") });
				_.each(other_anim,function(model){ model.addedview.stop() });
				var popup = App.popup.add(anim,{view_class:"floor_change_anim"});
			}
		},
		render:function(){
			this.bgView.cacheBgFlag = 0;
			                                                          // ↓ここではrender()しない。
			var $map_view = $('<div id="map_view"></div>').append( this.bgView.el ).append( this.scratchesView.render().el );
			
			var _this = this;
			var devcon = new DebugConsole;
			var $devbtn = $('<a class="devbtn">【デバッグ】</a>')
			$devbtn.on("ftap",function(){
				devcon.showCaveDebugView(_this)
			}).css({position: "absolute",color: "#FFF",top: "36px",left: "0px", "text-shadow":"1px 1px 1px #000"})
			
			this.$el
				.empty()
				.append( $map_view )
				.append('<div id="map_view_hide_screen" style="height:297px; width:320px; background-color:#000; position:absolute; top:37px; left:0px;"></div>')
				.append( this.eventInfoView.render().el )
				.append( this.infoView.render().el )
				.append( this.membersView.render().el )
				.append( $devbtn )
			return this;
		},
		setupView:function(){
			__.scroller.create("map_view",{ freeScroll: true, scrollX: true,scrollY: true  , useTransition:false });
			this.scrollerRefresh()
			return this;
		},
		scrollerRefresh:function(){
			if(_.has(__.scroller.id,"map_view")){
				var startPos = this.caveMap.attributes.scratches[0];
				console.log("StageView#scrollerRefresh [startPos]",startPos);
				
				var x = -1 * startPos.x * this.chip_size;
				var y = -1 * startPos.y * this.chip_size;
				__.scroller.id.map_view.scrollTo( x , y , 0)
				__.scroller.refresh();
			}
		},
		remove:function(){
			this.$el.remove();
			this.stopListening();
			this.bgView.stopListening();
			this.scratchesView.stopListening();
			this.membersView.stopListening();
			this.infoView.stopListening();
			this.eventInfoView.stopListening();
			return this;
		}
	});
	
	return StageView;
})

