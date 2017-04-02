(function(window){
'use strict';
	
	Main();
	
	function Main(){
		if( (/index.html/.test(location.href) && !window.device && window.cordova ) || (/index.html/.test(location.href) && window.device && window.device.uuid==null) ){
			document.addEventListener("deviceready",function(){ Main(); }, false);
			return;
		}else{
			Init();
		}
	}
	
	function Init(){
		// 実行速度計測オブジェクト
		var now = function(){ return (new Date()).getTime() };
		window.TimeLogs = { start: now() };
		
		// child_browser用の情報保存その１
		var is_mainview = (/index.html/.test(location.href));
		var is_app      = (!!window.device);
		var device_id   = (is_app) ? window.device.uuid : "browser";
		if( is_mainview) localStorage.device_id = device_id;
		if(!is_mainview) device_id = localStorage.device_id;
		localStorage.save_id = (localStorage.save_id) ? localStorage.save_id : "1";
		
		// テストユーザー判定
		var test_users = [
		]
		var isTestUser = function(device_id) {
			if(!is_app) return true;
			for (var i in test_users) {
				var flag = (test_users[i].id == device_id);
				if (flag) { return flag };
			}
		}
		var is_test_user = isTestUser(device_id);
		
		var app_version = "-";
		if(window.cordova){
			try{
			cordova.getAppVersion.getVersionNumber(function(version){ app_version = version });
			}catch(e){}
		}
		
		// Environment
		// todo : releaseenvとdevenvにデフォルト値を分け、さらにユーザーごとに設定を分け、appenvにセットするようにする
		var base_url = window.location.origin == "https://nabepon.github.io" ? "https://nabepon.github.io/xenosteel-public" : "http://localhost:9000";
		window.appenv = {
			version         : app_version ,
			in_review       : false,
			BUILD_LEVEL     : 1,
			DEBUG_BUILD     : 1,
			PRODUCT_BUILD   : 5,
			RELEASE_BUILD   : 10,
			device_id       : device_id,
			is_test_user    : is_test_user,
			cache_query     : "date="+ ((is_app)? now() : ""),
			release_host    : "xxxx", // 本番用ホスト名
			local_mode_host : "xxxx", // このホストと接続がマッチしたらlocal_image_modeをonにする
			local_image_mode: 0, // 1でローカル画像を使うmodeにする
			
			bug_report_php  : "https://xxxx", 
			save_php        : "https://xxxx", 
			load_php        : "https://xxxx", 
			form_url        : "https://xxxx",
			
			img_base_url    : base_url + "/app/img/", // 画像をどこから読むか。local_image_modeの判定で変わる
			img_server_url  : base_url + "/app/img/", // サーバ上の画像場所。local_image_modeで分けるため存在。
			base_url        : base_url + "/app/", // 各種ソースのベース
			official_twitter: "nabepon_dev",
			twitter_hash_tag: "{hash_tag}", //"#xenosteel",
			src_main        : "src/Main.js",
			src_css         : "src/Style.css",
			src_list        : [ "src/Libs.js", "src/Data.js", "src/App.js" ],
			scratch_js_url  : base_url + "/app/sample/ScratchPad/", // '../program/webview/sample/ScratchPad/ScratchPad.js'をwatch
			connections     : [
				base_url + "/app/"
			],
		}
		
		// デバッグ用の開始画面と関数
		var createDebugTitle = function(){
			console.log("Main#createDebugTitle")
			var html_str = '<style>body{ margin:0px; pading:0px; background-color:#ccc;} input.text{ width:260px; margin-top:10px; } input.btn{ width:50px; }</style>';
			var inputTemplate = function(i,url){ return '<input class="text" type="text" value="' + url + '" id="input_' + i + '"><input class="btn" type="button" onClick="debugGameStart(' + i + ')" value="開始"><br/>' }
			for(var i in appenv.connections) html_str += inputTemplate(i,appenv.connections[i]);
			html_str += '<br/>起動しなくなったら↓<br/> <input class="btn" style="width:100px;" type="button" onClick="deleteStorage()" value="データを消去">'
			document.body.innerHTML = html_str;
		}
		window.deleteStorage = function(){
			if(confirm("データを全て削除しますか？")){
				for(var i in localStorage){
					localStorage.removeItem(i)
				}
				alert("消去しました")
				location.reload();
			}
		}
		window.debugGameStart = function(id,force_url){
			appenv.base_url = document.getElementById("input_" + id).value;
			var appinfo = JSON.parse(localStorage.appinfo);
			appinfo.appenv = appenv;
			localStorage.appinfo = JSON.stringify(appinfo);
			gameStart();
		}
		
		// ゲーム開始
		var gameStart = function(change_base_url){
			console.log("Main#gameStart",arguments);
			document.body.innerHTML = ''
				+'<div id="device_display">'
				+'	<div id="body">'
				+'		<div id="main_view"></div>'
				+'		<div id="battle_view"></div>'
				+'		<div id="footer_view"></div>'
				+'		<div id="popup_view"></div>'
				+'		<div id="indicator_view"><i></i><div class="indicator_msg"></div></div>'
				+'	</div>'
				+'</div>'
				+'<div id="dev_view"></div>'
				+'<div id="touch_effect"></div>'
				+'';
			
			var loadJs = function(callback){
				console.log("Main#loadJs",arguments)
				var elems = [];
				var loaded_cnt = 0;
				for(var i=0;i<appenv.src_list.length;i++){
					elems[i]  = document.createElement("script");
					elems[i].src  = appenv.base_url + appenv.src_list[i] + "?" + appenv.cache_query;
					elems[i].type = "text/javascript";
					elems[i].onload = (i < appenv.src_list.length-1) ? function(){
						loaded_cnt++;
						document.head.appendChild(elems[loaded_cnt]);
					} : callback ;
				}
				document.head.appendChild(elems[0]);
			};
			
			var loadCss = function(){
				console.log("Main#loadCss",arguments)
				// ローカル画像を使う場合、cssもローカルにしないとcss内のpathがサーバーにってしまう点に対応
				if(appenv.base_url.search(appenv.local_mode_host) != -1 ){ appenv.local_image_mode = 1;}
				if(appenv.local_image_mode){
					appenv.img_base_url = "../img/";
					var css_load_start = now();
					var style_css_str = $.ajax({ url: appenv.base_url + appenv.src_css + "?" + appenv.cache_query, async: false }).responseText;
					var $style_el = $('<style id="style_css"></style>');
					$style_el.html(style_css_str);
					$('head').append($style_el);
					console.log("Main#loadCss time_log_start:" + (now() - css_load_start) );
				}else{
					var src_url = appenv.base_url + appenv.src_css + "?" + appenv.cache_query;
					$('head').append('<link href="' + src_url + '" type="text/css" rel="stylesheet">')
				}
			}
			
			loadJs(function(){
				TimeLogs.js = now();
				console.log("Main#loadJs time_log_start:" + (TimeLogs.js - TimeLogs.start) );
				loadCss();
			});
		};
		
		
		var Run = function(){
			// デバコン用のテストユーザー情報保存
			if( appenv.BUILD_LEVEL < appenv.RELEASE_BUILD ){ appenv.test_users = test_users }
			
			// 基本情報のlocalStorage保存。およびchild_browser用の情報受け渡し
			if( is_mainview && !location.hash ){
				localStorage.appinfo = JSON.stringify({
					device     : (function(){ var ret={},data=window.device;    for(var i in data){ if(typeof data[i] == "number" || typeof data[i] == "string" ){ ret[i] = data[i] } }; return ret; })(),
					navigator  : (function(){ var ret={},data=window.navigator; for(var i in data){ if(typeof data[i] == "number" || typeof data[i] == "string" ){ ret[i] = data[i] } }; return ret; })(),
					appenv     : window.appenv
				});
			}else{
				window.appinfo = JSON.parse(localStorage.appinfo);
				window.appenv = window.appinfo.appenv;
			}
			
			// ゲーム開始
			( is_mainview && !location.hash && appenv.BUILD_LEVEL < appenv.RELEASE_BUILD ) ? createDebugTitle() : gameStart() ;
		};
		
		Run();
	}
	
})(window)