define([
	"controllers/BattleAnimation",
	
	"models/PcREC",
	"models/Mate",
	"models/Quest",
	"models/BattleREC",
	"models/PresentREC",
	"models/UserConfigREC",
	
	"models/CaveREC",
	"models/CaveMapREC",
	"models/CaveManager",
],function(
	BattleAnimation,
	
	PcREC,
	Mate,
	Quest,
	BattleREC,
	PresentREC,
	UserConfigREC,
	
	CaveREC,
	CaveMapREC,
	CaveManager
){

var DebugConsole = Backbone.Model.extend({
	constructor:function(){
		// シングルトン
		if(!DebugConsole.instance){
			DebugConsole.instance = this;
			Backbone.Model.apply(DebugConsole.instance,arguments);
		}
		return DebugConsole.instance;
	},
	defaults    : function(){ return {} },
	initialize : function(){
		this.pc = new PcREC;
		this.mate = new Mate;
		this.quest = new Quest;
		this.present = new PresentREC;
		this.cave  = new CaveREC;
		this.caveMap = new CaveMapREC;
		this.caveMgr = new CaveManager;
		this.battle = new BattleREC;
		this.userConfig = new UserConfigREC;
	},
	showSystemDebugView : function(){
		var _this = this;
		var list = [
			["backkey                   ","backkey"        ],
			["アイテムデータ追加        ","add_items"      ],
			["モンスターの追加・売却    ","mate_add"       ],
			["モンスターのステータス変更","mate_status"    ],  
			["時間設定                  ","time_change"    ],
			["クエストクリア機能        ","quest_clear"    ],
			["プレゼント追加            ","add_present"    ],
			["--------------------------",""               ],
			["新規データ作成            ","data_create"    ],
			["データ初期化              ","data_initialize"],
			["データ保存                ","data_save"      ],
			["データ読み込み            ","data_load"      ],
			["データ完全消去            ","data_all_delete"],
			["--------------------------",""               ],
			["タイトルへ                ","goto_title"     ],
		]
		var html = "";
		_.each(list,function(el){ html += '<a class="btn '+el[1]+'">'+el[0]+'</a><br/>' })
		
		var views = {};
		window.devcon1 = views;
		
		views.system_debug = App.popup.confirm({yes:{label:"　リロードする"}, no:{label:"　　閉じる　　"}, message:'<div>'+html+'</div>'},{},{
			events:{
				"ftap .backkey"        :"backkey",
				"ftap .add_items"      :"add_items",
				"ftap .mate_add"       :"mate_add",
				"ftap .mate_status"    :"mate_status",
				"ftap .time_change"    :"time_change",
				"ftap .data_create"    :"data_create",
				"ftap .data_initialize":"data_initialize",
				"ftap .data_save"      :"data_save",
				"ftap .data_load"      :"data_load",
				"ftap .data_all_delete":"data_all_delete",
				"ftap .quest_clear"    :"quest_clear",
				"ftap .goto_title"     :"goto_title",
				"ftap .add_present"    :"add_present",
			},
			backkey :function(){
				views.system_debug.view.close();
				App.back();
			},
			add_present :function(){
				
				var data = {
					data_type: df.DATA_TYPE_ITEM,
					item_id  : 1,
					num      : 1,
					message  : "プレゼントメッセージです",
					item_data: {},
					time     : __.baseTime(),
				}
				
				var html = __.mustache('\
						<div style="height:10px\;"></div>\
						\
						data_type :<select class="select_data_type" style="width:130px;">\
							<option value="{{ df.DATA_TYPE_ITEM }}">ItemData.xls</option>\
							<option value="{{ df.DATA_TYPE_CARD_SEED }}">CardSeedData.xls</option>\
						</select><br/>\
						<div style="height:10px\;"></div>\
						\
						item_id :<input class="input_id" type="text" style="width:130px;" ><br/>\
						<div style="height:10px\;"></div>\
						\
						num :<input class="input_num" type="text" style="width:130px;" value="1"><br/>\
						<div style="height:10px\;"></div>\
						\
						時刻:<input class="input_date" type="datetime-local" value="{{ __.moment().format("YYYY-MM-DDTHH:mm:ss") }}" />\
						<div style="height:10px\;"></div>\
						\
						message :<br/>\
						<textarea class="input_message" type="text" style="width:250px;" >プレゼントメッセージ</textarea><br/>\
						<div style="height:10px\;"></div>\
						\
						受け取り期限フラグ :\
						<input class="is_limit" type="checkbox" /><br/>\
						<div style="height:10px\;"></div>\
						\
						期日:<input class="input_limit" type="datetime-local" value="{{ __.moment().add(1,"M").format("YYYY-MM-DDTHH:mm:ss") }}" />\
						<div style="height:10px\;"></div>\
						\
						<a class="on_enter_key add_present_btn" style="margin:5px 0 10px 0;">追加する</a><br/>\
					')();
					
				views.add_present = App.popup.message({yes:{label:"閉じる"}, message:"プレゼント追加<br/>"+html})
				var $popup = views.add_present.view.$el;
				$popup.on("ftap",".add_present_btn",function(){
					var date  = __.moment( $popup.find(".input_date").val()  ).valueOf();
					var limit = __.moment( $popup.find(".input_limit").val() ).valueOf();
					var is_limit = $popup.find(".is_limit").prop("checked");
					
					var data = {
						data_type: $popup.find(".select_data_type").val().toNumber(),
						item_id  : $popup.find(".input_id").val().toNumber(),
						num      : $popup.find(".input_num").val().toNumber(),
						time     : date,
						message  : $popup.find(".input_message").val(),
						limit    : (is_limit)? limit : 0,
					}
					if(!data.item_id || !data.num){ console.error("idかnumがsetされていません"); return }
					
					_this.present.add(data).save();
					App.popup.message({message:__.helper.itemName(data.data_type, data.item_id, data.num) + "<br/>を追加しました"})
				})
			},
			
			
			goto_title :function(){
				location.href = location.href.replace(/#.*/,"");
			},
			
			quest_clear :function(){
				var world_id = prompt("ワールドを選択してください\n1：通常\n2：未実装\n特殊ワールド：101",_this.pc.get("current_world"));
				if(world_id==null) return;
				var quest = _this.quest.attributes;
				if(!quest.world_data[world_id]){ alert("ワールドが存在しません") }
				var quest_list = quest.world_data[world_id];
				var item_options = "";
				for(var i in quest_list){
					item_options += '<option value="'+quest_list[i].id+'">ID:' + quest_list[i].id + ' ' + quest.area_data[world_id][ quest_list[i].area_id ][0].area_name + " " + quest_list[i].dungeon_name
				}
				var html = ''
						+'開放するクエストを選択してください<br/>'
						+'<select name="quest_clear_select" class="quest_clear_select" style="min-width:10px; width:100%;">'
						+   item_options
						+'</select>'
				views.data_load = App.popup.confirm({yes:{label:"　開放する　"},no:{label:"　キャンセル　"},message:html}).done(function(){
					var select_id = $(".quest_clear_select").val()
					var target_quest = _.find(quest_list,function(data){ return data.id == select_id });
					var quest_status = _this.pc.get("quest_status")
					quest_status[world_id].available_area = target_quest.area_id;
					quest_status[world_id].available_group= target_quest.group_id;
					quest_status[world_id].available_quest= target_quest.id;
					quest_status[world_id].available_world= target_quest.world_id;
					_this.pc.set("quest_status",quest_status);
					console.debug("quest_clear",_this.pc.get("quest_status"))
					_this.pc.save();
				})
			},
			
			data_all_delete : function(){
				if(confirm("端末内に保存した全てのデータを消去します")){
					for(var i in localStorage){
						localStorage.removeItem(i)
					}
					alert("全てのデータを削除しました。")
				}
			},
			
			data_save : function(retry,self){
				var _self = this;
				var save_id = prompt("入力されたSaveIDで保存します\n現在の SaveID:" + localStorage.save_id, localStorage.save_id);
				if(save_id){
					if(save_id.match(/[^a-zA-Z0-9]/)){
						alert("SaveIDには英数字のみ設定可能です")
						return
					}
					var prev_save_id = localStorage.save_id;
					localStorage.save_id = save_id;
					var user_id = localStorage.device_id + "_" + save_id;
					_this.pc.set("id",user_id).save();
					_this.pc.trigger("change_user_id",user_id);
					
					// 保存に必要なデータだけにする
					var storageClone = {};
					var device_id = localStorage.device_id;
					var save_id = localStorage.save_id;
					for(var i in localStorage){
						if(!!i.match(/REC-/)){
							var check_data = i.replace(/.*REC-/,"").split("_");
							if(check_data[0] == device_id && check_data[1] == save_id){
								storageClone[i] = localStorage[i]
							}
						}else{
							storageClone[i] = localStorage[i]
						}
					}
					for(var i in localStorage){ localStorage.removeItem(i) }
					for(var i in storageClone){ localStorage[i] = storageClone[i]; }
					storageClone = null;
					
					
					// 保存処理
					window.saveddata = $.ajax({
						url:appenv.save_php,
						type:"post",
						async:false,
						data:{
							device_id : localStorage.device_id ,
							save_id   : localStorage.save_id ,
							storage   : JSON.stringify(localStorage),
						},
					}).done(function( data ) {
						alert("SaveID:"+localStorage.save_id+" で保存しました");
					}).fail(function() {
						//if(retry){
						//	_self.data_save(false);
						//}else{
							alert(JSON.stringify(arguments))
						//}
					});
				}
			},
			
			data_load :function(retry){
				var _self = this;
				var user_id,device_id,save_id
				var item_options = "";
				for(var i in appenv.test_users){
					item_options += '<option value="'+appenv.test_users[i].id+'">' + appenv.test_users[i].name + " :" + appenv.test_users[i].id
				}
				var html = ''
						+'<hr><style>input[type="text"].devcon{ min-width:10px; }</style>'
						+ '■読み込みIDを入力してください<br/>形式：端末ID_SaveID<br/>'
						+ '<input type="text" class="devcon input_load_id" style="width: 98%;" value="'+localStorage.device_id+'_'+localStorage.save_id+'"><br/>'
						+ '<a class="load_user_id" style="margin:5px;">現在のSaveID:'+ localStorage.save_id +' に読み込む</a>'
						+'<br/><hr><br/>'
						+ '■端末とSaveIDを設定してください<br/>'
						+'<select name="select_device_id" class="devcon select_device_id" style="width: 100%; margin:5px 0px;">'
						+'	<option value="'+localStorage.device_id+'">自分の端末('+localStorage.device_id+')</option>'
						+   item_options
						+'</select>'
						+ 'SaveID：<input type="text" class="devcon input_save_id" style="margin:10px 0px 5px 0px;" value="'+localStorage.save_id+'"><br/>'
						+ '<a class="load_device_id" style="margin:5px;">現在のSaveID:'+ localStorage.save_id +' に読み込む</a>'
						+'<hr><br/><br/>'
				
				views.data_load = App.popup.message({yes:{label:"閉じる"},message:html})
				views.data_load.view.$el.on("ftap",".load_user_id",function(){
					user_id = $(".input_load_id").val()
					device_id = user_id.split("_")[0];
					save_id = user_id.split("_")[1];
					loadData();
				})
				views.data_load.view.$el.on("ftap",".load_device_id",function(){
					device_id = $(".select_device_id").val();
					save_id = $(".input_save_id").val();
					user_id = device_id+"_"+save_id;
					loadData();
				})
				
				var popuped = 0;
				var loadData = function(){
					if(save_id.match(/[^a-zA-Z0-9]/)){
						alert("SaveIDには英数字のみ設定可能です")
						return
					}
					$.ajax({ 
						type: 'GET',
						url : appenv.load_php,
						dataType: 'jsonp',
						jsonpCallback: 'jsonpParse',
						async :false,
						data : {
							device_id : device_id,
							save_id : save_id,
						},
					}).done(function( json ) {
						var self_user_id = localStorage.device_id+"_"+localStorage.save_id;
						var storage = JSON.parse(json.data.storage);
						var device_id = json.data.device_id;
						var save_id   = json.data.save_id;
						var user_id   = device_id+"_"+save_id
						// recデータだけ取り出し、idを書き変える
						var key_converted_rec_data = _.reduce(storage,function(result,data,key){
							if( key.match(device_id+"_"+save_id) ){
								var new_key = key.replace(user_id, self_user_id)
								data = JSON.parse(data)
								data.id = self_user_id;
								result[new_key] = JSON.stringify(data);
							}
							return result
						},{})
						// 自分のrecデータを消す
						for(var i in localStorage){
							if(!!i.match(/REC-/)) localStorage.removeItem(i);
						}
						// recデータ以外、および上書きしないデータ以外をコピーする
						for(var i in storage){
							if(i.match(/REC/) || i.match(/save_id/) || i.match(/device_id/) || i.match(/app_info/)){
							}else{
								localStorage[i] = storage[i];
							}
						}
						// recデータを読み込む
						for(var i in key_converted_rec_data){
							localStorage[i] = key_converted_rec_data[i];
						}
						// textareaに書き出し
						if(!__.info.is_mobile){
							var parsedData = __.parseSaveJson(json);
							var parsedStr = __.toJSON(parsedData);
							$("body").append('<textarea style="color: #465A9B; font-size: 12px; height:770px; width:320px;">'+parsedStr+'</textarea>');
							console.log(parsedStr);
							console.debug("parsedData:",parsedData);
						}
						alert("読み込みが完了しました");
					})
					.error(function(){ alert("読み込みに失敗しました\nError:\n" + JSON.stringify(arguments)) });
				}
			},
			
			time_change : function(){
				views.add_item = App.popup.confirm({yes:{label:"　変更する"},no:{label:"キャンセル　"}, message:'\
					<div>時間を変更します</div>\
					<input class="select_date" type="datetime-local" value="'+__.moment().format('YYYY-MM-DDTHH:mm:ss')+'"/>\
					<a class="reset_time" style="margin:15px 0px 10px 0px;">現在時刻に設定</a>\
				'},{},{
					events:{
						"ftap .reset_time":"resetTime",
					},
					resetTime: function(){
						this.$el.find(".select_date").val( __.moment(__.systemTime()).format('YYYY-MM-DDTHH:mm:ss') );
					},
				})
				views.add_item.done(function(){
					var date = __.moment( views.add_item.view.$el.find(".select_date").val() );
					__.setBaseTime( date.valueOf() )
				})
			},
			
			add_items : function(){
				var item_options = "";
				for(var i in st.ItemData){ item_options += '<option value="'+i+'">' + st.ItemData[i].name; }
				var html = ''
						+'<a class="item" data-item_id="1" >コイン変更</a><br/>'
						+'<a class="item" data-item_id="4" >魔石変更</a><br/>'
						+'<a class="item" data-item_id="5" >ガチャポイント変更</a><br/>'
						+'<a class="item" data-item_id="50">モンスターパックン</a><br/>'
						+'<a class="item" data-item_id="51">スーパーパックン</a><br/>'
						+'<a class="item" data-item_id="52">ドラゴンパックン</a><br/>'
						+'<br/>'
						+'<select name="item_select" class="item_select">'
						+'	<option value="">アイテムIDを選択</option>'
						+   item_options
						+'</select>'
						+'';
				views.add_item = App.popup.message({yes:{label:"閉じる"}, message:'<div>'+html+'</div>'},{},{
					events:{
						"ftap .item":"addItem",
						"change .item_select":"selectItem"
					},
					addItem : function(e){ this.addDone( $(e.currentTarget).data("item_id") ) },
					selectItem: function(e){ this.addDone( $(e.currentTarget).val().toNumber() ) },
					addDone : function(item_id){
						var item = st.ItemData[item_id];
						var num = prompt("名前：" + item.name + "\n現在：" + _this.pc.getItem(item_id) + item.count_name,_this.pc.getItem(item_id))
						if(num!=null){
							_this.pc.setItem(item_id,num.toNumber())
							_this.pc.save()
						}
					},
				})
			},
			
			
			data_create : function(){
				var save_id = prompt("新規SaveIDで開始します。\nSaveID を設定してください。")
				if(save_id!=null){
					localStorage.save_id = save_id;
					_this.pc.resetPcData( localStorage.device_id + "_" + save_id)
					alert("新規データを作成しました。");
					location.reload();
				}
			},
			
			
			data_initialize : function(){
				if(confirm("以下データを初期化しますか？\n端末ID:"+localStorage.device_id+"\nSaveID:"+localStorage.save_id+"\n")){
					_this.pc.resetPcData(_this.pc.get("id"))
					alert("初期化しました。");
					location.reload();
				}
			},
			
			
			mate_add : function(){
				var item_options = '';
				for(var i in st.CardSeedData){
					var youto = (st.CardSeedData[i].kind==0) ? "(ﾀﾞﾝｼﾞｮﾝ)" 
					          : (st.CardSeedData[i].kind==1) ? "(ガチャ )"
					          : "(その他)" ; 
					item_options += '<option value="'+i+'">' + i + youto + st.CardData[ st.CardSeedData[i].card_id ].name;
				}
				
				var html = ''
						+'<select name="select_add_id" class="select_add_id">'
						+'	<option value="">モンスターIDを選択</option>'
						+   item_options
						+'</select>'
						+'<a class="select_add_id_item" style="margin:5px 0 10px 0;">追加する</a><br/>'
						+'<input class="input_add_id" type="text" ><br/>'
						+'<a class="input_add_id_item" style="margin:5px 0 10px 0;">追加する</a><br/>'
						+'<a class="add_all_item" style="margin:10px 0 10px 0;">全てのモンスターを追加</a><br/>'
						+'<a class="sell_all_item" style="margin:10px 0 10px 0;">デッキ以外のモンスターを売却</a><br/>'
						+'<hr><div class="add_member_text"></div>'
				
				var selected_id = 0;
				views.add_mate_select = App.popup.message({yes:{label:"閉じる"}, message:"モンスターを選択してください<br/>"+html})
				
				views.add_mate_select.view.$el.on("ftap",".select_add_id_item, .input_add_id_item, .add_all_item, .sell_all_item",function(e){
					if($(e.currentTarget).hasClass("add_all_item")){
						_this.pc.addMates( _this.mate.createMates(_this.pc, _.keys(st.CardSeedData) ) )
						$(".add_member_text").html("全てのモンスターを追加しました");
						_this.pc.save()
						return
					}
					if($(e.currentTarget).hasClass("sell_all_item")){
						var mate_list = _this.pc.get("mate_list");
						var deck = _this.pc.deck.get("member");
						var mate_ids = _.reduce(mate_list,function(result,data,key){
							if(!_.contains(deck,data.id)) result.push(data.id);
							return result
						},[])
						_this.mate.sell(_this.pc, mate_ids );
						$(".add_member_text").html("全てのモンスターを売却しました");
						_this.pc.save()
						return
					}
					
					if($(e.currentTarget).hasClass("select_add_id_item")) selected_id = $(".select_add_id").val();
					if($(e.currentTarget).hasClass("input_add_id_item")) selected_id = $(".input_add_id").val();
					var seed_data = st.CardSeedData[selected_id];
					if(seed_data==undefined) $(".add_member_text").html("");
					
					var card_data = st.CardData[seed_data.card_id];
					_this.pc.addMates( _this.mate.createMates(_this.pc, selected_id ) )
					_this.pc.save()
					var youto = (seed_data.kind==0) ? " ダンジョン用 " : (seed_data.kind==1) ? " ガチャ用 " : " その他 " ; 
					var html = '<style>.add_member_text .l{text-align:left;}.r{text-align:right;}</style>'
							+'---------------------<br/>追加しました'+__.baseTime()+'<br/>---------------------'
							+'<table style="width:100%;">'
							+'          <tr><td class="r">        ID</td><td>：</td><td class="l">'+selected_id
							+'</td></tr><tr><td class="r">      用途</td><td>：</td><td class="l">' + youto 
							+'</td></tr><tr><td class="r">      名前</td><td>：</td><td class="l">' + card_data.name 
							+'</td></tr><tr><td class="r">      属性</td><td>：</td><td class="l">' + __.helper.attrText(card_data.attribute)
							+'</td></tr><tr><td class="r">レアリティ</td><td>：</td><td class="l">' + __.helper.rarityText(card_data.rarity)
							+'</td></tr></table>';
					
					$(".add_member_text").html(html);
				})
			},
			
			
			mate_status:function(){
				
				var deck = _this.pc.get("deck");
				var selected_id = 0;
				var skill_id_1 = 0;
				var skill_id_2 = 0;
				var item_options = "";
				var mate = new Mate;
				for(var i in deck){
					if(deck[i]>0){
						var member = _this.pc.getMateData(deck[i]);
						item_options += '<option value="'+member.id+'">'+member.name+'</option>'
					}else{
						item_options += '<option value="0">------------------</option>'
					}
				}
				var select_html = ''
						+'<select name="item_select" class="item_select">'
						+'	<option value="">デッキ内モンスターを選択</option>'
						+   item_options
						+'</select>'
						+'<div class="text" style="margin-top:8px; min-height:100px;"></div>'
				
				
				views.change_mate_select = App.popup.message({yes:{label:"閉じる"}, message:select_html},{},{
					events:{
						"ftap .mate_level"     :"mate_level",
						"ftap .mate_individual":"mate_individual",
					},  
					mate_level : function(){
						var member = _this.pc.getMateData(selected_id)
						var new_mate_list = _.cloneDeep(_this.pc.attributes.mate_list);
						var level = prompt("レベルを変更します\n 現在：" + member.lvl,member.lvl);
						//if(level<=0){ return }
						new_mate_list[member.id] = mate.getStatusFromLvl(member,level.toNumber());
						_this.pc.set("mate_list",new_mate_list);
						_this.pc.save();
						views.change_mate_select.view.$el.trigger("change");
					},
					mate_individual : function(){
						var member = _this.pc.getMateData(selected_id)
						var new_mate_list = _.cloneDeep(_this.pc.attributes.mate_list);
						var individual = prompt("個体値を変更します(0～100)\n 内容：[攻撃,防御,魔力,HP]\n 現在：" + JSON.stringify(member.individual),JSON.stringify(member.individual));
						member.individual = JSON.parse(individual);
						//if(level<=0){ return }
						new_mate_list[member.id] = mate.getStatusFromLvl(member,member.lvl);
						_this.pc.set("mate_list",new_mate_list);
						_this.pc.save();
						views.change_mate_select.view.$el.trigger("change");
					},
				})
				
				views.change_mate_select.view.$el.on("change",function(e){
					
					selected_id = views.change_mate_select.view.$el.find(".item_select").val()
					var member = _this.pc.getMateData(selected_id)
					
					if(e.target.className=="skill_select_1" || e.target.className=="skill_select_2"){
						var slot = (e.target.className=="skill_select_1") ? 0 : 1; 
						var skill_id = $(e.currentTarget).find(".skill_select_"+(slot+1)).val();
						member.skill[slot] = skill_id.toNumber();
						var new_mate_list = _.cloneDeep(_this.pc.attributes.mate_list);
						new_mate_list[member.id] = mate.getStatusFromLvl(member,member.lvl);
						_this.pc.set("mate_list",new_mate_list);
						_this.pc.save();
						member = _this.pc.getMateData(member.id)
					}
					
					var item_options = "";
					for(var i in st.CardSkillData){ item_options += '<option value="'+i+'">'+i+":"+st.CardSkillData[i].name+'</option>' }
					var skill1_html = ''
							+'<select name="skill_select_1" class="skill_select_1" style="margin:8px 0px;">'
							+'	<option value="">'+member.skill_data[0].name+' →変更</option>'
							+   item_options
							+'</select><br/>'
							+'<select name="skill_select_2" class="skill_select_2" style="margin:8px 0px;">'
							+'	<option value="">'+member.skill_data[1].name+' →変更</option>'
							+   item_options
							+'</select><br/>'
					var html = ''
							+'<a class="mate_level"              > レベル：'+ member.lvl +' →変更</a><br/>'
							+   skill1_html
							//+'<a class="mate_skill" data-slot="0">'+ member.skill_data[0].name +' →変更</a><br/>'
							//+'<a class="mate_skill" data-slot="1">'+ member.skill_data[1].name +' →変更</a><br/>'
							+'<a class="mate_individual"         > 個体値：'+ JSON.stringify(member.individual) +' →変更</a><br/>'
					$(e.currentTarget).find(".text").html(html);
				})
				
				
			},
		}).done(function(){ location.reload() }); // end system_debug
	},// end SystemDebugView
	
	
	
	
	
	
	showCaveDebugView : function(caveview){
		
		var _this = this;
		var list = [
			["クエストをクリア        ","quest_clear"      ],
			["全滅で失敗              ","quest_fail"       ],
			["諦めて失敗              ","quest_giveup"     ],
			["次フロアへ移動          ","floor_next"       ],  
			["前フロアへ移動          ","floor_prev"       ],  
			["フロアを再作成          ","floor_remake"     ],  
			["------------------------",""                 ],  
			["敵を選んで戦闘          ","debug_battle"     ],  
			["パックン追加            ","add_items"        ],
			["モンスターを回復        ","mamber_recover"   ],
			["イベントアイコン表示    ","show_event"       ],
			["イベントアイコン演出    ","show_event_anim"  ],
			//["イベント内容表示        ","show_event_detail"],
			["スクロール解消          ","resolve_scroll"   ],
		]
		var html = "";
		_.each(list,function(el){ html += '<a class="btn '+el[1]+'">'+el[0]+'</a><br/>' })
		
		var views = {};
		window.devcon2 = views;
		
		views.system_debug = App.popup.confirm({yes:{label:"　リロードする"}, no:{label:"　　閉じる　　"}, message:'<div>'+html+'</div>'},{},{
			events:{
				"ftap .quest_clear"      :"quest_clear",
				"ftap .quest_fail"       :"quest_fail",
				"ftap .quest_giveup"     :"quest_giveup",
				"ftap .floor_next"       :"floor_next",
				"ftap .floor_prev"       :"floor_prev",
				"ftap .floor_remake"     :"floor_remake",
				"ftap .debug_battle"     :"debug_battle",
				"ftap .add_items"        :"add_items",
				"ftap .mamber_recover"   :"mamber_recover",
				"ftap .show_event"       :"show_event",
				"ftap .show_event_anim"  :"show_event_anim",
				"ftap .show_event_detail":"show_event_detail",
				"ftap .resolve_scroll"   :"resolve_scroll",
			},
			resolve_scroll: function(){
				__.scroller.refresh();
				views.system_debug.view.close();
			},
			show_event_detail: function(){
				this.battle.battleSpeed = 5;
			},
			show_event: function(){
				$("#scratch_view .show_obj ").css("opacity",1);
				views.system_debug.view.close();
			},
			show_event_anim: function(){
				$("#scratch_view .show_obj ").css("opacity",1);
				views.system_debug.view.close();
				_.delay(function(){
					var jc = window.scratch_jc;
					
					var $coin_img = $(".treasure_coin_img");
					var $kirakira = $(".treasure_kirakira");
					var $coin_num = $(".treasure_num");
					$(".show_obj_tags").css("opacity",1);
					
					// $coin_img
					jc.animate({ duration: jc.frameToTime(5), target: $coin_img, easing: 'easeOutCubic', x: [0,6] , y: [-5,-25],
					}).animate({ duration: jc.frameToTime(5), target: $coin_img, easing: 'easeInCubic' , x: [6,10], y: [-25,-5],
					}).animate({ delay: jc.frameToTime(10), duration: jc.frameToTime(5), target: $coin_img, easing: 'linear',
						onFrame : function(k,anim){ anim.setStyle(anim.target, {x:10,y:-5,alpha:1-k}) },
						onInit  : function(anim){ anim.setStyle(anim.target, {x:0,y:-5,alpha:1}) }
					});
					
					// $coin_num
					jc.animate({
						duration: jc.frameToTime(25),
						target  : $coin_num,
						onFrame : function(k,anim){
							var alpha = (1 - anim.getEase('linear'))*2;
							anim.setStyle(anim.target, {
								y    : 10 - 10 * anim.getEase('linear'),
								alpha: (alpha>1)? 1 : alpha,
							})
						},
					});
					
					// $kirakira
					jc.animate({
						duration: jc.frameToTime(25),
						target  : $kirakira,
						onFrame : function(k,anim){
							var alpha = (1 - anim.getEase('linear'))*2;
							anim.setStyle(anim.target, {
								y    : 10 - 10 * anim.getEase('linear'),
								alpha: (alpha>1)? 1 : alpha,
							})
						},
					});
					
					// $enemy_img
					
					$(".e" + df.EVENT_ENEMY + " .close_obj").css("opacity",1);
					var $show_enemy_img = $(".e" + df.EVENT_ENEMY + " .show_obj_img");
					var $close_enemy_img = $(".e" + df.EVENT_ENEMY + " .close_obj_img");
					var $enemy_show_obj = $(".e" + df.EVENT_ENEMY + " .show_obj");
					var $enemy_close_obj = $(".e" + df.EVENT_ENEMY + " .close_obj");
					$close_enemy_img.css("-webkit-transform-origin","50% 80%");
					jc.animate({
						duration: jc.frameToTime(20),
						target  : $close_enemy_img,
						scale   : [1.5,1],
						alpha   : [0.999,1],
						easing  : "easeOutElastic",
					});
					
					jc.animate({ duration: jc.frameToTime(30), target: $enemy_show_obj , alpha: [0,0.00001], onFinish:function(k,anim){ anim.target.css("opacity",1) }, });
					jc.animate({ duration: jc.frameToTime(30), target: $enemy_close_obj, alpha: [1,0.99999], onFinish:function(k,anim){ anim.target.css("opacity",0) }, });
				},300)
			},
			add_items: function(){
				var item_data = _this.cave.get("item_data");
				for(var i in item_data){ item_data[i] = 100 }
				_this.cave.set("item_data",item_data).save();
				alert("アイテムを100個にしました");
			},
			mamber_recover: function(){
				var members = _this.cave.get("members");
				_.each(members,function(member){ member.hp = member.hp_full })
				_this.cave.set("members",members).save();
				alert("回復しました");
			},
			quest_clear: function(){
				_this.cave.attributes.status.play_result = df.QUEST_RESULT_CLEAR;
				_this.caveMgr.gameClear()
				views.system_debug.view.close();
			},
			quest_fail: function(){
				_this.cave.attributes.status.play_result = df.QUEST_RESULT_FAIL;
				_this.caveMgr.gameEnd()
				views.system_debug.view.close();
			},
			quest_giveup: function(){
				_this.cave.attributes.status.play_result = df.QUEST_RESULT_GIVEUP;
				_this.caveMgr.gameEnd()
				views.system_debug.view.close();
			},
			floor_next: function(){
				_this.cave.attributes.status.play_result = df.QUEST_RESULT_DEFAULT;
				_this.caveMgr.gameNext()
			},
			floor_prev: function(){
				_this.cave.attributes.status.play_result = df.QUEST_RESULT_DEFAULT;
				_this.caveMgr.gameNext("",-1)
			},
			floor_remake: function(){
				_this.cave.attributes.status.play_result = df.QUEST_RESULT_DEFAULT;
				_this.caveMgr.gameNext("",0)
				views.system_debug.view.close();
			},
			debug_battle: function(){
				var item_options = "";
				for(var i in st.CardSeedData){
					var seed = st.CardSeedData[i];
					var card = st.CardData[seed.card_id];
					item_options += '<option value="'+i+'">'+i+":"+card.name+'</option>'
				}
				var level_options = "";
				for(var i=1;i<101;i++){
					if(i==_this.cave.attributes.difficulty){
						level_options += '<option value="'+i+'" selected>'+i+'</option>'
					}else{
						level_options += '<option value="'+i+'">'+i+'</option>'
					}
				}
				
				
				var enemy_html = ''
						+'<hr/>'
						+'<select name="enemy_select_1" class="enemy_select_1" style="margin:8px 0px;">'
						+'	<option value="">敵を選択してください</option>'
						+   item_options
						+'</select><br/>'
						+'<select name="level_select_1" class="level_select_1" style="margin:8px 0px;">'
						+'	<option value="">レベルを選択</option>'
						+   level_options
						+'</select><br/>'
						+'<hr/>'
						+'<select name="enemy_select_2" class="enemy_select_2" style="margin:8px 0px;">'
						+'	<option value="">敵を選択してください</option>'
						+   item_options
						+'</select><br/>'
						+'<select name="level_select_2" class="level_select_2" style="margin:8px 0px;">'
						+'	<option value="">レベルを選択</option>'
						+   level_options
						+'</select><br/>'
						+'<hr/>'
						+'<select name="enemy_select_3" class="enemy_select_3" style="margin:8px 0px;">'
						+'	<option value="">敵を選択してください</option>'
						+   item_options
						+'</select><br/>'
						+'<select name="level_select_3" class="level_select_3" style="margin:8px 0px;">'
						+'	<option value="">レベルを選択</option>'
						+   level_options
						+'</select><br/>'
				
				views.enemy_select = App.popup.message({
					yes:{label:"バトル開始", action:function(){}},
					no:{label:"閉じる"},
					message:'敵を選んでください。<br/>デフォルトのレベルは<br/>　現在のダンジョンの難易度です　<div>'+enemy_html+'</div>'
				},{},{
					events:{
						"ftap .mate_level"     :"mate_level",
						"ftap .mate_individual":"mate_individual",
					},
				})
				views.enemy_select.view.$el.on("ftap",".yes_btn",function(){
					var enemy_1 = $(".enemy_select_1").val();
					var level_1 = $(".level_select_1").val();
					var enemy_2 = $(".enemy_select_2").val();
					var level_2 = $(".level_select_2").val();
					var enemy_3 = $(".enemy_select_3").val();
					var level_3 = $(".level_select_3").val();
					var list = [[enemy_1,level_1],[enemy_2,level_2],[enemy_3,level_3]]
					var valid_list = [];
					for(var i in list){
						if(list[i][0] && list[i][1]){
							valid_list.push(list[i]);
						}
					}
					var data_str = ""
					for(var i in valid_list){
						data_str += (i==0)? valid_list[i].join("_") : "/" + valid_list[i].join("_");
					}
					if(data_str){
						caveview.scratch.enemyEvent(data_str)
						views.enemy_select.view.close();
						views.system_debug.view.close();
					}
				})
				
			},
			
		}).done(function(){ location.reload() }); // end system_debug
	
	},// end showCaveDebugView
	
	
	
	
	
	
	showBattleDebugView : function(battleview){
		
		var _this = this;
		var list = [
			["戦闘速度変更            ","battle_speed"   ],
			["相手のHPを1にする       ","enemy_hp_one"   ],
			["相手のHPを回復する      ","enemy_hp_full"  ],
			["自分のHPを1にする       ","member_hp_one"  ],  
			["自分のHPを回復する      ","member_hp_full" ],
			["戦闘に勝利する          ","force_win" ],
		]
		var html = "";
		_.each(list,function(el){ html += '<a class="btn '+el[1]+'">'+el[0]+'</a><br/>' })
		
		var views = {};
		window.devcon3 = views;
		
		var members = battleview.members;
		var enemys = battleview.enemys;
		var battle = battleview.battle;
		var battleMgr = battleview.battleMgr;
		
		
		views.system_debug = App.popup.confirm({yes:{label:"　リロードする"}, no:{label:"　　閉じる　　"}, message:'<div>'+html+'</div>'},{},{
			events:{
				"ftap .battle_speed"  :"battle_speed",
				"ftap .enemy_hp_one"  :"enemy_hp_one",
				"ftap .enemy_hp_full" :"enemy_hp_full",
				"ftap .member_hp_one" :"member_hp_one",
				"ftap .member_hp_full":"member_hp_full",
				"ftap .force_win"     :"force_win",
			},
			force_win : function(){
				views.system_debug.view.close()
				enemys.each(function(chara){ chara.set("hp",0) })
				battleMgr.nextTurn()
			},
			battle_speed: function(){
				var speed = prompt("戦闘倍速を設定してください",_this.userConfig.attributes.battle_speed);
				if(speed){
					if(!speed.match(/[^0-9.]/)){
						speed = speed.toNumber();
						if(speed){
							_this.userConfig.attributes.battle_speed = speed;
							_this.userConfig.save();
							battleview.battleAnim.jc.mgr.changeFps(15*speed)
						}
					}
				}
			},
			change_hp : function(key,members,is_one){
				members.each(function(chara){
					var hp = (is_one) ? 1 : chara.get("hp_full");
					chara.set("hp",hp)
				})
				battle.set(key,members.toJSON()).save()
				location.reload();
			},
			enemy_hp_one: function(){ this.change_hp("enemys",enemys,true) },
			enemy_hp_full: function(){ this.change_hp("enemys",enemys,false) },
			member_hp_one: function(){ this.change_hp("members",members,true) },
			member_hp_full: function(){ this.change_hp("members",members,false) },
		}).done(function(){ location.reload() }); // end system_debug
	
	},// end showBattleDebugView
	
	
	
	
	
	
}); // end DebugConsole

return DebugConsole;
});





