define([
	"models/PcREC",
	"models/DeckREC",
	"models/CaveREC",
	"models/CaveMapREC",
	"models/ResumeREC",
	"models/LoginREC",
	
	"controllers/SamplePc",
	"controllers/SampleQuestData",
	"controllers/MypageView",
	"controllers/GachaIndexView",
	
	"controllers/CardIndexView",
	"controllers/CardDeckMemberSelectView",
	"controllers/CardSellSelectView",
	"controllers/CardMixSelectView",
	"controllers/CardPowerupSelectView",
	"controllers/CardLimitupSelectView",
	"controllers/CardFavSelectView",
	"controllers/CardBookView",
	
	"controllers/CaveView",
	"controllers/CaveResultView",
	"controllers/QuestSelectAreaView",
	"controllers/QuestSelectCaveView",
	
	"controllers/ShopArbeitView",
	"controllers/ShopIndexView",
	"controllers/ShopPackunView",
	"controllers/ShopRealMoneyView",
	"controllers/ShopRecoverView",
	"controllers/ShopArbelt_BugReportsView",
""],function(
	PcREC,
	DeckREC,
	CaveREC,
	CaveMapREC,
	ResumeREC,
	LoginREC,
	
	SamplePc,
	SampleQuestData,
	MypageView,
	GachaIndexView,
	
	CardIndexView,
	CardDeckMemberSelectView,
	CardSellSelectView,
	CardMixSelectView,
	CardPowerupSelectView,
	CardLimitupSelectView,
	CardFavSelectView,
	CardBookView,
	
	CaveView,
	CaveResultView,
	QuestSelectAreaView,
	QuestSelectCaveView,
	
	ShopArbeitView,
	ShopIndexView,
	ShopPackunView,
	ShopRealMoneyView,
	ShopRecoverView,
	ShopArbelt_BugReportsView
){

var Router = Backbone.Router.extend({
	
	constructor:function(){
		if(!Router.instance){
			Router.instance = this;
			Backbone.Router.apply(Router.instance,arguments);
		}
		return Router.instance;
	},
	initialize:function(){
		this.resume      = new ResumeREC();
		App.data.deckRec = new DeckREC();
		App.data.pcRec   = new PcREC();
		this.historyList = [];
		this.historyPos  = 0;
		Backbone.history.on('route', function() { this.setHistory(); }, this);
	},
	clearHistory: function(keep_current){
		var hash = Backbone.history.getHash();
		this.historyList = (hash && keep_current)? [hash] : [];
		this.historyPos = this.historyList.length;
	},
	isAvailableHistory: function(){
		var hash = Backbone.history.getHash();
		var ret = (
			hash.match("html/Cave/") ||
			hash.match("html/Card/limitupSelect")
		);
		if(ret) console.log( "Router#isAvailableHistory: unset history" );
		return !ret;
	},
	isAvailableBack: function(){
		var hash = Backbone.history.getHash();
		if (!hash) return false;
		var ret =  !hash.match("html/Cave/");
		if(!ret) console.log( "Router#isAvailableBack: disable back" );
		return ret;
	},
	setHistory: function(){
		if( this.isAvailableHistory() ){
			var hash = Backbone.history.getHash();
			this.historyList.push(hash);
			this.historyPos = this.historyList.length;
		}else{
			this.historyList.push(false);
			this.historyPos = this.historyList.length;
		}
	},
	back: function() {
		//indicatorが回っていればbackkeyは無効化する
		if(App.views.indicator.state == 1) return;
		
		// ポップアップがあればそれを優先する
		if(App.popups.length > 0){
			// on_back_keyクラスを持つ要素があればそれを優先する
			var $trigger_back_key = App.popup.getFrontView().$el.find(".on_back_key");
			if( $trigger_back_key.length > 0 ){
				$trigger_back_key.trigger("ftap");
			}else{
				App.popup.doNoOrYes();
			}
			return
		}
		
		// on_back_keyクラス要素があればそれをタップ
		var $btn = $("#main_view .on_back_key");
		if($btn.length > 0 && $btn.css("display") != "none" && $btn.css("visibility") != "hidden"){
			$btn.trigger("ftap");
			return
		}
		
		// 戻り禁止なら戻らない
		if( !this.isAvailableBack() ){ return }
		
		// back可能なpathなら戻る
		var current_hash = Backbone.history.getHash();
		var hash_index = _.findLastIndex(this.historyList,function(data){ return data && data.replace(/^\//,"") != current_hash.replace(/^\//,"") });
		var hash = this.historyList[hash_index];
		if( hash ){
			var param = _.compact( hash.split("/") );
			App.router.navigate(hash, {trigger: false});
			this.historyList = this.historyList.slice(0,hash_index+1);
			this.html(param[0],param[1],param[2])
			console.log("Router#back [hash,this.historyList]",[hash,this.historyList]);
			return
		}
		
		// trigger_back_keyにデフォルトの戻り先が指定されていれば戻る
		var $btn = $("#main_view .trigger_back_key");
		var backDefault = $btn.data("backDefault");
		if($btn.length > 0 && $btn.css("display") != "none" && $btn.css("visibility") != "hidden" && backDefault){
			App.router.navigate(backDefault, {trigger: true});
			return
		}
	},
	routes: {
		"":"index",
		":protocol/:loadFile/:callMethod": "html",
		":protocol/:loadFile/:callMethod/*:query": "html",
	},
	index: function () {
		App.views.main.remove();
		App.views.main = new App.views.Main();
		App.views.footer.model.set("disp",1);
		if( this.checkResume() ){ return } //ゲーム落として復帰したとき
		this.html("html","Top","index")
	},
	html: function (protocol,loadFile,callMethod,queryStr) {
		var _this = this;
		if(callMethod.has('?')){
			queryStr = callMethod.replace(/.*\?/,"?");
			callMethod = callMethod.replace(/\?.*/,"");
		}
		var query = Object.fromQueryString( queryStr );
		var req   = { protocol:protocol , loadFile:loadFile , callMethod:callMethod , query:query };
		
		console.log("Router#html [req]",req);
		
		if(loadFile == "Test"){
			require(["../../../webview/js/tests/Test"],function(Test){
				console.log("Router#html Test [Test.index]",Test.index);
				Test[callMethod](req);
			})
		}else if(protocol == "html"){
			App.views.main.remove();
			App.views.main = new App.views.Main();
			App.views.footer.model.set("disp",1);
			if( this.checkResume(req) ){ return }
			console.time("Router#html " + loadFile+"/"+callMethod)
			this.navi[loadFile][callMethod](req);
			console.timeEnd("Router#html " + loadFile+"/"+callMethod)
		}
	},
	checkLogin:function(req){
		var login = new LoginREC();
		var login_result = login.check();
		console.log("Router#checkLogin [login_result]",login_result);
		if(login_result){
			var anim = new App.anim.LoginBonus({ result: login_result });
			var popup = App.popup.add(anim,{view_class:"loginbonus_anim"});
		}
	},
	checkResume:function(req){
		if(!__.info.is_main_view){ return false } //index.htmlのときのみ有効にする
		
		if(this.resume.get("status") == df.RESUME_VIEW_AREA_SELECT){
			//エリア選択に移動し、ステータスを通常のVIEWにする
			
			console.log("Router#checkResume status == df.RESUME_VIEW_AREA_SELECT");
			this.resume.set("status",df.RESUME_SYSTEM_VIEW)
			this.resume.save();
			this.navi.Quest.selectArea(req);
			return true
		}
		else if(this.resume.get("status") == df.RESUME_CAVE){
			//クエスト中であればクエストを実行。urlの書き換えもついでに行う
			console.log("Router#checkResume status == df.RESUME_CAVE");
			this.navi.Cave.resume();
			this.navigate("/html/Cave/resume");
			return true
		}
		else if(this.resume.get("status") == df.RESUME_CAVE_RESULT){
			//クエスト中であればクエストを実行。urlの書き換えもついでに行う
			console.log("Router#checkResume status == df.RESUME_CAVE_RESULT");
			this.navi.Cave.caveResult();
			this.navigate("/html/Cave/caveResult");
			return true
		}
		else if(this.resume.get("status") == df.RESUME_BATTLE){
			//バトル中であればクエストを実行後、urlの書き換えもついでに行い、そこから戦闘のresume処理を移行する
			console.log("Router#checkResume status == df.RESUME_BATTLE");
			this.navi.Cave.resume();
			this.navigate("/html/Cave/resume");
			return true
		}
		
		console.log("Router#checkResume status == EMPTY");
		return false
	},
	navi : {
		Card : {
			index : function(req){
				App.views.footer.model.set("active",df.FOOTER_CARD   );
				App.views.main = new CardIndexView;
				App.views.display.$el.html( App.views.main.render().el );
				App.views.main.setupView();
			},
			deckMemberSelect : function(req){
				App.views.footer.model.set("active",df.FOOTER_CARD   );
				var cardPage = new CardDeckMemberSelectView;
				App.views.main = new cardPage.SelectView({},{request:req});
				App.views.display.$el.html( App.views.main.render().el );
				App.views.main.setupView();
			},
			sellSelect : function(req){
				App.views.footer.model.set("active",df.FOOTER_CARD   );
				var cardPage = new CardSellSelectView;
				App.views.main = new cardPage.SelectView({},{request:req});
				App.views.display.$el.html( App.views.main.render().el );
				App.views.main.setupView();
			},
			mixSelect : function(req){
				App.views.footer.model.set("active",df.FOOTER_CARD   );
				var cardPage = new CardMixSelectView;
				App.views.main = new cardPage.SelectView({},{request:req});
				App.views.display.$el.html( App.views.main.render().el );
				App.views.main.setupView();
			},
			powerupSelect : function(req){
				App.views.footer.model.set("active",df.FOOTER_CARD   );
				var cardPage = new CardPowerupSelectView;
				App.views.main = new cardPage.SelectView({},{request:req});
				App.views.display.$el.html( App.views.main.render().el );
				App.views.main.setupView();
			},
			limitupSelect : function(req){
				App.views.footer.model.set("active",df.FOOTER_CARD   );
				var cardPage = new CardLimitupSelectView;
				App.views.main = new cardPage.SelectView({},{request:req});
				App.views.display.$el.html( App.views.main.render().el );
				App.views.main.setupView();
			},
			favSelect : function(req){
				App.views.footer.model.set("active",df.FOOTER_CARD   );
				var cardPage = new CardFavSelectView;
				App.views.main = new cardPage.SelectView({},{request:req});
				App.views.display.$el.html( App.views.main.render().el );
				App.views.main.setupView();
			},
			book : function(req){
				App.views.footer.model.set("active",df.FOOTER_CARD   );
				App.views.main = new CardBookView();
				App.views.display.$el.html( App.views.main.render().el );
				App.views.main.setupView();
				App.mission.checkProcess("SHOW_BOOK");
			},
		},
		Gacha : {
			index : function(req){
				App.views.footer.model.set("active",df.FOOTER_GACHA  );
				App.views.main = new GachaIndexView.page();
				App.views.display.$el.html( App.views.main.render(req).el );
				__.scroller.create("gacha_index_list");
			},
		},
		Sample : {
			index : function(req){
				App.views.main.$el.html( __.template("sample/index",App) );
				App.views.display.$el.html( App.views.main.el );
			},
			pc : function(req){
				App.views.main = new SamplePc;
				App.views.devDisplay.$el.html( App.views.main.render(req).el );
			},
			questdata : function(req){
				var sampleQuestData = new SampleQuestData;
				//App.views.main.$el.html("");
				App.views.devDisplay.$el.html( sampleQuestData.render().el );
			},
			localstorage : function(req){
				App.views.main.$el.html( __.template("sample/localStorage",App) );
				App.views.devDisplay.$el.html( App.views.main.el );
			},
		},
		
		Top : {
			index : function(req){
				App.views.footer.model.set("active",df.FOOTER_MYPAGE );
				App.views.main.$el.html( __.template("top/index",App) );
				App.views.display.$el.html( App.views.main.el );
			},
			mypage : function(req){
				App.router.checkLogin();
				App.views.footer.model.set("active",df.FOOTER_MYPAGE );
				App.views.main = new MypageView;
				App.views.display.$el.html( App.views.main.render(req).el );
				App.views.main.setupView(req);
				// Todo : debug_modeじゃないときは消すようにする
				App.views.devDisplay.$el.html( __.template("sample/index",App) );
			},
			login : function(req){
				App.views.footer.model.set("active",df.FOOTER_MYPAGE );
				var pc = new PcREC;
				var tomorrow_str  = __.moment().add('days',1).format("YYYY-MM-DD");
				var tomorrow_line = __.moment(tomorrow_str).add('hour',4).format();
				pc.set("next_login_bonus_time", Date.parse(tomorrow_line) );
				
				// todo ボーナスアイテム追加処理
				pc.set("login_count", pc.get("login_count") + 1 );
				pc.save();
				
				console.debug("#ログイン " + pc.get("login_count") + "回目です");
				//alert("ログイン " + pc.get("login_count") + "回目です");
				this.index();
			},
		},
		Quest : {
			selectArea : function(req){
				App.views.footer.model.set("active",df.FOOTER_DUNGEON);
				App.views.main = new QuestSelectAreaView;
				App.views.display.$el.html( App.views.main.render(req).el );
				App.views.main.setupView(req);
			},
			selectCave : function(req){
				App.views.footer.model.set("active",df.FOOTER_DUNGEON);
				App.views.main = new QuestSelectCaveView;
				App.views.display.$el.html( App.views.main.render(req).el );
				App.views.main.setupView(req);
			},
		},
		Cave : {
			caveResult : function(req){
				if( App.router.resume.get("status") != df.RESUME_CAVE_RESULT ){
					App.router.navigate("html/Quest/selectArea", {trigger: false});
					App.router.navi.Quest.selectArea();
					return
				}
				
				App.views.footer.model.set("disp",0);
				App.views.footer.model.set("active",-1);
				App.views.main = new CaveResultView;
				App.views.display.$el.html( App.views.main.render(req).el );
				App.views.main.setupView(req);
			},
			start : function(req){
				App.views.footer.model.set("disp",0);
				App.views.footer.model.set("active",-1);
				App.views.main = new CaveView;
				App.views.display.$el.html( App.views.main.startQuest(req).render(req).el );
				App.views.main.setupView(req);
			},
			resume : function(req){
				if( App.router.resume.get("status") != df.RESUME_CAVE && 
				    App.router.resume.get("status") != df.RESUME_CAVE_RESULT && 
				    App.router.resume.get("status") != df.RESUME_CAVE_EVENT && 
				    App.router.resume.get("status") != df.RESUME_BATTLE && 
				    App.router.resume.get("status") != df.RESUME_BATTLE_EVENT && 
				    App.router.resume.get("status") != df.RESUME_BATTLE_RESULT  ){
					App.router.navigate("html/Quest/selectArea", {trigger: false});
					App.router.navi.Quest.selectArea();
					return
				}
				
				App.views.footer.model.set("disp",0);
				App.views.footer.model.set("active",-1);
				App.views.main = new CaveView;
				App.views.display.$el.html( App.views.main.resumeQuest(req).render(req).el );
				App.views.main.setupView(req);
			},
		},
		Shop : {
			arbeit : function(req){
				App.views.footer.model.set("active",df.FOOTER_SHOP);
				App.views.main = new ShopArbeitView;
				App.views.display.$el.html( App.views.main.render(req).el );
				App.views.main.setupView(req);
				App.mission.checkProcess("SHOW_ARBEIT");
			},
			index : function(req){
				App.views.footer.model.set("active",df.FOOTER_SHOP);
				App.views.main = new ShopIndexView;
				App.views.display.$el.html( App.views.main.render(req).el );
				App.views.main.setupView(req);
			},
			packun : function(req){
				App.views.footer.model.set("active",df.FOOTER_SHOP);
				App.views.main = new ShopPackunView;
				App.views.display.$el.html( App.views.main.render(req).el );
				App.views.main.setupView(req);
			},
			realMoney : function(req){
				App.views.footer.model.set("active",df.FOOTER_SHOP);
				App.views.main = new ShopRealMoneyView;
				App.views.display.$el.html( App.views.main.render(req).el );
				App.views.main.setupView(req);
				App.mission.checkProcess("SHOW_REAL_MONEY_SHOP");
			},
			recover : function(req){
				App.views.footer.model.set("active",df.FOOTER_SHOP);
				App.views.main = new ShopRecoverView;
				App.views.display.$el.html( App.views.main.render(req).el );
				App.views.main.setupView(req);
			},
			
			bugReports : function(req){
				App.views.footer.model.set("active",df.FOOTER_SHOP);
				App.views.footer.model.set("disp",0);
				App.views.main = new ShopArbelt_BugReportsView;
				App.views.display.$el.html( App.views.main.render(req).el );
				App.views.main.setupView(req);
			},
		},
	}
});

return Router;
})