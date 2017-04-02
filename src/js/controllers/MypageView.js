define([
	"models/PcREC",
	"models/PresentREC",
	"models/UserConfigREC",
	"models/Twitter",
	"controllers/PopupPresentList",
	"controllers/PopupPhraseList",
	"controllers/PopupHowtoList",
	"controllers/PopupUserConfig",
	"controllers/PopupOtherMenu",
	"controllers/PopupMissionDetail",
],function(PcREC,PresentREC,UserConfigREC,Twitter,PopupPresentList,PopupPhraseList,PopupHowtoList,PopupUserConfig,PopupOtherMenu,PopupMissionDetail){
	
	var MapView = Backbone.View.extend({
		el:"#map_view",
		events:{
			"ftap .back_to_mypage":"backToMypage",
		},
		backToMypage:function(){
			this.trigger("backToMypage");
		}
	});
	
	var InfoView = Backbone.View.extend({
		el:"#info_view",
		events:{
			"ftap .goto_map"    :"gotoMap",
			"ftap .chara_change":"charaChange",
			"ftap .information ":"information",
			"ftap .present     ":"present",
			"ftap .how_to      ":"howTo",
			"ftap .phrase_dict ":"phraseDict",
			"ftap .config      ":"config",
			"ftap .goto_title  ":"gotoTitle",
			"ftap .other_menu  ":"otherMenu",
			"ftap .mission     ":"missionDetail",
		},
		initialize:function(){
			this.pc = new PcREC;
			this.userConfig = new UserConfigREC;
		},
		missionDetail: function(e){ PopupMissionDetail.show($(e.currentTarget).data("mission_id"), this); },
		information: function(){
			// twitterの情報をiframe経由、ガジェット経由、$.ajax経由などで取得しようとしたがうまくいかない。
			// その他、アプリ外ページにリンクしたいときは_systemの方が便利なので、_systemの方法を採用。
			// また、100ms後にpauseになっていなかったらアプリがインストールされていないと判断し、ブラウザで起動。
			App.deviceState.pause = 0;
			window.open('twitter://user?screen_name=' + appenv.official_twitter,'_system');
			_.delay(function(){
				if(!App.deviceState.pause) window.open('https://twitter.com/' + appenv.official_twitter,'_system');
			},100)
		},
		present      : function(){ PopupPresentList.show(); },
		howTo        : function(){ PopupHowtoList.show();  },
		phraseDict   : function(){ PopupPhraseList.show(); },
		config       : function(){ PopupUserConfig.show(); },
		otherMenu    : function(){ PopupOtherMenu.show(); return; },
		charaChange:function(){
			var $mypage_chara = this.$el.find(".chara")
			var current_chara_type = $mypage_chara.data("chara_type");
			
			if(this.pc.get("chara_type") == 1){
				this.pc.set("chara_type",2).save();
				//$mypage_chara.removeClass("chara_1").addClass("chara_2");
			}else{
				this.pc.set("chara_type",1).save();
				//$mypage_chara.removeClass("chara_2").addClass("chara_1");
			}
			
			App.mission.checkProcess("CHANGE_CHARA");
			this.trigger("changedData");
		},
		gotoMap : function(){
			this.trigger("gotoMap");
			App.mission.checkProcess("SHOW_MAP");
		},
	});
	
	var MypageView = Backbone.View.extend({
		id:"mypage_view",
		tagName:"div",
		events:{},
		initialize:function(){
			this.pc = new PcREC;
			this.presentRec = new PresentREC;
			this.listenTo(this.presentRec,"change_present",this.changePresent);
		},
		changePresent: function(){
			var num = this.presentRec.get("present_list").length;
			var $el = this.infoView.$el.find(".mypage_menu_btn.present .batch");
			if(num){
				$el.show().find("i").html(num);
			}else{
				$el.hide();
			}
		},
		render:function(){
			var mission_list = App.mission.getMissionDataList();
			if( _.find(mission_list, function(data){ return data.type_str == "REVIEW_APP" }) ) App.mission.checkProcess("REVIEW_APP");
			if( _.find(mission_list, function(data){ return data.type_str == "COMP_CARD" })  ) App.mission.checkProcess("COMP_CARD");
			
			var pc = new PcREC;
			var remainTime = new __.RemainTime({ disp:{sec:false} , str:{day:"日",hour:"時間",min:"分"} });
			var mission_list = App.mission.getMissionDataList();
			_.each(mission_list,function(mission){
				var process_type = (App.mission.detailResponseList[mission.type_str])? mission.type_str : "DEFAULT_RESPONSE";
				var response = _.bind(App.mission.detailResponseList[process_type], App.mission)(mission);
				mission.title = __.mustache(mission.title)(response);
				mission.is_clear = (mission.is_clear)?1:0;
				if(mission.guerrilla_end) mission.guerrilla_end_text = remainTime.toText(mission.guerrilla_end);
				if(mission.end) mission.end_text = __.moment(mission.end).format("M/D HH:mm (ddd)");
			})
			
			var response = {
				pc          :  _.cloneDeep(this.pc.attributes),
				chara_type  : pc.get("chara_type"),
				mate_num    : _.size(pc.get("mate_list")),
				mate_max    : pc.get("mate_max"),
				login_count : pc.get("login_count"),
				zukan_num   : _.reduce(pc.get("zukan_flag"),function(sum,flag){ if(flag){sum++}; return sum },0),
				gacha_point : pc.getItem( df.ITEM_GACHA_POINT ),
				game_money  : pc.getItem( df.ITEM_GAME_MONEY ),
				real_money  : pc.getItem( df.ITEM_REAL_MONEY ),
				present_num : this.presentRec.get("present_list").length,
				mission_list: mission_list,
			};
			console.log("MypageView#render [response]",response);
			this.$el.html( __.template("top/mypage",response) )
			return this;
		},
		setupView : function(){
			__.scroller.create("mission_item_container");
			__.scroller.create("mypage_map",{ startX:-110 , scrollX: true,scrollY: false });
			this.infoView = new InfoView();
			this.mapView  = new MapView();
			this.listenTo(this.infoView,"gotoMap",this.gotoMap);
			this.listenTo(this.infoView,"changedData",this.reload);
			this.listenTo(this.mapView,"backToMypage",this.backToMypage);
		},
		reload: function(){
			App.router.navi.Top.mypage();
		},
		backToMypage:function(){
			this.infoView.$el.show();
			this.mapView.$el.find(".back_to_mypage").hide();
		},
		gotoMap : function(){
			this.infoView.$el.hide();
			this.mapView.$el.find(".back_to_mypage").show();
		}
	});
	
	return MypageView;
})

