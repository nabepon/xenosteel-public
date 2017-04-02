define([
	"models/PcREC",
	"models/Quest",
	"models/Mate",
	"models/CaveREC",
	"models/CaveMapREC",
	"models/Twitter",
],function(PcREC,Quest,Mate,CaveREC,CaveMapREC,Twitter){
	
	// 開発用のメニューを表示
	var CaveManager = Backbone.Model.extend({
		constructor:function(){
			if(!CaveManager.instance){
				CaveManager.instance = this;
				Backbone.Model.apply(CaveManager.instance,arguments);
			}
			return CaveManager.instance;
		},
		initialize:function(){
			this.pc = new PcREC;
			this.quest = new Quest;
			this.cave = new CaveREC;
			this.caveMap = new CaveMapREC;
			this.listenTo(this.pc,"invalid",this.saveError);
			this.listenTo(this.cave,"invalid",this.saveError);
			this.listenTo(this.caveMap,"invalid",this.saveError);
		},
		saveError:function(){
			this.pc.attributes = _.cloneDeep(this.pc._previousAttributes)
			this.cave.attributes = _.cloneDeep(this.cave._previousAttributes)
			this.caveMap.attributes = _.cloneDeep(this.caveMap._previousAttributes)
		},
		checkState: function(){
			var _this = this;
			var members = this.cave.get("members");
			var is_live = _.find(members,function(member){ return member.hp > 0 });
			if(!is_live){
				this.cave.attributes.status.play_result = df.QUEST_RESULT_FAIL;
				if(appenv.BUILD_LEVEL == appenv.DEBUG_BUILD){
					App.popup.confirm({
						yes:{label:"デバッグ続行"},
						no:{label:"終了"},
						title  :"全滅しました",
						message:"デバッグ続行しますか？",
					}).fail(function(){
						_this.gameEnd();
					})
				}else{
					_this.gameEnd();
				}
			}
		},
		// todo CaveViewで戦闘に遷移しているのをManagerに仕事を移動する
		gameBattle:function(){
		},
		gameStart:function(quest_id){
			if(quest_id == undefined){quest_id=this.cave.get("quest_id")}; //仮対応
			//リセット
			this.cave.reset();
			
			//PcRECからデータ作成
			this.cave.createMemberParty();
			this.cave.createItemData();
			
			//floor初期値
			this.cave.set("quest_id",quest_id);
			this.cave.set("floor_now",0);
			
			this.gameNext();
		},
		gameNext:function(e,num){
			var num = (num==undefined) ? 1 : num;
			if( st.QuestListData[this.cave.get("quest_id")].floor_max < this.cave.get("floor_now") + num){
				this.gameClear();
				return
			}
			//MAPの作成
			var list_id      = this.cave.get("quest_id");
			var floor_before = this.cave.get("floor_now");
			var floor_now    = this.cave.get("floor_now") + num;
			var floor_data   = this.quest.getFloorData(list_id, floor_now);
			
			this.cave.set("first_touch", 0 );
			this.cave.set("floor_before", floor_before );
			this.cave.set("floor_now", floor_now );
			this.cave.set("difficulty",floor_data.level);
			this.caveMap.reset();
			this.caveMap.newMap( list_id, floor_now, floor_data );
			this.caveMap.makeScratches( list_id, floor_data.scratch_id );
			this.caveMap.setScratchEventNum( floor_data.level );
			this.caveMap.extendProp(); //caveMapにx,y,nu,scratchesなどのショートカット設定
			this.cave.set("positive_num"  , this.caveMap.get("positive_num") );
			this.cave.set("positive_open" , this.caveMap.get("positive_num") );
			this.cave.set("negative_num"  , this.caveMap.get("negative_num") );
			this.cave.set("negative_open" , this.caveMap.get("negative_num") );
			this.cave.set("scratches" , this.caveMap.get("scratches") );
			this.trigger("Resume","gameNext");
			this.cave.save();
			this.caveMap.save();
			this.trigger("gameNext");
		},
		gameEnd:function(e){
			console.log("CaveManager#gameEnd [e]",e);
			var mate         = new Mate;
			var quest_id     = this.cave.get("quest_id");
			var quest_info   = this.quest.getQuestInfo(quest_id);
			var quest_play   = this.pc.attributes.quest_play;
			var quest_status = this.pc.attributes.quest_status[quest_info.data.world_id];
			
			//ダメージ計算
			var mate_list = this.pc.get("mate_list");
			_.each(this.cave.get("members"), function(member){ mate_list[member.id].hp_time = mate.extendHpTime(member).hp_time });
			
			//入手ポイント、使用後アイテムのset
			_.each(this.cave.get("item_data")             , function(num ,id){ this.pc.setItem(id.toNumber(), num       ) },this);
			_.each(this.cave.get("result").got_item_data  , function(item,id){ this.pc.addItem(id.toNumber(), item.point) },this);
			_.each(this.cave.get("result").got_phrase_data, function(id){ this.pc.addPhrase(id, 1) },this);
			
			//入手カードset
			var new_mate_list = mate.createMates(this.pc, this.cave.get("result").get_member_list );
			this.pc.addMates(new_mate_list);
			App.mission.checkProcess("CAPTURE_CARD", this.cave.get("result").get_member_list);
			App.mission.checkProcess("CURRENT_AREA", quest_id);
			App.mission.checkProcess("PLAY_QUEST_ID", quest_id);
			App.mission.checkProcess("CLEAR_QUEST_ID",[quest_id, this.cave.attributes.status.play_result]);
			console.log("CaveManager#gameEnd [new_mate_list]", new_mate_list);
			
			//play_count、クリアフラグset
			if( _.isUndefined(quest_play[quest_id]) ) quest_play[quest_id] = this.pc.defaultQuestPlay();
			quest_play[quest_id].play += 1;
			if(this.cave.attributes.status.play_result == df.QUEST_RESULT_CLEAR ){
				if(!_.contains(quest_status.clear_ids,quest_id)) quest_status.clear_ids.push(quest_id);
				quest_play[quest_id].clear += 1;
				this.cave.get("result").is_clear = 1;
			}
			
			//クリアボーナス付与
			if(this.cave.attributes.status.play_result == df.QUEST_RESULT_CLEAR ){
				console.log("quest_info",quest_info)
				if(quest_play[quest_id].clear == 1 && quest_play[quest_id].play == 1){
					_.each(quest_info.first_reward,function(reward){
						this.pc.addItem(reward.first_reward_id, reward.first_reward_vol, reward.first_reward_type);
					},this)
					this.cave.get("result").clear_first_reward = quest_info.first_reward;
				}else{
					_.each(quest_info.reward,function(reward){
						this.pc.addItem(reward.reward_id, reward.reward_vol, reward.reward_type);
					},this)
					this.cave.get("result").clear_reward = quest_info.reward;
				}
			}
			
			//残処理
			this.trigger("Resume","gameResult");
			this.pc.save();
			this.cave.save();
			this.trigger("gameEnd");
			
			var endDialog = function(dialog_data){
				App.popup.message(dialog_data).done(function(){
					var anim = new App.anim.Fadeout( { nextAction :function(){ App.router.navigate("/html/Cave/caveResult",{trigger:true}) }} );
					App.popup.add(anim);
				})
			}
			if(this.cave.attributes.status.play_result == df.QUEST_RESULT_CLEAR ){
				endDialog({
					title  :'クエストクリア！',
					yes    :{label:"OK"},
					message:'\
						クエストをクリアしました！<br/>\
						<br/>\
						ここまでに獲得したモンスターと<br/>\
						アイテムを持ち帰ります\
					',
				});
			}
			if(this.cave.attributes.status.play_result == df.QUEST_RESULT_FAIL ){
				endDialog({
					title  :'全滅しました',
					yes    :{label:"OK"},
					message:'\
						「遊び方」を確認して再挑戦しよう！<br/>\
						<br/>\
						ここまでに獲得したモンスターと<br/>\
						アイテムを持ち帰ります\
					'.replace(/\t/g,""),
				});
			}
			if(this.cave.attributes.status.play_result == df.QUEST_RESULT_GIVEUP ){
				endDialog({
					title  :'諦めた',
					yes    :{label:"OK"},
					message:'\
						クエストを諦めました<br/>\
						<br/>\
						ここまでに獲得したモンスターと<br/>\
						アイテムを持ち帰ります\
					'.replace(/\t/g,""),
				});
			}
			if(this.cave.attributes.status.play_result == df.QUEST_RESULT_DEFAULT ){
				endDialog({
					title  :'エラー',
					yes    :{label:"OK"},
					message:'クリアできませんでした<br/>',
				});
			}
		},
		gameClear:function(e){
			console.log("CaveManager#gameClear [e]", e);
			this.cave.attributes.status.play_result = df.QUEST_RESULT_CLEAR;
			this.gameEnd();
			//ボス討伐処理
			//終了処理 gameEnd
		},
		setInitQuestPlay : function(){
			
		},
		render:function(){
			var response = {
				cave:_.cloneDeep(this.cave.attributes),
				map :_.cloneDeep(this.caveMap.attributes),
			};
			this.$el.html( __.template("sample_cave",response) );
			return this;
		},
		
		
		
		//イベント関連
		emptyEvent: function(event_data,event_num){
		},
		gameMoneyEvent: function(event_data,event_num){
			//this.cave.attributes.result.get_game_money += event_num;
			this.cave.attributes.result.get_treasure += 1;
			this.cave.addGetItem(df.ITEM_GAME_MONEY, event_num)
		},
		realMoneyEvent: function(event_data,event_num){
			//this.cave.attributes.result.get_real_money += event_num;
			this.cave.attributes.result.get_treasure += 1;
			this.cave.addGetItem(df.ITEM_REAL_MONEY_FREE, event_num)
		},
		gachaPointEvent: function(event_data,event_num){
			//this.cave.attributes.result.get_gacha_point += event_num;
			this.cave.attributes.result.get_treasure += 1;
			this.cave.addGetItem(df.ITEM_GACHA_POINT, event_num)
		},
		phraseEvent: function(event_data,event_num){
			// 1001000_0/1001000_0...の形式でくるので加工する
			console.log("CaveManager#phraseEvent begin [event_data]", _.cloneDeep(event_data));
			this.cave.attributes.result.get_treasure += 1;
			var event_data = _.map(event_data.split("/"),function(data,n){
				return {
					id : data.split("_")[0].toNumber(),
					num: data.split("_")[1].toNumber(),
				};
			});
			var event_phrase = _.last(event_data);
			var event_item   = _.first(event_data);
			var event_omake  = event_data.slice(1,event_data.length-1);
			
			var phrase_data = st.PhraseData[event_phrase.id];
			var item        = _.extend( event_item , st.ItemData[ event_item.id ] );
			this.omake      = event_omake;
			console.log("CaveManager#phraseEvent after [event_data]", _.cloneDeep(event_data));
			console.log("CaveManager#phraseEvent [this.omake]", this.omake);
			
			// アイテムを追加
			this.cave.addGetItem(item.id, item.num);
			this.cave.addGetPhrase(event_phrase.id, 1);
			var phrase_text = phrase_data.text + "<br/><br/>" + phrase_data.author;
			
			if(_.size(this.omake)){
				var twitter = this.createTwitter();
				var is_connected = twitter.rec.get("is_connected");
				var yes_text = (is_connected)?"ツイート報酬GET":"更に報酬をGET";
				App.popup.confirm({
					yes:{label:yes_text},
					no:{label:"閉じる"},
					title:"フレーズを発見！",
					message:"過去の冒険者のものだろうか……<hr><br/>" + phrase_text + "<br/><br/><hr>入手アイテム：" + item.name + " × " + item.num + item.count_name
				}).done(_.bind(function(){
					if( !is_connected ){
						App.popup.confirm({
							yes:{label:"次へ"},
							no :{label:"要らない"},
							title:'<i style="color:#FFFF55;">追加報酬</i>の獲得チャンス！',
							message: '\
								Twitterに入手フレーズを投稿すると<br/>\
								<i style="color:#FFFF55; padding:12px 0px 20px 0px; display: inline-block;" class="tweet_aori">\
									' + item.name + ' × ' + item.num + item.count_name + '<br/>\
									がGETできます！<br/>\
								</i>\
								<br/>\
								※報酬付与のため連携アプリ認証を行います<br/>\
								※報酬付与以外の目的には使用しません\
							'.replace(/\t/g,""),
						}).done(function(){ twitter.tweet(phrase_text) })
					}else{
						twitter.tweet(phrase_text)
					}
				},this))
			}else{
				App.popup.message({
					yes:{label:"OK"},
					title:"フレーズを発見！",
					message:"過去の冒険者のものだろうか……<hr><br/>" + phrase_text + "<br/><br/><hr>入手アイテム：" + item.name + " × " + item.num + item.count_name
				})
			}
		},
		itemEvent: function(event_data,event_num){
			this.cave.attributes.result.get_treasure += 1;
			// 1001000_0/1001000_0...の形式でくるので加工する
			var event_data = _.map(event_data.split("/"),function(data,n){
				return {
					id : data.split("_")[0].toNumber(),
					num: data.split("_")[1].toNumber(),
				};
			});
			console.log("CaveManager#itemEvent [event_data]", event_data);
			
			// アイテムの追加をする
			var reward_text = "";
			_.each( event_data ,function(item){
				this.cave.addGetItem(item.id, item.num)
				var item_data = st.ItemData[item.id]
				reward_text += item_data.name + " × " + item.num + item_data.count_name + "<br/>";
			},this)
			
			//獲得ダイアログ
			App.popup.message({ yes:{label:"OK"}, title:"宝箱を発見！", message: reward_text + "を見つけました！", })
		},
		enemyEvent: function(event_data,is_boss){
			//enemys作成に必要な変数準備
			// 1001000-0/1001000-0...の形式でくるので、 [[1001000][0]] [[1001000][0]] ...の形に加工する
			var floor_data = this.quest.getFloorData( this.cave.get("quest_id"), this.cave.get("floor_now") );
			var enemy_data = _.map(event_data.split("/"),function(data,n){ return data.split("_") });
			var enemy_ids  = _.map(enemy_data,function(data){ return data[0] });
			var enemy_lvls = _.map(enemy_data,function(data){
				var lvl = data[1].toNumber();
				return (lvl > 0) ? lvl : floor_data.level;
			})
			var converted_data = {
				enemy_ids :enemy_ids,
				enemy_lvls:enemy_lvls,
			}
			
			this.trigger("enemyEvent",converted_data, (is_boss=="is_boss")?1:0 )
			console.log("CaveManager#enemyEvent");
			return
		},
		enemyEventMimic: function(event_data,is_boss){
			App.popup.message({ yes:{label:"OK"}, title:"ミミックだ！", message: "モンスターが飛びだしてきた！", }).done(_.bind(function(){
				this.enemyEvent(event_data,is_boss);
			},this))
		},
		trapEvent: function(event_data,event_num){
			App.popup.message({message:"未実装"})
		},
		kaidanEvent: function(event_data,event_num){
			App.sound.se(1);
			App.popup.confirm(df.MSG_NEXT_FLOOR_CONFIRM).done(_.bind(function(popup,selected){
				if(this.caveMap.get("is_exist_boss")){
					App.popup.confirm({message:"この先に強敵の気配がする……<br/>奥に進みますか？"}).done(_.bind(function(){
						// this.caveMgr.gameNext();
						this.enemyEvent( this.caveMap.get("boss_data_str"), "is_boss" )
					},this));
				}else{
					this.gameNext();
				}
			},this));
		},
		
		createTwitter: function(){
			var _this = this;
			var twitter = new Twitter;
			twitter.tweetFinish = function(){
				App.views.indicator.hide()
				var text = "";
				_.each(_this.omake,function(item){
					_this.cave.addGetItem(item.id, item.num);
					text += st.ItemData[item.id].name + " × " + item.num + st.ItemData[item.id].count_name + "<br/>";
				},_this)
				App.popup.message({yes:{label:"OK"}, message:"ツイート報酬として<br/><br/>" + text + "<br/>をGETしました！"})
				App.mission.checkProcess("POST_TWITTER_PHRASE");
			}
			return twitter
		},
	});
	
	return CaveManager;
})

