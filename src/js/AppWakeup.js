(function (){
	
	// RJSONをunpack
	var unpack_time = __.baseTime();
	_.chain(st)
		.keys()
		.filter(function(key){ return key.match(/RJSON/) })
		.each(function(key){
			st[key] = RJSON.unpack(st[key]);
			st[key.replace("RJSON","")] = st[key];
		})
	console.log("AppWakeup#RJSON.unpack_time :" + (__.baseTime() - unpack_time));
	
	// todo 初インストール、versionをチェックし、変わっていたらsetする
	
	// scratch_js
	if(appenv.scratch_js_url && appenv.BUILD_LEVEL < appenv.PRODUCT_BUILD ){
		//ScratchPadWatch 以下を有効にすると、500ミリ秒ごとにdoScratchPadJs()を行う
		//$.ajax({dataType : "script", url: appenv.scratch_js_url + "ScratchPadWatch.js?date=" + __.baseTime(), async: false })
		
		//ScratchPad 画面をタッチした際にdoScratchPadJs()を行う
		//$(document).on(__.info.touchstart,function(){ $.ajax({dataType : "script", url: appenv.scratch_js_url + "ScratchPad.js?date=" + __.baseTime(), async: false }).success(function(){ doScratchPadJs(); }) })
	}
	
	// Bodyを画面サイズにリサイズ
	if(__.info.is_mobile){
		__.adjustView.zoom().position("#device_display","#body");
	}
	
	
	// 要素の選択禁止
	if(__.info.is_main_view && __.info.is_mobile && appenv.BUILD_LEVEL > appenv.DEBUG_BUILD ){ __.disableDomSelect() }
	
	// fasttap準備。clickとa:hoverを乗っ取る
	var disable_webscroll = (appenv.BUILD_LEVEL > appenv.DEBUG_BUILD) ? true : false; // スクロール無効化設定
	var move_event_deley = 50; // fmoveイベントの発行間隔。
	var _clickInfo = $(document).fasttap( move_event_deley, disable_webscroll );
	
	// formへのフォーカス挙動乗っ取り
	var rejectForm = function(e){
		var tag = e.target.tagName;
		if( (tag != "INPUT") && (tag != "TEXTAREA") && (tag != "SELECT") && (tag != "OPTION") && (tag != "BUTTON") ){ e.preventDefault(); }
	}
	$(document).on(__.info.touchstart,"#body",rejectForm);
	$(document).on(__.info.clickevent,"#body",rejectForm);
	
	// 波紋エフェクト
	/*
	var time = 20;
	var jc = new jChrono({fps:time,updateTime:1000/time});
	window.document_jc = jc;
	jc.start();
	var $touch_effect = $("#touch_effect");
	var zoom_value = __.adjustView.zoom_value;
	*/
	$(document).on("ftap",function(e,tap){
		// formへのフォーカス挙動乗っ取り
		$(e.target).focus();
		/*
		jc.animate({
			duration: jc.frameToTime(5),
			target  : $touch_effect,
			easing  : "linear",
			onFrame : function(k,anim){
				k = (k*0.5);
				anim.setStyle(anim.target, { y: tap.startY/zoom_value, x: tap.startX/zoom_value, alpha:0.5-k, scaleX:1+k, scaleY:1+k });
			},
			onFinish: function(k,anim){
				anim.setStyle(anim.target, { x: 350 });
			},
		});
		*/
	});
	
	// ボタンtouchstart時
	$(document).on("fstart","a",function(e){
		App.clickInfo.fstartTarget = this;
		var _this = $(this);
		_this.addClass("hover");
		
		if( _this.data("after_se") != 1 ){
			if( _this.data("se") == undefined ){
				App.sound.se(1)
			}else{
				App.sound.se( _this.data("se") )
			}
		}
		
		setTimeout(function(){ _this.removeClass("hover") },300);
	});
	
	// ボタンtouchend時
	$(document).on("ftap  ", "a",_.debounce(function(){
		App.analyze.trackEvent("","", "Button", "Click", "event only", 1)
		App.clickInfo.ftapTarget = this;
		
		var _this = $(this);
		
		if( _this.data("after_se") == 1 ){
			if( _this.data("se") == undefined ){
				App.sound.se(1)
			}else{
				App.sound.se( _this.data("se") )
			}
		}
		
		if(location.hash.has('/html/Test/') && $(_this).attr("href")){
			location.href = $(_this).attr("href") + location.hash;
		}else if( $(_this).hasClass("trigger_back_key") ){
			App.router.back();
		}else if( !__.isExist($(_this).attr("data-href")) ){
			// hrefがないときは何もしない
		}else if(location.hash.has('/html/Test/') && $(_this).attr("data-href").has('?') ){
			location.href = $(_this).attr("data-href") + location.hash;
		}else if( $(_this).attr("data-href").has('http://') ){
			location.href = $(_this).attr("data-href");
		}else if( $(_this).attr("data-href").has('/html/Test/') ){
			location.href = "?d=" + Number.random(999) + "#" + $(_this).attr("data-href");
		}else{
			location.hash = $(_this).attr("data-href");
		}
	},300,true) );
	
	// グローバル名前空間
	window.App={
		st       :st,
		df       :df,
		data     :{}, //consoleで表示したいデータなどつっこむ
		views    :{},
		anim     :{},
		sound    :{},
		router   :{},
		resume   :{},
		clickInfo:_clickInfo,
		deviceState: {pause:0},
	};
	
	//main view、Routerの準備
	require([
		'models/DebugConsole',
		'models/ResumeREC',
		'models/Sound',
		'models/CaveREC',
		'models/AnalyzeREC',
		'models/UserConfigREC',
		'models/MissionREC',
		'models/Footer',
		'controllers/FooterView',
		'controllers/PopupsView',
		'controllers/Animations',
		'AppRouter',
	],function(
		DebugConsole,
		ResumeREC,
		Sound,
		CaveREC,
		AnalyzeREC,
		UserConfigREC,
		MissionREC,
		Footer,
		FooterView,
		PopupsView,
		Animations,
		AppRouter
	){
		//メニューボタン押下でデバコン
		document.addEventListener("menubutton", function(){
			// todo:デバッグモード、テストユーザーで処理を分ける
			var devcon = new DebugConsole
			devcon.showSystemDebugView();
		}, false);
		
		//Google Analytics
		App.analyze = new AnalyzeREC();
		
		//MainView
		App.views.Display     = Backbone.View.extend({ el:"#main_view" });
		App.views.Main        = Backbone.View.extend({});
		App.views.display     = new App.views.Display();
		App.views.main        = new App.views.Main();
		
		//FooterView
		App.views.footer      = new FooterView.View({model:new FooterView.Model(), el:"#footer_view" });
		App.views.footer.render();
		
		//DevView
		App.views.DevDisplay  = Backbone.View.extend({ el:"#dev_view" });
		App.views.devDisplay  = new App.views.DevDisplay();
		
		//画像Preload
		var preload_images = _.map(preloadImageFiles,function(file){ return __.path.img_ui(file) });
		var loader = __.preload(preload_images);
		
		//indicator
		App.views.Indicator = Backbone.View.extend({
			el:"#indicator_view",
			initialize:function(){ this.state = 0; this.$el.css("display","none")  },
			hide      :function(){ this.state = 0; $("#indicator_view").css("display","none")  },
			show      :function(msg){
				this.state = 1;
				if(msg != undefined){
					$("#indicator_view .indicator_msg").html(msg);
				}else{
					$("#indicator_view .indicator_msg").html("")
				}
				$("#indicator_view").css("display","block");
				var width = $("#indicator_view")[0].clientWidth; //強制リペイントの補助
			},
		});
		App.views.indicator = new App.views.Indicator();
		
		//Sound
		var bgm_list = {1:"bgm_main.mp3"}
		var se_list  = {1:"se_btn_main.mp3"}
		App.sound = new Sound({se_list:se_list,bgm_list:bgm_list});
		App.userConfig = new UserConfigREC;
		document.addEventListener("pause" , function(){ App.deviceState.pause = 1; App.sound.pauseBgm()  } , false);
		document.addEventListener("resume", function(){ App.deviceState.pause = 0; App.sound.resumeBgm() } , false);
		if(__.info.is_phonegap){
			navigator.notification.confirm("音楽を鳴らしますか？",function(button){
				if(button==1) {
					App.userConfig.set("sound",0);
				}else if(button==2) {
					App.userConfig.set("sound",1);
					App.sound.bgm(1);
				}
			},"サウンド設定","いいえ,はい");
		}else{
			if(confirm("音楽を鳴らしますか？")) {
				App.userConfig.set("sound",1);
				App.sound.bgm(1);
			}else{
				App.userConfig.set("sound",0);
			}
		}
		
		//AnimClasses
		App.anim = new Animations();
		
		//AnimClasses
		App.mission = new MissionREC();
		
		//PopupsView
		var popups = new PopupsView();
		App.views.popupsView = new popups.PopupsView({
			el:"#popup_view",
			data:st.DialogMessageData,
			messageTemplate:function(response){ return __.template("dialog/common",response) },
			selectTemplate :function(response){ return __.template("dialog/select",response) },
		});
		App.popup = App.views.popupsView; //Alias
		App.popups = App.popup.collection; //Alias
		
		// ボタン処理
		document.addEventListener("backbutton",function(){ App.router.back() }, false);
		$(document).on("keydown",function(e){
			var KEY_ENTER = 13;
			var KEY_BACK = 8;
			var tag = e.target.tagName;
			
			// フォームなら無視
			if( e.keyCode != KEY_ENTER && (tag == "INPUT") || (tag == "TEXTAREA") || (tag == "SELECT") || (tag == "OPTION") || (tag == "BUTTON") ){
				return;
			}
			// 戻るボタン処理
			if( e.keyCode == KEY_BACK  ){
				e.preventDefault();
				App.router.back();
			}
			// ポップアップが存在するときの決定キー処理
			if( e.keyCode == KEY_ENTER && App.popups.length > 0){
				e.preventDefault();
				// on_enter_keyクラスを持つ要素があればそれを優先する
				var $trigger_enter_key = App.popup.getFrontView().$el.find(".on_enter_key");
				if( $trigger_enter_key.length > 0 ){
					$trigger_enter_key.trigger("ftap");
				}else{
					App.popup.doYesOrYes();
				}
				return
			}
		})
		
		//Resume
		App.resume = new ResumeREC();
		
		//Router起動
		App.router = new AppRouter();
		Backbone.history.start();
		App.router.listenTo(App.router,"route",function(){
			console.log("AppWakeup#App.router dispatch event 'route' [arguments]",arguments);
		})
	});
	
})()


