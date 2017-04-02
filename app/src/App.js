(function(window){
 var undefined = void 0; 


/*!
 * AppUtil.js
 * @author watanabe
 * プロジェクトごとのPlugin、Utility集
 * jQuwry, lo-Dash(underscore.js), moment.js, sugar.jsに依存
 */
 
 
/**
 * 名前空間
 * projectごとに設定してもいい
 * ----------------------------------------------------
 */
window.AppUtil = {};
window.__ = AppUtil;

(function(){

// local name space
// ----------------------------------------------------
	var __ = AppUtil;
	__.info = new DeviceInfo("/html/index.html");
	
// baseTime
// ----------------------------------------------------
	
	/**
	 * systemTime
	 * Date.nowを使うために分ける
	 */
	__.systemTime = Date.now;
	
	/**
	 * baseTime
	 * 現在時刻にoffset timeをプラスした時刻を取得する
	 */
	__.baseTime = function(){
		var base_time_ofs = localStorage.getItem("base_time_ofs");
		var now = (new Date).getTime();
		if(base_time_ofs != null){
			now += parseInt(base_time_ofs,10);
		};
		return now;
	};
	
	/**
	 * setBaseTime
	 * baseTimeのオフセット時刻を設定する
	 * __.setBaseTime("2013/7/23 00:55:00");
	 */
	__.setBaseTime = function(date_str){
		var ofs = moment(date_str).valueOf() - moment().valueOf();
		localStorage.setItem("base_time_ofs", ofs);
		return ofs;
	};
	
	/**
	 * setBaseTime
	 * baseTimeのオフセット時刻を設定する
	 * __.setBaseTime("2013/7/23 00:55:00");
	 */
	moment.lang('ja', {
		months: '1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月'.split('_'),
		monthsShort: '1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月'.split('_'),
		weekdays: '日曜日_月曜日_火曜日_水曜日_木曜日_金曜日_土曜日'.split('_'),
		weekdaysShort: '日_月_火_水_木_金_土'.split('_'),
		weekdaysMin: '日_月_火_水_木_金_土'.split('_'),
		longDateFormat: {LT: 'Ah時m分',LTS: 'LTs秒',L: 'YYYY/MM/DD',LL: 'YYYY年M月D日',LLL: 'YYYY年M月D日LT',LLLL: 'YYYY年M月D日LT dddd'},
		meridiemParse: /午前|午後/i,
		isPM: function(input) { return input === '午後'; },
		meridiem: function(hour, minute, isLower) { if (hour < 12) { return '午前'; } else { return '午後'; } },
		calendar: { sameDay: '[今日] LT', nextDay: '[明日] LT', nextWeek: '[来週]dddd LT', lastDay: '[昨日] LT', lastWeek: '[前週]dddd LT', sameElse: 'L' },
		relativeTime: { future: '%s後', past: '%s前', s: '数秒', m: '1分', mm: '%d分', h: '1時間', hh: '%d時間', d: '1日', dd: '%d日', M: '1ヶ月', MM: '%dヶ月', y: '1年', yy: '%d年' }
	})
	__.moment = function(val){
		return (val === undefined) ? moment(__.baseTime()) : moment(val) ;
	};
	__.moment.utc = function(val){
		return (val === undefined) ? moment.utc(__.baseTime()) : moment.utc(val) ;
	}
	
	/**
	 * NTP時刻取得
	 * __.adjust(bool,function(error){})
	 * __.adjust(true)で非同期取得、__.adjust()、__.adjust(false)で同期取得
	 * 2つ目の引数には失敗したときの処理を書く。引数にエラー内容が渡される。
	 */
	__.adjust = function adjust(async,fn){
		return //debug中は使わない
		
		if( !_.isFunction(fn) ){ fn = function(){} };
		if( async !== true ){ async = false };
		var config = { url: "http://ntp-b1.nict.go.jp/cgi-bin/json" , dataType: "text", async: async };
		try{
			var res = $.ajax(config).responseText;
			__.setBaseTime( JSON.parse( res ).st*1000 )
		}catch(e){
			console.error("Util#adjust error [e]",e);
			fn.call(__,e);
		}
	};
	
	//falseで一時間以上たってたら取得しなおす仕組みをいれる。
	
	
// Logger
// ----------------------------------------------------
	
	/**
	 * sugar.jsのメソッドを使えなくする
	 * _.escape(html)、_.unescape(html)を使う
	 */
	//String.prototype.escapeHTML   = void 0; 
	//String.prototype.unescapeHTML = void 0;
	
	
	//乗っ取るため、オリジナルを退避させる
	__.console = console;
	
	//consoleを乗っ取る
	//console = {};
	
	//logger
	__.logger = new function(){
		var _this = this;
		
		//呼び出すたびに間隔時間を返すlog
		this.log_count = 0;
		this.log_time = __.baseTime();
		this.log = function(){
			var time_diff = ( __.baseTime()-_this.log_time < 1000 )? __.baseTime()-_this.log_time : "---" ;
			var log_text = "log"+ _this.log_count +" "+ time_diff +"ms";
			_this.log_count++
			_this.log_time = __.baseTime();
			
			if(__.info.is_phonegap){
				var args = _.chain(arguments).toArray().filter(function(arg){ return typeof arg=="string" || typeof arg=="object" || typeof arg=="number" }).values()
				var args_text = ""
				try{ args_text = JSON.stringify(args); }catch(e){}
				__.console.log(log_text, args_text )
			}else{
				__.console.log(log_text, arguments )
			}
		}
		
		//開始たぐから終了タグまでの時間を計測するlog
		this.store = {};
		this.logTime = function(key){
			_this.store[key] = __.baseTime();
		}
		this.logTimeEnd = function(key){
			if(_this.store[key]==undefined){ return }
			var time = (__.baseTime() - _this.store[key]);
			var message = "TimeLog: " + time + "ms" + " :" + key;
			var warn_time =(__.info.is_phonegap)?100:50;
			
			(time>warn_time)? __.console.warn(message) : __.console.log(message) ;
		}
		
	}()
	
	// 存在しないメソッドにオリジナルLogを入れる
	var consoles = "assert,clear,constructor,count,debug,dir,dirxml,error,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,table,time,timeEnd,timeStamp,timeline,timelineEnd,trace,warn".split(",")
	_.each(consoles,function(cons){ if(!console[cons]) console[cons] = __.logger.log; })
	console.time    = __.logger.logTime;
	console.timeEnd = __.logger.logTimeEnd;
	
	// DUBEGじゃなければlogを出さない
	if(appenv.BUILD_LEVEL > appenv.DEBUG_BUILD){
		for(var i in console) console[i] = function(){};
	}
	
	
// Util
// ----------------------------------------------------
	
	/**
	 * isExist
	 * falsyなときはfalseを返す
	 */
	__.isExist = function(val,true_vals){
		
		//[],{}ならfalse
		if (typeof val == "object"){
			var cnt=0;
			for(var i in val){
				if(cnt>0){ break };
				cnt++;
			}
			return (cnt>0)? true : false ;
		};
		
		//以下の条件ならfalse
		var check_vals = ["",undefined,"undefined",null,"null",false,"false",0,"0"];
		
		//true_valsにマッチしたらtrue
		if(true_vals != undefined){
			for(var i in true_vals){
				if( val === true_vals[i] ) return true;
			};
		};
		
		//check_valsにマッチしたらfalse
		for(var i in check_vals){
			if( check_vals[i] === val) return false;
		};
		
		//チェックを全て通ったらtrue
		return true;
	};
	
	/**
	 * adujstView
	 * 画面のzoom、要素の縦位置を調整する
	 */
	__.adjustView = new function(){
		var _this = this;
		this.zoomValue=function(){
			var is_zoom = 0;
			var zoom_value = 1;
			var base_ratio = 480/320;
			var client_height = $(window).height();
			var client_width  = $(window).width(); //window.outerWidth/window.devicePixelRatio;
			var client_ratio  = client_height/client_width;
			console.log("Util#adjustView.zoomValue [client_width]" + client_width);
			
			if( base_ratio <= client_ratio ){ zoom_value = client_width/320;  }
			if( base_ratio >  client_ratio ){ zoom_value = client_height/480; }
			zoom_value = client_width/320;
			
			return zoom_value;
		};
		this.zoom_value=1;
		this.zoom=function(){
			_this.zoom_value=_this.zoomValue();
			$("body").css("zoom",_this.zoom_value);
			console.log("Util#adjustView.zoom [zoom_value]" + _this.zoom_value);
			//$("body").css("-webkit-transform","scale3d("+_this.zoom_value+","+_this.zoom_value+",0)");
			//$("body").css("-webkit-transform-origin","left top");
			return _this;
		};
		this.position=function(device_display,contents_body){
			//端末のサイズに合わせる要素を指定する
			$(device_display).css("height",window.innerHeight/_this.zoom_value + "px");
			//縦位置を調整する要素を指定する
			if($(contents_body).data("adust_position") != 0){
				$(contents_body).css("top",((window.innerHeight/_this.zoom_value)-480)/2 + "px")
				                .css("left",((window.innerWidth/_this.zoom_value)-320)/2 + "px");
			}
			return _this
		};
	}()
	 
	 
	/**
	 * compareAttrType
	 * デフォルトとセーブ時の型が同じかチェックする
	 */
	__.compareAttrType = function(defaults,attrs,length_match){
		if(length_match === undefined || length_match === true){
			var diff = _.difference( _.keys(attrs) , _.keys(defaults) );
			if(diff.length>0){
				console.error("Util#compareAttrType [diff,defaults,attrs]", [diff,defaults,attrs]);
				return "length is not match";
			}
		};
		for(var i in defaults){
			if( _.isNaN(defaults[i]) || _.isNaN(attrs[i]) ){
				console.log("Util#compareAttrType " + i +":"+ defaults +":"+ attrs);
				return i + " is NaN";
				
			}else if( _.isNull(defaults[i]) || _.isNull(attrs[i]) ){
				console.log("Util#compareAttrType " + i +":"+ defaults +":"+ attrs);
				return i + " is Null";
				
			}else if( _.isUndefined(defaults[i]) || _.isUndefined(attrs[i]) ){
				console.log("Util#compareAttrType " + i +":"+ defaults +":"+ attrs);
				return i + " is Undefined";
				
			}else if( (_.isArray(attrs[i]) !== _.isArray(defaults[i])) || (typeof attrs[i] !== typeof defaults[i]) ){
				console.log("Util#compareAttrType " + i +":"+ defaults +":"+ attrs);
				return  i + " is different from the type of default";
				
			};
		};
	};
	
	
	/**
	 * exception
	 * 例外処理
	 * Errorオブジェクトを返す
	 */
	__.exception = function(error_code,info_data){
		var error_data = st.DialogData[error_code];
		if(error_data==undefined){ console.error("Util#exception ERR_CODE_NOT_FOUND",err); }
		
		var err = new Error();
		err.text       = error_data.message;
		err.message    = error_code;
		err.info_data  = info_data;
		err.error_data = error_data;
		err.arguments  = arguments;
		
		console.error("Util#exception [error_code,err]", error_code,err);
		return err
	}
	
	
	/**
	 * checkType
	 * typeが違ったらなら例外を投げる
	 * 
	 * 2つの形式で受け付ける;
	 * __.checkType("undefined",[values]);
	 * __.checkType({"undefined":[values],"string":[values]});
	 * 
	 * undefined、null、NaN、finiteはtrueだったときにエラーになり、
	 * それ以外はfalseのときにエラーになる。
	 * 
	 */
	__.checkType = function(check_arg,list){
		
		if(_.isString(check_arg)){
			var obj = {};
			obj[check_arg] = list
		}else{
			var obj = check_arg;
		}
		
		var check_list = list;
		var error_code = "";
		var is_error   = 0;
		var error_type = 0;
		var keys       = _.keys(obj);
		
		for(var i in keys){
			var key = keys[i];
			var fn  = "is" + key.capitalize();
			
			if(key == "undefined" || key == "null" || key == "NaN" || key == "finite" ){
				
				for(var i in obj[key]){
					if( _[fn](obj[key][i]) ){ is_error = 1; error_type = key; check_list = obj[key] }
				}
				
			}else{
				
				for(var i in obj[key]){
					if( !_[fn](obj[key][i]) ){ is_error = 1; error_type = key; check_list = obj[key] }
				}
				
			}
		}
		
		if(is_error){
			if(error_code == undefined){ error_code = "UNDEFINED_VALUES" }
			var error_data = st.DialogData[error_code];
			//if(error_data==undefined){ console.error("Util#checkType ERR_CODE_NOT_FOUND",err); }
			
			var err = new Error();
			//err.text       = error_data.message;
			err.text       = "型エラー : 不正な" + error_type + "があります";
			err.message    = error_code;
			err.info_data  = check_list;
			err.error_data = error_data;
			err.arguments  = arguments;
			
			console.error("Util#checkType [error_code,err]",error_code,err);
			throw err
		}
	}
	
	// __.checkHas(config,["pc",card"])
	__.checkHas = function(obj,check_list){
		var is_error = 0;
		var error_prop = "";
		for(var i in check_list){
			var check_keys = check_list[i].split(".");
			var check_obj = obj;
			var chekc_str = "obj";
			for(var j in check_keys){
				chekc_str += "." + check_keys[j];
				if(_.has(check_obj,check_keys[j])){
					check_obj = check_obj[check_keys[j]]
				}else{
					is_error = 1;
					error_prop = chekc_str;
				}
			}
		}
		
		if(is_error){
			if(typeof error_code == "undefined"){ error_code = "UNDEFINED_VALUES" }
			var error_data = st.DialogData[error_code];
			//if(error_data==undefined){ console.error("Util#checkHas ERR_CODE_NOT_FOUND",err); }
			
			var err = new Error();
			//err.text       = error_data.message;
			err.text       = "プロパティエラー : 指定のプロパティがundefinedです";
			err.message    = error_code;
			err.info_data  = error_prop;
			err.error_data = error_data;
			err.arguments  = arguments;
			
			console.error("Util#checkHas [error_code,err]", error_code,err);
			throw err
		}
	}
	
	/**
	 * template
	 * underscoreのtemplateを使う
	 */
	__.getTemplate = function(file_name){
		return JST[file_name];
	}
	__.template = function(file_name,response){
		console.log("Util#template [file_name,response]", file_name,response);
		return JST[file_name]( (response)?response:"" )
	}
	__.macro = function(name,response){ return __.template("_macro/" + name, response ) }
	__.mustacheSetting = {
		evaluate    : /{\%([\s\S]+?)\%}/g,
		interpolate : /\{\{ ([\s\S]+?) \}\}/g,
		escape      : /\{\{\{([\s\S]+?)\}\}\}/g,
	}
	__.mustache = function(text){ return _.template(text, false, __.mustacheSetting) }
	
	/**
	 * formQuery
	 * formの内容をobjectにして返す
	 */
	__.formQuery = function formQuery(e,is_parse){
		var query = {};
		var query_str = "";
		var elems = $(e.target).closest('form').find("input,select,textarea");
		
		for(var j in elems){
			if( j < elems.length && elems[j].name != "" && elems[j].name != undefined ){
				if( elems[j].type == "checkbox" || elems[j].type == "radio" ){
					if( $(elems[j]).prop('checked') ){
						query_str += "&" + elems[j].name + "=" + elems[j].value;
					}
				}else{
					if(is_parse === false){
						query[elems[j].name] = elems[j].value;
					}else{
						query[elems[j].name] = JSON.parse(elems[j].value);
					}
				}
			}
		}
		
		var checkboxes = Object.fromQueryString(query_str);
		for(var i in checkboxes){ query[i] = checkboxes[i]; }
		
		return query;
	};
	
	
	/**
	 * doTest
	 * jasmineのtestを実行する
	 */
	__.doTest = function(){
		
		var jasmineEnv = jasmine.getEnv();
		jasmineEnv.updateInterval = 1000;
		
		var htmlReporter = new jasmine.HtmlReporter();
		
		jasmineEnv.addReporter(htmlReporter);
		
		jasmineEnv.specFilter = function(spec) {
			return htmlReporter.specFilter(spec);
		};
		
		var currentWindowOnload = window.onload;
		
		window.onload = function() {
			if (currentWindowOnload) {
				currentWindowOnload();
			}
			execJasmine();
		};
		
		function execJasmine() {
			jasmineEnv.execute();
		}
		
	};
	
	
	/**
	 * doBeautify
	 * beautify.jsを実行する
	 */
	__.doBeautify = function(source) {
		var tabsize = 4;
		var tabchar = ' ';
		if (tabsize == 1) {
			tabchar = '\t';
		}
		if (source && source.charAt(0) === '<') {
			source = style_html(source, tabsize, tabchar, 80);
		} else {
			source = js_beautify(source, tabsize, tabchar);
		}
		return source;
	};
	
	
	/**
	 * scroller
	 * iScrollの要素を格納、管理するオブジェクト
	 * 
	 * scroller.create
	 * scroller.switchCcreate
	 * 
	 * switchCcreateScrollerは、アンドロイドだった場合
	 * スクロールの仕組みを切り替えて、createScroller（）をする
	 * {{ macro.switchScrollStructure() }}とセットで使用
	 */
	__.scroller = new function(){
		var _this = this
		this.id = {};
		this.refresh = function(option){
			var config = {
				toTop : false,
				time  : 0,
			};
			if(option != undefined){
				for(var i in option){
					config[i] = option[i];
				}
			}
			console.log("Util#scroller.refresh [config]",config);
			for(var i in _this.id){
				_this.id[i].refresh();
				if( _this.id[i].options.refreshTop || config.toTop ){
					_this.id[i].scrollTo(0,0,config.time);
				};
			}
		}
		this.adjust = function($wrapper,config){
			if(config.fitZoom){
				var zoom_value = __.adjustView.zoom_value;
				var $scroller  = $wrapper.find("> .scroller");
				var $scaller   = $scroller.find("> .scaller");
				if(config.hZoom){ $scroller.css({"height":$scroller.height()*zoom_value}) };
				if($scroller.width()>320){ $scroller.css({"width":$scroller.width()*zoom_value}) };
				$wrapper.css({"zoom":1/zoom_value, "height":$wrapper.height()*zoom_value, "width":$wrapper.width()*zoom_value});
				$scaller.css("zoom",zoom_value);
			}
		}
		this.create = function createScroller(id,option){
			
			if ( __.isExist(document.getElementById(id)) ){
				
				var ua = window.navigator.userAgent;
				var canTransform = false;
				if(ua.search(/AppleWebKit\/534\.30/) == -1 ){
					var canTransform = true;
				}else{
					var canTransform = false;
				}
				var forms = $("#" + id + " form");
				
				var config = {
					scrollbarClass: 'scrollbar',
					desktopCompatibility:true,
					zoom:false,
					fitZoom:false,
					vZoom:true,
					hZoom:true,
					refreshTop:false,
					hScrollbar:false,
					vScrollbar:false,
					scrollbars: false,
					hideScrollbar:false,
					HWCompositing: (forms.length == 0 && canTransform)? true : false,
					useTransform: (forms.length == 0 && canTransform)? true : false,
					//useTransition:true,
					useTransition:false,
					//bounceLock: true, //scrollerよりwrapperが大きいとき、スクロールさせない
					onBeforeScrollStart: function(e) {
						var target = e.target;
						while (target.nodeType != 1) target = target.parentNode;
						if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA')
							e.preventDefault();
					}
				};
				if(__.isExist(option)){
					for(var i in option){
						config[i] = option[i];
					}
				}
				if(config.scrollbars) config.scrollbars = 'custom';
				
				var $wrapper = $("#"+id);
				$wrapper.wrapInner('<div class="scroller"><div class="scaller"></div></div>');
				this.adjust($wrapper,config);
				var new_scroll = new IScroll("#" + id, config);
				_this.id[id] = new_scroll;
			}
		}
		this.switchCreate = function(id,config){
			if(__.info.is_android){
				if ( __.isExist(document.getElementById(id)) ){
					var css = document.createElement("link");
					css.setAttribute("rel","stylesheet");
					css.setAttribute("type","text/css");
					css.setAttribute("href","../css/switch_scroll_structure.css");
					document.getElementsByTagName("head")[0].appendChild(css);
				}
			}else{
				_this.create(id,config);
			}
		}
	}()
	
	/**
	* preload
	* preloadjsのラッパー
	*/
	__.preload = function(load_list,complete){
		//if(typeof complete == "function") complete();
		//return
		var loader =  new createjs.LoadQueue(false);
		loader.setMaxConnections(4);
		if(typeof complete == "function") loader.addEventListener("complete", complete);
		loader.loadManifest(load_list);
		return loader
	}
	
	/**
	* checkStringByte,countString,restrictString
	* 半角を1文字、全角を2文字として文字数制限をする
	* 
	* restrictInputLength
	* 実際の入力時に制限をする
	*/
	__.checkStringByte = function(c){
		// Shift_JIS: 0x0 ～ 0x80, 0xa0  , 0xa1   ～ 0xdf  , 0xfd   ～ 0xff
		// Unicode  : 0x0 ～ 0x80, 0xf8f0, 0xff61 ～ 0xff9f, 0xf8f1 ～ 0xf8f3
		if ( (c >= 0x0 && c < 0x81) || (c == 0xf8f0) || (c >= 0xff61 && c < 0xffa0) || (c >= 0xf8f1 && c < 0xf8f4)) {
			return 1;
		}else{
			return 2;
		}
	};
	
	__.countString = function(strSrc){
		var cnt = 0;
		for (var i = 0; i < strSrc.length; i++) {
			cnt += __.checkStringByte( strSrc.charCodeAt(i) );
		}
		return cnt;
	};
	
	__.restrictString = function(strSrc,max_num){
		var cnt = 0;
		var restrict_str = "";
		for (var i = 0; i < strSrc.length; i++) {
			if(cnt < max_num){
				cnt += __.checkStringByte( strSrc.charCodeAt(i) );
				restrict_str += strSrc[i];
			}else{
				break
			}
		}
		return restrict_str;
	};
	
	__.restrictInputLength = function(target_id,max_length){
		
		var target_obj = $(target_id);
		
		target_obj.bind("keydown",restrict);
		target_obj.bind("blur",restrict);
		
		function restrict(){
			var strLength = __.countString( target_obj.val() );
			console.log("Util#restrictInputLength [strLength]", strLength);
			if(strLength >= max_length - 1){
				var restrictStr = __.restrictString( target_obj.val() , max_length );
				target_obj.val( restrictStr );
			}
		}
	};
	
	
	/**
	 * toggleHtml
	 * 要素をtoggle表示
	 * toggleHtml.elem([ $(class1),$(class2),$(class3) ])
	 * toggleHtml.toggle();
	 */
	__.toggleHtml = {
		elem : {},
		current : 0,
		toggle : function(){
			for(var i in elems){
				if(this.current == i){
					elems[i].show();
				}else{
					elems[i].hide();
				}
			}
			
			__.scroller.refresh();
			
			if( elems.length - 1 <= this.current ){
				this.current = 0;
			}else{
				this.current++;
			}
		},
	};
	
	
	/**
	 * CountdownTimer
	 * カウントダウン
	 * 11day 00:00:00 → 00:00 の形式で変化
	 * <div id="CDT"></div>
	 * 
	 * var limit = __.baseTime() + 1000000000;
	 * var timer = new CountdownTimer('CDT',limit,'00:00');
	 * timer.countDown();
	 */
	
	__.CountdownTimer = function(elm,limit,message,callback){
		this.initialize.apply(this,arguments);
	};
	__.CountdownTimer.prototype={
		initialize:function(elm,limit,message,callback) {
			this.elem = document.getElementById(elm);
			this.limit = limit;
			this.message = message;
		},
		countDown:function(){
			var timer = '';
			var today = __.baseTime();
			var day   = Math.floor( (this.limit-today)/(24*60*60*1000));
			var hour  = Math.floor(((this.limit-today)%(24*60*60*1000))/(60*60*1000));
			var min   = Math.floor(((this.limit-today)%(24*60*60*1000))/(60*1000))%60;
			var sec   = Math.floor(((this.limit-today)%(24*60*60*1000))/1000)%60%60;
			var milli = Math.floor(((this.limit-today)%(24*60*60*1000))/10)%100;
			var _this = this ;
				
			if( ( this.limit - today ) > 1000 ){
				if (day) timer += '<span class="day">'+day+'day </span>';
				if (hour) timer += '<span class="hour">'+this.addZero(hour)+':</span>';
				timer += '<span class="min">'+this.addZero(min)+':</span><span class="sec">'+this.addZero(sec)+'</span>';
				this.elem.innerHTML = timer;
				setTimeout( function(){_this.countDown();},1000 );
			}else{
				this.elem.innerHTML = this.message;
				return;
			}
		},
		addZero:function(num){ return ('0'+num).slice(-2); }
	};
	
	/**
	 * RemainTime
	 * 残り時間表示
	 * var remainTime = new __.RemainTime({ disp:{hour:false,sec:false} , str:{min:"分"} });
	 * remainTime.toText( limit_date_time )
	 */
	__.RemainTime = function(config){
		var default_config = {
			str :{ day:"日 ", hour:":"  , min:":"  , sec:""   , milli:""    }, //表示フォーマット
			disp:{ day:true , hour:true , min:true , sec:true , milli:false }, //フルタイムのとき表示するかどうか
			hide:{ day:true , hour:false, min:false, sec:false, milli:false }, //0を切ったとき、非表示にするかどうか
			zero:{ day:false, hour:false, min:true , sec:true , milli:true  }, //1ケタになったとき、0をつけるかどうか
		}
		if(config !== undefined){
			for(var i in config){
				for(var j in config[i]){
					default_config[i][j] = config[i][j];
				}
			}
		}
		this.config = default_config;
	}
	__.RemainTime.prototype.toText = function(limit_date){
		var addZero    = function(num){ return ('0'+num).slice(-2); }
		var time_str   = '';
		var remain     = limit_date - __.baseTime();
		    remain     = Math.floor( (remain<0)?0:remain ); // おまじない
		var set        ={};
		    set.day    = 24*60*60*1000;
		    set.hour   = 60*60*1000;
		    set.min    = 60*1000;
		    set.sec    = 1000;
		    set.milli  = 10;
		var cnt        ={};
		    cnt.day    = Math.floor(  remain / set.day );
		    cnt.hour   = Math.floor(( remain % set.day ) / set.hour );
		    cnt.min    = Math.floor(( remain % set.day ) / set.min  )%60;
		    cnt.sec    = Math.floor(( remain % set.day ) / set.sec  )%60%60;
		    cnt.milli  = Math.floor(( remain % set.day ) / set.milli)%100;
		var times      ={};
		    times.day  = Math.floor( remain / set.day  );
		    times.hour = Math.floor( remain / set.hour );
		    times.min  = Math.floor( remain / set.min  )%60;
		    times.sec  = Math.floor( remain / set.sec  )%60%60;
		    times.milli= Math.floor( remain / set.milli)%100;
		var str        ={day:"",hour:"",min:"",sec:"",milli:""};
		var ret        = "";
		
		for(var i in str){
			if( this.config.zero[i]               ){ str[i] = addZero(cnt[i]); }else{ str[i] = cnt[i]; }
			if(!this.config.disp[i]               ){ this.config.str[i] = str[i] = "";         }
			if( this.config.hide[i] && cnt[i] <= 0){ this.config.str[i] = str[i] = "";         }
			ret += str[i] + "" + this.config.str[i];
		}
		
		return ret;
	};
	
	
	/**
	 * Counter
	 * カウンター
	 */
	
	__.Counter = function(init_num){
		var _this = this;
		this.current = init_num;
		this.inc = function(){
			_this.current += 1;
			return _this.current;
		};
		this.dec = function(){
			_this.current -= 1;
			return _this.current;
		};
	}
	
	/**
	 * excelArrayToJSON
	 * Excelの配列をオブジェクトに変換
	 */
	__.excelArrayToJSON = function(data,keys,is_compact){
		var values_length = data[keys[0]].length;
		var ret = [];
		var ret_compact = [];
		var is_compact = (is_compact == false)? false : true;
		
		for(var i=0;i<values_length;i++){
			ret[i] = {};
			for(var j in keys){
				ret[i][ keys[j] ] = data[ keys[j] ][i];
			}
		}
		if(is_compact){
			for(var i in ret){
				if(ret[i][ keys[0] ]) ret_compact.push(ret[i]);
			}
			return ret_compact;
		}else{
			return ret;
		}
	}
	
	
	/**
	 * helper
	 * Viewのヘルパー関数
	 */
	__.helper = {
		startPage:function(name,class_name){
			return '<section class="page_wrapper " id="' + name + '"><div class="' + name + ' ' + class_name + '">'
		},
		endPage:function(){
			return '</div></section>'
		},
		pageTitle:function(title){
			return '<div class="page_title"><i>'+title+'</i></div>'
		},
		listBg:function(type){
			return '<div class="list_bg"></div>'
		},
		attrText:function(attr){
			if(attr==1){ return "火" }
			if(attr==2){ return "水" }
			if(attr==3){ return "雷" }
			if(attr==4){ return "闇" }
			if(attr==5){ return "光" }
			return ""
		},
		rarityText:function(rarity){
			if(rarity==1){ return "ノーマル" }
			if(rarity==2){ return "レア" }
			if(rarity==3){ return "スーパーレア" }
			if(rarity==4){ return "ウルトラレア" }
			return ""
		},
		rarityShortText:function(rarity){
			if(rarity==1){ return "N" }
			if(rarity==2){ return "R" }
			if(rarity==3){ return "SR" }
			if(rarity==4){ return "UR" }
			return ""
		},
		sample:function(){
			return {}
		},
		toNumClass:function(num){
			if(!_.isNumber(num)){ return }
			var num = num.toString();
			var ret = "";
			for(var i=0;i<num.length;i++){
				console.log("Util#helper.toNumClass [num,i,num[i]]", [num,i,num[i]]);
				ret += '<i class="num'+num[i]+'"></i>';
			}
			return ret;
		},
		countName: function(type,id){
			if(type == df.DATA_TYPE_CARD     ){ return "体" }
			if(type == df.DATA_TYPE_CARD_SEED){ return "体" }
			if(type == df.DATA_TYPE_ITEM     ){ return st.ItemData[id].count_name }
			if(type == df.DATA_TYPE_ITEM_SET ){ return "" }
			if(type == df.DATA_TYPE_PHRASE   ){ return "個" }
			return ""
		},
		itemName: function(type,id,num){
			var name = "";
			if(type == df.DATA_TYPE_CARD     ){ name = st.CardData[id].name; }
			if(type == df.DATA_TYPE_CARD_SEED){ name = st.CardData[ st.CardSeedData[id].card_id ].name; }
			if(type == df.DATA_TYPE_ITEM     ){ name = st.ItemData[id].name; }
			if(type == df.DATA_TYPE_PHRASE   ){ name = "フレーズNo."+id;     }
			name += " " + num + __.helper.countName(type,id);
			return name;
		},
	};
	
	
	/**
	 * path
	 * pathオブジェクト
	 */
	__.path = {
		card:function(size,id){
			return appenv.img_base_url + 'card/'+size+'/'+id+'.png';
		},
		world_map_icon:function(id){
			return appenv.img_base_url + 'world_map_icon/'+id+'.png';
		},
		img_ui:function(path){
			path = (path)?path:"";
			return appenv.img_base_url + 'ui/' + path;
		},
		img:function(path){
			path = (path)?path:"";
			return appenv.img_base_url + path;
		},
	};
	
	/**
	 * disableDomSelect
	 * 選択禁止化する
	 */
	__.disableDomSelect = function(){
		document.body.onselectstart = function(){ return false };
		document.body.onmousedown   = function(){ return false };
		document.body.onkeydown     = function(){ return false };
		document.body.oncontextmenu = function(){ return false };
		var style = document.createElement('style');
		style.innerHTML = ''
		+'body{'
		+'	user-select:none;'
		+'	-webkit-user-select:none;'
		+'	-webkit-touch-callout:none;'
		+'}'
		+'body input{'
		+'	user-select: auto;'
		+'	-webkit-user-select: auto;'
		+'}'
		+'';
		document.head.appendChild(style);
	};
	
// phonegap
// ----------------------------------------------------
	__.childWindowEvent = function(data){
		if(data.type == "loadstart"){
			/*
			* phonegapのInAppBrowserのloadstartイベントの挙動を設定する
			* data : {
			*   type   :"loadstart", // イベント名
			*   window :to.twitterWindow, // windowオブジェクト
			*   handler:to.twitterWindowLocationChange, // イベントが発火したとき実行する関数
			*   done   :function(){ to.twitterWindow.close(); }, // handlerの中でDeferredオブジェクトをresolv()したときの関数
			* }
			*/
			if(__.info.is_phonegap){
				var $check = new $.Deferred();
				var exit = function(e){ data.exit(e) };
				data.window.addEventListener("loadstart",function(e){ data.handler(e,$check); });
				if( _.has(data,"exit") ){
					data.window.addEventListener("exit",exit);
				}
				$check.done(function(){
					data.window.removeEventListener("exit",exit);
					data.done(arguments);
					data.window.close()
				});
				$check.fail(function(){
					data.window.removeEventListener("exit",exit);
					data.fail(arguments);
					data.window.close()
				});
			}else{
				var $check = new $.Deferred();
				var check_loc = data.window.location.href;
				var checkLocation = setInterval(function(){
					if(!_.has(data.window.location,"href")){
						if( _.has(data,"exit") ){
							data.exit();
						}
						clearInterval(checkLocation);
						return
					}
					if(check_loc != data.window.location.href){
						data.handler({type:"intervalCheck",url:data.window.location.href},$check);
					}
					check_loc = data.window.location.href;
				},10);
				$check.done(function(){
					clearInterval(checkLocation);
					data.window.close()
					data.done(arguments);
				});
				$check.fail(function(){
					clearInterval(checkLocation);
					data.window.close()
					data.fail(arguments);
				});
			}
		}
	}
	
	__.receiptToJSON = function(str){
		var data = str.decodeBase64().replace(/" = "/g,'" : "').replace(/";/g,'",'); //'
		data = eval("(" + data + ")");
		data["purchase-info"] = eval("(" + data["purchase-info"].decodeBase64().replace(/" = "/g,'" : "').replace(/";/g,'",') + ")"); //'
		return data;
	}
	
	// windowsオブジェクトに展開されたグローバル変数のキーを取り出す
	__.windowDiffKyes = function(){
		var keys = "top,window,location,external,chrome,document,i,localStorage,sessionStorage,applicationCache,speechSynthesis,webkitStorageInfo,indexedDB,webkitIndexedDB,crypto,CSS,performance,console,devicePixelRatio,styleMedia,parent,opener,frames,self,defaultstatus,defaultStatus,status,name,length,closed,pageYOffset,pageXOffset,scrollY,scrollX,screenTop,screenLeft,screenY,screenX,innerWidth,innerHeight,outerWidth,outerHeight,offscreenBuffering,frameElement,clientInformation,navigator,toolbar,statusbar,scrollbars,personalbar,menubar,locationbar,history,screen,postMessage,close,blur,focus,onautocompleteerror,onautocomplete,ondeviceorientation,ondevicemotion,onunload,onstorage,onpopstate,onpageshow,onpagehide,ononline,onoffline,onmessage,onlanguagechange,onhashchange,onbeforeunload,onwaiting,onvolumechange,ontoggle,ontimeupdate,onsuspend,onsubmit,onstalled,onshow,onselect,onseeking,onseeked,onscroll,onresize,onreset,onratechange,onprogress,onplaying,onplay,onpause,onmousewheel,onmouseup,onmouseover,onmouseout,onmousemove,onmouseleave,onmouseenter,onmousedown,onloadstart,onloadedmetadata,onloadeddata,onload,onkeyup,onkeypress,onkeydown,oninvalid,oninput,onfocus,onerror,onended,onemptied,ondurationchange,ondrop,ondragstart,ondragover,ondragleave,ondragenter,ondragend,ondrag,ondblclick,oncuechange,oncontextmenu,onclose,onclick,onchange,oncanplaythrough,oncanplay,oncancel,onblur,onabort,onwheel,onwebkittransitionend,onwebkitanimationstart,onwebkitanimationiteration,onwebkitanimationend,ontransitionend,onsearch,getSelection,print,stop,open,alert,confirm,prompt,find,scrollBy,scrollTo,scroll,moveBy,moveTo,resizeBy,resizeTo,matchMedia,getComputedStyle,getMatchedCSSRules,requestAnimationFrame,cancelAnimationFrame,webkitRequestAnimationFrame,webkitCancelAnimationFrame,webkitCancelRequestAnimationFrame,captureEvents,releaseEvents,btoa,atob,setTimeout,clearTimeout,setInterval,clearInterval,TEMPORARY,PERSISTENT,webkitRequestFileSystem,webkitResolveLocalFileSystemURL,openDatabase,addEventListener,removeEventListener,dispatchEvent,".split(",")
		var new_keys = (function(){ ret=[]; for(i in window){ ret.push(i) }; return ret})()
		return _.difference(new_keys,keys)
	}
	
	// セーブデータをオブジェクトにパースする
	//jsonをファイル比較するときは__.toJSONを使う。console.log( __.toJSON( __.parseSaveJson(json) ) )
	__.parseSaveJson = function(json){
		json.data.storage = JSON.parse(json.data.storage);
		for(var i in json.data.storage){
			if(/^\"/.test(json.data.storage[i]) || /^\{/.test(json.data.storage[i]) || /^\[/.test(json.data.storage[i]) ){ //"
				json.data.storage[i] = JSON.parse(json.data.storage[i]);
			}
		}
		console.log("Util#parseSaveJson [json]",json);
		return json
	}
	
	/**
	 * toJSON
	 * json文字列にする。js_beautifyがあれば整形する。
	 */
	__.toJSON = function(context){
		try{
			if( typeof js_beautify === "undefined" ){
				return JSON.stringify(context);
			}else{
				return __.doBeautify(JSON.stringify(context));
			}
		}catch(e){
			console.log("Util#toJSON");
			console.error(context,e);
		}
	}
	
	__.connection = new function(){
		this.check = function(){
			if(!__.info.is_phonegap){ return false }
			if( navigator.connection.type == Connection.UNKNOWN || navigator.connection.type == Connection.NONE){
				return true
			}
			return false
		}
		this.alert = function(){
			App.popup.message({message: "通信できませんでした<br/>通信環境のいい場所でご利用ください"})
		}
	}();
	
})();

/*!
 * Debug.js
 * @author watanabe
 *
 * Debug用の画面描画、ツールを担当する
 * 
 */
 
/*-------------------------------------------------*/
// プロパティ設定
/*-------------------------------------------------*/
var debug_all_disable   = false; //trueですべてのデバッグ機能をOFF
var cssRefresh_touch    = false;  
var print_console_log   = true;  
var copy_local_path_btn = true;  
var print_onload_time   = true;  
var hide_address_bar    = false; 
var local_file_path     = "E:\\hobby\\xeno\\program\\webview\\js\\templates\\"; 

//呼び出し

document.addEventListener("DOMContentLoaded", debug, false);

function debug(){
	
	//loadCssRefresh();
	
	//if( !('ontouchstart' in window) ){
	if( !(__.info.is_mobile) ){
		//loadPhantomLimb();
		//loadHoevrlinks();
		printData()
		//printDebugText();
		//createCopyScript();
		//window.addEventListener('load', copyLocalPathBtn, false)
	}
	
	hideAddressBar();
}


/*-------------------------------------------------*/
// printData
/*-------------------------------------------------*/
function printData(){
	
	//console.clear(); //前のlogを消す
	
	var window_obj = ["$","ArrayBuffer","ArrayBufferView","Attr","Audio","AudioProcessingEvent","AutocompleteErrorEvent","Backbone","BeforeLoadEvent","Blob","CDATASection","COMPILE_MODE","CSSCharsetRule","CSSFontFaceRule","CSSHostRule","CSSImportRule","CSSMediaRule","CSSPageRule","CSSPrimitiveValue","CSSRule","CSSRuleList","CSSStyleDeclaration","CSSStyleRule","CSSStyleSheet","CSSValue","CSSValueList","CanvasGradient","CanvasPattern","CanvasRenderingContext2D","CharacterData","ClientRect","ClientRectList","Clipboard","CloseEvent","Comment","CompositionEvent","Console","Counter","CustomEvent","DEBUG_MODE","DOMException","DOMImplementation","DOMParser","DOMSettableTokenList","DOMStringList","DOMStringMap","DOMTokenList","DataView","DateRange","DeviceOrientationEvent","Document","DocumentFragment","DocumentType","Element","Entity","EntityReference","ErrorEvent","Event","EventException","EventSource","File","FileError","FileList","FileReader","Float32Array","Float64Array","FocusEvent","FormData","HTMLAllCollection","HTMLAnchorElement","HTMLAppletElement","HTMLAreaElement","HTMLAudioElement","HTMLBRElement","HTMLBaseElement","HTMLBaseFontElement","HTMLBodyElement","HTMLButtonElement","HTMLCanvasElement","HTMLCollection","HTMLContentElement","HTMLDListElement","HTMLDataListElement","HTMLDirectoryElement","HTMLDivElement","HTMLDocument","HTMLElement","HTMLEmbedElement","HTMLFieldSetElement","HTMLFontElement","HTMLFormControlsCollection","HTMLFormElement","HTMLFrameElement","HTMLFrameSetElement","HTMLHRElement","HTMLHeadElement","HTMLHeadingElement","HTMLHtmlElement","HTMLIFrameElement","HTMLImageElement","HTMLInputElement","HTMLKeygenElement","HTMLLIElement","HTMLLabelElement","HTMLLegendElement","HTMLLinkElement","HTMLMapElement","HTMLMarqueeElement","HTMLMediaElement","HTMLMenuElement","HTMLMetaElement","HTMLMeterElement","HTMLModElement","HTMLOListElement","HTMLObjectElement","HTMLOptGroupElement","HTMLOptionElement","HTMLOptionsCollection","HTMLOutputElement","HTMLParagraphElement","HTMLParamElement","HTMLPreElement","HTMLProgressElement","HTMLQuoteElement","HTMLScriptElement","HTMLSelectElement","HTMLShadowElement","HTMLSourceElement","HTMLSpanElement","HTMLStyleElement","HTMLTableCaptionElement","HTMLTableCellElement","HTMLTableColElement","HTMLTableElement","HTMLTableRowElement","HTMLTableSectionElement","HTMLTemplateElement","HTMLTextAreaElement","HTMLTitleElement","HTMLTrackElement","HTMLUListElement","HTMLUnknownElement","HTMLVideoElement","Handlebars","HashChangeEvent","IDBCursor","IDBCursorWithValue","IDBDatabase","IDBFactory","IDBIndex","IDBKeyRange","IDBObjectStore","IDBOpenDBRequest","IDBRequest","IDBTransaction","IDBVersionChangeEvent","IS_ANDROID","IS_IOS4","IS_IOS5","Image","ImageData","Int8Array","Int16Array","Int32Array","Intl","KeyboardEvent","MediaController","MediaError","MediaKeyError","MediaKeyEvent","MediaList","MediaStreamEvent","MessageChannel","MessageEvent","MessagePort","MimeType","MimeTypeArray","MouseEvent","MutationEvent","MutationObserver","NamedNodeMap","Node","NodeFilter","NodeList","Notation","Notification","OfflineAudioCompletionEvent","Option","OverflowEvent","PERSISTENT","PageTransitionEvent","PhoneGap","Plugin","PluginArray","PopStateEvent","ProcessingInstruction","ProgressEvent","RGBColor","RTCIceCandidate","RTCSessionDescription","Range","RangeException","Rect","SQLException","SVGAElement","SVGAltGlyphDefElement","SVGAltGlyphElement","SVGAltGlyphItemElement","SVGAngle","SVGAnimateColorElement","SVGAnimateElement","SVGAnimateMotionElement","SVGAnimateTransformElement","SVGAnimatedAngle","SVGAnimatedBoolean","SVGAnimatedEnumeration","SVGAnimatedInteger","SVGAnimatedLength","SVGAnimatedLengthList","SVGAnimatedNumber","SVGAnimatedNumberList","SVGAnimatedPreserveAspectRatio","SVGAnimatedRect","SVGAnimatedString","SVGAnimatedTransformList","SVGCircleElement","SVGClipPathElement","SVGColor","SVGComponentTransferFunctionElement","SVGCursorElement","SVGDefsElement","SVGDescElement","SVGDocument","SVGElement","SVGElementInstance","SVGElementInstanceList","SVGEllipseElement","SVGException","SVGFEBlendElement","SVGFEColorMatrixElement","SVGFEComponentTransferElement","SVGFECompositeElement","SVGFEConvolveMatrixElement","SVGFEDiffuseLightingElement","SVGFEDisplacementMapElement","SVGFEDistantLightElement","SVGFEDropShadowElement","SVGFEFloodElement","SVGFEFuncAElement","SVGFEFuncBElement","SVGFEFuncGElement","SVGFEFuncRElement","SVGFEGaussianBlurElement","SVGFEImageElement","SVGFEMergeElement","SVGFEMergeNodeElement","SVGFEMorphologyElement","SVGFEOffsetElement","SVGFEPointLightElement","SVGFESpecularLightingElement","SVGFESpotLightElement","SVGFETileElement","SVGFETurbulenceElement","SVGFilterElement","SVGFontElement","SVGFontFaceElement","SVGFontFaceFormatElement","SVGFontFaceNameElement","SVGFontFaceSrcElement","SVGFontFaceUriElement","SVGForeignObjectElement","SVGGElement","SVGGlyphElement","SVGGlyphRefElement","SVGGradientElement","SVGHKernElement","SVGImageElement","SVGLength","SVGLengthList","SVGLineElement","SVGLinearGradientElement","SVGMPathElement","SVGMarkerElement","SVGMaskElement","SVGMatrix","SVGMetadataElement","SVGMissingGlyphElement","SVGNumber","SVGNumberList","SVGPaint","SVGPathElement","SVGPathSeg","SVGPathSegArcAbs","SVGPathSegArcRel","SVGPathSegClosePath","SVGPathSegCurvetoCubicAbs","SVGPathSegCurvetoCubicRel","SVGPathSegCurvetoCubicSmoothAbs","SVGPathSegCurvetoCubicSmoothRel","SVGPathSegCurvetoQuadraticAbs","SVGPathSegCurvetoQuadraticRel","SVGPathSegCurvetoQuadraticSmoothAbs","SVGPathSegCurvetoQuadraticSmoothRel","SVGPathSegLinetoAbs","SVGPathSegLinetoHorizontalAbs","SVGPathSegLinetoHorizontalRel","SVGPathSegLinetoRel","SVGPathSegLinetoVerticalAbs","SVGPathSegLinetoVerticalRel","SVGPathSegList","SVGPathSegMovetoAbs","SVGPathSegMovetoRel","SVGPatternElement","SVGPoint","SVGPointList","SVGPolygonElement","SVGPolylineElement","SVGPreserveAspectRatio","SVGRadialGradientElement","SVGRect","SVGRectElement","SVGRenderingIntent","SVGSVGElement","SVGScriptElement","SVGSetElement","SVGStopElement","SVGStringList","SVGStyleElement","SVGSwitchElement","SVGSymbolElement","SVGTRefElement","SVGTSpanElement","SVGTextContentElement","SVGTextElement","SVGTextPathElement","SVGTextPositioningElement","SVGTitleElement","SVGTransform","SVGTransformList","SVGUnitTypes","SVGUseElement","SVGVKernElement","SVGViewElement","SVGViewSpec","SVGZoomAndPan","SVGZoomEvent","Selection","SharedWorker","SpeechInputEvent","Storage","StorageEvent","StyleSheet","StyleSheetList","TEMPORARY","Text","TextEvent","TextMetrics","TextTrack","TextTrackCue","TextTrackCueList","TextTrackList","TimeRanges","TrackEvent","TransitionEvent","UIEvent","URL","Uint8Array","Uint8ClampedArray","Uint16Array","Uint32Array","WebGLActiveInfo","WebGLBuffer","WebGLContextEvent","WebGLFramebuffer","WebGLProgram","WebGLRenderbuffer","WebGLRenderingContext","WebGLShader","WebGLShaderPrecisionFormat","WebGLTexture","WebGLUniformLocation","WebKitAnimationEvent","WebKitCSSFilterRule","WebKitCSSFilterValue","WebKitCSSKeyframeRule","WebKitCSSKeyframesRule","WebKitCSSMatrix","WebKitCSSMixFunctionValue","WebKitCSSTransformValue","WebKitMediaSource","WebKitMutationObserver","WebKitPoint","WebKitShadowRoot","WebKitSourceBuffer","WebKitSourceBufferList","WebKitTransitionEvent","WebSocket","WheelEvent","Window","Worker","XMLDocument","XMLHttpRequest","XMLHttpRequestException","XMLHttpRequestProgressEvent","XMLHttpRequestUpload","XMLSerializer","XPathEvaluator","XPathException","XPathResult","XSLTProcessor","_","addDebugText","addEventListener","alert","applicationCache","atob","blur","btoa","callCssRefresh","cancelAnimationFrame","captureEvents","chrome","clearInterval","clearTimeout","clientInformation","close","closed","confirm","console","copyLocalPathBtn","copy_local_path_btn","cordova","createCopyScript","crypto","cssRefresh_touch","debug","debug_all_disable","debug_copy_file_name","debug_start_time","debug_text","debug_time_text","defaultStatus","defaultstatus","devicePixelRatio","dispatchEvent","document","event","external","find","focus","frameElement","frames","getComputedStyle","getLoadedTime","getMatchedCSSRules","getSelection","global_obj","hideAddressBar","hide_address_bar","history","iScroll","indexedDB","innerHeight","innerWidth","jQuery","length","less","loadCssRefresh","loadHoevrlinks","loadPhantomLimb","localStorage","local_file_path","location","locationbar","matchMedia","menubar","moveBy","moveTo","name","offscreenBuffering","onabort","onbeforeunload","onblur","oncanplay","oncanplaythrough","onchange","onclick","oncontextmenu","ondblclick","ondeviceorientation","ondrag","ondragend","ondragenter","ondragleave","ondragover","ondragstart","ondrop","ondurationchange","onemptied","onended","onerror","onfocus","onhashchange","oninput","oninvalid","onkeydown","onkeypress","onkeyup","onload","onloadeddata","onloadedmetadata","onloadstart","onmessage","onmousedown","onmousemove","onmouseout","onmouseover","onmouseup","onmousewheel","onoffline","ononline","onpagehide","onpageshow","onpause","onplay","onplaying","onpopstate","onprogress","onratechange","onreset","onresize","onscroll","onsearch","onseeked","onseeking","onselect","onstalled","onstorage","onsubmit","onsuspend","ontimeupdate","ontransitionend","onunload","onvolumechange","onwaiting","onwebkitanimationend","onwebkitanimationiteration","onwebkitanimationstart","onwebkittransitionend","open","openDatabase","opener","outerHeight","outerWidth","pageXOffset","pageYOffset","parent","performance","personalbar","postMessage","print","printData","printDebugText","printReadyTime","print_console_log","print_onload_time","prompt","releaseEvents","removeEventListener","requestAnimationFrame","resizeBy","resizeTo","screen","screenLeft","screenTop","screenX","screenY","scroll","scrollBy","scrollTo","scrollX","scrollY","scrollbars","self","sessionStorage","setInterval","setTimeout","showModalDialog","status","statusbar","stop","styleMedia","toolbar","top","v8Intl","webkitAudioContext","webkitAudioPannerNode","webkitCancelAnimationFrame","webkitCancelRequestAnimationFrame","webkitConvertPointFromNodeToPage","webkitConvertPointFromPageToNode","webkitIDBCursor","webkitIDBDatabase","webkitIDBFactory",
	                 "webkitIDBIndex","webkitIDBKeyRange","webkitIDBObjectStore","webkitIDBRequest","webkitIDBTransaction","webkitIndexedDB","webkitMediaStream","webkitNotifications","webkitOfflineAudioContext","webkitRTCPeerConnection","webkitRequestAnimationFrame","webkitRequestFileSystem","webkitResolveLocalFileSystemURL","webkitSpeechGrammar","webkitSpeechGrammarList","webkitSpeechRecognition","webkitSpeechRecognitionError","webkitSpeechRecognitionEvent","webkitStorageInfo","webkitURL","window","__proto__",];
	var sub_obj = ["d","st","df","dp","env","g","res","Controller","Model","View","_macro_list","router","loop"];
	var function_obj = {};
	var global_vals = {};
	
	window_obj = window_obj.concat(sub_obj);
	
	for(var i in window){
		if( ! _.contains(window_obj,i) ){
			if(typeof window[i] == "function"){
				function_obj[i] = window[i];
			}else{
				global_vals[i] = window[i];
			}
		}
	}
	
	console.info("Debug#printData [function_obj,global_vals,d]",[function_obj,global_vals,d]);
}


/*-------------------------------------------------*/
// copyLocalPathBtn
/*-------------------------------------------------*/
// ローカルファイルのパスをクリップボードに
// コピーするボタンを表示する
/*-------------------------------------------------*/
	
	
	function createCopyScript(){
		
		if( copy_local_path_btn == false || debug_all_disable == true ){return}
		
		var scrpt=document.createElement('script');
		scrpt.charset='Shift_JIS';
		scrpt.src='../development/sample/js/copyclipb/swfobject.js';
		document.getElementsByTagName("head")[0].appendChild(scrpt);
		
		var scrpt=document.createElement('script');
		scrpt.charset='utf-8';
		scrpt.src='../development/sample/js/copyclipb/copyclipb.js';
		document.getElementsByTagName("head")[0].appendChild(scrpt);
	}
	
	var debug_copy_file_name = location.hash.replace("#","").replace(/\/.*/,"");
	function copyLocalPathBtn(){
	
		if( copy_local_path_btn == false || debug_all_disable == true ){return}
		
		var copypath=document.createElement('div');
		copypath.setAttribute("style","width:200px;");
		copypath.innerHTML = '<br/><br/><div id="copypath" class="btn">[コピー]</div><br/><br/><br/><br/>';
		
		$("body").append(copypath);
		
		debug_copy_file_name = location.hash.replace("#","").replace(/\//,"_");
		if(debug_copy_file_name == ""){
			debug_copy_file_name = "../index.html";
		}else{
			debug_copy_file_name += ".hbs";
		}
		var filepath =  local_file_path + debug_copy_file_name;
		
		createCopyButton('copypath', filepath);
	}


/*-------------------------------------------------*/
// printOnloadTime
/*-------------------------------------------------*/
// 読み込み時間を表示する
/*-------------------------------------------------*/
	
	var debug_start_time = (new Date()).getTime();
	var debug_text = "";
	var debug_time_text = "";
	
	function getLoadedTime(){
		var end = (new Date()).getTime();
		var diff = end - debug_start_time;
		return diff;
	}
	
	function addDebugText(){
		var debugTag = document.getElementById("debug_text");
		debugTag.innerHTML += debug_text;
	}
	
	
	printReadyTime();
	function printReadyTime() {
		if( print_onload_time == false || debug_all_disable == true ){return}
		
		$(document).ready(function(){
			debug_time_text += "ready(" + getLoadedTime() + "ms) ";
		});
	}
	
	function printDebugText() {
		if( print_onload_time == false || debug_all_disable == true ){return}
		
		debug_time_text +="created(" + getLoadedTime() + "ms) ";
		
		var html = '<div id="debug_text" style="display:inline-block; text-align:right; padding:1px 3px; font-size:12px; position:absolute; top:0; right:0; background:rgba(0,0,0,0.5); color:#fff; z-index:9999;"></div>';
		$("body").append(html);
		var debugTag = document.getElementById("debug_text");
		debugTag.innerHTML = debug_time_text;
		
		window.addEventListener('load',function(){
			debugTag.innerHTML += "onload(" + getLoadedTime() + "ms)" + "<br/>";
			addDebugText();
		}, false)
			
	}

/*-------------------------------------------------*/
// hideAddressBar
/*-------------------------------------------------*/
// 読み込みが終わったら1px移動し、
// アドレスバーを消す
/*-------------------------------------------------*/
	
	function hideAddressBar() {
		if( hide_address_bar == true ){
			setTimeout(function(){window.scrollTo(0,1);},10);
		}
	}
	

/*-------------------------------------------------*/
// phantom-limb
/*-------------------------------------------------*/
	
	function loadPhantomLimb(){
		(function(commit) {
			var scriptTag = document.createElement('script');
			scriptTag.type = 'text/javascript';
			//scriptTag.src = 'https://raw.github.com/brian-c/phantom-limb/' + commit + '/phantom-limb.js';
			scriptTag.src = '../development/sample/js/phantom-limb/phantom-limb.js';
			document.body.appendChild(scriptTag);
		}('v2.0.1'))
	}

/*-------------------------------------------------*/
// hoevrlinks
/*-------------------------------------------------*/
	
	function loadHoevrlinks(){
		var scriptTag = document.createElement('script');
		scriptTag.type = 'text/javascript';
		scriptTag.src = '../development/sample/js/hoevrlinks.js';
		document.body.appendChild(scriptTag);
	}

/*-------------------------------------------------*/
// cssRefresh
/*-------------------------------------------------*/
	
	function loadCssRefresh(){
		var scriptTag = document.createElement('script');
		scriptTag.type = 'text/javascript';
		scriptTag.src = '../development/sample/js/cssrefresh.js';
		document.body.appendChild(scriptTag);
		
	}

/*-------------------------------------------------*/
// call cssRefresh 未使用
/*-------------------------------------------------*/
	
	function callCssRefresh(){
		if( debug_all_disable == true ){return}
		
		if( 'ontouchstart' in window ){
			if(cssRefresh_touch){
				cssRefresh();
			}
		}else{
			cssRefresh();
		}
	}





/*	
 *	CSSrefresh v1.0.1
 *	
 *	Copyright (c) 2012 Fred Heusschen
 *	www.frebsite.nl
 *
 *	Dual licensed under the MIT and GPL licenses.
 *	http://en.wikipedia.org/wiki/MIT_License
 *	http://en.wikipedia.org/wiki/GNU_General_Public_License
 */
/*
(function() {

	var phpjs = {

		array_filter: function( arr, func )
		{
			var retObj = {}; 
			for ( var k in arr )
			{
				if ( func( arr[ k ] ) )
				{
					retObj[ k ] = arr[ k ];
				}
			}
			return retObj;
		},
		filemtime: function( file )
		{
			var headers = this.get_headers( file, 1 );
			return ( headers && headers[ 'Last-Modified' ] && Date.parse( headers[ 'Last-Modified' ] ) / 1000 ) || false;
	    },
	    get_headers: function( url, format )
	    {
			var req = window.ActiveXObject ? new ActiveXObject( 'Microsoft.XMLHTTP' ) : new XMLHttpRequest();
			if ( !req )
			{
				throw new Error('XMLHttpRequest not supported.');
			}

			var tmp, headers, pair, i, j = 0;

			try
			{
				req.open( 'HEAD', url, false );
				req.send( null ); 
				if ( req.readyState < 3 )
				{
					return false;
				}
				tmp = req.getAllResponseHeaders();
				tmp = tmp.split( '\n' );
				tmp = this.array_filter( tmp, function( value )
				{
					return value.toString().substring( 1 ) !== '';
				});
				headers = format ? {} : [];
	
				for ( i in tmp )
				{
					if ( format )
					{
						pair = tmp[ i ].toString().split( ':' );
						headers[ pair.splice( 0, 1 ) ] = pair.join( ':' ).substring( 1 );
					}
					else
					{
						headers[ j++ ] = tmp[ i ];
					}
				}
	
				return headers;
			}
			catch ( err )
			{
				return false;
			}
		}
	};

	var CssRefresh = function() {
		var _this = this;
		_this.reloadFile = function( links ){
			for ( var a = 0, l = links.length; a < l; a++ )
			{
				var link = links[ a ],
					newTime = phpjs.filemtime( _this.getRandom( link.href ) );

				//	has been checked before
				if ( link.last )
				{
					//	has been changed
					if ( link.last != newTime )
					{
						//	reload
						link.elem.setAttribute( 'href', _this.getRandom( link.href ) );
					}
				}

				//	set last time checked
				link.last = newTime;
			}
			setTimeout( function()
			{
				_this.reloadFile( links );
			}, 400 );
		};

		_this.getHref = function( f )
		{
			return f.getAttribute( 'href' ).split( '?' )[ 0 ];
		};
		_this.getRandom = function( f )
		{
			return f + '?x=' + Math.random();
		};


		var files = document.getElementsByTagName( 'link' ),
			links = [];

		for ( var a = 0, l = files.length; a < l; a++ )
		{			
			var elem = files[ a ],
				rel = elem.rel;
			if ( typeof rel != 'string' || rel.length == 0 || rel == 'stylesheet' )
			{
				links.push({
					'elem' : elem,
					'href' : _this.getHref( elem ),
					'last' : false
				});
			}
		}
		_this.reloadFile( links );
	};
	
	var cssRefresh = new CssRefresh();

})();
*/

function testData(){
	
	//QuestListDataとCaveScratchDataMinのデータ一致チェック
		var questListData = _.reduce(st.QuestListData,function(result,data,id){
			var floor_data_num = 0;
			for(var i=0;i<data.floor.length;i++){
				result.push(id + (i).pad(3))
				if(data.floor[i] >= data.floor_max){
					break
				}
			}
			return result
			console.debug("Debug#testData questListData.reduce [arguments]", arguments);
		},[])
		questListData = _.map(questListData,function(id){ return (id).toNumber() })
		
		var caveScratchDataMin = _.keys(st.CaveScratchDataMin)
		caveScratchDataMin = _.map(caveScratchDataMin,function(id){
			return (id).toNumber();
		})
		
		var checkData = _.difference(questListData, caveScratchDataMin);
		
		if(checkData.length>0){
			console.error("Debug#testData QuestListDataとcaveScratchDataMinのデータが一致しません ⇒" + checkData.join(","))
		}
	
}
testData();




(function(window){ 
 
 var undefined = void 0; 
define('models/Mate',[],function(){
	
	/**
	 * 仲間モンスター関連のクラス
	 * @class Mate
	 */
	var Mate = Backbone.Model.extend({
		defaults    : function(){ return this.defaultAttr() },
		defaultAttr : function(){
			return {
				id  : 1,
				atk : 1,
				def : 1,
				mag : 1,
				exp : 0,
				fav : 0,
				hp  : 0,
				lvl : 1,
				hp_full : 0,
				hp_per  : 0,
				hp_time : 1375300160213,
				lim_lvl     : 0,  // 上げたlimの数
				lim_lvl_max : 20, // 上げられるlimの最大
				total_exp   : 0,
				card_id     : 1,
				individual  : [0,0,0,0],
				skill : [ this.defaultSkillAttr() ],
				date  : 0,
			}
		},
		getHosei: function(){
			return [0,1,2,3,4];
		},
		// 現在レベル取得。限界突破分も含む。
		getLevel: function(mate_data){
			return mate_data.lvl;
		},
		// 最大レベル取得。限界突破分も含む。
		getMaxLevel: function(mate_data){
			return st.CardData[mate_data.card_id].lvl_max + mate_data.lim_lvl;
		},
		// 最大レベルに到達しているか判定。限界突破を含む。
		isMaxLevel: function(mate_data){
			return ( this.getLevel(mate_data) >= this.getMaxLevel(mate_data) );
		},
		// 限界突破の限界かどうか判定。
		isMaxLimit: function(mate_data){
			return ( mate_data.lvl >= st.CardData[mate_data.card_id].lvl_max + mate_data.lim_lvl_max );
		},
		// レベル限界に達しているか判定。
		isLimitLevel: function(mate_data){
			return ( this.isMaxLevel(mate_data) && this.isMaxLimit(mate_data) );
		},
		
		/**
		 * 仲間モンスターデータの生成。createMatesから呼び出される。
		 * @memberof Mate
		 * @function createMate
		 * @param card_id {int}
		 * @param [config] {object} 生成に必要な初期値オプション。初期レベル設定など。
		 */
		createMate : function(card_seed_id,config){
			if(!_(st.CardSeedData).has(card_seed_id)){ throw "card_seed_id " + card_seed_id + " is not defined" }
			var ret =  this.defaultAttr();
			var seed = st.CardSeedData[card_seed_id];
			var data_attr = {
				lim_lvl_max  :st.CardData[seed.card_id].lim_lvl_max,
				card_seed_id :card_seed_id,
				card_id      :seed.card_id,
				individual   :[0,0,0,0],
				skill        :[10101011,10101011],
				date         :__.baseTime(),
			};
			
			// 固体値
			for(var i in seed.individual){
				data_attr.individual[i] = (seed.individual[i] >= 0) ? seed.individual[i] : _.random(0,100) ;
			}
			
			// スキル
			var skill_ids          = _.compact(seed.skill);
			var skill_index        = _.random(0,skill_ids.length-1);
			data_attr.skill[0]     = skill_ids[skill_index];
			skill_ids[skill_index] = 0;
			var skill_ids          = _.compact(skill_ids);
			var skill_index        = _.random(0,skill_ids.length-1);
			data_attr.skill[1]     = skill_ids[skill_index];
			data_attr.skill.sort(function(a,b){ return a-b });
			
			// data_attr、configを順に上書き
			_.extend(ret,data_attr,config);
			ret.date = __.baseTime() + ret.id;
			
			ret = this.getStatusFromLvl(ret,ret.lvl);
			
			return ret;
		},
		/**
		 * 仲間モンスターデータの生成
		 * @memberof Mate
		 * @function createMates
		 * @param card_id {int}
		 * @param [config] {object} 生成に必要な初期値オプション。初期レベル設定など。
		 */
		createMates : function(pc,card_seed){
			// card_idは101、[101,102]、{card_id:101,...}、[{card_id:101,...},{card_id:102,...}]の4つの形で受け付ける
			// [{mate},{mate},{mate},...]の形で返す
			// この時点ではPcRECに追加されないが、idは振られる
			// new_flagを持ったものを得たい場合は、mapNewFlag()を使う
			
			//error
			__.checkType({undefined:[pc,card_seed]})
			if( !_.isArray(card_seed) ){ card_seed = [card_seed]; }
			
			//createMate()でlist作成
			var new_mate_list = {};
			for(var i in card_seed){
				if(_.isObject(card_seed[i])){
					var card_data = card_seed[i];
					card_data.id = i.toNumber() + 1;
					new_mate_list[ card_data.id ] = this.createMate(card_data.card_seed_id,card_data);
				}else{
					var card_seed_id = card_seed[i];
					new_mate_list[ i.toNumber() + 1 ] = this.createMate(card_seed_id, {id:i.toNumber() + 1} );
				}
			}
			
			
			//id振り
			var largest_mate_id = 0;
			var desc_id_list = _(pc.attributes.mate_list).sortBy(function(a) { return a.id*-1 ; }).value();
			if(!_.isEmpty(desc_id_list)){ largest_mate_id = desc_id_list[0].id; };
			new_mate_list = _(new_mate_list).reduce(function(result,new_mate,n){
				new_mate.id = largest_mate_id + n.toNumber();
				result[new_mate.id] = new_mate;
				return result;
			},{});
			
			console.log("Mate#createMates [new_mate_list]",new_mate_list);
			return new_mate_list;
		},
		/**
		 * 仲間モンスターデータ（表示用）の生成
		 * @memberof Mate
		 * @function addMateStatus
		 */
		makeMateStatus:function(mate_data){
			var add_data = {
				hp                 : 0,
				hp_per             : 0,
				hp_text            : "全快",
				power              : 0,
				lvl                : this.getLevel(mate_data),
				lvl_without_lim    : mate_data.lvl,
				max_lvl            : this.getMaxLevel(mate_data),
				max_lvl_without_lim: st.CardData[mate_data.card_id].lvl_max,
				is_max_level       : this.isMaxLevel(mate_data),
				is_max_limit       : this.isMaxLimit(mate_data),
				is_limit_level     : this.isLimitLevel(mate_data),
				next_need_exp      : 0,
				next_exp           : 0,
				exp_per            : 0,
				contain_deck       : 0,
				skill_data         :[{},{}],
			};
			
			for(var i=0;i<2;i++){
				add_data.skill_data[i] = _.cloneDeep(st.CardSkillData[mate_data.skill[i]]);
				add_data.skill_data[i].use_max    = (mate_data.mag/add_data.skill_data[i].need_mag).ceil();
				add_data.skill_data[i].use_remain = add_data.skill_data[i].use_max;
			}
			
			var recover_full_time = df.RECOVER_TIME; // 仮に一律で1時間とする
			var recover_time      = mate_data.hp_time - __.baseTime();
			var hp_per            = 1;
			var hp                = mate_data.hp_full;
			if( recover_time > 0 ){
				hp_per            = 1 - (recover_time / recover_full_time);
				hp                = mate_data.hp_full * hp_per
			}
			
			add_data.hp         = hp.ceil();
			add_data.hp_per     = (hp_per*100).floor()/100;
			add_data.power      = (mate_data.atk + mate_data.def + add_data.hp/4 + mate_data.mag*4).floor();
			if(add_data.hp_per < 1){
				var remainTime = new __.RemainTime({ disp:{hour:false,sec:false} , str:{min:"分"} });
				add_data.hp_text = remainTime.toText( mate_data.hp_time );
			};
			
			if(mate_data.is_max_level){
				add_data.next_need_exp = 0;
				add_data.next_exp      = 0;
				add_data.exp_per       = 1;
			}else{
				var exp_data = this.getExpData(mate_data);
				add_data.next_need_exp = exp_data.next_need_exp;
				add_data.next_exp      = exp_data.next_exp;
				add_data.exp_per       = exp_data.exp_per;
			}
			
			return add_data
		},
		extendHpTime : function(mate){
			var damage_per = 1 - ( mate.hp / mate.hp_full );
			var recover_time = df.RECOVER_TIME * damage_per ;
			mate.hp_time = __.baseTime() + recover_time;
			return mate
		},
		/**
		 * 仲間モンスターデータ(表示用)の生成
		 * @memberof Mate
		 * @function createMates
		 * @param card_id {int}
		 * @param [config] {object} 生成に必要な初期値オプション。初期レベル設定など。
		 */
		defaultSkillAttr : function(){
			return {
				id:1,
				lvl:1
			};
		},
		defaultSkill : function(card_id,config){
			var stCard = st.CardData[card_id];
			var ret =  this.defaultSkillAttr();
			var data_attr = {
				id:stCard.skill,
			};
			
			// data_attr、configを順に上書き
			for(var i in data_attr   ){ ret[i] = data_attr[i];    };
			for(var i in config      ){ ret[i] = config[i];       };
			
			return ret;
		},
		/**
		 * 次のレベルに必要な経験値を返す。
		 * 現在レベルの始まりとの差分で1レベルに必要な経験値に、total_expとの差分でそのレベルまでに必要な経験値になる。
		 * @memberof Mate
		 * @function getExpData
		 * @param mate {object}
		 * @param lvl {int}
		 */
		getExpData:function(mate){
			// Todo : max_level時のエラーを返す
			var lvl    = mate.lvl;
			var rarity = st.CardData[mate.card_id].rarity;
			var data   = st.CardExpData[rarity].exp;
			var ret = {
				current      :data[lvl],
				next         :data[lvl+1],
				next_exp     :data[lvl+1] - data[lvl],
				next_need_exp:data[lvl+1] - mate.total_exp,
				current_exp  :mate.total_exp - data[lvl],
			};
			ret.exp_per = (ret.current_exp/ret.next_exp*100 ).floor()/100;
			return ret;
		},
		/**
		 * 指定の仲間が指定のレベルになったときのパラメータを返す
		 * @memberof Mate
		 * @function getStatusFromLvl
		 * @param before_mate {object}
		 * @param after_lvl {int}
		 */
		getStatusFromLvl:function(before_mate,after_lvl){
			// levelからカードデータを計算して返す。
			var rarity = st.CardData[before_mate.card_id].rarity;
			var exp = st.CardExpData[rarity].exp[after_lvl];
			return this.getStatusFromTotalExp( before_mate, exp);
		},
		/**
		 * 指定の仲間が指定の経験値に到達したときのパラメータを返す
		 * @memberof Mate
		 * @function getStatusFromTotalExp
		 * @param before_mate {object}
		 * @param after_total_exp {object}
		 */
		getStatusFromTotalExp:function(before_mate,after_total_exp){
			// total_expからカードデータを計算して返す。
			var st_card    = st.CardData[before_mate.card_id];
			var after_mate = _.cloneDeep(before_mate);
			var after_lvl  = 1;
			var exp_list   = st.CardExpData[st_card.rarity].exp;
			for(var i=1;i<exp_list.length;i++){
				if(after_total_exp >= exp_list[i]){ after_lvl = i }
			}
			after_mate.lvl       = after_lvl;
			after_mate.total_exp = after_total_exp;
			after_mate.exp       = after_total_exp - exp_list[after_lvl];
			
			// ステータスの上がり方：LevelMaxが4だとして、1,2,3,4、ステータスが上がる回数は lvl_max-1回、レベルアップ後のステータスは after_mate.lvl-1回 になる。
			// 固体値の補正：レベル × 固体値/100。最大（レベル100で固体値100の場合）で100になる。
			after_mate.atk       = ( st_card.atk_min + ((st_card.atk_max-st_card.atk_min)/(st_card.lvl_max-1)) * (after_mate.lvl-1) + ((before_mate.individual[0]/100)*after_mate.lvl) ).floor();
			after_mate.def       = ( st_card.def_min + ((st_card.def_max-st_card.def_min)/(st_card.lvl_max-1)) * (after_mate.lvl-1) + ((before_mate.individual[1]/100)*after_mate.lvl) ).floor();
			after_mate.mag       = ( st_card.mag_min + ((st_card.mag_max-st_card.mag_min)/(st_card.lvl_max-1)) * (after_mate.lvl-1) + ((before_mate.individual[2]/100)*after_mate.lvl) ).floor();
			after_mate.hp_full   = ( st_card.hp_min  + ((st_card.hp_max -st_card.hp_min )/(st_card.lvl_max-1)) * (after_mate.lvl-1) + ((before_mate.individual[3]/100)*after_mate.lvl) ).floor();
			
			// スキルレベル判定
			for(var i=0;i<2;i++){
				for(var j=0;j<3;j++){
					var skill_data = st.CardSkillData[after_mate.skill[i]];
					if(skill_data.up_level>0 && skill_data.up_level <= after_mate.lvl){
						after_mate.skill[i] += 1;
					}
				}
			}
			
			return after_mate;
		},
		/**
		 * 獲得モンスターに新規獲得かどうかを付加して返す
		 * @memberof Mate
		 * @function mapNewFlag
		 * @param pc {object} PcRECのインスタンス
		 * @param new_mate_list {object} Mate#createMatesで作成したlist
		 */
		mapNewFlag:function(pc,new_mate_list){
			//new_flagを追加したcloneを返す
			var clone_mate_list = _.cloneDeep(new_mate_list);
			
			_( clone_mate_list ).each(function(m){
				if( !_.has(m,"card_id") ){ throw "PcREC#mapNewZukanFlag don't have a card_id" };
				if( pc.attributes.zukan_flag[ st.CardData[ m.card_id ].zukan_no ] == 1 ){
					m.new_flag = 0;
				}else{
					m.new_flag = 1;
				};
			});
			
			return clone_mate_list;
		},
		/**
		 * 売却時の結果を返す。データを返すだけでsaveやsetは行わない。
		 * @memberof Mate
		 * @function sellResult
		 * @param pc {object} PcRECのインスタンス
		 * @param sell_list {array} mateのid一覧
		 * @example
		 * 	戻り値オブジェクト
		 * 	sell_materials {array} 売却したmateデータ
		 * 	get_game_money {int} 獲得金額
		 * 	new_mate_list {object} 売却後の所持モンスター一覧
		 * 	contain_deck {bool} 売却対象にデッキに含まれているものがあるかどうか
		 */
		sellResult:function(pc,sell_list){
			sell_list = _.compact(sell_list);
			//sell_price
			var contain_deck      = false;
			var contain_fav       = false;
			var contain_limit     = false;
			var contain_rare_data = {};
			var get_game_money    = 0;
			var sell_materials    = [];
			var new_mate_list     = _.cloneDeep(pc.attributes.mate_list);
			
			// todo mate_listにいないときのエラーを作る
			_(sell_list).each(function(sell_id,n){
				var mate_data = pc.getMateData(sell_id);
				get_game_money += this.getSellPrice(mate_data);
				new_mate_list = _(new_mate_list).omit(function(mate){ return mate.id == sell_id }).value();
				sell_materials.push( pc.get("mate_list")[sell_id] );
				if( _.contains(pc.attributes.deck, sell_id) ){ contain_deck  = true };
				if( mate_data.fav                           ){ contain_fav   = true };
				if( mate_data.lim_lvl                       ){ contain_limit = true };
				contain_rare_data[mate_data.rarity] = (contain_rare_data[mate_data.rarity])? contain_rare_data[mate_data.rarity]+1 : 1;
			},this);
			
			return {
				sell_materials    :sell_materials,
				get_game_money    :get_game_money,
				new_mate_list     :new_mate_list,
				contain_deck      :contain_deck,
				contain_fav       :contain_fav,
				contain_limit     :contain_limit,
				contain_rare_data :contain_rare_data,
				contain_rare_max  :_.chain(contain_rare_data).keys().map(function(k){ return k.toNumber() }).max().value(),
				is_have_not_all   :(_.size(pc.get("mate_list")) <= sell_list.length),
			}
		},
		getSellPrice: function(mate_data){
			var hosei = this.getHosei();
			var price = mate_data.sell_price + (100 * hosei[mate_data.rarity] + mate_data.total_exp * hosei[mate_data.rarity] * 0.05).floor();
			return price;
		},
		/**
		 * 売却結果をPcRECにsetする。saveは行わない。pc.attributes.result.sell、pc.set("mate_list")、pc.setItem( df.ITEM_ID_GAME_MONEY )をsetする。
		 * @memberof Mate
		 * @function sell
		 * @param pc {object} PcRECのインスタンス
		 * @param sell_list {array} mateのid一覧
		 * @return {object} PcRECのインスタンス
		 */
		sell:function(pc,sell_list){
			
			var result = this.sellResult(pc,sell_list);
			if( result.is_have_not_all ){ throw "所持モンスターが1体もいなくなるため、実行できません。" }
			if( result.contain_fav     ){ throw "お気に入りに設定しているモンスターが含まれているため、実行できません。" }
			if( result.contain_deck    ){ throw "デッキ編成されているモンスターが含まれているため、実行できません。" }
			
			pc.attributes.result.sell = {};
			pc.attributes.result.sell.materials = result.sell_materials;
			pc.attributes.result.sell.get_game_money = result.get_game_money;
			pc.set("mate_list",result.new_mate_list);
			pc.setItem( df.ITEM_GAME_MONEY , pc.getItem( df.ITEM_GAME_MONEY ) + result.get_game_money );
			
			return result;
		},
		/**
		 * 合成時の結果を返す。データを返すだけでsaveやsetは行わない。
		 * @memberof Mate
		 * @function mixResult
		 * @param pc {object} PcRECのインスタンス
		 * @param base {int} 強化するモンスターのid
		 * @param mat_list {array} 素材にするモンスターのid一覧
		 * @example
		 * 	戻り値オブジェクト
		 * 	contain_deck   :contain_deck,
		 * 	need_game_money:need_game_money,
		 * 	new_mate_list  :new_mate_list,
		 * 	mix_materials  :mix_materials, 
		 * 	materials      :mix_materials,
		 * 	get_exp        :get_exp,
		 * 	before         :before,
		 * 	after          :after,
		 */
		mixResult:function(pc,base,mat_list){
			// todo 合成のエラーを作る
			var contain_limit     = false;
			var contain_deck      = false;
			var contain_fav       = false;
			var contain_rare_data = {};
			var need_game_money   = 0;
			var get_exp           = 0;
			var mix_materials     = [];
			var new_mate_list     = _.cloneDeep(pc.attributes.mate_list);
			var hosei             = this.getHosei();
			
			// todo baseまたは素材がmate_listにいないときのエラーを作る
			_(mat_list).each(function(mat_id,n){
				var mate_data = pc.getMateData(mat_id);
				need_game_money += (100 * hosei[mate_data.rarity] + mate_data.total_exp * hosei[mate_data.rarity] * 0.1).floor();
				get_exp         += (100 * hosei[mate_data.rarity] + mate_data.total_exp * hosei[mate_data.rarity] * 0.2).floor();
				new_mate_list = _(new_mate_list).omit(function(mate){ return mate.id == mat_id }).value();
				mix_materials.push( pc.get("mate_list")[mat_id] );
				if( _.contains(pc.attributes.deck, mat_id) ){ contain_deck = true };
				if( mate_data.fav     ){ contain_fav   = true };
				if( mate_data.lim_lvl ){ contain_limit = true };
				contain_rare_data[mate_data.rarity] = (contain_rare_data[mate_data.rarity])? contain_rare_data[mate_data.rarity]+1 : 1;
			});
			
			var before          = _.cloneDeep( pc.get("mate_list")[base] );
			new_mate_list[base] = this.getStatusFromTotalExp( before, before.total_exp + get_exp ); //レベルアップ処理
			var after           = _.cloneDeep( new_mate_list[base] );
			return {
				contain_limit     :contain_limit,
				contain_deck      :contain_deck,
				contain_fav       :contain_fav,
				contain_rare_data :contain_rare_data,
				contain_rare_max  :_.chain(contain_rare_data).keys().map(function(k){ return k.toNumber() }).max().value(),
				contain_base      :_.contains(mat_list,base),
				is_max_level      :this.isMaxLevel(before),
				is_max_limit      :this.isMaxLimit(before),
				is_limit_level    :this.isLimitLevel(before),
				money_not_enough  :( pc.getItem( df.ITEM_GAME_MONEY ) < need_game_money ),
				need_game_money   :need_game_money,
				new_mate_list     :new_mate_list,
				mix_materials     :mix_materials, 
				get_exp           :get_exp,
				before            :before,
				after             :after,
			}
		},
		/**
		 * 合成結果をPcRECにsetする。saveは行わない。pc.attributes.result.mix、pc.set("mate_list")、pc.setItem( df.ITEM_GAME_MONEY )をsetする。
		 * @memberof Mate
		 * @function mix
		 * @param pc {object} PcRECのインスタンス
		 * @param base {int} 強化するモンスターのid
		 * @param mat_list {array} 素材にするモンスターのid一覧
		 * @return {object} PcRECのインスタンス
		 */
		mix:function(pc,base,mat_list){
			
			var result = this.mixResult(pc,base,mat_list);
			if( result.is_max_level     ){ throw "最大レベルに到達しているため、実行できません。" }
			if( result.money_not_enough ){ throw "コインが不足しているため、実行できません" }
			if( result.contain_base     ){ throw "ベースに設定しているモンスターが含まれているため、実行できません。" }
			if( result.contain_fav      ){ throw "お気に入りに設定しているモンスターが含まれているため、実行できません。" }
			if( result.contain_deck     ){ throw "デッキ編成されているモンスターが含まれているため、実行できません。" }
			
			pc.set("mate_list",result.new_mate_list);
			pc.setItem( df.ITEM_GAME_MONEY , pc.getItem( df.ITEM_GAME_MONEY ) - result.need_game_money );
			
			pc.attributes.result.mix = {}; //一回消す
			pc.attributes.result.mix.before          = result.before;
			pc.attributes.result.mix.after           = result.after;
			pc.attributes.result.mix.materials       = result.mix_materials;
			pc.attributes.result.mix.need_game_money = result.need_game_money;
			pc.attributes.result.mix.get_exp         = result.get_exp;
			return result;
		},
		/**
		 * 限界突破合成時の結果を返す。データを返すだけでsaveやsetは行わない。
		 * @memberof Mate
		 * @function mixResult
		 * @param pc {object} PcRECのインスタンス
		 * @param base {int} 強化するモンスターのid
		 * @param mat_list {array} 素材にするモンスターのid一覧
		 * @example
		 * 	戻り値オブジェクト
		 * 	contain_deck   :contain_deck,
		 * 	need_game_money:need_game_money,
		 * 	new_mate_list  :new_mate_list,
		 * 	mix_materials  :mix_materials, 
		 * 	materials      :mix_materials,
		 * 	get_exp        :get_exp,
		 * 	before         :before,
		 * 	after          :after,
		 */
		limitupResult:function(pc,base,mat_list){
			// todo 合成のエラーを作る
			var contain_limit     = false;
			var contain_deck      = false;
			var contain_fav       = false;
			var contain_rare_data = {};
			var need_game_money   = 0;
			var get_exp           = 0;
			var mix_materials     = [];
			var new_mate_list     = _.cloneDeep(pc.attributes.mate_list);
			
			// todo baseまたは素材がmate_listにいないときのエラーを作る
			_(mat_list).each(function(mat_id,n){
				var mate_data = pc.getMateData(mat_id);
				new_mate_list = _(new_mate_list).omit(function(mate){ return mate.id == mat_id }).value();
				mix_materials.push( pc.get("mate_list")[mat_id] );
				if( _.contains(pc.attributes.deck, mat_id) ){ contain_deck = true };
				if( mate_data.fav     ){ contain_fav   = true };
				if( mate_data.lim_lvl ){ contain_limit = true };
				contain_rare_data[mate_data.rarity] = (contain_rare_data[mate_data.rarity])? contain_rare_data[mate_data.rarity]+1 : 1;
			});
			
			var before          = _.cloneDeep( pc.get("mate_list")[base] );
			new_mate_list[base] = this.getStatusFromTotalExp( before, before.total_exp + get_exp ); //レベルアップ処理
			new_mate_list[base].lim_lvl += 1;
			var after           = _.cloneDeep( new_mate_list[base] );
			return {
				contain_limit     :contain_limit,
				contain_deck      :contain_deck,
				contain_fav       :contain_fav,
				contain_rare_data :contain_rare_data,
				contain_rare_max  :_.chain(contain_rare_data).keys().map(function(k){ return k.toNumber() }).max().value(),
				contain_base      :_.contains(mat_list,base),
				is_max_level      :this.isMaxLevel(before),
				is_max_limit      :this.isMaxLimit(before),
				is_limit_level    :this.isLimitLevel(before),
				money_not_enough  :( pc.getItem( df.ITEM_GAME_MONEY ) < need_game_money ),
				need_game_money   :need_game_money,
				new_mate_list     :new_mate_list,
				mix_materials     :mix_materials, 
				get_exp           :0,
				before            :before,
				after             :after,
			}
		},
		/**
		 * 限界突破合成結果をPcRECにsetする。saveは行わない。pc.attributes.result.mix、pc.set("mate_list")、pc.setItem( df.ITEM_GAME_MONEY )をsetする。
		 * @memberof Mate
		 * @function mix
		 * @param pc {object} PcRECのインスタンス
		 * @param base {int} 強化するモンスターのid
		 * @param mat_list {array} 素材にするモンスターのid一覧
		 * @return {object} PcRECのインスタンス
		 */
		limitup:function(pc,base,mat_list){
			
			var result = this.limitupResult(pc,base,mat_list);
			if( result.is_max_limit     ){ throw "限界突破の上限のため、実行できません。" }
			if( result.contain_base     ){ throw "ベースに設定しているモンスターが含まれているため、実行できません。" }
			if( result.contain_fav      ){ throw "お気に入りに設定しているモンスターが含まれているため、実行できません。" }
			if( result.contain_deck     ){ throw "デッキ編成されているモンスターが含まれているため、実行できません。" }
			if( result.money_not_enough ){ throw "コインが不足しているため、実行できません" }
			
			pc.set("mate_list",result.new_mate_list);
			pc.setItem( df.ITEM_GAME_MONEY , pc.getItem( df.ITEM_GAME_MONEY ) - result.need_game_money );
			
			pc.attributes.result.limitup = {}; //一回消す
			pc.attributes.result.limitup.before          = result.before;
			pc.attributes.result.limitup.after           = result.after;
			pc.attributes.result.limitup.materials       = result.mix_materials;
			pc.attributes.result.limitup.need_game_money = result.need_game_money;
			pc.attributes.result.limitup.get_exp         = result.get_exp;
			return result;
		},
		/**
		 * 強化時の結果を返す。データを返すだけでsaveやsetは行わない。
		 */
		powerupResult:function(pc,base){
			// todo 合成のエラーを作る
			var is_max_level    = false;
			var is_limit_level  = false;
			var new_mate_list   = _.cloneDeep(pc.attributes.mate_list);
			var base_data       = pc.get("mate_list")[base];
			var exp_data        = this.getExpData(base_data);
			var need_game_money = (exp_data.next_need_exp).floor();
			var before          = _.cloneDeep( base_data );
			
			new_mate_list[base] = this.getStatusFromLvl(before,before.lvl + 1); //レベルアップ処理
			var after = _.cloneDeep( new_mate_list[base] );
			
			return {
				is_max_level    :this.isMaxLevel(before),
				is_max_limit    :this.isMaxLimit(before),
				is_limit_level  :this.isLimitLevel(before),
				money_not_enough:( pc.getItem( df.ITEM_GAME_MONEY ) < need_game_money ),
				need_game_money :need_game_money,
				new_mate_list   :new_mate_list,
				before          :before,
				after           :after,
			}
		},
		/**
		 * レベルアップ強化結果をPcRECにsetする。saveは行わない。pc.set("mate_list")、pc.setItem( df.ITEM_GAME_MONEY )をsetする。
		 * @memberof Mate
		 * @function mix
		 * @param pc {object} PcRECのインスタンス
		 * @param base {int} 強化するモンスターのid
		 * @return {object} PcRECのインスタンス
		 */
		powerup:function(pc,base){
			
			var result = this.powerupResult(pc,base);
			if( result.is_max_level     ){ throw "レベルが最大のため、実行できません" }
			if( result.money_not_enough ){ throw "コインが不足しているため、実行できません" }
			
			pc.set("mate_list",result.new_mate_list);
			pc.setItem( df.ITEM_GAME_MONEY , pc.getItem( df.ITEM_GAME_MONEY ) - result.need_game_money );
			
			pc.attributes.result.powerup = {}; //一回消す
			pc.attributes.result.powerup.before          = result.before;
			pc.attributes.result.powerup.after           = result.after;
			pc.attributes.result.powerup.need_game_money = result.need_game_money;
			pc.attributes.result.powerup.get_exp         = result.get_exp;
			return result;
		},
	});
	
return Mate;

});

define('models/DeckREC',[
	"models/Mate"
],function(Mate){
	
	var DeckREC = Backbone.Model.extend({
		constructor:function(){
			if(!DeckREC.instance){
				DeckREC.instance = this;
				Backbone.Model.apply(DeckREC.instance,arguments);
			}
			return DeckREC.instance;
		},
		defaults    : function(){ return this.defaultAttr() },
		defaultAttr : function(){
			return {
				member : [0,0,0,0,0],
			}
		},
		localStorage : new Backbone.LocalStorage("DeckREC"),
		initialize : function(config,option){
			console.log("DeckREC#initialize");
			this.pc = option.pc;
			this.set("id",option.pc_id);
			this.fetch();
			//var deck = [0,0,0,0,0];
			//var mate_list = _.values(this.pc.get("mate_list"))
			//var max_length = Math.min(deck.length, mate_list.length);
			//for(var i=0;i<max_length;i++){ deck[i] = mate_list[i].id }
			//this.set("member",deck);
			this.listenTo(this.pc,"reset_data",this.resetData);
			this.listenTo(this.pc,"fetch_user_id",this.fetchUserId);
			this.listenTo(this.pc,"change_user_id",this.changeUserId);
		},
		fetchUserId  : function(id){ console.log("DeckREC#fetchUserId",arguments); this.set("id",id).fetch() },
		changeUserId : function(id){ console.log("DeckREC#changeUserId",arguments); this.set("id",id).save() },
		resetData : function(pc_id,is_data_delete){
			this.destroy();
			this.attributes = (is_data_delete) ? {} : this.defaults();
			this.set("id",pc_id);
			this.save();
		},
		validate : function(attrs,opt){
		},
		error : function(model,error,opt){
			console.error("DeckREC#error [model,error,opt]",[model,error,opt]);
		},
	});
	
	return DeckREC;
});






define('models/Quest',[],function(){
	
	var Quest = Backbone.Model.extend({
		constructor:function(){
			// シングルトン
			if(!Quest.instance){
				Quest.instance = this;
				Backbone.Model.apply(Quest.instance,arguments);
			}
			return Quest.instance;
		},
		defaults    : function(){ return this.defaultAttr() },
		defaultAttr : function(){
			var world_data = _.groupBy(st.QuestListData,function(data){ return data.world_id; });
			var area_data = _.reduce(world_data,function(result,world,id){
				result[id] = _.groupBy(world,function(data){ return data.area_id; });
				return result
			},{})
			
			//下2ケタを除いたID一覧を作成
			//key_quest==0は除外ために必要な処理
			var quest_list = _.sortBy(st.QuestListData, function(data){ return data.id });
			var group_ids = []
			for(var i in quest_list){
				if(quest_list[i].key_quest!=0 && quest_list[i].world_id!=99 ){
					group_ids.push( (quest_list[i].id/1000).floor() );
				}
			}
			group_ids = _.uniq(group_ids).sort();
			
			var quest_play_status = _.reduce(st.QuestListData,function(result,quest,id){
				result[id] = {
					clear:0,
					play:0,
					fail:0,
				}
				return result
			},{})
			
			return {
				id:1,
				world_data:world_data,
				area_data :area_data,
				group_ids :group_ids,
				quest_play_status:quest_play_status,
			}
		},
		initialize:function(){
			window.App.data.quest = this.attributes;
		},
		updateQuest:function(){
			//クエストの状態の更新はPcRECで行う
		},
		getAvailableScenario:function(world_id,quest_status,quest_play){
			//quest_status = {
			//	clear_ids       : [1010101,1010102,1010201],
			//	available_quest : 10101,
			//	available_world : 1,
			//	available_area  : 2,
			//	available_group : 1,
			//}
			if(quest_status==undefined){ throw "Quest#getAvailableScenario quest_statusがundefined"; }
			var status = _.cloneDeep(quest_status);
			
			console.log("Quest#getAvailableScenario [quest_status]",status);
			
			// 有効なエリアの、key_questのみ抽出
			var available_area_data = this.get("area_data")[world_id][status.available_area];
			available_area_data = _.filter(available_area_data,function(area){ return area.key_quest == 1 });
			console.log("Quest#getAvailableScenario [available_area_data]",available_area_data);
			
			// 現在のグループを全てクリアしているかチェック
			var available_group_data = _.groupBy(available_area_data,function(data){ return data.group_id })[status.available_group];
			var is_clear_key_quest = 1;
			for(var i in available_group_data){
				if(!quest_play[ available_group_data[i].id ] || !quest_play[ available_group_data[i].id ].clear ){
					is_clear_key_quest = 0;
				}
			}
			
			var next_quest_id = status.available_quest;
			if( is_clear_key_quest ){
				var current_group_index = _.indexOf(this.get("group_ids"), (status.available_quest/1000).floor()); //group_idsの中で何番にavailable_questがあるか調べる
				var world_check = ( this.get("group_ids")[current_group_index + 1] /1000000).floor();
				
				if(status.available_world != world_check){
					// worldをクリアしていたら、クリアフラグだけ立てて次のクエストには進まない
					status.is_world_clear = 1;
				}else{
					//グループをクリアしていたら次のidへ。
					var next_quest_id = (this.get("group_ids")[current_group_index + 1] + "001").toNumber();
					if(st.QuestListData[next_quest_id] == undefined  ){ throw "ダンジョンID 1 がありません"; }
					if(st.QuestListData[next_quest_id].key_quest == 0){ throw "クエストタイプが 0 です。"; }
					status.clear_ids = [];
				}
			}
			
			var ret = {
				clear_ids          : status.clear_ids,
				available_quest    : next_quest_id,
				available_group    : next_quest_id.toString().slice(-6,-3).toNumber(),
				available_area     : next_quest_id.toString().slice(-9,-6).toNumber(),
				available_world    : (next_quest_id/1000000000).floor(),
				is_available_world : status.is_available_world,
				is_world_clear     : status.is_world_clear,
			}
			
			return ret;
		},
		
		createQuestList : function(current_world,current_area,quest_status){
			if(current_world == undefined){ current_world = 1 };
			if(current_area  == undefined){ current_area = 1  };
			if(quest_status  == undefined){
				alert("createQuestList : quest_statusがundefinedです")
				var available_area   = 1;
				var available_group  = 1;
			}else{
				var available_area   = quest_status.available_area;
				var available_group  = quest_status.available_group;
			}
			
			//ワールドセレクト機能をつけるときはここを変更
			var area_list = _.reduce(this.get("area_data")[current_world],function(result,data){
				if( data[0].area_id <= available_area ){
					result[data[0].area_id] = data[0];
				}
				return result
			},{});
			
			//有効なクエスト一覧を作成
			var group_data = _.groupBy(this.get("area_data")[current_world][current_area],function(data){ return data.group_id; });
			var quest_list = _.reduce(group_data,function(result,data){
				for(var i in data){
					if( data[i].area_id < available_area ){
						result[data[i].id] = data[i];
					}else if( data[i].area_id == available_area && data[i].group_id <= available_group ){
						result[data[i].id] = data[i];
					}
				}
				return result
			},{});
			
			
			var quest_data = {
				world_data:this.get("world_data"),
				area_data :this.get("area_data")[current_world] ,
				area_list :_.cloneDeep(area_list ),
				group_data:_.cloneDeep(group_data),
				quest_list:_.cloneDeep(quest_list),
			}
			console.log("Quest#createQuestList [quest_data]",_.cloneDeep(quest_data));
			
			return quest_data;
		},
		appendPlayStatus:function(pc_quest_play_data,quest_data){
			__.checkType("undefined",[pc_quest_play_data,quest_data]);
			
			
			//空データを作成、playデータを付加
			var quest_play_status = this.get("quest_play_status");
			_.extend(quest_play_status,pc_quest_play_data);
			
			//作ったデータからarea状況を判定
			var area_play_status = _.reduce(quest_data.area_data,function(result,area,id){
				result[id] = {
					clear:1,
					play:1,
				}
				for(var i in area){
					var quest_id = area[i].id;
					//1つでもクリアしてないものがあったらフラグを下げる
					if(quest_play_status[quest_id].clear == 0){
						result[id].clear = 0;
					}
					//1つでもプレイしてないものがあったらフラグを下げる
					if(quest_play_status[quest_id].play == 0){
						result[id].play = 0;
					}
				}
				return result
			},{})
			
			//ステータスを付加する
			_.map(quest_data.quest_list,function(data,id){
				data.clear_flag = quest_play_status[id].clear;
				data.play_flag  = quest_play_status[id].play;
			})
			_.map(quest_data.area_list,function(data,id){
				data.clear_flag = area_play_status[id].clear;
				data.play_flag  = area_play_status[id].play;
			})
			
			console.log("Quest#appendPlayStatus [quest_play_status,area_play_status,quest_data]", [quest_play_status,area_play_status,quest_data]);
			
			return quest_data
		},
		/**
		 * その階のfloorデータを取得
		 * @memberof Quest
		 * @function getFloorData
		 */
		getFloorData:function(quest_id,floor_now){
			var quest_data = st.QuestListData[ quest_id ];
			var current_floor = 0;
			for(var i=0;i<quest_data.floor.length;i++){
				if( floor_now <= quest_data.floor[i] ){
					current_floor = i;
					break
				}
			}
			console.log("Quest#getFloorData [quest_id,current_floor]",[quest_id,current_floor]);
			var floor_data = {
				floor      : quest_data.floor[current_floor],
				level      :quest_data.level[current_floor],
				cave_map_id:quest_data.cave_map_id[current_floor],
				scratch_id :(quest_id*1000) + current_floor,
			}
			return floor_data
		},
		
		/**
		 * クエストの基本情報を返す
		 * @memberof Quest
		 * @function getFloorData
		 */
		getQuestInfo:function(quest_id){
			var quest_data = st.QuestListData[quest_id]
			
			// 最大フロア数
			var floor_max = quest_data.floor_max
			
			// 最大難易度
			var level = _.max(quest_data.level,function(level){ return level })
			
			// 敵情報取得。{card_id:int, card_data:object}で返す。
			var scrach_data_ids = _.reduce(quest_data.floor, function(result,floor,n){
				if(floor!=0) result.push(quest_id + n.pad(3));
				return result
			},[])
			var scrach_data_all = _.reduce(scrach_data_ids,function(result,id){
				return result.concat( st.CaveScratchDataMin[id] );
			},[])
			var scrach_data_enemy = _.reduce(scrach_data_all,function(result,data){
				if(data[1] == df.EVENT_ENEMY || data[1] == df.EVENT_MIMIC || data[1] == df.EVENT_BOSS){
					_.map( data[2].split("/") ,function(enemy){
						var seed_id = enemy.split("_")[0];
						var card_id = st.CardSeedData[seed_id].card_id;
						result[card_id] = {card_id:card_id, card_data: st.CardData[card_id] };
					})
				}
				return result;
			},{})
			var enemys = _.values(scrach_data_enemy).sort(function(a,b){ return a.card_id - b.card_id });
			
			var first_reward = __.excelArrayToJSON(quest_data,["first_reward_id", "first_reward_type", "first_reward_vol"]);
			var reward       = __.excelArrayToJSON(quest_data,["reward_id"      , "reward_type"      , "reward_vol"      ]);
			
			return {
				data        : quest_data,
				enemys      : enemys,
				floor_max   : floor_max,
				level       : level,
				first_reward: first_reward,
				reward      : reward,
			}
		},
		
	});
	
return Quest;

});

define('models/BillingForGooglePlay',[
	"models/PcREC",
""],function(PcREC){
	
	var Billing = Backbone.Model.extend({
		initialize:function(config){
			console.log("####init###")
			console.log(config)
			if(typeof inappbilling == "undefined"){
				console.error("inappbilling is not defined")
			}
			this.set("product_list",config.produt_ids);
		},
		defaults:function(){
			return {
				product_list :[],
				initializing:false,
				buying:false,
				available_product_list:[],
			}
		},
		//init
		init : function(){
			this.set("initializing",true)
			inappbilling.init(
				_.bind(this.successInit,this),
				_.bind(this.failInit,this),
				{showLog:true},
				this.get("product_list")
			)
		},
		successInit : function(data){
			console.debug("#### SUCCESS Init ####");
			this.initLoadProducts()
		},
		failInit : function(error){
			console.debug("#### FAIL Init ####")
			console.debug("ERROR: " + error )
			this.trigger("failBilling",arguments)
			alert("ERROR: \r\n"+error );
		},
		
		//initLoadProducts
		initLoadProducts : function(){
			inappbilling.getAvailableProducts(
				_.bind(this.successInitLoadProducts,this),
				_.bind(this.failinitLoadProducts,this)
			)
		},
		successInitLoadProducts : function(available_product_list){
			console.debug("#### SUCCESS getAvailableProducts ####")
			console.debug(JSON.stringify(available_product_list));
			this.set("available_product_list",available_product_list)
			this.executeTransaction();
		},
		failinitLoadProducts: function(error){
			console.debug("#### FAIL getAvailableProducts ####")
			console.debug("ERROR: " + error )
			this.trigger("failBilling",arguments)
			alert("ERROR: \r\n"+error );
		},
		
		//executeTransaction
		executeTransaction : function(){
			console.log("### executeTransaction start ###");
			inappbilling.getPurchases(
				_.bind(this.successExecuteTransaction,this),
				_.bind(this.failExecuteTransaction,this)
			)
		},
		successExecuteTransaction : function(items){
			console.log("#### SUCCESS GetPurchases ####")
			console.log(JSON.stringify(items));
			this.consume_list = items;
			this.consume_cnt  = 0;
			this.checkConsumePurchase()
		},
		failExecuteTransaction : function(error){
			console.log("#### FAIL GetPurchases ####")
			console.log("ERROR: " + error )
			this.trigger("failBilling",arguments)
			alert("ERROR: \r\n"+error );
		},
		
		//consumePurchase
		consumePurchase : function (productId) {
			inappbilling.consumePurchase(
				_.bind(this.checkConsumePurchase,this),
				_.bind(this.failConsumePurchase,this),
				productId
			)
		},
		checkConsumePurchase : function(){
			console.log("### SUCCESS ConsumePurchase ###")
			var cnt = this.consume_cnt;
			console.log("this.consume_list.length > cnt : " + this.consume_list.length + " > " + cnt);
			if(this.consume_list.length > cnt){
				/*
				orderId: "12999763169054705758.1370533565906823"
				packageName: "com.phonegap.xenosteel"
				productId: "xeno_test_10000"
				purchaseState: 0
				purchaseTime: 1390151669987
				purchaseToken: "aulbcakevldwwxmwgihptnyx.AO-J1OxUchFOpTLpndrM6WDAwqiPaD3_QkAGNsKdAugNLV6h_xl3M92yl4g6Qqupi6zkXjFyZTDaoMBViLUJ3KNMAu5SwSQq0cRUAiHw8pPlJtgG6EjYagGHsTo-R9GZc4XiAbsx7sw6"
				*/
				this.trigger("successBuy",this.consume_list[cnt])
				this.consume_cnt += 1;
				this.consumePurchase(this.consume_list[cnt].productId);
			}else{
				this.finishConsume();
			}
		},
		finishConsume:function(){
			console.log("### BillingREC : finishConsume start ###");
			if(this.get("initializing")){
				this.set("initializing",false)
				this.trigger("finishInit",this.get("available_product_list"))
			}else if(this.get("buying")){
				this.set("buying",false)
				this.trigger("finishBuy")
			}
		},
		failConsumePurchase : function(error){
			console.debug("#### FAIL ConsumePurchase ####")
			console.debug("ERROR: " + error )
			this.trigger("failBilling",arguments)
			alert("ERROR: \r\n"+error );
		},
		
		//buy
		buy : function(product_id){
			this.set("buying",true);
			inappbilling.buy(
				_.bind(this.successBuy,this),
				_.bind(this.failBuy,this),
				product_id
			)
		},
		successBuy : function(productId){
			console.log("### SUCCESS Buy ###");
			this.executeTransaction()
		},
		failBuy : function(error){
			console.debug("#### FAIL BUY ####")
			console.debug("ERROR: " + JSON.stringify(arguments))
			if(/1005/.test(error)){
				this.trigger("failBilling","cancel")
			}else{
				this.trigger("failBilling",arguments)
				alert("ERROR: \r\n"+error );
			}
		},
	});
	
	return Billing;
})

;
define('models/BillingForAppStore',[
	"models/PcREC",
""],function(PcREC){
	
	var Billing = Backbone.Model.extend({
		initialize:function(config){
			if(typeof storekit == "undefined"){
				console.error("storekit is not defined")
			}
			this.set("product_list",config.produt_ids);
		},
		defaults:function(){
			return {
				product_list :[],
				buying:false,
			}
		},
		//init
		init : function(){
			console.log("BillingAppStore : " + "init_start");
			storekit.init({
				noAutoFinish: true,
				debug:    true, // Enable IAP messages on the console
				ready:    _.bind(this.successInit,this),
				purchase: _.bind(this.successBuy,this),
				restore:  _.bind(this.restore,this),
				error:    _.bind(this.error,this),
				failedTransaction:_.bind(this.failedTransaction,this),
				finish:   _.bind(this.finish,this),
			});
		},
		successInit:function(){
			console.debug("#### SUCCESS Init ####");
			this.initLoadProducts()
		},
		
		//successInitLoadProducts
		initLoadProducts:function(){
			console.log("BillingAppStore : " + "initLoadProducts");
			// Once setup is done, load all product data.
			storekit.load(
				this.get("product_list"),
				_.bind(this.successInitLoadProducts,this)
			);
		},
		successInitLoadProducts : function(products, invalidIds){    
			console.log("#### SUCCESS successInitLoadProducts ####")       
			console.log(JSON.stringify(products));                         
			//GooglePlayにあわせる                                         
			// AppAtoreの場合  {        "id":"xeno_test_10000", "title":"", "price":"￥500", "description":"" }
			// GooglePlayの場合{ "productId":"xeno_test_10000", "title":"", "price":"￥104", "description": "", "type":"inapp", "price_amount_micros":990000, "price_currency_code": "USD" }
			_.each(products,function(product){ product.productId = product.id; })
			this.set("available_product_list",products)
			this.trigger("finishInit",products)
		},
		
		//buy
		buy:function (product_id) {
			this.set("buying",true)
			console.log("BillingAppStore : " + "buy");
			storekit.purchase(product_id);
		},
		successBuy : function(transactionId, productId, receipt){
			console.log("### SUCCESS Buy ###")
			console.log("successBuy / " + transactionId +" : "+ productId +" : "+ receipt )
			this.getReceipts(transactionId,_.bind(function(data){
				this.trigger("successBuy",data);
				storekit.finish(transactionId);
			},this))
		},
		getReceipts:function(transactionId,callback){
			storekit.loadReceipts(_.bind(function(receipts){
				this.successGetReceipts(receipts,transactionId,callback)
			},this));
		},
		successGetReceipts : function (receipts,transactionId,callback) {
			console.log("#### loadReceipts ####")
			//var productReceipt = receipts.forProduct("xeno_test_10000"); // null or base64 encoded receipt (iOS < 7)
			var productReceipt = receipts.forTransaction(transactionId);
			productReceipt = productReceipt.decodeBase64().replace(/" = "/g,'" : "').replace(/";/g,'",'); //'コメント回避
			productReceipt = eval("(" + productReceipt + ")");
			productReceipt["purchase-info"] = eval("(" + productReceipt["purchase-info"].decodeBase64().replace(/" = "/g,'" : "').replace(/";/g,'",') + ")"); //'コメント回避
			console.log("productReceipt : " + JSON.stringify(productReceipt));
			
			var ret = {
				purchaseToken:"",
				originalTransactionId:productReceipt["purchase-info"]["original-transaction-id"],
				purchaseTime         :parseInt( productReceipt["purchase-info"]["purchase-date-ms"] ),
				productId            :productReceipt["purchase-info"]["product-id"],
				orderId              :productReceipt["purchase-info"]["transaction-id"],
			}
			//this.trigger("successGetPurchases",[ret])
			callback(ret)
		},
		
		//consumePurchase
		finishConsume:function (productId,transactionId) {
			storekit.finish(transactionId)
		},
		
		//onError
		error:function (errorCode, errorMessage) {
			console.log('Error: ' + errorCode + '\r\n' + errorMessage)
			this.trigger("failBilling",errorCode,errorMessage);
		},
		failedTransaction:function(transactionIdentifier, productId, errorCode, errorText){
			//alert("failedTransaction");
			storekit.finish(transactionIdentifier);
			console.log('Error: ' + errorCode + '\r\n' + errorText)
			this.trigger("failBilling",errorCode,"failedTransaction transactionIdentifier:" + transactionIdentifier + " productId : " + productId);
		},
		finish:function(transactionIdentifier, productId){
			console.log('finish transaction')
			if(this.get("buying")){
				this.set("buying",false)
				this.trigger("finishBuy");
			}
			this.trigger("finishTransaction");
		},
		
		//restore
		restore:function(){},
	});
	
	return Billing;
})
;
define('models/BillingREC',[
	"models/BillingForGooglePlay",
	"models/BillingForAppStore",
""],function(BillingForGooglePlay,BillingForAppStore){
	
	/**
	 * Billing情報のmodel。
	 * @class BillingREC
	 */
	var BillingREC = Backbone.Model.extend({
		constructor:function(){
			if(!BillingREC.instance){
				BillingREC.instance = this;
				Backbone.Model.apply(BillingREC.instance,arguments);
			}
			return BillingREC.instance;
		},
		defaults : function(){
			var prepaid_list = []
			if(!__.info.is_phonegap){
				prepaid_list = [
					{orderId: "1000000098883856",point: 500,pointMax: 500,productId: "xeno_test_10000",purchaseTime: 1390168668001},
					{orderId: "1000000098883858",point: 500,pointMax: 500,productId: "xeno_test_10000",purchaseTime: 1390168673697},
					{orderId: "1000000098883861",point: 500,pointMax: 500,productId: "xeno_test_10000",purchaseTime: 1390168679903},
				]
			}
			/* available_product_listのios、android両方で有効なプロパティ
			description: "テスト用アイテム説明"
			price: "￥500"
			productId: "xeno_test_10000"
			title: "テスト用アイテム"
			*/
			return{
				id :"default",
				buy_finish : true,
				available_product_list : [],
				buy_id : "",
				prepaid_list : prepaid_list,
				invalid_prepaid_list : [],
			}
		},
		localStorage : new Backbone.LocalStorage("BillingREC"),
		initialize : function(config,option){
			console.log("BillingREC#initialize");
			__.checkHas(option,["pc_id"]);
			this.set("id",option.pc_id)
			this.pc = option.pc;
			this.fetch();
			var list = ["xeno_test_10000","xeno_test_10001","android.test.purchased","android.test.canceled","android.test.item_unavailable"];
			if(__.info.is_android)  this.billing = new BillingForGooglePlay({produt_ids:list});
			if(__.info.is_ios)      this.billing = new BillingForAppStore({produt_ids:list});
			if(!__.info.is_phonegap){
				var DummyBilling = Backbone.Model.extend({ init:function(){}, buy:function(){} });
				this.billing = new DummyBilling({produt_ids:list})
			};
			this.listenTo(this.billing,"finishInit" ,this.finishInit)
			this.listenTo(this.billing,"successBuy" ,this.successBuy)
			this.listenTo(this.billing,"finishBuy"  ,this.finishBuy)
			this.listenTo(this.billing,"failBilling",this.failBilling)
			this.listenTo(this.pc,"reset_data",this.resetData);
			this.listenTo(this.pc,"fetch_user_id",this.fetchUserId);
			this.listenTo(this.pc,"change_user_id",this.changeUserId);
			this.checkEnablePrepaid();
			this.save();
		},
		fetchUserId  : function(id){ console.info("BillingREC#fetchUserId",arguments); this.set("id",id).fetch() },
		changeUserId : function(id){ console.info("BillingREC#changeUserId",arguments); this.set("id",id).save() },
		resetData : function(pc_id,is_data_delete){
			this.destroy();
			this.attributes = (is_data_delete) ? {} : this.defaults();
			this.set("id",pc_id);
			this.save();
		},
		validate : function(attrs,opt){
		},
		checkConnection:function(){
			if( navigator.connection.type == Connection.UNKNOWN || navigator.connection.type == Connection.NONE){
				this.failBilling();
				return false
			}else{
				return true
			}
		},
		init : function(){
			console.log("### BillingREC : init start ###");
			if(!this.checkConnection()){ return }
			this.billing.init()
		},
		finishInit:function(available_product_list){
			this.set("available_product_list",available_product_list);
			this.set("buy_id","");
			this.save();
			this.trigger("finishInit");
		},
		buy : function(buy_id){
			// 購入を開始する。初期化時に購入処理が終わっていないものは無くなっているはずなので、
			// そのまま購入処理へ遷移する。
			console.log("### BillingREC : buy start ###");
			if(!this.checkConnection()){ return }
			this.set("buy_id",buy_id);
			this.save();
			this.billing.buy(this.get("buy_id"))
		},
		successBuy : function(buy_data){
			/*
				購入が完了し、Transactionの数が1以上になっている状態
				successBuy()の呼び出しのあとあと、
				それぞれのbillingクラスの中でTransactionを処理するようになっている。
				Transactionが2つ以上ある場合、その分だけこのsuccessBuyが呼ばれる。
				全てのTransactionを処理したら、AndroidではfinishBuyイベントを発火させる。
				iOSではPaymentTransactionStateFinishedにどのタイミングでなるのか不明なので不明。
			*/
			console.log("### givePurchaseItems ###");
			var product_data = _.find(st.ProductData,function(data){ return data.product_id == "xeno_test_10000" })
			var prepaid = {
				point       :product_data.point,
				pointMax    :product_data.point,
				purchaseTime:buy_data.purchaseTime,
				productId   :buy_data.productId,
				orderId     :buy_data.orderId
			};
			this.get("prepaid_list").push(prepaid);
			this.save();
			App.mission.checkProcess("BUY_REAL_MONEY");
			this.trigger("successBuy")
			//商品受け渡し
			//buy_dataの整形が未完了。iosの方をandroidにあわせる。
		},
		finishBuy : function(){
			this.trigger("finishBuy")
		},
		failBilling : function(type,msg_str){
			if(type == "cancel"){
				var msg = "購入をキャンセルしました"
			}else{
				var msg = "通信エラーが起きました。通信環境のいい場所でご利用ください。"
			}
			this.trigger("failBilling",type);
			alert(msg + " : " + msg_str);
			//error処理を書く
		},
		
		//prepaid関連
		checkEnablePrepaid : function(){
			var check_time = __.baseTime();
			var prepaid_data = _.reduce(this.get("prepaid_list"), function(result,prepaid){
				if( (prepaid.purchaseTime + 14688000000 <= check_time) || prepaid.point == 0){
					result.disables.push(prepaid)
				}else{
					result.enables.push(prepaid)
				}
				return result
			},{ enables:[], disables:[] });
			
			var invalid_prepaid_list = this.get("invalid_prepaid_list").concat(prepaid_data.disables);
			this.set("invalid_prepaid_list",invalid_prepaid_list);
			
			var valid_prepaid_list = prepaid_data.enables.sort(function(a,b){ return a.purchaseTime - b.purchaseTime })
			this.set("prepaid_list", valid_prepaid_list);
			
			//this.save();
		},
		getMoney : function(){
			this.checkEnablePrepaid();
			var total_money = _.reduce(this.get("prepaid_list"), function(sum,prepaid){ return (sum + prepaid.point) },0)
			return total_money
		},
		useMoney : function(val){
			this.checkEnablePrepaid();
			var prepaid_list = this.get("prepaid_list");
			var remain_val = val;
			_.each(prepaid_list,function(prepaid){
				if(remain_val <= 0){ return }
				if(prepaid.point <= remain_val){
					remain_val -= prepaid.point;
					prepaid.point = 0;
				}else{
					prepaid.point -= remain_val;
					remain_val = 0;
				}
			})
			return remain_val
		},
	});
	
	return BillingREC;
});






define('models/PcREC',[
	"models/Mate",
	"models/DeckREC",
	"models/Quest",
	"models/BillingREC",
],function(Mate,DeckREC,Quest,BillingREC){
	
	/**
	 * プレイヤー情報のmodel。シングルトン。
	 * @class PcREC
	 */
	var PcREC = Backbone.Model.extend({
		constructor:function(){
			// シングルトン
			if(!PcREC.instance){
				PcREC.instance = this;
				Backbone.Model.apply(PcREC.instance,arguments);
			}
			return PcREC.instance;
		},
		defaults    : function(){ return this.defaultAttr() },
		default_attr_cash : 0,
		defaultItem: function(id){
			return {
				num : 0,
				flag: 0,
			}
		},
		defaultQuestPlay: function(id){
			return {
				clear:0,
				fail:0,
				play:0
			}
		},
		defaultGacha: function(id){
			return {
				id: id,
				draw_cnt: 0,
				total_draw_cnt: 0,
				last_draw_time: 0,
				last_check_time: 0,
				last_revival_time: 0,
			}
		},
		defaultAvailableWorldData: function(){
			var world_data = _.reduce(st.QuestListData,function(result,data){
				if(data.world_name) result.push(data);
				return result;
			},[])
			var available_world_data = _.reduce(world_data,function(result,data){
				result[data.world_id] = {
					available_area:1,
					available_group:1,
					available_quest:data.id,
					available_world:data.world_id,
					is_available_world:(data.world_id > 100 || data.world_id == 1)? 1 : 0,
					is_world_clear: 0,
					clear_ids:[]
				}
				return result
			},{});
			
			console.log("PcREC#defaultAttr [available_world_data]",available_world_data);
			return available_world_data;
		},
		defaultInitQuestPlay : function(available_world_data){
			return _.reduce(available_world_data,function(result,available_world){
				result[ available_world.available_quest ] = this.defaultQuestPlay();
				return result
			},{},this);
		},
		defaultAttr : function(){
			if(this.default_attr_cash){ return _.cloneDeep(this.default_attr_cash) }
			
			// todo ガチャデータが追加になったときのtestを書く
			var gacha_status = _(st.GachaListData).reduce(function(result,gacha,key){
				result[key] = this.defaultGacha(gacha.id);
				return result;
			},{},this);
			var mate            = new Mate;
			var start_mates     = mate.createMates(this,[{ card_seed_id: 10010000, lvl:10, individual: [50, 50, 50, 50] }]);
			var zukan_flag      = _.map(new Array( 201), function(){ return 0 });
			_.each(start_mates,function(data,n){ zukan_flag[ st.CardData[ data.card_id ].zukan_no ] = 1; })
			var item_data       = _.reduce(st.ItemData , function(result,data,key){
				result[key]      = this.defaultItem()
				result[key].num  = data.default_point
				result[key].flag = (data.default_point)?1:0;
				return result
			},{},this);
			var phrase_list     = _.map(new Array(1001), function(data,n){ return [n,0,0,0,0] }); // id, flag, have_num, get_date, fav_state
			
			var available_world_data = this.defaultAvailableWorldData();
			var init_quest_play = this.defaultInitQuestPlay(available_world_data);
			
			var ret = {
				name                  : "default_user",
				save_id               : "1",
				id                    : localStorage.device_id + "_" + localStorage.save_id,
				chara_type            : 2,
				create_time           : __.baseTime(),
				last_login_time       : 0,
				next_login_bonus_time : 0,
				login_count           : 0,
				mate_max              : df.MATE_MAX,
				deck                  : [0,0,0,0,0],
				quest_status          : available_world_data,
				current_world         : 1,
				quest_play            : init_quest_play,
				zukan_flag            : zukan_flag,
				item_data             : item_data, // todo item所持上限チェック作成
				phrase_list           : phrase_list,
				mate_list             : start_mates,
				result                : {},
				gacha_status          : gacha_status,
			}
			
			this.default_attr_cash = ret;
			return _.cloneDeep(ret);
		},
		localStorage : new Backbone.LocalStorage("PcREC"),
		/**
		 * PcRECのinitialize処理。fetchでロードする。
		 * @memberof PcREC
		 * @function initialize
		 */
		initialize : function(){
			console.log("PcREC#initialize");
			this.fetch();
			this.billing = new BillingREC({},{pc_id: this.get("id"), pc: this});
			this.mate    = new Mate;
			this.quest   = new Quest;
			this.deck    = new DeckREC({},{ pc_id:this.get("id"), pc:this });
			this.listenTo(this.deck,"sync",this.syncDeck   );
			this.listenTo(this,"destroy"  ,this.syncDestroy);
			this.listenTo(this,"invalid"  ,this.error      );
			this.syncDeck();
			this.save();
		},
		save : function(){
			PcREC.__super__.save.apply(this, arguments);
			this.trigger("on_save",this);
		},
		syncDestroy:function(){
			this.deck.destroy();
		},
		syncDeck:function(){
			this.attributes.deck = this.deck.attributes.member;
		},
		getDeck:function(){
			//syncしてるのでどちらでもいい気がするが、バグの原因になりそう
			return this.attributes.deck
			return this.deck.attributes.member;
		},
		setDeck:function(member){
			this.deck.set("member",member);
			return this.deck;
		},
		validate : function(attrs,opt){
			var pc_defaults = this.defaultAttr();
			//PcRECの型チェック
			if( __.compareAttrType( pc_defaults , attrs ) ){
				return __.compareAttrType( pc_defaults , attrs );
			};
			//deckチェック
			if( pc_defaults.deck.length != attrs.deck.length ){
				return "デッキlengthが " + attrs.deck.length + "つ になっています"
			}
			for(var i in attrs.deck ){
				if( typeof attrs.deck[i] != "number" ){
					return "デッキに数字以外が含まれています :" + attrs.deck;
				}
			}
			//deck内のmate存在チェック
			var mate_ids = _.map(this.attributes.mate_list,function(mate){ return mate.id });
			if( _.compact(mate_ids).length <= 0){ return "味方が1体もいなくなります" }
			for(var i in attrs.deck ){
				if( attrs.deck[i] == 0){ continue }
				if( !_.contains(mate_ids , attrs.deck[i]) ){
					console.error("mate_ids",attrs.deck,mate_ids);
					return "deck内:" + i + " ID:" + attrs.deck[i] + "は仲間に存在しません"
				}
			}
			//id重複チェック
			var mate_list_ids = _(this.attributes.mate_list).groupBy(function(n){ return n.id; }).value();
			for(var i in mate_list_ids){
				if(mate_list_ids[i].length !== 1){
					return "PcREC#addMates 'id' is a 'duplicate'" 
				};
			};
			
			//mate_listの型チェック
			var mate = new Mate;
			var default_attr = mate.defaultAttr();
			var default_skill_attr = mate.defaultSkillAttr();
			var mate_list = this.attributes.mate_list;
			// forinにする
			for(var i=0; i<mate_list.length;i++){
				//デフォルトの属性チェック
				if( __.compareAttrType( default_attr , mate_list[i] ) ){
					return __.compareAttrType( default_attr , mate_list[i] );
				};
				//skillの属性チェック
				for(var j=0; j<mate_list[i].skill.length;j++){
					if( __.compareAttrType( default_skill_attr , mate_list[i].skill[j] ) ){
						return __.compareAttrType( default_skill_attr , mate_list[i].skill[j] );
					};
				};
			};
		},
		error : function(model,error,opt){
			console.error("PcREC#error [model,error,opt]",[model,error,opt]);
		},
		/**
		 * 所持アイテムのgetter、setter。お金やガチャポイントも。
		 * @example
		 *     pc.getItem( df.ITEM_GAME_MONEY );
		 */
		 /*
		getItem(df.ITEM_REAL_MONEY) : 無料、有料の合計値を返す  
		getItem(df.ITEM_REAL_MONEY_COST) : 有料の合計を返す  
		getItem(df.ITEM_REAL_MONEY_FREE) : 無料の値を返す
		*/
		getItem:function(item_id){
			__.checkType({number:[item_id]});
			if(!this.attributes.item_data[item_id]){
				 this.attributes.item_data[item_id] = this.defaultItem();
			}
			if(item_id == df.ITEM_REAL_MONEY){
				return this.attributes.item_data[df.ITEM_REAL_MONEY_FREE].num + this.billing.getMoney();
			}
			if(item_id == df.ITEM_REAL_MONEY_COST){
				return this.billing.getMoney();
			}
			return this.attributes.item_data[item_id].num;
		},
		setItem:function(item_id,val){
			__.checkType({number:[item_id,val]});
			if(!this.attributes.item_data[item_id]){
				 this.attributes.item_data[item_id] = this.defaultItem();
			}
			if(val < 0){ throw "item valがマイナス値です"; }
			if(item_id == df.ITEM_REAL_MONEY){ var msg = "ITEM_REAL_MONEYにsetすることはできません"; alert(msg); throw msg; }
			if(item_id == df.ITEM_REAL_MONEY_COST){ var msg = "ITEM_REAL_MONEY_COSTにsetすることはできません"; alert(msg); throw msg; }
			this.attributes.item_data[item_id].num = val;
			if(val > 0){
				this.attributes.item_data[item_id].flag = 1;
			}
		},
		addItem:function(item_id,val,type){
			if(type == df.DATA_TYPE_ITEM || type == undefined){
				this.setItem(item_id, this.getItem(item_id) + val);
				
			}else if(type == df.DATA_TYPE_PHRASE){
				this.addPhrase(item_id, val);
				
			}else if(type == df.DATA_TYPE_ITEM_SET){
				this.addItemSet(item_id);
				
			}else if(type == df.DATA_TYPE_CARD_SEED){
				var card_data = {
					card_seed_id:item_id,
					lvl         :val,
					individual  :[50,50,50,50],
				}
				var new_mate_list = this.mate.createMates(this,card_data);
				this.addMates(new_mate_list);
			}
			
			return this
		},
		addItemSet:function(item_set_id){
			var data = st.ItemSetData[item_set_id];
			for(var i in data.data_type){
				this.addItem(data.item_id[i], data.item_num[i], data.data_type[i]);
			}
		},
		useItem : function(item_id,val){
			//saveまで行うので注意する
			__.checkType({number:[item_id,val]});
			if(val < 0){ throw "item valがマイナス値です"; }
			if(item_id == df.ITEM_REAL_MONEY_FREE){ throw "useItemにITEM_REAL_MONEY_FREEを指定することはできません"; }
			if(item_id == df.ITEM_REAL_MONEY_COST){ throw "useItemにITEM_REAL_MONEY_COSTを指定することはできません"; }
			
			if(item_id == df.ITEM_REAL_MONEY){
				if(this.getItem(df.ITEM_REAL_MONEY) < val){ throw "魔石が足りません"; }
				var remain_cost = this.billing.useMoney(val);
				this.setItem(df.ITEM_REAL_MONEY_FREE, this.getItem(df.ITEM_REAL_MONEY_FREE) - remain_cost)
			}else{
				this.setItem(item_id,this.getItem(item_id) - val);
			}
			this.save()
			this.billing.save()
			return
		},
		getPrepaidMoney:function(){
			var prepaids = this.billing.get("prepaid_list");
		},
		addPhrase:function(item_id,val){
			var sum = this.attributes.phrase_list[item_id][2] + val;
			this.setPhrase(item_id,sum);
		},
		setPhrase:function(item_id,val){
			__.checkType({number:[item_id,val]});
			if(val < 0){ throw "item valがマイナス値です"; }
			// [id, flag, num, date, fav_state]
			if(val > 0){
				this.attributes.phrase_list[item_id][1] = 1;
			}
			this.attributes.phrase_list[item_id][2] = val;
			this.attributes.phrase_list[item_id][3] = __.baseTime();
		},
		
		// Card関連
		/**
		 * 所持モンスターの最大IDを取得
		 * @memberof PcREC
		 * @function largestMateId
		 */
		largestMateId:function(){
			var desc_id_list = _(this.attributes.mate_list).sortBy(function(a) { return a.id*-1 ; }).value();
			if(_.isEmpty(desc_id_list)){
				return 0;
			}else{
				return desc_id_list[0].id;
			}
		},
		/**
		 * モンスター所持上限チェック
		 * @memberof PcREC
		 * @function checkMateMax
		 * @chainable
		 */
		checkMateMax:function(){
			if( _(this.attributes.mate_list).size() >= this.attributes.mate_max){
				throw "PcREC#addMates 'mate_num' is greater than 'mate_max'";
			}
			return this
		},
		/**
		 * モンスター追加処理。save()は行わない。
		 * @memberof PcREC
		 * @function addMates
		 * @param new_mate_list {array} 
		 * @chainable
		 */
		addMates:function(new_mate_list){
			var largest_mate_id = this.largestMateId();
			_(new_mate_list).each( function(new_mate,key){
				this.attributes.zukan_flag[ st.CardData[ new_mate.card_id ].zukan_no ] = 1;
			},this );
			_( this.attributes.mate_list ).extend( new_mate_list )
			return this
		},
		/**
		 * 所持モンスターデータの取得。
		 * @memberof PcREC
		 * @function getMateData
		 * @param id {int}  
		 * @param [is_all] {bool} falseで返すデータが少なくなる。defaultでtrue。
		 */
		getMateData:function(id,is_all){
			var mate_data = this.get("mate_list")[id];
			if(mate_data == undefined){ throw "id" + id + " の仲間が見つかりません" };
			
			//追加データ
			var add_data = this.mate.makeMateStatus(mate_data);
			
			//デッキ含みデータ追加
			var pc_deck = this.get("deck");
			add_data.contain_deck = 0;
			for(var i=0;i<pc_deck.length;i++){
				if(pc_deck[i] == mate_data.id){ add_data.contain_deck = 1; continue; }
			}
			
			var card_data = _.clone(st.CardData[mate_data.card_id]);
			
			return _.extend(card_data,mate_data,add_data);
		},
		/**
		 * クエストリストを更新する。クリアカウントなどもここで行う。
		 * @memberof PcREC
		 */
		updateQuest:function(quest_data){
			//updateして終了
			var quest_status = this.get("quest_status");
			for(var i in quest_status){
				quest_status[i] = this.quest.getAvailableScenario( i, quest_status[i], this.get("quest_play") );
			}
			// this.defaultAvailableWorldDataは、Dataが追加された時用の対応
			this.set("quest_status", _.extend(this.defaultAvailableWorldData(), quest_status) );
			return this
		},
		
		resetPcData:function(user_id,is_data_delete){
			this.destroy();
			this.attributes = (is_data_delete) ? {} : this.defaults();
			this.attributes.id = user_id;
			this.save();
			this.trigger("reset_data",this.get("id"),is_data_delete);
		},
	});
	
	return PcREC;
});






define('controllers/Animations',[
"models/PcREC",
"models/Mate",
""],function(PcREC,Mate){
var Animations = function(){
return {
	Fadeout : Backbone.View.extend({
		initialize: function(options){
			this.options = options;
		},
		render : function(){
			this.$el.html(''
				+'<div class="fadeout_container">'
				+'	<div class="black_screen" style="height: 480px; width:320px; background-color:#000; background-size:100% 100%; position: absolute; opacity:1;"></div>'
				+'</div>'
			);
			
			var _this = this;
			var jc = new jChrono({fps:30,updateTime:1000/30},{easing:"linear"});
			jc.start();
			
			jc.animate({
				duration: jc.frameToTime(10),
				target  : _this.$el.find(".black_screen"),
				alpha   : [0,1],
				onFinish: function(){
					_this.options.nextAction();
					_this.trigger("close");
				},
			})
			return this
		},
	}),
	
	FloorChange : Backbone.View.extend({ //usage : var anim = new App.anim.FloorChange({before:10,after:11});
		initialize: function(options){
			this.options = options;
		},
		startAnim:function(){
			// Todo : iPhoneの良いやつでは滑らかにするのをメソッド化する
			var step = 1000/30;
			if(__.info.is_phonegap){
				var modelNumber = function(type){ return window.device.model.replace(type,"").slice(0,1).toNumber() }
				if( modelNumber("iPhone") >= 5 ||  modelNumber("iPod") >= 5 || modelNumber("iPad") >= 3 ){
					step = 1000/30;
				}
			}
			
			var _this = this;
			var jc = new jChrono({fps:30,updateTime:1000/30},{easing:"linear"});
			jc.start();
			
			this.stop = function(){
				_this.trigger("close");
				jc.stop();
				__.scroller.refresh()
			};
			
			jc.animate({
				duration: jc.frameToTime(12),
				delay   : jc.frameToTime(10),
				step    : step,
				easing  : "easeOutCirc",
				target  : _this.$el.find(".before_num_container *"),
				x       : [0,-70],
				alpha   : [1,0],
			}).animate({
				duration: jc.frameToTime(12),
				step    : step,
				easing  : "easeOutCirc",
				target  : _this.$el.find(".after_num_container"),
				x       : [70,0],
				alpha   : [0,1],
			}).animate({
				duration: jc.frameToTime(10),
			}).animate({
				duration: jc.frameToTime(10)+10,
				step    : step,
				target  : _this.$el.find(".floor_change_container"),
				alpha   : [1,0],
				onFinish: function(){
					_this.trigger("close");
					jc.stop();
					__.scroller.refresh()
				},
			})
			return this
		},
		render : function(){
			this.$el.html(''
				+'<div class="floor_change_container">'
				+'	<div class="black_screen" style="height: 480px; width:320px; background-color:#000; background-size:100% 100%; position: absolute; opacity:0.5;"></div>'
				+'	<div class="num_container"><div class="before_num_container" style="opacity:1;">'+__.helper.toNumClass(this.options.before)+'<i class="numF"></i></div></div>'
				+'	<div class="num_container"><div class="after_num_container"  style="opacity:0;">'+__.helper.toNumClass(this.options.after )+'<i class="numF"></i></div></div>'
				+'</div>'
			);
			
			var list = [__.path.img("anim/floor-change/F.png")];
			_.times(9,function(n){
				list.push( __.path.img("anim/floor-change/" + n + ".png") )
			})
			var loader = __.preload(list,_.bind(this.startAnim,this));
			return this
		},
	}),
	
	EnemyEncounter : Backbone.View.extend({
		id:"enemy_encounter_view",
		initialize: function(options){
			this.options = options;
		},
		startAnim:function(){
			var _this = this;
			_this.$el.html('<div class="black_screen" style="height: 480px; width:320px; background-color:#000; position: absolute; opacity:0;"></div>');
			
			// Todo : iPhoneの良いやつでは滑らかにするのをメソッド化する
			var step = 1000/15;
			if(__.info.is_phonegap){
				var modelNumber = function(type){ return window.device.model.replace(type,"").slice(0,1).toNumber() }
				if( modelNumber("iPhone") >= 5 ||  modelNumber("iPod") >= 5 || modelNumber("iPad") >= 3 ){
					step = 1000/30;
				}
			}
			
			var jc = new jChrono({fps:30,updateTime:1000/30},{easing:"linear"});
			jc.start();
			
			jc.animate({
				duration: jc.frameToTime(10),
				step    : step,
				target  : _this.$el.find(".black_screen"),
				alpha   : [0,1],
			}).animate({
				duration: 300,
				delay:200,
				onFrame : function(k,anim){ if(anim.inFrame(1)) _this.options.nextAction(); },
				onEnd   : function(){
					_this.options.nextAction2();
				},
			}).animate({
				duration: jc.frameToTime(10),
				step    : step,
				target  : _this.$el.find(".black_screen"),
				alpha   : [1,0],
				onInit: function(){
					this.target.css("opacity",0)
				},
				onEnd   : function(){
					_this.trigger("close");
					_this.$el.trigger("play_anim_end");
					jc.stop();
				},
			})
			
			return this
		},
		render : function(){
			var list_1 = "attack_fx.png,attack_fx_enemy.png,capture_fail.png,capture_success.png,hit_fx_1.png,hit_fx_2.png";
			    list_1 = _.map(list_1.split(","),function(file){ return __.path.img("battle/fx/" + file); })
			var list_2 = "1.png,1_close.png,2.png,2_close.png,3.png,3_close.png";
			    list_2 = _.map(list_2.split(","),function(file){ return __.path.img("ui/packun/" + file); })
			var list_3 = "common/cmn_win_010.png,common/cmn_win_010_content.png,common/cmn_win_010_title.png,dungeon_ui/menu_info_bg_1.png";
			    list_3 = _.map(list_3.split(","),function(file){ return __.path.img("ui/" + file); })
			var loader = __.preload(list_1.concat(list_2).concat(list_3),_.bind(this.startAnim,this));
			return this
		},
	}),
	
	/*
		var anim = new App.anim.BossEncounter();
		var popup = App.popup.add(anim,{view_class:"bossencounter_anim"});
	*/
	BossEncounter : Backbone.View.extend({
		id:"bossencounter_anim_view",
		initialize: function(options){
			this.options = options;
		},
		anim_state: 0, 
		template: __.mustache('\
			<div class="black_screen" style="height: 480px; width:320px; background-color:#000; position: absolute; opacity:0.8;"></div>\
			<div class="bossencounter_anim_container">\
				<div class="keep_out_container">\
					<div class="keep_out_1"><div class="img"></div></div>\
					<div class="keep_out_2"><div class="img"></div></div>\
					<div class="keep_out_3"><div class="img"></div></div>\
					<div class="keep_out_4"><div class="img"></div></div>\
					<div class="keep_out_5"><div class="img"></div></div>\
				</div>\
				<div class="shadow_container">\
					<div class="shadow_1 opacity"><div class="img scale"></div></div>\
					<div class="shadow_2 opacity"><div class="img scale"></div></div>\
					<div class="shadow_3 opacity"><div class="img scale"></div></div>\
					<div class="shadow_4 opacity"><div class="img scale"></div></div>\
				</div>\
				<div class="text_container">\
					<div class="text_1   opacity"><div class="img y scale"></div></div>\
					<div class="text_2   opacity"><div class="img y scale"></div></div>\
					<div class="text_3   opacity"><div class="img y scale"></div></div>\
					<div class="text_4   opacity"><div class="img y scale"></div></div>\
				</div>\
			</div>\
			<div class="white_screen" style="height: 480px; width:320px; background-color:#fff; position: absolute; opacity:0;"></div>\
		'),
		startAnim:function(){
			var _this = this;
			var html = this.template({
			});
			_this.$el.html( html );
			
			var step = 1000/30;
			var jc = new jChrono({fps:30,updateTime:1000/30},{easing:"linear"});
			jc.start();
			_this.jc = jc;
			_this.$el.on("ftap",function(){ _this.tap() });
			
			// keep_out
			jc.animate({
				duration: jc.frameToTime(15),
				step    : step,
				target  : _this.$el.find(".keep_out_1 .img, .keep_out_4 .img, .keep_out_5 .img"),
				x       : [-1050,0],
			})
			jc.animate({
				duration: jc.frameToTime(15),
				step    : step,
				target  : _this.$el.find(".keep_out_2 .img, .keep_out_3 .img"),
				x       : [360,-680],
				onEnd   : function(){
					// shadow
					jc.animate({
						duration: jc.frameToTime(15),
						step    : step,
						target  : _this.$el.find(".shadow_1, .shadow_2, .shadow_3, .shadow_4, .shadow_5"),
						alpha   : [0.0,1],
					})
					jc.animate({
						duration: jc.frameToTime(15),
						step    : step,
						target  : _this.$el.find(".shadow_1 .img, .shadow_2 .img, .shadow_3 .img, .shadow_4 .img, .shadow_5 .img"),
						easing  : "easeInCirc",
						scale   : [0.5,1],
					})
					// text
					jc.animate({
						duration: jc.frameToTime(7),
						step    : step,
						target  : _this.$el.find(".text_1, .text_2, .text_3, .text_4, .text_5"),
						alpha   : [0.0,1],
					})
					jc.animate({
						duration: jc.frameToTime(7),
						step    : step,
						target  : _this.$el.find(".text_1 .img, .text_2 .img, .text_3 .img, .text_4 .img, .text_5 .img"),
						easing  : "easeInCirc",
						y       : [-80,0],
						onEnd   : function(){
							jc.animate({
								duration: jc.frameToTime(6),
								step    : step,
								target  : _this.$el.find(".keep_out_container"),
								onFrame : function(k,anim){
									if(anim.frameCnt % 2 == 0){
										anim.setStyle(anim.target, { y: -5 })
									}else{
										anim.setStyle(anim.target, { y: 5 })
									}
								},
							})
						},
					}).animate({
						duration: jc.frameToTime(4),
						step    : step,
						target  : _this.$el.find(".text_1 .img, .text_2 .img, .text_3 .img, .text_4 .img, .text_5 .img"),
						scaleX  : [1.25,0.75],
						scaleY  : [0.75,1.25],
					}).animate({
						duration: jc.frameToTime(2),
						step    : step,
						target  : _this.$el.find(".text_1 .img, .text_2 .img, .text_3 .img, .text_4 .img, .text_5 .img"),
						scaleX  : [0.75,1],
						scaleY  : [1.25,1],
						onEnd   : function(){
							
							// フェードアウト
							jc.animate({
								duration: jc.frameToTime(15),
								delay   : jc.frameToTime(20),
								step    : step,
								target  : _this.$el.find(".white_screen"),
								alpha   : [0,1],
							}).animate({
								duration: 300,
								delay:200,
								onFrame : function(k,anim){ if(anim.inFrame(1)) _this.options.nextAction(); },
								onEnd   : function(){
									_this.options.nextAction2();
								},
							}).animate({
								duration: jc.frameToTime(8),
								step    : step,
								target  : _this.$el,
								alpha   : [1,0],
								onFinish:function(){
									jc.stop();
									_this.trigger("close");
								},
							})
							
						},
					})
				},
			})
			
			
			jc.animate({
				duration: jc.frameToTime(15),
				step    : step,
				target  : _this.$el.find(".black_screen"),
				alpha   : [0,0.7],
				onInit  : function(){
					_this.$el.find(".shadow_1, .shadow_2, .shadow_3, .shadow_4, .shadow_5").css({"opacity":0})
					_this.$el.find(".text_1, .text_2, .text_3, .text_4, .text_5").css({"opacity":0})
				}
			})
			return this
		},
		render : function(){
			var list_1 = "attack_fx.png,attack_fx_enemy.png,capture_fail.png,capture_success.png,hit_fx_1.png,hit_fx_2.png";
			    list_1 = _.map(list_1.split(","),function(file){ return __.path.img("battle/fx/" + file); })
			var list_2 = "1.png,1_close.png,2.png,2_close.png,3.png,3_close.png";
			    list_2   = _.map(list_2.split(","),function(file){ return __.path.img("ui/packun/" + file); })
			var list_3 = "common/cmn_win_010.png,common/cmn_win_010_content.png,common/cmn_win_010_title.png,dungeon_ui/menu_info_bg_1.png";
			    list_3 = _.map(list_3.split(","),function(file){ return __.path.img("ui/" + file); })
			var list_4 = "keep_out.png,shadow.png,text_1.png,text_2.png,text_3.png,text_4.png";
			    list_4 = _.map(list_4.split(","),function(file){ return __.path.img("anim/encounter_boss/" + file); })
			var loader = __.preload(list_1.concat(list_2).concat(list_3).concat(list_4),_.bind(this.startAnim,this));
			return this
		},
	}),
	
	
	/*
		var before = {"id":54,"atk":200,"def":200,"mag":19,"exp":0,"fav":0,"hp":0,"lvl":1,"hp_full":800,"hp_per":0,"hp_time":1375300160213,"lim_lvl":0,"lim_lvl_max":20,"total_exp":0,"card_id":1031,"individual":[49,26,21,98],"skill":[10102101,20202101],"date":1428143501826,"card_seed_id":10310000};
		var after = {"id":54,"atk":222,"def":199,"mag":20,"exp":0,"fav":0,"hp":0,"lvl":2,"hp_full":801,"hp_per":0,"hp_time":1375300160213,"lim_lvl":0,"lim_lvl_max":20,"total_exp":20,"card_id":1031,"individual":[49,26,21,98],"skill":[10102101,20202101],"date":1428143501826,"card_seed_id":10310000};
		var anim = new App.anim.Powerup({ before:before, after:after });
		var popup = App.popup.add(anim,{view_class:"powerup_anim"});
	*/
	Powerup : Backbone.View.extend({
		id:"powerup_anim_view",
		initialize: function(options){
			this.after  = options.after;
			this.before = options.before;
		},
		tap: function(){},
		anim_state: 0, 
		toAnimResult: function(){
			for(var i=0;i<300;i++ ){
				if(this.anim_state<1) this.jc.nextFrame();
			}
		}, 
		toAnimEnd: function(){
			for(var i=0;i<300;i++ ){
				if(this.anim_state<2) this.jc.nextFrame();
			}
		},
		template: __.mustache('\
			<div class="black_screen" style="height: 480px; width:320px; background-color:#000; position: absolute; opacity:0.6;"></div>\
			<div class="powerup_anim_container">\
				<div class="fx_container">\
					<div class="halo_2"></div>\
					<div class="halo_1"></div>\
					<div class="text"></div>\
					<div class="text_light"></div>\
				</div>\
				<div class="chara_container">\
					<img class="chara" src="{{ img }}">\
				</div>\
				<div class="result_container">\
					<div class="result_wrapper">\
						レベルが上がりました！<br/>\
						{% if(before.lvl     != after.lvl    ){ %}レベル {{ before.lvl     }} → <i class="after">{{ after.lvl     }}</i><br/>{% } %}\
						{% if(before.hp_full != after.hp_full){ %}HP     {{ before.hp_full }} → <i class="after">{{ after.hp_full }}</i><br/>{% } %}\
						{% if(before.atk     != after.atk    ){ %}攻撃力 {{ before.atk     }} → <i class="after">{{ after.atk     }}</i><br/>{% } %}\
						{% if(before.def     != after.def    ){ %}防御力 {{ before.def     }} → <i class="after">{{ after.def     }}</i><br/>{% } %}\
						{% if(before.mag     != after.mag    ){ %}魔力   {{ before.mag     }} → <i class="after">{{ after.mag     }}</i><br/>{% } %}\
					</div>\
				</div>\
			</div>\
		'),
		startAnim:function(){
			var _this = this;
			var html = this.template({
				img    : __.path.card("l", st.CardData[this.after.card_id].gra_id ),
				before : this.before,
				after  : this.after,
			});
			_this.$el.html( html );
			
			var step = 1000/30;
			var jc = new jChrono({fps:30,updateTime:1000/30},{easing:"linear"});
			jc.start();
			_this.jc = jc;
			_this.$el.on("ftap",function(){ _this.tap() });
			_this.tap = _this.toAnimResult;
			
			jc.animate({
				duration: jc.frameToTime(3),
				step    : step,
				target  : _this.$el.find(".black_screen"),
				alpha   : [0,0.6],
			}).animate({
				duration: jc.frameToTime(20),
				step    : step,
				target  : _this.$el.find(".text"),
				easing  : "easeOutCirc",
				y       : [60,0],
				alpha   : [0,1],
			}).animate({
				duration: jc.frameToTime(14),
				step    : step,
				target  : _this.$el.find(".text_light"),
				easing  : "easeOutCirc",
				scale   : [1,1.4],
				alpha   : [1,0],
				onStart : function(){
					_this.$el.find(".halo_2").css("opacity",1);
					_this.$el.find(".halo_1").css("opacity",1);
				}
			}).animate({
				duration: jc.frameToTime(4),
				step    : step,
				target  : _this.$el.find(".text_light"),
				alpha   : [0,1],
			}).animate({
				duration: jc.frameToTime(4),
				step    : step,
				target  : _this.$el.find(".text_light"),
				alpha   : [1,0],
			}).animate({
				duration: jc.frameToTime(3),
				step    : step,
				target  : _this.$el.find(".result_container"),
				alpha   : [0,1],
				onInit  : function(){
					_this.$el.find(".text_light").css("opacity",0);
					_this.$el.find(".halo_2").css("opacity",0);
					_this.$el.find(".halo_1").css("opacity",0);
				},
				onEnd: function(){
					_this.anim_state = 1;
					_this.tap = function(){;
						_this.tap = function(){};
						jc.animate({
							duration: jc.frameToTime(4),
							step    : step,
							target  : _this.$el,
							alpha   : [1,0],
							onFinish:function(){
								jc.stop();
								_this.trigger("close");
							},
						})
					}
				},
			})
			return this
		},
		render : function(){
			var list = "halo_1.png,halo_2.png,text.png,text_light.png";
			    list = _.map(list.split(","),function(file){ return __.path.img("anim/powerup/" + file); })
			var loader = __.preload(list,_.bind(this.startAnim,this));
			return this
		},
	}),
	
	/*
		var before = {"id":54,"atk":200,"def":200,"mag":19,"exp":0,"fav":0,"hp":0,"lvl":1,"hp_full":800,"hp_per":0,"hp_time":1375300160213,"lim_lvl":0,"lim_lvl_max":20,"total_exp":0,"card_id":1031,"individual":[49,26,21,98],"skill":[10102101,20202101],"date":1428143501826,"card_seed_id":10310000};
		var after = {"id":54,"atk":222,"def":199,"mag":20,"exp":0,"fav":0,"hp":0,"lvl":1,"hp_full":801,"hp_per":0,"hp_time":1375300160213,"lim_lvl":1,"lim_lvl_max":20,"total_exp":20,"card_id":1031,"individual":[49,26,21,98],"skill":[10102101,20202101],"date":1428143501826,"card_seed_id":10310000};
		var anim = new App.anim.Limitup({ before:before, after:after });
		var popup = App.popup.add(anim,{view_class:"limitup_anim"});
	*/
	Limitup : Backbone.View.extend({
		id:"limitup_anim_view",
		initialize: function(options){
			this.after  = options.after;
			this.before = options.before;
		},
		tap: function(){},
		anim_state: 0, 
		toAnimResult: function(){
			for(var i=0;i<300;i++ ){
				if(this.anim_state<1) this.jc.nextFrame();
			}
		}, 
		toAnimEnd: function(){
			for(var i=0;i<300;i++ ){
				if(this.anim_state<2) this.jc.nextFrame();
			}
		},
		template: __.mustache('\
			<div class="black_screen" style="height: 480px; width:320px; background-color:#000; position: absolute; opacity:0.6;"></div>\
			<div class="limitup_anim_container">\
				<div class="fx_container">\
					<div class="halo_2"></div>\
					<div class="halo_1"></div>\
					<div class="break"></div>\
					<div class="break_fx"></div>\
					<div class="text"></div>\
					<div class="text_light"></div>\
				</div>\
				<div class="chara_container">\
					<img class="chara" src="{{ img }}">\
				</div>\
				<div class="result_container">\
					<div class="result_wrapper">\
						最大レベル上限が上がりました！<br/>\
						<br/>\
						最大レベル {{ before_max_level }} → <i class="after">{{ after_max_level }}</i><br/>\
					</div>\
				</div>\
			</div>\
		'),
		startAnim:function(){
			var _this = this;
			var mate = new Mate();
			var html = this.template({
				img    : __.path.card("l", st.CardData[this.after.card_id].gra_id ),
				before : this.before,
				after  : this.after,
				before_max_level: mate.getMaxLevel(this.before),
				after_max_level : mate.getMaxLevel(this.after),
			});
			_this.$el.html( html );
			
			var step = 1000/30;
			var jc = new jChrono({fps:30,updateTime:1000/30},{easing:"linear"});
			jc.start();
			_this.jc = jc;
			_this.$el.on("ftap",function(){ _this.tap() });
			_this.tap = _this.toAnimResult;
			
			jc.animate({
				duration: jc.frameToTime(3),
				step    : step,
				target  : _this.$el.find(".black_screen"),
				alpha   : [0,0.6],
			}).animate({
				duration: jc.frameToTime(20),
				step    : step,
				target  : _this.$el.find(".text"),
				easing  : "easeOutCirc",
				y       : [60,0],
				alpha   : [0,1],
			}).animate({
				duration: jc.frameToTime(14),
				step    : step,
				target  : _this.$el.find(".text_light"),
				easing  : "easeOutCirc",
				scale   : [1,1.4],
				alpha   : [1,0],
				onStart : function(){
					_this.$el.find(".halo_2").css("opacity",1);
					_this.$el.find(".halo_1").css("opacity",1);
					_this.$el.find(".break").css("opacity",1);
					jc.animate({
						duration: jc.frameToTime(25),
						step    : step,
						target  : _this.$el.find(".break_fx"),
						easing  : "easeOutCirc",
						alpha   : [1,0],
						scale   : [1,1.4],
					})
				}
			}).animate({
				duration: jc.frameToTime(4),
				step    : step,
				target  : _this.$el.find(".text_light"),
				alpha   : [0,1],
			}).animate({
				duration: jc.frameToTime(4),
				step    : step,
				target  : _this.$el.find(".text_light"),
				alpha   : [1,0],
			}).animate({
				duration: jc.frameToTime(3),
				step    : step,
				target  : _this.$el.find(".result_container"),
				alpha   : [0,1],
				onInit  : function(){
					_this.$el.find(".text_light").css("opacity",0);
					_this.$el.find(".halo_2").css("opacity",0);
					_this.$el.find(".halo_1").css("opacity",0);
					_this.$el.find(".break").css("opacity",0);
					_this.$el.find(".break_fx").css("opacity",0);
				},
				onEnd: function(){
					_this.anim_state = 1;
					_this.tap = function(){;
						_this.tap = function(){};
						jc.animate({
							duration: jc.frameToTime(4),
							step    : step,
							target  : _this.$el,
							alpha   : [1,0],
							onFinish:function(){
								jc.stop();
								_this.trigger("close");
							},
						})
					}
				},
			})
			return this
		},
		render : function(){
			var list = "break.png,halo_1.png,halo_2.png,text.png,text_light.png";
			    list = _.map(list.split(","),function(file){ return __.path.img("anim/limitup/" + file); })
			var loader = __.preload(list,_.bind(this.startAnim,this));
			return this
		},
	}),
	
	/*
		var anim = new App.anim.LoginBonus({ result:{time_type:1} });
		var popup = App.popup.add(anim,{view_class:"loginbonus_anim"});
	*/
	LoginBonus : Backbone.View.extend({
		id:"loginbonus_anim_view",
		initialize: function(options){
			this.result = options.result;
		},
		tap: function(){},
		okBtn: function(){},
		anim_state: 0, 
		toAnimResult: function(){
			for(var i=0;i<300;i++ ){
				if(this.anim_state<1) this.jc.nextFrame();
			}
		}, 
		toAnimEnd: function(){
			for(var i=0;i<300;i++ ){
				if(this.anim_state<2) this.jc.nextFrame();
			}
		},
		template: __.mustache('\
			<div class="black_screen" style="height: 480px; width:320px; background-color:#000; position: absolute; opacity:0.6;"></div>\
			<div class="loginbonus_anim_container">\
				<div class="fx_container">\
					<div class="halo_2"></div>\
					<div class="halo_1"></div>\
					<div class="text"></div>\
					<div class="text_light"></div>\
				</div>\
				<div class="bonus_list_container">\
					{% _.times(4,function(n){ if(n!=time_type){ %}\
						<div class="bonus bonus_{{ n+1 }}"><div class="bonus_shade"></div></div>\
					{% }}) %}\
					{% _.times(4,function(n){ if(n==time_type){ %}\
						<div class="bonus bonus_{{ n+1 }}"><div class="get_text"></div><div class="bonus_light"></div></div>\
					{% }}) %}\
				</div>\
				<div class="btn_container">\
					<div class="next_bonus_text">毎日4回 <i>魔石</i> のプレゼントがあるよ！</div>\
					<a class="ok_btn cmn_btn_1"><i>OK</i></a>\
				</div>\
			</div>\
		'),
		startAnim:function(){
			var _this = this;
			var html = this.template({
				result   : this.result,
				time_type: this.result.time_type,
			});
			_this.$el.html( html );
			
			var step = 1000/30;
			var jc = new jChrono({fps:30,updateTime:1000/30},{easing:"linear"});
			jc.start();
			_this.jc = jc;
			_this.$el.on("ftap",function(){ _this.tap() });
			_this.$el.on("ftap",".ok_btn",function(){ _this.okBtn() });
			//_this.tap = _this.toAnimResult;
			
			jc.animate({
				duration: jc.frameToTime(3),
				step    : step,
				target  : _this.$el.find(".black_screen"),
				alpha   : [0,0.6],
			}).animate({
				duration: jc.frameToTime(20),
				step    : step,
				target  : _this.$el.find(".text"),
				easing  : "easeOutCirc",
				y       : [60,0],
				alpha   : [0,1],
				onEnd   : function(k,anim){
					jc.animate({
						duration: jc.frameToTime(14),
						step    : step,
						target  : _this.$el.find(".text_light"),
						easing  : "easeOutCirc",
						scale   : [1,1.4],
						alpha   : [1,0],
						onStart : function(){
							_this.$el.find(".halo_2").css("opacity",1);
							_this.$el.find(".halo_1").css("opacity",1);
						}
					})
					for(var i=1 ; i <= 4; i++){
						jc.animate({
							duration: jc.frameToTime(14),
							delay   : jc.frameToTime(10 + i*3),
							step    : step,
							target  : _this.$el.find(".bonus_" + i),
							easing  : "easeOutBack",
							x       : [40,0],
							alpha   : [0,1],
							onEnd   : (i!=4)?function(){}:function(){
								anim.excuteChain();
							},
						})
					}
					
				},
				autoChain: false,
			}).animate({
				duration: jc.frameToTime(20),
				delay   : jc.frameToTime(10),
				step    : step,
				target  : _this.$el.find(".bonus_shade"),
				alpha   : [0,1],
			}).animate({
				duration: jc.frameToTime(20),
				delay   : jc.frameToTime(10),
				step    : step,
				target  : _this.$el.find(".bonus_light"),
				easing  : "easeOutCirc",
				scale   : [1,1.4],
				alpha   : [1,0],
				onStart : function(){
					_this.$el.find(".get_text").css({"opacity":1})
					jc.animate({
						delay   : jc.frameToTime(15),
						duration: jc.frameToTime(10),
						step    : step,
						target  : _this.$el.find(".get_text"),
						alpha   : [1,0.25],
					})
				},
			}).animate({
				duration: jc.frameToTime(10),
				step    : step,
				target  : _this.$el.find(".btn_container"),
				alpha   : [0,1],
			}).animate({
				duration: jc.frameToTime(3),
				step    : step,
				target  : _this.$el.find(".result_container"),
				alpha   : [0,1],
				onInit  : function(){
					_this.$el.find(".text_light").css("opacity",0);
					_this.$el.find(".halo_2").css("opacity",0);
					_this.$el.find(".halo_1").css("opacity",0);
					_this.$el.find(".bonus_light").css({"opacity":0});
					_this.$el.find(".get_text").css({"opacity":0});
					_this.$el.find(".btn_container").css({"opacity":0});
				},
				onEnd: function(){
					_this.anim_state = 1;
					_this.okBtn = function(){;
						_this.$el.off("ftap");
						jc.animate({
							duration: jc.frameToTime(4),
							step    : step,
							target  : _this.$el,
							alpha   : [1,0],
							onFinish:function(){
								jc.stop();
								_this.trigger("close");
							},
						})
					}
				},
			})
			return this
		},
		render : function(){
			var list = "1.png,2.png,3.png,4.png,bonus_light.png,get.png,halo_1.png,halo_2.png,next_bonus_text.png,text.png,text_light.png";
			    list = _.map(list.split(","),function(file){ return __.path.img("anim/login_bonus/" + file); })
			var loader = __.preload(list,_.bind(this.startAnim,this));
			return this
		},
	}),
	
	/*
		var anim = new App.anim.Gacha({ result:{} });
		var popup = App.popup.add(anim,{view_class:"gacha_anim"});
	*/
	Gacha : Backbone.View.extend({
		id:"gacha_anim_view",
		initialize: function(){
			this.pc = new PcREC();
			var result = this.pc.get("result").gacha_result;
			for(var i in result){
				_.extend( result[i], this.pc.getMateData(result[i].id) )
			}
			
			this.result = _.values(result);
			this.step = 1000/25;
			this.updateTime = 1000/25;
			this.fps = 25;;
			console.log("Gacha#result",result);
			console.log("Gacha#result",this.result);
			
		},
		template: __.mustache('\
			<div class="black_screen" style="height: 480px; width:320px; background-color:#000; position: absolute; opacity:0.6;"></div>\
			<div class="gacha_anim_container" style="opacity:0;">\
				<div class="reflection"></div>\
				<div class="circle_container">\
					<div class="circle_1 opacity"><div class="rotate"><div class="img scale"></div></div></div>\
					<div class="circle_2 opacity"><div class="rotate"><div class="img scale"></div></div></div>\
					<div class="circle_3 opacity"><div class="rotate"><div class="img scale"></div></div></div>\
					<div class="flare"></div>\
				</div>\
				<div class="break_container">\
					<div class="break_1"></div>\
					<div class="break_2"></div>\
					<div class="break_3"></div>\
				</div>\
				\
				{% _.each(result,function(data,n){ %}\
					<div class="gacha_result_container">\
						<div class="result_card card_{{ n }}">\
							<img class="card_img" src="{{ __.path.card("l",data.gra_id) }}">\
							<div class="card_name_container">\
								<div class="name">{{ data.name }}</div>\
								<div class="rarity rarity_icon_{{ data.rarity }}"></div>\
								<div class="attr attr_icon_{{ data.attribute }}"></div>\
								{% if(data.new_flag){ %}<div class="new_icon"></div>{% } %}\
							</div>\
							<div class="card_skill_container">\
								<div class="skill_1">スキル：{{ data.skill_data[0].name }}<br/>{{ data.skill_data[0].discription }}<br/></div>\
								<div class="skill_2">スキル：{{ data.skill_data[1].name }}<br/>{{ data.skill_data[1].discription }}<br/></div>\
							</div>\
						</div>\
					</div>\
				{% }) %}\
				\
				<div class="debris_container">\
					<div class="debris_1 opacity"><div class="img y"></div></div>\
					<div class="debris_2 opacity"><div class="img y"></div></div>\
					<div class="debris_3 opacity"><div class="img y"></div></div>\
				</div>\
			</div>\
			<div class="white_screen" style="height: 480px; width:320px; background-color:#fff; position: absolute; opacity:0;"></div>\
		'),
		enable_tap: 0, 
		disp_count: 0,
		tap: function(){
			var _this = this;
			var step = this.step;
			
			console.log("Gacha#result _this.enable_tap",_this.enable_tap)
			if(!_this.enable_tap){ return; }
			
			_this.disp_count += 1;
			if(this.result.length > _this.disp_count ){
				
				_this.jc.animate({
					duration: _this.jc.frameToTime(5),
					step    : step,
					target  : _this.$el.find(".white_screen"),
					alpha   : [0.6,0],
				})
				
				_this.$el.find(".break_3").css("opacity",1);
				_this.$el.find(".result_card.card_" + (_this.disp_count-1) ).css("opacity",0);
				_this.$el.find(".result_card.card_" + _this.disp_count     ).css("opacity",1);
				
				_this.jc.animate({
					duration: _this.jc.frameToTime(15),
					step    : step,
					target  : _this.$el.find(".debris_3"),
					easing  : "linear",
					alpha   : [0.75,0],
				})
				_this.jc.animate({
					duration: _this.jc.frameToTime(15),
					step    : step,
					target  : _this.$el.find(".debris_3 .y"),
					easing  : "easeInBack",
					y       : [0,100],
					onEnd   : function(){
						_this.enable_tap = 1;
					}
				})
				
			}else if(this.result.length == _this.disp_count ){
				_this.jc.animate({
					duration: _this.jc.frameToTime(4),
					step    : step,
					target  : _this.$el,
					alpha   : [1,0],
					onFinish:function(){
						_this.jc.stop();
						_this.trigger("close");
					},
				})
			}else{
			}
		},
		animInit: function(){
			var _this = this;
			var step = this.step;
			_this.$el.find(".gacha_anim_container").css("opacity",1);
			_this.jc.animate({
				onInit  : function(){
					_this.$el.find(".reflection").css("opacity",0);
					_this.$el.find(".circle_1").css("opacity",0);
					_this.$el.find(".circle_2").css("opacity",0);
					_this.$el.find(".circle_3").css("opacity",0);
					_this.$el.find(".flare").css("opacity",0);
					_this.$el.find(".break_1").css({"opacity":0});
					_this.$el.find(".break_2").css({"opacity":0});
					_this.$el.find(".break_3").css({"opacity":0});
					_this.$el.find(".debris_1").css({"opacity":0});
					_this.$el.find(".debris_2").css({"opacity":0});
					_this.$el.find(".debris_3").css({"opacity":0});
				},
			})
		},
		animCircle: function(){
			var _this = this;
			var step = this.step;
			
			// circle_1
			_this.jc_circle.animate({
				duration: _this.jc.frameToTime(20),
				step    : step,
				delay   : _this.jc.frameToTime(0),
				target  : _this.$el.find(".circle_1"),
				alpha   : [0,1],
			})
			_this.jc_circle.animate({
				duration: _this.jc.frameToTime(20),
				step    : step,
				delay   : _this.jc.frameToTime(0),
				target  : _this.$el.find(".circle_1 .img"),
				easing  : "easeOutBack",
				scale   : [0,1],
			})
			_this.jc_circle.animate({
				duration: _this.jc.frameToTime(200),
				step    : step,
				delay   : _this.jc.frameToTime(0),
				target  : _this.$el.find(".circle_1 .rotate"),
				rotate  : [0,1000],
			})
			
			// circle_2
			_this.jc_circle.animate({
				duration: _this.jc.frameToTime(20),
				step    : step,
				delay   : _this.jc.frameToTime(5),
				target  : _this.$el.find(".circle_2"),
				alpha   : [0,1],
			})
			_this.jc_circle.animate({
				duration: _this.jc.frameToTime(20),
				step    : step,
				delay   : _this.jc.frameToTime(5),
				target  : _this.$el.find(".circle_2 .img"),
				easing  : "easeOutBack",
				scale   : [0,1],
			})
			_this.jc_circle.animate({
				duration: _this.jc.frameToTime(200),
				step    : step,
				delay   : _this.jc.frameToTime(5),
				target  : _this.$el.find(".circle_2 .rotate"),
				rotate  : [0,-1000],
			})
			
			// circle_3
			_this.jc_circle.animate({
				duration: _this.jc.frameToTime(20),
				step    : step,
				delay   : _this.jc.frameToTime(10),
				target  : _this.$el.find(".circle_3"),
				alpha   : [0,1],
			})
			_this.jc_circle.animate({
				duration: _this.jc.frameToTime(20),
				step    : step,
				delay   : _this.jc.frameToTime(10),
				target  : _this.$el.find(".circle_3 .img"),
				easing  : "easeOutBack",
				scale   : [0,1],
			})
			_this.jc_circle.animate({
				duration: _this.jc.frameToTime(200),
				step    : step,
				delay   : _this.jc.frameToTime(10),
				target  : _this.$el.find(".circle_3 .rotate"),
				rotate  : [0,1000],
			})
			
			//flare
			_this.jc_circle.animate({
				duration: _this.jc.frameToTime(20),
				step    : step,
				target  : _this.$el.find(".flare"),
				alpha   : [0,1],
			})
		},
		
		startAnim:function(){
			var _this = this;
			var step = this.step;
			
			_this.jc = new jChrono({fps:this.fps,updateTime:this.updateTime},{easing:"linear"});
			_this.jc.start();
			_this.$el.on("ftap",function(){ _this.tap() });
			
			_this.jc_circle = new jChrono({fps:this.fps,updateTime:this.updateTime},{easing:"linear"});
			_this.jcCircleNext = function(){ _this.jc_circle.nextFrame(); };
			_this.jcCircleStop = function(){
				_this.jc.off("onFrame",_this.jcCircleNext);
				_this.jc_circle.stop();
			};
			_this.jc.on("onFrame",_this.jcCircleNext)
			
			
			_this.jc.animate({
				duration: _this.jc.frameToTime(3),
				step    : step,
				target  : _this.$el.find(".black_screen"),
				alpha   : [0,0.6],
			}).animate({
				duration: _this.jc.frameToTime(100),
				delay   : _this.jc.frameToTime(60),
				step    : step,
				target  : _this.$el.find(".white_screen"),
				onStart : _this.jcCircleStop,
				onFrame : function(k,anim){
					if( anim.inFrame(2) ){ anim.target.css("opacity",0  ); }
					if( anim.inFrame(0) ){
						_this.$el.find(".reflection").css("opacity",1);
						_this.$el.find(".break_1").css("opacity",1);
						anim.target.css("opacity",0.6);
						_this.jc.animate({
							duration: _this.jc.frameToTime(15),
							step    : step,
							target  : _this.$el.find(".debris_1"),
							easing  : "linear",
							alpha   : [0.75,0],
						})
						_this.jc.animate({
							duration: _this.jc.frameToTime(15),
							step    : step,
							target  : _this.$el.find(".debris_1 .y"),
							easing  : "easeInBack",
							y       : [0,100],
						})
					}
					
					if( anim.inFrame(32) ){ anim.target.css("opacity",0); }
					if( anim.inFrame(30) ){
						_this.$el.find(".break_1").css("opacity",0);
						_this.$el.find(".break_2").css("opacity",1);
						anim.target.css("opacity",0.6);
						_this.jc.animate({
							duration: _this.jc.frameToTime(15),
							step    : step,
							target  : _this.$el.find(".debris_2"),
							easing  : "linear",
							alpha   : [0.75,0],
						})
						_this.jc.animate({
							duration: _this.jc.frameToTime(15),
							step    : step,
							target  : _this.$el.find(".debris_2 .y"),
							easing  : "easeInBack",
							y       : [0,100],
						})
					}
					
					if( anim.inFrame(62) ){ anim.target.css("opacity",0); }
					if( anim.inFrame(60) ){
						_this.$el.find(".break_2").css("opacity",0);
						_this.$el.find(".break_3").css("opacity",1);
						anim.target.css("opacity",0.6);
						_this.$el.find(".result_card.card_0").css("opacity",1);
						
						_this.jc.animate({
							duration: _this.jc.frameToTime(15),
							step    : step,
							target  : _this.$el.find(".debris_3"),
							easing  : "linear",
							alpha   : [0.75,0],
						})
						_this.jc.animate({
							duration: _this.jc.frameToTime(15),
							step    : step,
							target  : _this.$el.find(".debris_3 .y"),
							easing  : "easeInBack",
							y       : [0,100],
							onEnd   : function(){
								_this.enable_tap = 1;
							}
						})
					}
				},
			})
			
			
			_this.animCircle();
			_this.animInit();
			
			return this
		},
		render : function(){
			var html = this.template({ result: this.result });
			this.$el.html( html );
			
			var list = "break_1.png,break_2.png,break_3.png,card_detail_name.png,circle_1.png,circle_2.png,circle_3.png,debris_1.png,debris_2.png,debris_3.png,flare.png,reflection.png,skill_detail.png";
			    list = _.map(list.split(","),function(file){ return __.path.img("anim/gacha/" + file); })
			var loader = __.preload(list,_.bind(this.startAnim,this));
			return this
		},
	}),
	
	CaveResult : Backbone.View.extend({
		initialize: function(option){
			this.$target = option.$target;
		},
		startAnim:function(){
			var _this = this;
			var $el           = this.$target;
			var $black_screen = $el.find(".result_black_screen");
			var $results      = $el.find(".result .num");
			var $clear_reward = $el.find(".clear_reward_container");
			var $result_btn   = $el.find(".result_btn");
			
			var jc = new jChrono({fps:30,updateTime:1000/30});
			jc.start();
			_this.jc = jc;
			jc.animate({
				delay   : jc.frameToTime(10),
				duration: jc.frameToTime(10),
				target  : $black_screen,
				easing  : "linear",
				alpha   : [1,0],
				onFinish:function(){
					$results.each(function(n,el){
						var is_last = (n==$results.length-1);
						jc.animate({
							delay   : jc.frameToTime(10 + n*2),
							duration: jc.frameToTime(6),
							target  : $(el),
							alpha   : [0,1],
							x       : [-15,0],
							onFinish:function(){
								if(!is_last) return;
								jc.animate({
									delay   : jc.frameToTime(5),
									duration: jc.frameToTime(15),
									target  : $clear_reward,
									alpha   : [0,1],
									x       : [-30,0],
									easing  : "easeOutElastic",
								}).animate({
									duration: jc.frameToTime(8),
									target  : $result_btn,
									alpha   : [0,1],
									x       : [-20,0],
									onEnd   : function(){
										$black_screen.css("display","none");
									},
								})
							},
						})
					})
				},
			})
			
			return this
		},
		render : function(){
			var list = "result_bg.png,result_clear.png,result_fail.png";
			    list = _.map(list.split(","),function(file){ return __.path.img("ui/dungeon_ui/" + file); })
			var loader = __.preload(list,_.bind(this.startAnim,this));
			return this
		},
	}),
	
}
}
return Animations
})

;
define('models/UserConfigREC',["models/PcREC"],function(PcREC){
	
	var UserConfigREC = Backbone.Model.extend({
		constructor:function(){
			if(!UserConfigREC.instance){
				UserConfigREC.instance = this;
				Backbone.Model.apply(UserConfigREC.instance,arguments);
			}
			return UserConfigREC.instance;
		},
		localStorage : new Backbone.LocalStorage("UserConfigREC"),
		defaults    :function(){
			this.pc = new PcREC;
			return{
				id :this.pc.get("id"),
				sound        : 1,
				battle_speed : 1,
				page_elem_num: 50,
				card_sort_key: "power",
			}
		},
		initialize:function(option){
			console.log("UserConfigREC#initialize");
			this.fetch();
			this.listenTo(this.pc,"reset_data",this.resetData);
			this.listenTo(this.pc,"fetch_user_id",this.fetchUserId);
			this.listenTo(this.pc,"change_user_id",this.changeUserId);
			this.save();
		},
		fetchUserId  : function(id){ console.log("UserConfigREC#fetchUserId",arguments); this.set("id",id).fetch() },
		changeUserId : function(id){ console.log("UserConfigREC#changeUserId",arguments); this.set("id",id).save() },
		resetData : function(pc_id,is_data_delete){
			this.destroy();
			this.attributes = (is_data_delete) ? {} : this.defaults();
			this.set("id",pc_id);
			this.save();
		},
	});
	
return UserConfigREC;

});

define('controllers/BattleAnimation',["models/PcREC","models/UserConfigREC"],function(PcREC,UserConfigREC){
	
/**
 * Animation Define
 */
	var jc;
	
	var BattleAnimation = Backbone.View.extend({
		constructor:function(){
			if(!BattleAnimation.instance){
				BattleAnimation.instance = this;
				Backbone.View.apply(BattleAnimation.instance,arguments);
			}
			return BattleAnimation.instance;
		},
		initialize : function(){
			var pc = new PcREC
			var userConfig = new UserConfigREC
			this.battleSpeed = userConfig.get("battle_speed");
			var time = 20 * this.battleSpeed;
			jc = new jChrono({fps:time,updateTime:1000/time},{easing:"linear"});
			this.jc = jc;
			jc.start();
		},
		
		effectHit:function($effect,view,side){
			var $smoke = $('<div class="hit_smoke"></div>');
			var $mark  = $('<div class="hit_mark"></div>');
			var $damage= $('<i class="chara_hp_diff_num">' + view.chara.get("damage") + '</i>');
			$effect.append($smoke).append($mark).append($damage);
			
			jc.animate({
				duration: jc.frameToTime(6),
				delay   : jc.frameToTime(7),
				easing  :"easeOutCirc",
				target  : $damage,
				y       :[0,-15],
				alpha   :[1,0],
				onEnd : function(){
					view.$el.trigger("play_anim_end","effectHit");
					$effect.remove();
				}
			})
			jc.animate({
				duration: jc.frameToTime(8),
				target  : $smoke,
				alpha   : [1,0],
				scale   : [1,1.2],
			})
			jc.animate({
				duration: jc.frameToTime(8),
				target  : $mark,
				onFrame : function(k,anim){
					if(anim.inFrame(0)) anim.setStyle(anim.target,{alpha:1});
					if(anim.inFrame(2)) anim.setStyle(anim.target,{alpha:0});
					if(anim.inFrame(4)) anim.setStyle(anim.target,{alpha:1});
					if(anim.inFrame(6)) anim.setStyle(anim.target,{alpha:0});
				},
			})
		},
		effectAttack:function($effect,view,side){
			console.log("BattleAnimation#effectAttack")
			var val = (side=="member")? -7 : 7 ;
			jc.animate({
				duration: jc.frameToTime(6),
				target  : $effect,
				onFrame : function(k,anim){
					if(anim.inFrame(0)) anim.setStyle(anim.target,{y:val*-2 ,alpha: 1   });
					if(anim.inFrame(2)) anim.setStyle(anim.target,{y:val*-1 ,alpha: 1   });
					if(anim.inFrame(4)) anim.setStyle(anim.target,{y:val* 0 ,alpha: 0.5 });
				},
				onEnd : function(){
					view.$el.trigger("play_anim_end","effectAttack");
					$effect.remove();
				}
			})
		},
		
		hpDamage:function(view,hp_per){
			var before_hp_per = (view.model.get("before_hp") / view.model.get("hp_full"))*100;
			var $hp_diff     = view.$el.find(".chara_hp_diff")
			jc.animate({
				duration: jc.frameToTime(6),
				delay   : jc.frameToTime(7),
				easing  :"easeOutCirc",
				target  : view.$el.find(".chara_hp_diff"),
				scaleX  : [before_hp_per/100,hp_per/100],
				onEnd   : function(){ view.$el.trigger("play_anim_end","hpDamage") }
			})
		},
		hpRemove:function(view){
			var alpha = (view.model.get("battle_side")=="member")?1:0;
			jc.animate({
				duration: jc.frameToTime(7),
				delay   : jc.frameToTime(6),
				target  : view.$el,
				alpha   :[1,alpha],
				onEnd   : function(){ view.$el.trigger("play_anim_end","hpRemove") }
			})
		},
		
		charaAttack:function(view,side){
			var rev = (side=="member")? -1 : 1;
			jc.animate({
				duration: jc.frameToTime(3),
				delay   : jc.frameToTime(16),
				easing  :"easeOutCirc",
				target  : view.$el,
				y       :[rev*12,0],
				onEnd   : function(){ view.$el.trigger("play_anim_end","charaAttack") }
			})
			this.battleLogView.addMessageAttack(view.model);
		},
		charaSkill:function(view,data){
			if(data.skill.scope == 1){
				var side = (data.type==1)? "member" : "enemy" ;
			}else{
				var side = (data.type==1)? "enemy" : "member" ;
			}
			
			// テスト用アニメ
			var $effect_view = $('#full_screen_effect_view');
			var $effect_container = $('<div class="effect_container" style="position:absolute; top:150px; left:160px; width:0px; height:0px;"></div>');
			$effect_view.append($effect_container);
			
			jc.animate({
				type   : "sprite",
				images : [__.path.img("battle/skill/fire_lv1.png")],
				frames : [ [2, 2, 300, 250], [304, 2, 300, 250], [606, 2, 300, 250], [2, 254, 300, 250], [304, 254, 300, 250], [606, 254, 300, 250], [2, 506, 300, 250], [304, 506, 300, 250], [606, 506, 300, 250], [2, 758, 300, 250], [304, 758, 300, 250], [606, 758, 300, 250] ],
				target : $effect_container,
				alpha  : [1,0],
				scale  : [1,1.5],
				rotate : [0,-720],
				onFrame: function(k,anim){
					if( anim.inFrame(3) ){
						//debugger
					}
				},
				onEnd  : function(){
					$effect_view.empty();
				},
			})
			
			// 敵ダメージ
			_.each(data.targets,function(target,n){
				if( target.get("before_hp") <= 0 ){ return } // 上のisAliveをisActiveに変えれば解決する
				target.trigger("play_hp_type", "hp_damage");
				target.trigger("play_effect_type", "effect_chara_damage", side );
			})
			
			// 味方攻撃
			var rev = (side=="member")? -1 : 1;
			jc.animate({
				duration: jc.frameToTime(3),
				delay   : jc.frameToTime(16),
				easing  :"easeOutCirc",
				target  : view.$el,
				y       :[rev*12,0],
				onEnd   : function(){ view.$el.trigger("play_anim_end","charaAttack") }
			})
			this.battleLogView.addMessageAttack(view.model);
		},
		charaDamage:function(view,side){
			var rev = (side=="member")?-3:3;
			jc.animate({
				duration: jc.frameToTime(8),
				target  : view.$el,
				onFrame : function(k,anim){
					if(anim.inFrame(0)) anim.setStyle(anim.target, {y:rev*2 });
					if(anim.inFrame(2)) anim.setStyle(anim.target, {y:rev*-1});
					if(anim.inFrame(4)) anim.setStyle(anim.target, {y:rev*0 });
				},
				onEnd   : function(){ view.$el.trigger("play_anim_end","charaDamage") }
			})
			var damage = view.model.get("hp") - view.model.get("before_hp");
			this.battleLogView.addMessageDamage(view.model, damage);
		},
		charaGuard:function(view,side){
			jc.animate({
				duration: jc.frameToTime(17),
				onFinish: function(){
					view.$el.trigger("play_anim_end","charaGuard");
				}
			})
			this.battleLogView.addMessageGuard(view.model);
		},
		effectGuard:function($effect,view,side){
			jc.animate({
				delay   : jc.frameToTime(5),
				duration: jc.frameToTime(4),
				target  : $effect,
				alpha   : [1,0],
			}).animate({
				duration: jc.frameToTime(12),
				target  : $effect,
				alpha   : [1,0],
				onFinish:function(){
					$effect.remove();
				},
				onInit  : function(){ $effect.css("opacity",0) },
			})
		},
		charaDeath:function(view){
			var side = view.model.get("battle_side");
			var alpha = (side=="member")? 0.4 : 0;
			jc.animate({
				duration: jc.frameToTime(7),
				delay   : jc.frameToTime(10),
				target  : view.$el,
				alpha   :[1,alpha],
				onEnd   : function(){ view.$el.trigger("play_anim_end","charaDeath") },
			})
		},
		turnChange:function(view,turn){
			console.log("BattleAnimation#turnChange");
			view.$el.html(''
				+'<div style="position:absolute; top:240px; display: block; text-align: center; background:rgba(0,0,0,0.5);">'
				+'<div class="turn" style="display: inline-block;">'
				+'TURN ' + turn
				+'</div>'
				+'</div>'
				)
			
			jc.animate({
				duration: jc.frameToTime(5),
				delay   : jc.frameToTime(5),
				easing  :"easeOutCirc",
				target  : view.$el.find(".turn"),
				x       :[40,0],
				alpha   :[0,1],
			}).animate({
				duration: jc.frameToTime(5),
				delay   : jc.frameToTime(7),
				easing  :"easeOutCirc",
				target  : view.$el.find(".turn"),
				x       :[0,-30],
				alpha   :[1,0],
				onEnd   : function(){
					console.log("BattleAnimation#turnChange#onEnd");
					view.$el.trigger("play_anim_end","turnChange");
					view.$el.empty();
				},
			}).animate({
				// 初期位置セット
				duration: jc.frameToTime(0),
				target  : view.$el.find(".turn"),
				alpha   :[0,1],
			})
			
			return
		},
		effectCapture:function(item_id, result, target, targetView, target_pos, callback){
			/*
			* todo: targetのmodelをtrrigerしてアニメを表示させる。捕獲失敗・成功の文字は別途表示する。
			*/
			var $effect_view = $("#full_screen_effect_view");
			$effect_view.html('\
				<div class="capture_effect_container">\
					<div class="packun_container packun_' + item_id + '">\
						<div class="packun_pos">\
							<div class="packun_icon"></div>\
							<div class="packun_icon_close"></div>\
						</div>\
						<div class="smoke_container">\
							<div class="smoke_alpha">\
								<div class="smoke"></div>\
							</div>\
						</div>\
					</div>\
					<div class="flash"></div>\
					<div class="result_text_success"></div>\
					<div class="result_text_fail"></div>\
				</div>\
			'.replace(/\t/g,""))
			
			var $flash               = $effect_view.find(".flash");
			var $packun_icon         = $effect_view.find(".packun_icon");
			var $packun_icon_close   = $effect_view.find(".packun_icon_close");
			var $packun_pos          = $effect_view.find(".packun_pos");
			var $smoke_container     = $effect_view.find(".smoke_container");
			var $smoke_alpha         = $effect_view.find(".smoke_alpha");
			var $smoke               = $effect_view.find(".smoke");
			var $result_text_success = $effect_view.find(".result_text_success");
			var $result_text_fail    = $effect_view.find(".result_text_fail");
			var packun_pos_x         = target_pos - (320/2)
			var packun_sclae         = 0.5;
			
			$packun_icon_close.css("opacity",0);
			$smoke_container.css("opacity",0);
			$result_text_success.css("opacity",0);
			$result_text_fail.css("opacity",0);
			
			// パックン縦位置
			jc.animate({
				duration: jc.frameToTime(4),
				target  : $packun_pos,
				y       :[60,-50],
				easing  :"easeOutCubic",
			}).animate({
				duration: jc.frameToTime(6),
				target  : $packun_pos,
				y       :[-50,40],
				easing  :"easeInCubic",
				onInit  : function(anim){
					anim.setStyle(anim.target,{y:60});
				},
			})
			
			// パックンアニメ
			jc.animate({
				duration: jc.frameToTime(10),
				target  : $packun_icon,
				x       :[0,packun_pos_x],
				scale   :[1,packun_sclae],
				alpha   :[0.3,1],
			}).animate({
				delay   : jc.frameToTime(1),
				duration: jc.frameToTime(6),
				onStart : function(anim){
					$flash.css("opacity",1);
					$packun_icon.css("opacity",0);
					targetView.$el.css("opacity",0);
					jc.animTool.setStyleWithVender($packun_icon_close,{ x:packun_pos_x ,y:0 ,alpha:1 ,scaleX:packun_sclae ,scaleY:packun_sclae ,rotate: 0 });
				}
			}).animate({
				duration: jc.frameToTime(4),
				target  : $flash,
				alpha   :[1,0],
			}).animate({
				delay   : jc.frameToTime(12),
				duration: jc.frameToTime(6),
				target  : $flash,
				alpha   :[1,0],
				onInit  : function(){
					$flash.css("opacity",0);
				},
				onStart : function(anim){
					jc.animTool.setStyleWithVender($smoke_container,{ x:target_pos ,y:0 ,alpha:1 ,scaleX:1 ,scaleY:1 ,rotate: 0 });
					jc.animate({ duration: jc.frameToTime(10), target  : $smoke_alpha, alpha   :[0.7,0]          , easing  :"linear",      })
					jc.animate({ duration: jc.frameToTime(10), target  : $smoke      , scale   :[1,1.7], y:[5,-5], easing  :"easeOutCirc", })
					
					if(result){
						targetView.$el.css("opacity",0);
						jc.animTool.setStyleWithVender($packun_icon_close,{ x:packun_pos_x ,y:0 ,alpha:1 ,scaleX:packun_sclae ,scaleY:packun_sclae ,rotate: 0 });
					}else{
						targetView.$el.css("opacity",1);
						jc.animTool.setStyleWithVender($packun_icon_close,{ x:packun_pos_x ,y:0 ,alpha:0 ,scaleX:packun_sclae ,scaleY:packun_sclae ,rotate: 0 });
					}
					
				},
				onEnd   : function(){
					var $result_text = (result)? $result_text_success : $result_text_fail;
					jc.animate({
						delay   : jc.frameToTime(1),
						duration: jc.frameToTime(8),
						target  : $result_text,
						alpha   :[0,1],
						x       :[30,0],
						easing  : "easeOutQuart",
					}).animate({
						delay   : jc.frameToTime(4),
						duration: jc.frameToTime(8),
						target  : $result_text,
						alpha   :[1,0],
						x       :[0,-30],
						easing  : "easeOutQuart",
					}).animate({
						duration: jc.frameToTime(4),
						onEnd   : function(){
							$(".capture_effect_container").remove();
							callback();
						},
						onInit  : function(){
							$result_text.css("opacity",0);
						}
					})
				}
			})
			
			return
			callback();
		},
	});
	
	return BattleAnimation;
})

;
define('controllers/BattleChara',[
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

;
define('models/CaveMapMake',[],function(){
	
	var CaveMapMake = Backbone.Model.extend({
		defaults   : function(){ return {} },
		initialize : function(){},
		make:function(caveMapData){
			var config = {x:8,y:8,margin:1,times:3,min:10};
			_.extend(config,caveMapData);
			var stage  = {};
			stage = this.generate(config);
			
			var result = {stage:stage,stage_config:config}
			var try_cnt =0;
			for(;;){
				try_cnt += 1;
				result = this.retry(result.stage,result.stage_config);
				if(result.retry == false){
					console.log("CaveMapMake#make [try_cnt]",try_cnt);
					stage = result.stage;
					break
				}
			}
			
			stage = this.trim(stage);
			stage = this.embedData(stage);
			
			//console.log("CaveMapMake#make [stage]","total:"+stage.x*stage.y,"num:"+stage.num,stage);
			return stage;
		},
		embedData:function(stage){
			
			// 別の座標を調べたとき、undefinedの条件になるのをふせぐため、marginを追加する
			stage = this.margin(stage,{top:2,bottom:2,left:2,right:2});
			
			// 012
			// 345
			// 678
			var cnt = 0;
			var map_data = [];
			var M = stage.mark;
			for(var i=0;i<stage.y;i++){
				map_data[i] = [];
				for(var j=0;j<stage.x;j++){
					map_data[i].push([]);
					map_data[i][j] = {
						type:df.MAP_TYPE_WALL,
						//wall:0,
						gra:[0,0,0,0,0,0,0,0,0],
					};
					if( i < 2 ||  j < 2 || i > stage.y-2 || j > stage.x-2 ){
					}else if(stage.map[i][j] == M ){
						map_data[i][j].type = df.MAP_TYPE_FLOOR;
						if( stage.map[i-1][j] != M ){ map_data[i][j].gra[1] = 1; }
						if( stage.map[i+1][j] != M ){ map_data[i][j].gra[7] = 1; }
						if( stage.map[i][j-1] != M ){ map_data[i][j].gra[3] = 1; }
						if( stage.map[i][j+1] != M ){ map_data[i][j].gra[5] = 1; }
						
						if( stage.map[i-1][j-1] != M && map_data[i][j].gra[1] != 1 && map_data[i][j].gra[3] != 1 ){ map_data[i][j].gra[0] = 1; }
						if( stage.map[i-1][j+1] != M && map_data[i][j].gra[1] != 1 && map_data[i][j].gra[5] != 1 ){ map_data[i][j].gra[2] = 1; }
						if( stage.map[i+1][j-1] != M && map_data[i][j].gra[7] != 1 && map_data[i][j].gra[3] != 1 ){ map_data[i][j].gra[6] = 1; }
						if( stage.map[i+1][j+1] != M && map_data[i][j].gra[7] != 1 && map_data[i][j].gra[5] != 1 ){ map_data[i][j].gra[8] = 1; }
						
						if( map_data[i][j].gra[1] == 1 && map_data[i][j].gra[3] == 1 ){ map_data[i][j].gra[0] = 2; }
						if( map_data[i][j].gra[1] == 1 && map_data[i][j].gra[5] == 1 ){ map_data[i][j].gra[2] = 2; }
						if( map_data[i][j].gra[7] == 1 && map_data[i][j].gra[3] == 1 ){ map_data[i][j].gra[6] = 2; }
						if( map_data[i][j].gra[7] == 1 && map_data[i][j].gra[5] == 1 ){ map_data[i][j].gra[8] = 2; }
						//console.log("CaveMapMake#embedData", cnt + "| " + i +":"+ j ,map_data[i][j].gra.join(""));
					}else{
						map_data[i][j].type = df.MAP_TYPE_WALL;
						map_data[i][j].gra[4]   = 1;
						if( stage.map[i-1][j  ] == M ){ map_data[i][j].gra[1] = 1; }
						if( stage.map[i+1][j  ] == M ){ map_data[i][j].gra[7] = 1; }
						if( stage.map[i  ][j-1] == M ){ map_data[i][j].gra[3] = 1; }
						if( stage.map[i  ][j+1] == M ){ map_data[i][j].gra[5] = 1; }
						
						if( stage.map[i-1][j-1] == M && stage.map[i-1][j] != M && stage.map[i][j-1] != M ){ map_data[i][j].gra[0] = 1; }
						if(                             stage.map[i-1][j] == M && stage.map[i][j-1] == M ){ map_data[i][j].gra[0] = 1; }
						if( stage.map[i-1][j+1] == M && stage.map[i-1][j] != M && stage.map[i][j+1] != M ){ map_data[i][j].gra[2] = 1; }
						if(                             stage.map[i-1][j] == M && stage.map[i][j+1] == M ){ map_data[i][j].gra[2] = 1; }
						if( stage.map[i+1][j-1] == M && stage.map[i+1][j] != M && stage.map[i][j-1] != M ){ map_data[i][j].gra[6] = 1; }
						if(                             stage.map[i+1][j] == M && stage.map[i][j-1] == M ){ map_data[i][j].gra[6] = 1; }
						if( stage.map[i+1][j+1] == M && stage.map[i+1][j] != M && stage.map[i][j+1] != M ){ map_data[i][j].gra[8] = 1; }
						if(                             stage.map[i+1][j] == M && stage.map[i][j+1] == M ){ map_data[i][j].gra[8] = 1; }
					}
				}
			}
			for(var i=0;i<stage.y;i++){
				for(var j=0;j<stage.x;j++){
					map_data[i][j].gra_id = map_data[i][j].gra.join("");
				}
			}
			
			stage.map = map_data;
			stage = this.margin(stage,{top:-2,bottom:-2,left:-2,right:-2});
			stage.data = stage.map;
			
			//console.log("CaveMapMake#embedData [map_data]",map_data);
			return stage;
		},
		trim:function(stage){
			//現在のマージンを取得
			var margin = {};
			
			var break_flag = false;
			for(var i=0; i<stage.y; i++){
				margin.top = i;
				for(var j=0; j<stage.x; j++){
					if(stage.map[i][j] == stage.mark ){ break_flag = true; break }
				};
				if(break_flag){ break }
			};
			
			var break_flag = false;
			for(var i=stage.y-1; i>0; i--){
				margin.bottom = stage.y - i - 1;
				for(var j=0; j<stage.x; j++){
					if(stage.map[i][j] == stage.mark ){ break_flag = true; break }
				};
				if(break_flag){ break }
			};
			
			var break_flag = false;
			for(var i=0; i<stage.x; i++){
				margin.left = i;
				for(var j=0; j<stage.y; j++){
					if(stage.map[j][i] == stage.mark ){ break_flag = true; break }
				};
				if(break_flag){ break }
			};
			
			var break_flag = false;
			for(var i=stage.x-1; i>0; i--){
				margin.right = stage.x - i - 1;
				for(var j=0; j<stage.y; j++){
					if(stage.map[j][i] == stage.mark ){ break_flag = true; break }
				};
				if(break_flag){ break }
			};
			
			//console.log("CaveMapMake#trim [margin]",margin);
			
			var trim = {
				top   :stage.margin - margin.top   ,
				bottom:stage.margin - margin.bottom,
				left  :stage.margin - margin.left  ,
				right :stage.margin - margin.right ,
				
			};
			
			return this.margin(stage,trim);
			
		},
		margin:function(stage,trim){
			//マージンを調整
			
			if(trim.top > 0){
				for(var i=0;i<trim.top;i++){
					stage.map.unshift( stage.row.slice(0) )
				}
			}else{
				for(var i=0;i<trim.top*-1;i++){
					stage.map.shift()
				}
			}
			if(trim.bottom > 0){
				for(var i=0;i<trim.bottom;i++){
					stage.map.push( stage.row.slice(0) )
				}
			}else{
				for(var i=0;i<trim.bottom*-1;i++){
					stage.map.pop()
				}
			}
			stage.y = stage.map.length;
			
			if(trim.left > 0){
				for(var i=0;i<trim.left;i++){
					for(var j=0;j<stage.y;j++){
						stage.map[j].unshift(0)
					}
				}
			}else{
				for(var i=0;i<trim.left*-1;i++){
					for(var j=0;j<stage.y;j++){
						stage.map[j].shift()
					}
				}
			}
			if(trim.right > 0){
				for(var i=0;i<trim.right;i++){
					for(var j=0;j<stage.y;j++){
						stage.map[j].push(0)
					}
				}
			}else{
				for(var i=0;i<trim.right*-1;i++){
					for(var j=0;j<stage.y;j++){
						stage.map[j].pop()
					}
				}
			}
			stage.x = stage.map[0].length;
			stage.row = [];
			for(var i=0; i<stage.x; i++){ stage.row.push(0) };
			
			return stage;
		},
		retry:function(stage,stage_config,pieces){
			//var thisFn = arguments.callee
			var result = {retry:false}
			if(stage.num < stage.min){
				if(stage.x>15){ stage_config.x += -5; }
				if(stage.y>15){ stage_config.x += -5; }
				if(stage.times<100){ stage_config.times += 10; }
				stage = this.generate(stage_config,pieces);
				if(stage.num < stage.min){
					result.retry = true;
					result.stage = stage;
					result.stage_config = stage_config;
					result.pieces = pieces;
					return result
				}else{
					result.retry = false;
					result.stage = stage;
					return result
				}
			}else{
				result.retry = false;
				result.stage = stage;
				return result
			}
		},
		generate:function(stage_config,pieces){
			
			var stage  = {
				x    : 30, // mapのxサイズ
				y    : 30, // mapのyサイズ
				row  : [], // 一行のデフォルト配列を入れておく
				maked: [], // 作成直後のmapを保存
				map  : [], // 作成後のmapを保存し、マーキングする
				peak : 0,  // 塗りつぶし時の最大値を保存
				mark : "M", // 塗りつぶしに使う数値
				num  : 0,  // markされた数
				times: 20, // pieceを置く回数
				data : [], // mapを元に加工した実データを入れる
				fillstart:[0,0],// 塗りつぶし基点の保存
				min  : 10,  // 条件を下回った場合のtry条件
				trylimit:10, // try回数の最大
			};
			
			//塗りつぶし用変数
			var navi = {
				map:[[0,0]],
				next:[[0,0]]
			};
			
			//stage_configをコピー
			if(_.isObject(stage_config)){
				_.extend(stage,stage_config);
			}
			
			//piecesのデフォルト値
			if(!_.isArray(pieces)){
				var pieces = [
					[
						[0,0,1,1,0],
						[0,1,-3,-3,1],
						[1,1,-3,0,1],
						[0,0,1,1,0],
						[0,0,1,0,0],
					],
				];
			}
			
			//errorチェック
			//大きさ確認
			for(var i=0; i<pieces.length; i++){
				if(stage.y < pieces[i].length){
					alert("stageサイズよりpieceの方が大きいです");
				}
				if(stage.x < pieces[i][0].length){
					alert("stageサイズよりpieceの方が大きいです");
				}
			}
			
			//全体の空map作成
			for(var i=0; i<stage.x; i++){ stage.row.push(0) };
			for(var i=0; i<stage.y; i++){ stage.maked.push( stage.row.slice(0) ) };
			
			//重ねてランダムmap作成
			var offset = {x:0,y:0};
			var patchwork = function(piece){
				offset.x = _.random(0,stage.x - piece[0].length);
				offset.y = _.random(0,stage.y - piece.length);
				for(var i=0; i<piece.length; i++){
					for(var j=0; j<piece[i].length; j++){
						stage.maked[i + offset.y][j + offset.x] += piece[i][j];
					};
				};
			}
			for(var i=0; i<stage.times; i++){
				patchwork(pieces[ _.random(0,pieces.length-1) ])
			};
			stage.map = _.cloneDeep(stage.maked);
			
			//開始基点の作成
			//mapの最大数を調べ、
			for(var i=0; i<stage.y; i++){
				for(var j=0; j<stage.x; j++){
					if(stage.peak < stage.map[i][j]){
						stage.peak = stage.map[i][j];
					}
				};
			};
			//そこを基点にする
			for(var i=0; i<stage.y; i++){
				for(var j=0; j<stage.x; j++){
					if(stage.peak == stage.map[i][j]){
						navi.map[0][1] = j;
						navi.map[0][0] = i;
						stage.fillstart[1]  = j;
						stage.fillstart[0]  = i;
						break
					}
				};
			};
			
			// 塗りつぶす
			for(var i=0; i<1000; i++){
				navi.next = [];
				for(var j=0; j<navi.map.length; j++){
					if( navi.map[j][0] != stage.mark  &&  navi.map[j][0] > 0            &&  typeof stage.map[navi.map[j][0]-1]                   !== "undefined"  &&  stage.map[navi.map[j][0]-1][navi.map[j][1]  ] !== stage.mark  &&  stage.map[navi.map[j][0]-1][navi.map[j][1  ]] > 0 ){ stage.map[navi.map[j][0]-1][navi.map[j][1]  ] = stage.mark; navi.next.push([navi.map[j][0]-1,navi.map[j][1]  ]); }
					if( navi.map[j][1] != stage.mark  &&  navi.map[j][1] < stage.x - 1  &&  typeof stage.map[navi.map[j][0]  ][navi.map[j][1]+1] !== "undefined"  &&  stage.map[navi.map[j][0]  ][navi.map[j][1]+1] !== stage.mark  &&  stage.map[navi.map[j][0]  ][navi.map[j][1]+1] > 0 ){ stage.map[navi.map[j][0]  ][navi.map[j][1]+1] = stage.mark; navi.next.push([navi.map[j][0]  ,navi.map[j][1]+1]); }
					if( navi.map[j][0] != stage.mark  &&  navi.map[j][0] < stage.y - 1  &&  typeof stage.map[navi.map[j][0]+1]                   !== "undefined"  &&  stage.map[navi.map[j][0]+1][navi.map[j][1]  ] !== stage.mark  &&  stage.map[navi.map[j][0]+1][navi.map[j][1]  ] > 0 ){ stage.map[navi.map[j][0]+1][navi.map[j][1]  ] = stage.mark; navi.next.push([navi.map[j][0]+1,navi.map[j][1]  ]); }
					if( navi.map[j][1] != stage.mark  &&  navi.map[j][1] > 0            &&  typeof stage.map[navi.map[j][0]  ][navi.map[j][1]-1] !== "undefined"  &&  stage.map[navi.map[j][0]  ][navi.map[j][1]-1] !== stage.mark  &&  stage.map[navi.map[j][0]  ][navi.map[j][1]-1] > 0 ){ stage.map[navi.map[j][0]  ][navi.map[j][1]-1] = stage.mark; navi.next.push([navi.map[j][0]  ,navi.map[j][1]-1]); }
				}
				navi.map = navi.next.slice(0);
				if(navi.next.length == 0){
					//console.log("CaveMapMake#generate --end--:" + i);
					break
				}
			}
			
			// 有効map数をカウント
			for(var i=0; i<stage.y; i++){
				for(var j=0; j<stage.x; j++){
					if(stage.map[i][j] == stage.mark ){
						stage.num += 1;
					}
				};
			};
			return stage
		},
	});
	
	return CaveMapMake;
});






define('models/CaveMapREC',[
	"models/PcREC",
	"models/CaveMapMake",
],function(PcREC,CaveMapMake){
	
	/**
	 * Mapの生成と、生成したMapの保存をするクラス。
	 * @class CaveMapREC
	 */
	var CaveMapREC = Backbone.Model.extend({
		constructor:function(){
			// シングルトン
			if(!CaveMapREC.instance){
				CaveMapREC.instance = this;
				Backbone.Model.apply(CaveMapREC.instance,arguments);
			}
			return CaveMapREC.instance;
		},
		defaults    : function(){ return this.defaultAttr() },
		defaultAttr : function(){
			this.pc = new PcREC;
			return{
				id               :this.pc.get("id"),
				x                : 1,
				y                : 1,
				num              : 1,
				positive_num     : 0,
				negative_num     : 0,
				make_data        :{},
				scratch_data     :{},
				chip_size        : 60,
				floor_gra_id     : 1,
				floor_sub_gra_id : 0,
				wall_gra_id      : 2,
				bg_color         : "000",
				i_id_namespace   :"i",
				a_id_namespace   :"a",
				map      : [],
				scratches: {},
				boss_data_str   : "",
				is_exist_boss   : 0,
				is_boss_defeated: 0,
			}
		},
		validate : function(attrs,opt){
			if( this.get("id") != this.pc.get("id") ){
				return "id compere is not pc id :" + this.get("id") + "-"  + this.pc.get("id");
			}
		},
		error:function(model,e){
			console.error("CaveMapREC#error [model,e]",[model,e])
		},
		localStorage : new Backbone.LocalStorage("CaveMapREC"),
		/**
		 * CaveMapRECのinitialize処理。fetchでMapをロードしてくる。
		 * @memberof CaveMapREC
		 * @function initialize
		 */
		initialize : function(){
			console.log("CaveMapREC#initialize");
			this.pc = new PcREC;
			this.fetch();
			
			this.extendProp();
			this.listenTo(this,"invalid",this.error);
			this.listenTo(this.pc,"reset_data",this.resetData);
			this.listenTo(this.pc,"fetch_user_id",this.fetchUserId);
			this.listenTo(this.pc,"change_user_id",this.changeUserId);
			this.save();
		},
		fetchUserId  : function(id){ console.log("CaveMapREC#fetchUserId",arguments); this.set("id",id).fetch() },
		changeUserId : function(id){ console.log("CaveMapREC#changeUserId",arguments); this.set("id",id).save() },
		resetData : function(pc_id,is_data_delete){
			this.destroy();
			this.attributes = (is_data_delete) ? {} : this.defaults();
			this.set("id",pc_id);
			this.save();
		},
		/**
		 * いくつかのメンバを、attributes下ではなく、modelに直接追加する。(x,y,num,scratches)
		 * @memberof CaveMapREC
		 * @function extendProp
		 */
		extendProp:function(){
			this.x   = this.attributes.x   = this.attributes.make_data.x  ;
			this.y   = this.attributes.y   = this.attributes.make_data.y  ;
			this.num = this.attributes.num = this.attributes.make_data.num;
			this.scratches = _.cloneDeep(this.attributes.scratches);
		},
		/**
		 * defaultAttrでreset
		 * @memberof CaveMapREC
		 * @function reset
		 */
		reset :function(){
			this.attributes = {};
			this.attributes = this.defaultAttr();
			return this;
		},
		/**
		 * 新しくMapを生成する
		 * @memberof CaveMapREC
		 * @function newMap
		 * @param list_id {int} CaveRECに保存したQuestListData.xlsのid。
		 * @param floor {int} 今いるフロア+1を渡す。
		 */
		newMap : function(list_id,floor,floor_data){
			var questListData = _.clone(st.QuestListData[list_id]);
			var caveMapData = st.CaveMapData[floor_data.cave_map_id];
			caveMapData.peaces = _(caveMapData.peace_data.split("-")).reduce(function(result,id,n){
				result[n] = st.CaveMapPeaceData[id];
				return result;
			},[]);
			
			var caveMapMake = new CaveMapMake;
			var make_data = caveMapMake.make(caveMapData)
			_.extend(this.attributes,caveMapData);
			this.set("id", this.pc.get("id") );
			this.set("caveMapData", st.CaveMapData[floor_data.cave_map_id] );
			this.set("questListData", questListData );
			this.set("make_data", make_data );
			this.set("map", make_data.map );
			console.log("CaveMapREC#newMap [make_data]",make_data);
			
			// BOSS関連
			var scratch_table = st.CaveScratchDataMin[ floor_data.scratch_id ];
			var boss_data     = _.find(scratch_table,function(data){ return data[1]==df.EVENT_BOSS });
			var is_knot_floor = ( floor == questListData.floor_max || floor == floor_data.floor ); 
			var is_exist_boss = ( is_knot_floor && boss_data != undefined) ? 1 : 0; 
			this.set("boss_data_str", (is_exist_boss) ? boss_data[2] : "" );
			this.set("is_exist_boss", is_exist_boss );
			
			return this;
		},
		/**
		 * scratchesを作成してsetする。
		 * @memberof CaveMapREC
		 * @function makeScratches
		 * @param list_id {int} CaveRECに保存したquest_id(QuestListData.xlsのid)
		 * @param scratch_id {int} 。QuestListDataのscratch_id[]
		 */
		makeScratches : function(list_id,scratch_id){
			
			//drawする
			var scratch_num   = this.attributes.make_data.num
			var empty_per     = _.random( 60, 75 ) / 100;
			var draw_max      = ( (1-empty_per) * ( scratch_num - 1 ) ).ceil();
			var draw_result   = this.drawScratches(scratch_num,draw_max,scratch_id);
			console.log("CaveMapREC#makeScratches [draw_result]",draw_result);
			
			//作ったdraw_resultに座標idを振る
			var map_data = this.get("make_data").data;
			var scratches = {};
			var cnt = 0;
			// todo 有効要素数とdraw_resultの数があってるかチェック入れる
			for(var i=0; i<map_data.length; i++){
				for(var j=0; j<map_data[i].length; j++){
					if(map_data[i][j].type == df.MAP_TYPE_FLOOR){
						scratches[i+"-"+j] = {
							id        :i+"-"+j,
							event_type:draw_result[cnt].event_type,
							//event_id  :draw_result[cnt].event_id,
							event_data:draw_result[cnt].event_data,
							y         :i,
							x         :j,
						}
						cnt += 1;
					}
				}
			}
			console.log("CaveMapREC#makeScratches [scratches]",scratches);
			
			this.set("scratches",scratches);
			return this
			
		},
		
		/**
		 * makeScratchesで使う。Scratchのdataをdrawして決定する。。
		 * @memberof CaveMapREC
		 * @function drawScratches
		 * @param scratch_num {int} mapの床数
		 * @param draw_max {int} 。scratch_numに空白率を掛けたもの
		 * @param scratch_id {int} 。QuestListDataのscratch_id[]
		 */
		drawScratches:function(scratch_num,draw_max,scratch_id){
			//draw todo drawScratchesのdefault値を作る
			console.log("CaveMapREC#drawScratches [scratch_id]",scratch_id);
			//var scratch_table = st.CaveScratchDataAll[ scratch_id ];
			var scratch_table = st.CaveScratchDataMin[ scratch_id ];
			scratch_table = this.scratchTableToObject(scratch_id,scratch_table)
			console.log("CaveMapREC#drawScratches [scratch_table]",scratch_table);
			
			//変数準備
			var scratch_data = {}
			scratch_data.lot_max = _.reduce(scratch_table,function(sum,data,n){ return sum + data.rate  },0)
			scratch_data.lot_num = [];
			scratch_data.lot_sum = [];
			scratch_data.elect_indexs = []
			
			//draw処理。scratch_dataにdraw結果を保存していく
			for(var j=0; j<draw_max; j++){
				scratch_data.lot_num[j] = _.random(0,scratch_data.lot_max);
				scratch_data.lot_sum[j] = 0;
				for(var i=0;i<scratch_table.length;i++){
					scratch_data.lot_sum[j] += scratch_table[i].rate;
					scratch_data.elect_indexs[j] = i;
					if(scratch_data.lot_num[j] < scratch_data.lot_sum[j] ){ break }
				}
			}
			
			//drawしたindexから、実際のscratchデータを作成
			var draw_result = _(scratch_data.elect_indexs).reduce(function(result,elect_index){
				var res = {
					event_type:scratch_table[elect_index].event_type,
					//event_id  :scratch_table[elect_index].event_id,
					event_data:scratch_table[elect_index].event_data,
				}
				result.push(res);
				return result
			},[])
			
			//超過分を削除
			//draw_result = draw_result.slice(0,draw_max);
			
			//残りマス分空白マスデータを追加
			for(var i=0; i< scratch_num - 1 - draw_max ; i++){
				//draw_result.push({event_type:df.EVENT_EMPTY,event_id:0})
				draw_result.push({event_type:df.EVENT_EMPTY,event_data:""})
			}
			
			//階段データを追加
			//draw_result.push({event_type:df.EVENT_KAIDAN,event_id:0})
			draw_result.push({event_type:df.EVENT_KAIDAN,event_data:""})
			
			//shuffleして完成
			draw_result = _.shuffle(draw_result);
			
			return draw_result
		},
		scratchTableToObject:function(id,scratch_table_list){
			//var scratch_table = {};
			var scratch_table = [];
			for(var i in scratch_table_list){
				//scratch_table[id] = [];
				for(var j in scratch_table_list[i]){
					//scratch_table[id][j] = {
					scratch_table[i] = {
						group     :id,
						rate      :scratch_table_list[i][0],
						event_type:scratch_table_list[i][1],
						event_data:scratch_table_list[i][2],
					}
				}
			}
			console.log("CaveMapREC#scratchTableToObject [id, scratch_table_list, scratch_table]",[id, scratch_table_list, scratch_table]);
			return scratch_table
		},
		makeCaveScratchDataAll:function(){
			var all_obj = {}
			for(var i in st.CaveScratchDataMin){
				all_obj[i] = this.scratchTableToObject( i, st.CaveScratchDataMin[i] );
			}
			return all_obj
		},
		/**
		 * Mapのイベントに数値パラメータ付与。(入手するお金やトラップのダメージなど)
		 * @memberof CaveMapREC
		 * @function setScratchEventNum
		 * @param difficulty {int} 難易度。QuestListData.xlsのlevel[]
		 */
		setScratchEventNum : function( difficulty ){
			
			var neutral_num = 0;
			var positive_num= 0;
			var negative_num= 0;
			
			var scratches = _( this.get("scratches") ).map(function(scratch,key){
				if(scratch.event_type == df.EVENT_KAIDAN){
					neutral_num += 1;
					scratch.event_num = 0;
				}
				if(scratch.event_type == df.EVENT_EMPTY){
					neutral_num += 1;
					scratch.event_num = 0;
				}
				if(scratch.event_type == df.EVENT_GAME_MONEY){
					positive_num += 1;
					var get_num = (scratch.event_data).toNumber() * difficulty * 10 * _.random(90,110) / 100;
					scratch.event_num = get_num.floor();
				}
				if(scratch.event_type == df.EVENT_REAL_MONEY){
					positive_num += 1;
					var get_num = (scratch.event_data).toNumber() ;
					scratch.event_num = get_num.floor();
				}
				if(scratch.event_type == df.EVENT_GACHA_POINT){
					positive_num += 1;
					var get_num = (scratch.event_data).toNumber() * difficulty * 10 * _.random(90,110) / 100;
					scratch.event_num= get_num.floor();
				}
				if(scratch.event_type == df.EVENT_PHRASE){
					positive_num += 1;
					scratch.event_num = 0;
				}
				if(scratch.event_type == df.EVENT_ITEM){
					positive_num += 1;
					scratch.event_num = 1;
				}
				if(scratch.event_type == df.EVENT_ENEMY || scratch.event_type == df.EVENT_MIMIC){
					negative_num += 1;
					var enemy_lvl = 100 * difficulty * _.random(90,110) / 100;
					scratch.event_num = enemy_lvl.floor();
				}
				if(scratch.event_type == df.EVENT_TRAP){
					negative_num += 1;
					//var damage = scratch.event_id * difficulty * 10 * _.random(90,110) / 100;
					var damage = 100 * difficulty * _.random(90,110) / 100;
					scratch.event_num = damage.floor();
				}
				return scratch
			});
			
			this.set("positive_num",positive_num);
			this.set("negative_num",negative_num);
			this.set("scratches",scratches.value());
			console.log("CaveMapREC#setScratchEventNum [scratches]",scratches);
			return this
		},
	});
	
	return CaveMapREC;
});






define('models/CaveREC',[
	"models/PcREC",
	"models/Mate",
	"models/Quest",
	"models/CaveMapREC",
],function(PcREC,Mate,Quest,CaveMapREC){
	
	// todo CaveMapRECとscratchデータのIDが一致するかバリデーションする
	
	/**
	 * ダンジョン情報のmodel。シングルトン。
	 * @class CaveREC
	 */
	var CaveREC = Backbone.Model.extend({
		constructor:function(){
			// シングルトン
			if(!CaveREC.instance){
				CaveREC.instance = this;
				Backbone.Model.apply(CaveREC.instance,arguments);
			}
			return CaveREC.instance;
		},
		defaults    : function(){ return this.defaultAttr() },
		defaultAttr : function(){
			var mate = new Mate;
			var member_default = mate.defaultAttr();
			member_default.status = {atk:-10,def:-10};
			this.pc = new PcREC;
			var defaultItemData = function(){
				var data = {};
				data[df.ITEM_GAME_MONEY]      = {point:0,time:0};
				data[df.ITEM_GACHA_POINT]     = {point:0,time:0};
				data[df.ITEM_REAL_MONEY_FREE] = {point:0,time:0};
				return data;
			}
			return {
				id            :this.pc.get("id") ,
				quest_id      :1,
				start_data    :{},
				item_data     :{},
				first_touch   :0,
				start_scratch :{id:"1-1",x:1,y:1},
				member_max    :4,
				member_num    :1,
				floor_before  :0,
				floor_now     :1,
				open_num      :0,
				close_num     :0,
				positive_num  :0,
				positive_open :0,
				negative_num  :0,
				negative_open :0,
				difficulty    :0,
				result        :{
					got_phrase_data:[], 
					got_item_data  :defaultItemData(),
					lost_item      :defaultItemData()                                                                                                                                          ,
					get_member_list:[
						// 以下の4つを保存
						// { card_seed_id: 0, lvl: 0, skill: [], individual: [] },
					],
					get_treasure      :0,
					enemy_win_count   :0,
					enemy_escape      :0,
					open_event        :[], //{type:1,id:0}
					is_clear          :0,
					clear_reward      :[],
					clear_first_reward:[],
				},
				status        :{
					item_effect:{},
					play:df.STATE_CAVE_BEFORE,
					play_result:0, //0:あきらめ 1クリア 2:全滅
				},
				members       :{"1":member_default},
				members_start :{"1":member_default},
				scratches     :{"1-1":{oepn:0,show:0},"1-2":{oepn:0,show:1},"1-3":{oepn:1,show:1},"1-4":{oepn:2,show:0},},
			}
		},
		validate : function(attrs,opt){
			if( this.get("id") != this.pc.get("id") ){
				return "id compere is not pc id :" + this.get("id") + "-"  + this.pc.get("id");
			}
			var diff = _.difference( _.keys(attrs) , _.keys(this.defaults()) );
			if(_.compact(diff).length>0) return __.exception("ERR_MODEL_SET_INVALID",diff);
		},
		error:function(model,e){
			console.error("CaveREC#error [model,e]",[model,e]);
		},
		localStorage : new Backbone.LocalStorage("CaveREC"),
		/**
		 * ダンジョンのinitialize処理。fetchでロードする。
		 * @memberof CaveREC
		 * @function initialize
		 */
		initialize : function(){
			console.log("CaveREC#initialize");
			this.pc = new PcREC;
			this.mate = new Mate;
			this.quest = new Quest;
			this.caveMap = new CaveMapREC;
			this.fetch();
			this.listenTo(this,"invalid",this.error);
			this.listenTo(this.pc,"reset_data",this.resetData);
			this.listenTo(this.pc,"fetch_user_id",this.fetchUserId);
			this.listenTo(this.pc,"change_user_id",this.changeUserId);
			this.save();
		},
		fetchUserId  : function(id){ console.log("CaveREC#fetchUserId",arguments); this.set("id",id).fetch() },
		changeUserId : function(id){ console.log("CaveREC#changeUserId",arguments); this.set("id",id).save() },
		resetData : function(pc_id,is_data_delete){
			this.destroy();
			this.attributes = (is_data_delete) ? {} : this.defaults();
			this.set("id",pc_id);
			this.save();
		},
		define:{
			PLAY_BEFORE:1,
			PLAY_NOW   :2,
			PLAY_AFTER :3,
			BATTLE_OFF :4,
			BATTLE_ON  :5,
		},
		/**
		 * ダンジョン情報をdefaultAttrでreset
		 * @memberof CaveREC
		 * @function reset
		 */
		reset : function(){
			this.attributes = {};
			this.attributes = this.defaultAttr();
			return this;
		},
		/**
		 * 1スクラッチの履歴を記録(this.attributes.result.open_event)
		 * @memberof CaveREC
		 * @function scratchLogger
		 */
		scratchLogger:function(scratch){
			console.log("CaveREC#scratchLogger [scratch]",scratch);
			//this.attributes.result.open_event.push({ type:scratch.get("event_type"),id:scratch.get("event_id") })
			this.attributes.result.open_event.push({ type:scratch.get("event_type"),data:scratch.get("event_data") })
		},
		createMemberParty:function(){
			var members = {};
			_( this.pc.get("deck") ).compact().each(function(id,n){
				members[id] = this.pc.getMateData(id,false);
				members[id].pos = n;
			},this)
			this.set("members",members);
			this.set("members_start",_.cloneDeep(members));
		},
		createItemData: function(){
			var item_data = {}
				item_data[df.ITEM_PACKUN_NORMAL] = this.pc.getItem(df.ITEM_PACKUN_NORMAL);
				item_data[df.ITEM_PACKUN_SUPER]  = this.pc.getItem(df.ITEM_PACKUN_SUPER);
				item_data[df.ITEM_PACKUN_DRAGON] = this.pc.getItem(df.ITEM_PACKUN_DRAGON);
			this.set("item_data",item_data)
		},
		addGetItem : function(item_id,item_num){
			var got_item_data = this.attributes.result.got_item_data;
			if( _.has(got_item_data,item_id) ){
				got_item_data[item_id].point += item_num;
			}else{
				got_item_data[item_id] = {id: item_id, point : item_num};
			};
			console.log("CaveREC#addGetItem [item_id,got_item_data]", [item_id,got_item_data])
		},
		addGetPhrase : function(item_id,item_num){
			this.attributes.result.got_phrase_data.push(item_id);
			console.log("CaveREC#addGetItem [item_id,got_phrase_data]",[item_id, this.attributes.result.got_phrase_data])
		},
	});
	
	return CaveREC;
});






define('models/BattleREC',[
	"models/Mate",
	"models/PcREC",
	"models/CaveREC",
""],function(Mate,PcREC,CaveREC){
	
	var BattleREC = Backbone.Model.extend({
		constructor:function(){
			if(!BattleREC.instance){
				BattleREC.instance = this;
				Backbone.Model.apply(BattleREC.instance,arguments);
			}
			return BattleREC.instance;
		},
		defaults    : function(){
			this.pc = new PcREC;
			return{
				id :this.pc.get("id"),
				turn_list     :[],
				next_turn_list:[],
				current_turn  :0,
				total_new_turn:0,
				total_turn    :0,
				members       :[],
				enemys        :[],
				is_default    :true,
				item_data     :{},
				is_boss       :0,
				is_got_reward :0,
			}
		},
		localStorage : new Backbone.LocalStorage("BattleREC"),
		initialize : function(){
			console.log("BattleREC#initialize");
			this.mate = new Mate;
			this.cave = new CaveREC;
			this.fetch();
			this.set("members", this.get("members").sort(function(a,b){ return b.position - a.position }) )
			this.listenTo(this.pc,"reset_data",this.resetData);
			this.listenTo(this.pc,"fetch_user_id",this.fetchUserId);
			this.listenTo(this.pc,"change_user_id",this.changeUserId);
			this.save();
		},
		fetchUserId  : function(id){ console.info("BattleREC#fetchUserId",arguments); this.set("id",id).fetch() },
		changeUserId : function(id){ console.info("BattleREC#changeUserId",arguments); this.set("id",id).save() },
		resetData : function(pc_id,is_data_delete){
			this.destroy();
			this.attributes = (is_data_delete) ? {} : this.defaults();
			this.set("id",pc_id);
			this.save();
		},
		validate : function(attrs,opt){
			console.info("BattleREC#validate");
			if( this.get("id") != this.pc.get("id") ){
				return "id compere is not pc id :" + this.get("id") + "-"  + this.pc.get("id");
			}
			var diff = _.difference( _.keys(attrs) , _.keys(this.defaults()) );
			if(_.compact(diff).length>0) throw __.exception("ERR_MODEL_SET_INVALID",diff);
		},
		error : function(model,error,opt){
			console.error("BattleREC#error",error);
		},
		getCurrentTurn:function(){
			if(this.get("turn_list").length - 1 < this.get("current_turn") ){
				console.error("BattleREC#getCurrentTurn 最後のターンが終了しています");
				return -1;
			}else{
				return this.get("turn_list")[ this.get("current_turn") ];
			}
		},
		incTurn:function(){
			this.set("current_turn", this.get("current_turn") + 1 );
			this.set("total_turn"  , this.get("total_turn") + 1 );
			return this
		},
		getLastActionMember : function(){
			var current_turn = this.get("current_turn");
			var list = _.filter(this.get("turn_list"),function(turn,n){ return current_turn>=n && turn.turn_type=="player" });
			var turn = (list.length>0)? _.last(list) : _.find(this.get("turn_list"),function(turn){ return turn.turn_type=="player" }) ;
			return _.find(this.get("members"),function(member){ return member.id==turn.id });
		},
		getDispTurnData : function(members, enemys){
			//var members        = this.get("members");
			//var enemys         = this.get("enemys");
			var turn_list      = this.get("turn_list");
			var current_turn   = this.get("current_turn");
			var disp_turn_data = _.reduce(turn_list,function(result,turn,n){
				if(n<current_turn) return result;
				
				var side = (turn.turn_type=="player")? members : enemys ;
				var chara = side.get(turn.id);
				if(chara.isInactive()) return result;
				
				result.push({
					id : turn.id,
					turn_type : turn.turn_type,
					disp_num : result.length,
				})
				return result
			},[]);
			return disp_turn_data
		},
		//save:function(){
		//	//保存したくないのでオーバーライド
		//},
		createEnemyParty:function(enemy_ids,lvl_data){
			__.checkType("undefined",[enemy_ids,lvl_data]);
			
			//lvl_dataは数字、または配列で渡す。数字の場合、enemyと同じ長さの配列を作成する。
			if(_.isNumber(lvl_data)){
				lvl_data = _.map(new Array(enemy_ids.length),function(){ return lvl_data })
			}
			if(enemy_ids.length != lvl_data.length){ throw "createEnemyParty : 敵の数とレベルデータの数が一致しません"; }
			
			var enemys = _.map(enemy_ids,function(enemy_id,n){
				var enemy_data = this.createEnemyData(enemy_id,lvl_data[n])
				enemy_data.id = n+1;
				return enemy_data;
			},this)
			
			console.log("BattleREC#createEnemyParty [enemys]", enemys);
			return enemys;
		},
		createEnemyData:function(enemy_id,lvl){
			if(!_.has(st.CardSeedData,enemy_id)){ throw "enemy_id " + enemy_id + "が見つかりません"; }
			
			var enemy_data = st.CardSeedData[enemy_id];
			if(lvl > st.CardData[enemy_data.card_id].lvl_max){
				lvl = st.CardData[enemy_data.card_id].lvl_max;
				console.warn("BattleREC#createEnemyData enemyに指定されたlvlがCardDataのlvl_maxをオーバーしています");
			}
			var enemy      = this.mate.createMate(enemy_data.id, {lvl:lvl});
			var add_data   = this.mate.makeMateStatus(enemy);
			var card_data  = _.clone(st.CardData[enemy.card_id]);
			var offset_status = {
				atk : ( enemy.atk     * (enemy_data.pow_ofs[0] + 100) / 100 ).floor(),
				def : ( enemy.def     * (enemy_data.pow_ofs[1] + 100) / 100 ).floor(),
				mag : ( enemy.mag     * (enemy_data.pow_ofs[2] + 100) / 100 ).floor(),
				hp  : ( enemy.hp_full * (enemy_data.pow_ofs[3] + 100) / 100 ).floor(),
				img_type :"l",
				battle_side :"enemy",
			}
			
			return _.extend(card_data,enemy,add_data,offset_status);
		},
		
		//ターンデータを作成する
		createTurn:function(members, enemys){
			console.log("BattleMgr#createTurn");
			//戦闘に参加してるモンスターだけにする
			var members = members.filter(function(chara){ return chara.isActive() });
			var enemys  = enemys.filter(function(chara){ return chara.isActive() });
			
			//敵、味方のターンデータ作成
			var members_turn = this.assignTurn( members          , this.lotTurn(members.length), "player" );
			var enemys_turn  = this.assignTurn( _.shuffle(enemys), this.lotTurn(enemys.length ), "enemy"  );
			
			//敵、味方のターンデータを結合、lotでソートして順序決定
			//自分を必ず一番にする
			members_turn[0].lot = -1;
			var turn_list = _.union(members_turn,enemys_turn).sort(function(a,b){ return a.lot - b.lot });
			console.info("BattleREC#createTurn [turn_list]",turn_list)
			
			if(this.get("turn_list").length == 0){
				//現在のターンデータが無かったらそこに保存し、
				//次のターンデータを作るためにもう一度createTurnを実行する
				this.set("turn_list", turn_list );
				this.createTurn(members, enemys);
				return
			}else{
				this.set("next_turn_list", turn_list );
				this.set("current_turn", 0 );
				this.set("total_new_turn", this.get("total_new_turn") + 1 );
				this.save();
				return
			}
		},
		lotTurn:function(num){
			console.log("BattleMgr#lotTurn");
			var lot_list = _.map(new Array(num),function(){ return _.random(1,100) })
			return lot_list.sort(function(a,b){ return a - b })
		},
		assignTurn:function(members,lots,type){
			console.log("BattleMgr#assignTurn");
			//memberにターン順を付加したオブジェクトを返す
			return _.map(lots,function(lot,n){
				return {
					lot  :lot,
					id   :members[n].id,
					turn_type :type,
				}
			});
		},
		
		// 敵を捕まえる処理
		captureRate : function(item_id,enemy){
			var rarity_data = {
				1 :{ name: "N" , base:   0, coefficient: 1.00, adjust: 0 },
				2 :{ name: "R" , base: -10, coefficient: 0.40, adjust: 0 },
				3 :{ name: "SR", base: -40, coefficient: 0.10, adjust: 0 },
				4 :{ name: "UR", base: -80, coefficient: 0.02, adjust: 0 },
			}
			var packun_data = {
				50 :{ name: "ノーマル", base:  0, coefficient: 1, adjust: 0 },
				51 :{ name: "スーパー", base: 10, coefficient: 2, adjust: 2 },
				52 :{ name: "ドラゴン", base: 40, coefficient: 8, adjust:10 },
			}
			var hp        = enemy.get("hp")/enemy.get("hp_full") * 100;
			var rarity    = rarity_data[enemy.get("rarity")];
			var packun    = packun_data[item_id];
			var rare_val  = st.CardSeedData[enemy.get("card_seed_id")].get_rate;
			
			var kakuritsu = ((100 - hp + rarity.base + packun.base) * rarity.coefficient * packun.coefficient + rarity.adjust + packun.adjust)*rare_val;
			    kakuritsu = kakuritsu.floor().clamp(0,10000);
			console.log("BattleMgr#captureRate 捕獲確率:" + (kakuritsu/100) + "%");
			return kakuritsu;
		},
		capture : function(item_id, enemy_id, enemys){
			if(this.attributes.item_data[item_id] <= 0){
				// todo throwにし、アイテム不足ダイアログを別途作る
				console.error("アイテムが足りません");
				return false
			}
			this.attributes.item_data[item_id] -= 1;
			var enemy = enemys.get(enemy_id);
			
			var kakuritsu = this.captureRate(item_id,enemy);
			var lot       = _.random(1,10000);
			var result    = (kakuritsu>=lot);
			
			if(result){
				enemy.set("captured",1);
				enemy.set("captured_item",item_id);
				this.set("enemys", enemys.toJSON());
			}
			this.save();
			App.mission.checkProcess("USE_PACKUN");
			
			return result
		},
		
		// 戦闘終了処理
		// members, enemysはBattleManagerに保存しているデータを渡す
		battleResult : function(result, members, enemys){
		
			// 使用アイテム処理
			this.cave.set("item_data", _.cloneDeep(this.get("item_data")) );
			
			// hpやスキルの状態をコピー
			var cave_members = this.cave.get("members");
			members.each(function(member){
				var cave_member = _.find(cave_members,function(cave_member){ return cave_member.id == member.id });
				_.each(member.transferAttr(),function(attr,key){
					cave_member[key] = _.cloneDeep(member.attributes[key]);
				})
			})
			
			if(result=="win"){
				// 敵の獲得処理
				var get_enemy_list = this.getCaptureList(enemys);
				var get_enemys = _.reduce(get_enemy_list,function(result,enemy,n){
					result.push({
						card_seed_id : enemy.get("card_seed_id"),
						lvl          : enemy.get("lvl"),
						skill        : [enemy.get("skill_data")[0].id, enemy.get("skill_data")[1].id],
						individual   : enemy.get("individual"),
						time         : __.baseTime(),
					})
					return result
				},[])
				var cave_result = this.cave.get("result");
				cave_result.get_member_list = cave_result.get_member_list.concat(get_enemys);
				
				//討伐報酬処理
				var get_win_reward = this.getBattleReward(enemys);
				_.each(get_win_reward, function(num,key){
					this.cave.addGetItem(key,num);
				},this)
			}
			
			this.cave.save();
		},
		getCaptureList : function(enemys){
			return enemys.filter(function(enemy){ return enemy.get("captured") == 1 })
		},
		getBattleReward : function(enemys){
			var rewards = {}
			rewards[df.ITEM_GAME_MONEY]
			var game_money = _.reduce(enemys.toJSON(),function(sum,enemy){
				var sell_price = this.mate.getSellPrice(enemy);
				return sum + (sell_price/10).floor();
			},0,this)
			if(game_money) rewards[df.ITEM_GAME_MONEY] = game_money;
			
			return rewards
		},
	});
	
	return BattleREC;
});






define('models/BattleEnemyAi',[
],function(){
	
	var BattleEnemyAi = Backbone.Model.extend({
		constructor:function(){
			if(!BattleEnemyAi.instance){
				BattleEnemyAi.instance = this;
				Backbone.Model.apply(BattleEnemyAi.instance,arguments);
			}
			return BattleEnemyAi.instance;
		},
		initialize:function(prop,option){
			this.enemys  = option.enemys;
			this.members = option.members;
		},
		decideCommand : function(turn,chara,data){
			this.turn  = turn;
			this.chara = chara;
			this.battle_data  = data;
			
			var ai_id = chara.get("ai_id");
			    ai_id = (ai_id)? ai_id : 0 ;
			var command = ["atk","guard","skill1","skill2"];
			var command_index = _.bind(this.aiData[ai_id],this)();
			var result = {
				list  : command,
				type  : command[command_index],
				index : command_index,
			}
			console.log("BattleEnemyAi#decideCommand [result,chara]",[result,chara]);
			return result
		},
		checkSkillRemain : function(command_rate){
			// スキル回数が0だったら確率を0にする。その分通常攻撃の確率に足す。
			if(this.chara.get("skill_data")[0].use_remain == 0){
				command_rate[0] += command_rate[2];
				command_rate[2] = 0;
			}
			if(this.chara.get("skill_data")[1].use_remain == 0){
				command_rate[0] += command_rate[3];
				command_rate[3] = 0;
			}
			return command_rate;
		},
		randomCommand : function(command_rate){
			// 単純なランダムでコマンドを決定する。
			command_rate = this.checkSkillRemain(command_rate);
			//console.debug("BattleEnemyAi#randomCommand [command_rate]",command_rate);
			var rot_sum = _.reduce( command_rate , function(memo, num){ return memo + num; }, 0);
			var rot = _.random(1,rot_sum);
			var command_index = 0;
			for(var i in command_rate){
				if(command_rate[i]-rot>=0){
					command_index = i.toNumber();
					break
				}else{
					rot -= command_rate[i];
				}
			}
			return command_index
		},
		aiData : {
			0 : function(){
				return this.randomCommand([10,10,10,10]);
				return this.randomCommand([60,10,15,15]);
			}
		}
	});
	
	return BattleEnemyAi;
})

;
define('models/BattleManager',[
	'models/BattleREC',
	'models/BattleEnemyAi',
	'controllers/BattleAnimation',
],function(BattleREC,BattleEnemyAi,BattleAnimation){
/**
 * BattleState
 * 状態管理のためのクラス
 */
	var BattleState = Backbone.Model.extend({
		
		//抽象メソッド
		click        :function(){ console.log("BattleState#click"); this.startBattle() },
		commandEvent :function(){},
		next         :function(){ console.log("BattleState#next"); this.startBattle() },
		animEndEnemy :function(){},
		animEndMember:function(){},
		
		//抽象メソッドをリセット
		resetAbstract:function(){
			console.log("BattleState#resetAbstract");
			this.click         = function(){};
			this.commandEvent  = function(){};
			this.next          = function(){};
			this.animEndEnemy  = function(){};
			this.animEndMember = function(){};
		},
		
		//オーバーライド用する処理メンバ
		beginBattleDisp :function($deferred){ $deferred.resolve(); /* $deferredを渡して、本来の処理が終わったらresolveする */ },
		beginNextTurn   :function($deferred){ $deferred.resolve(); /* $deferredを渡して、本来の処理が終わったらresolveする */ },
		battleResult    :function(result){ /* "lose" or "win" */ },
		loseResult      :function(){},
		checkTurn       :function(){ return false },
		memberCombat    :function(){},
		enemyCombat     :function(){},
		checkAbleAnimEndEnemy :function(){ return false },
		checkAbleAnimEndMember:function(){ return false },
		
		//状態メソッド
		startBattle:function(){
			console.info("--------------- BattleState#startBattle ---------------");
			
			//戦闘の準備をし、nextActionをbattleViewにイベントで投げてを実行してもらう。
			
			this.resetAbstract();
			
			var nextAction = _.bind(function(){
				console.log("BattleState#startBattle#nextAction");
				if(this.battle.get("turn_list")[0].turn_type=="enemy"){
					var _this = this;
					setTimeout(function(){
						_this.next = _this.nextTurn;
						_this.next();
					},1000)
				}else{
					this.next = this.nextTurn;
					this.next();
				}
			},this)
			
			this.trigger("battle_start",nextAction)
			
			return
		},
		nextTurn:function(){
			console.log("BattleState#nextTurn");
			
			//行動中の CharaView で play_anim_end が発火すると
			//    trigger("play_anim_end") > CharaView#animEnd > Chara#turnEnd > trigger("chara_turn_end") >
			//    BattleMgr#animEndMember > BattleState#checkAnimEndMember > BattleState#nextTurn
			//    と辿ってこの処理へ移る。どのcharaもplay_anim_endを発火するので、checkAbleAnimEndMemberで行動キャラ判定をする。
			
			//自分か敵のタンーンか判断し
			//$.Deferredで演出の完了を待ったあと、
			//自分だったらコマンドのみ受け付ける状態にして終了
			//敵だったら敵の攻撃処理へ移る
			this.resetAbstract();
			
			var $deferred = new $.Deferred;
			var turn_type = this.checkTurn();
			var disp_turn_data = this.battle.getDispTurnData(this.members,this.enemys);
			
			this.command.disableCommand(); //commandを利かなくし、レンダリング
			this.members.each(function(chara){
				var turn = _.find(disp_turn_data,function(data){ return chara.id==data.id && data.turn_type=="player" });
				var turn_num = (typeof turn=="undefined")? -1 : turn.disp_num;
				chara.set("disp_turn",turn_num);
				chara.set("is_action_turn", (turn_num==0) );
			})
			this.enemys.each(function(chara){
				var turn = _.find(disp_turn_data,function(data){ return chara.id==data.id && data.turn_type=="enemy" });
				var turn_num = (typeof turn=="undefined")? -1 : turn.disp_num;
				chara.set("disp_turn",turn_num);
				chara.set("is_action_turn", (turn_num==0) );
			})
			
			if( turn_type == "player" ){
				this.beginNextTurn($deferred);
				$deferred.done(_.bind(function(){
					this.command.enableCommand(); //commandを有効にし、レンダリング
					var turn = this.battle.getCurrentTurn();
					this.members.each(function(member){
						//攻撃ターンのモンスターにフラグを立てる
						member.set("is_action_turn", (turn.id==member.get("id")) );
					})
					this.commandEvent = this.inputCommand;
				},this))
			}else if( turn_type == "enemy" ){
				this.beginNextTurn($deferred);
				$deferred.done(_.bind(function(){
					this.next = this.enemyTurn;
					this.next();
				},this))
			}else if( turn_type == "battle_win" ){
				this.battleResult("win");
			}else if( turn_type == "battle_lose" ){
				this.battleResult("lose");
			}else{
				console.error("BattleState#nextTurn 不明なターン状態です");
			}
		},
		inputCommand:function(type,data){
			console.log("BattleState#inputCommand");
			//受け付けたコマンドの処理をし、
			//クリックするか自分のアニメーションが終わったら次のターンへ
			if( this.checkAbleCommand(type,data) ){
				this.resetAbstract();
				this.command.disableCommand(); //commandを利かなくし、レンダリング
				this.members.each(function(member){ member.set("is_action_turn",false) }) //攻撃ターンフラグをリセット
				this.commandEvent = this.inputCommand;
				this.animEndMember = this.checkAnimEndMember;
				this.memberCombat(type,data);
			}
		},
		enemyTurn  :function(){
			console.log("BattleState#enemyTurn");
			//敵の攻撃処理をし、
			//クリックするか敵のアニメーションが終わったら次のターンへ
			
			this.resetAbstract();
			//this.click = this.nextTurn; //攻撃を飛ばせない方がリズムが良さそうなので消しておく
			this.next = this.nextTurn;
			this.animEndEnemy = this.checkAnimEndEnemy;
			this.enemyCombat();
		},
		checkAnimEndMember:function(event,model){
			console.log("BattleState#checkAnimEndMember");
			// 味方の攻撃演出の終了イベント chara_turn_endで呼ばれる
			// タップでスキップすることによる、複数の味方の同時攻撃演出があるなごりで、
			// どの味方の攻撃演出かを判定するために checkAbleAnimEndMember がある。
			// 最後に攻撃した味方のアニメーション終了であれば次へ
			
			if( this.checkAbleAnimEndMember(event,model) ){
				this.resetAbstract();
				this.click   = this.nextTurn;
				this.next    = this.nextTurn;
				this.next();
			}
		},
		checkAnimEndEnemy:function(event,model){
			console.log("BattleState#checkAnimEndEnemy");
			// 敵の攻撃演出の終了イベント chara_turn_endで呼ばれる
			// タップでスキップすることによる、複数の敵の同時攻撃演出があるなごりで、
			// どの敵の攻撃演出かを判定するために checkAbleAnimEndEnemy がある。
			// 最後に攻撃した敵のアニメーション終了であれば次へ
			
			if( this.checkAbleAnimEndEnemy(event,model) ){
				this.resetAbstract();
				this.click   = this.nextTurn;
				this.next    = this.nextTurn;
				this.next();
			}
		},
	});
	
	
/**
 * BattleMgr
 * BattleView
 */
	var BattleMgr = BattleState.extend({
		defaults:function(){
			return {
				turn_list:[],
				turn_status:"",
				is_turn_change:false,
			}
		},
		initialize:function(prop,option){
			console.log("BattleMgr#initialize",this,arguments);
			App.data.battleMgr = this;
			this.battle  = new BattleREC;
			this.enemys  = option.enemys;
			this.members = option.members;
			this.command = option.command;
			this.listenTo(option.command ,"input_command" ,_.bind(function(event,model){ this.commandEvent(event,model)  },this))
			this.listenTo(option.members ,"chara_turn_end",_.bind(function(event,model){ this.animEndMember(event,model) },this))
			this.listenTo(option.enemys  ,"chara_turn_end",_.bind(function(event,model){ this.animEndEnemy(event,model)  },this))
		},
		checkAbleAnimEndMember:function(event,model){
			var judge = (model.get("action_anim_played_index") == this.battle.get("total_turn") ) ? true : false ;
			console.log("BattleMgr#checkAbleAnimEndMember", judge , model.get("action_anim_played_index") , this.battle.get("total_turn"));
			return judge
		},
		checkAbleAnimEndEnemy:function(event,model){
			var judge = (model.get("action_anim_played_index") == this.battle.get("total_turn") ) ? true : false ;
			console.log("BattleMgr#checkAbleAnimEndEnemy", judge , model.get("action_anim_played_index") , this.battle.get("total_turn"));
			return judge
		},
		checkAbleCommand:function(type,data){
			console.log("BattleMgr#checkAbleCommand",type,data,this.battle.get("current_turn"),this.battle.get("turn_list"),turn);
			
			if(type == "command_type_attack"){
				var target = this.enemys.get(data.target_id);
				if(target.isInactive() && type == "attack"){
					console.log("BattleMgr#checkAbleCommand 非アクティブの敵には攻撃できません")
					return false
				}
			}
			
			var turn = this.battle.getCurrentTurn();
			if(turn == -1){
				return false
			}
			
			if(turn.turn_type != "player" ){
				console.log("BattleMgr#checkAbleCommand 自分のターンではありません")
				return false
			}
			
			return true
		},
		
		//stateの処理系
		
		//次のターンデータへ移行
		switchNextTurn:function(){
			console.log("BattleMgr#switchNextTurn");
			this.battle.set("turn_list", this.battle.get("next_turn_list") );
		},
		
		//次ターンに行く前の処理
		beginNextTurn :function($deferred){
			console.log("BattleMgr#beginNextTurn");
			var _this = this;
			var $deferred_charaBeginTurn = new $.Deferred;
			
			// Turn切り替え演出
			if(this.get("is_turn_change")){
				// TurnChangeView#turnChangeへ
				this.command.trigger("turn_change",$deferred_charaBeginTurn);
				this.set("is_turn_change",false)
			}else{
				$deferred_charaBeginTurn.resolve();
			}
			
			// beginTurn実行
			$deferred_charaBeginTurn.done(function(){
				var turn = _this.battle.getCurrentTurn();
				var turn_type = _this.checkTurn();
				var chara = (turn_type=="player")? _this.members.get(turn.id) : chara = _this.enemys.get(turn.id) ;
				chara.beginTurn($deferred)
			})
		},
		//勝利か敗北かチェックし、
		//自分のターンか敵ターンかチェック
		checkTurn:function(){
			console.log("BattleMgr#checkTurn");
			
			//どちらかが全滅していたら終了
			var turn_type = "";
			var check_members = this.members.filter(function(model){ return model.isActive() });
			var check_enemys  = this.enemys.filter(function(model){ return model.isActive() });
			if( check_members.length <= 0 ){ return "battle_lose"; }
			if( check_enemys.length  <= 0 ){ return "battle_win";  }
			
			//ターンが消化しきっていたら新規作成とターンチェンジフラグを設定
			if(this.battle.get("turn_list").length <= this.battle.get("current_turn") ){
				this.set("is_turn_change",true)
				this.switchNextTurn();
				this.battle.createTurn(this.members, this.enemys);
			}
			
			//現在のターン情報を取得
			var turn = this.battle.getCurrentTurn();
			if(turn == -1){ return }
			var chara = (turn.turn_type=="player")? this.members.get(turn.id) : this.enemys.get(turn.id) ;
			if( chara.isInactive() ){
				console.log("BattleMgr#checkTurn 非アクティブなのでスキップします");
				this.battle.incTurn().save();
				return this.checkTurn();
			}
			return turn.turn_type
		},
		
		// 次ターンへの進行処理と保存を行う、$deferredオブジェクトを返す
		createSaveCombatDeferred : function(chara){
			var $deferred = new $.Deferred;
				$deferred.done( _.bind(function(){
					console.log("BattleMgr#createSaveCombatDeferred#done");
					this.battle.incTurn();
					this.battle.set("members", this.members.toJSON() )
					this.battle.set("enemys" , this.enemys.toJSON() )
					this.battle.save();
					chara.set("action_anim_played_index", this.battle.get("total_turn") );
				},this) );
				$deferred.fail( _.bind(function(){
					console.log("BattleMgr#createSaveCombatDeferred#fail");
					this.nextTurn();
				},this) );
				
			return $deferred
		},
		
		//自分の攻撃処理
		memberCombat:function(event_type,data){
			console.log("BattleMgr#memberCombat",event_type);
			var turn = this.battle.getCurrentTurn();
			var chara = this.members.get(turn.id);
			var $deferred = this.createSaveCombatDeferred(chara);
			var side = 1;
			
			if(event_type == "command_type_attack"){
				chara.attack(side, $deferred, data, this.members, this.enemys);
				return
			}
			if(event_type == "command_type_guard"){
				chara.guard(side, $deferred);
				return
			}
			if(event_type == "command_type_capture"){
				// input_commandでis_action_turnがfalseになるので戻す
				chara.set("is_action_turn",true);
				this.command.trigger("capture_confirm",$deferred,this.enemys,chara)
				return
			}
			if(event_type == "command_type_skill"){
				// input_commandでis_action_turnがfalseになるので戻す
				chara.set("is_action_turn",true);
				this.command.trigger("skill_confirm",side, $deferred, data, this.members, this.enemys, chara)
				return
			}
			console.error("BattleMgr#memberCombat 不正な味方コマンドです ", event_type);
		},
		
		//敵の攻撃処理
		enemyCombat:function(data){
			console.log("BattleMgr#enemyCombat");
			var turn = this.battle.getCurrentTurn();
			var chara = this.enemys.get(turn.id);
			var ai = new BattleEnemyAi({},{ members:this.members, enemys:this.enemys });
			var command = ai.decideCommand(turn,chara,data);
			console.log("BattleMgr#enemyCombat#command ",command);
			
			if(command.type == "atk"){
				this.enemyAttack(turn,chara,data);
				return
			}
			if(command.type == "guard"){
				this.enemyGuard(turn,chara,data)
				return
			}
			if(command.type == "skill1"){
				this.enemyAttack(turn,chara,data);
				return
			}
			if(command.type == "skill2"){
				this.enemyAttack(turn,chara,data);
				return
			}
			console.error("BattleMgr#enemyCombat 不正な敵コマンドです ", command.type, command);
		},
		enemyAttack:function(turn,chara,data){
			console.log("BattleMgr#enemyAttack");
			var $deferred = this.createSaveCombatDeferred(chara);
			var side = 2;
			
			var anim = new BattleAnimation();
			anim.jc.animate({
				duration: anim.jc.frameToTime(7),
				onEnd : _.bind(function(){
					var members = _.filter(this.members.models, function(model){ return model.isActive() });
					var target  = members[_.random(0, members.length-1)];
					data = { target_id: target.get("id") };
					chara.attack(side, $deferred, data, this.enemys, this.members);
				},this)
			})
		},
		enemyGuard : function(turn,chara,data){
			console.log("BattleMgr#enemyGuard");
			var $deferred = this.createSaveCombatDeferred(chara);
			var side = 2;
			
			chara.guard(side, $deferred);
		},
		
		// 戦闘終了処理
		battleResult : function(result){
			this.battle.battleResult(result, this.members, this.enemys);
			
			if( this.battle.get("is_got_reward") ){
				App.popup.message({ view_class: "battle_result_popup", title:"モンスターをやっつけた！",message: '勝利しました！<br/>'}).done(_.bind(function(){
					this.trigger("battle_end",result,this.battle.get("is_boss"));
				},this))
				return
			}
			
			if(result=="win"){
				var get_text = '';
				var reward_data   = this.battle.getBattleReward(this.enemys);
				var captured_list = this.battle.getCaptureList(this.enemys);
				this.battle.set("is_got_reward",1).save();
				
				var battle_data = {
					enemy_list   : this.enemys.toJSON(),
					captured_list: _.map(captured_list, function(enemy){ return enemy.toJSON() }),
					quest_id     : this.battle.cave.get("quest_id"),
				}
				App.mission.checkProcess("BATTLE_WIN");
				App.mission.checkProcess("SLAY_CARD_LEVEL"    , battle_data);
				App.mission.checkProcess("SLAY_CARD_ATTR"     , battle_data);
				App.mission.checkProcess("SLAY_CARD_RARITY"   , battle_data);
				App.mission.checkProcess("SLAY_CARD_ID"       , battle_data);
				App.mission.checkProcess("SLAY_CARD_UNIQU"    , battle_data);
				App.mission.checkProcess("CAPTURE_CARD_LEVEL" , battle_data);
				App.mission.checkProcess("CAPTURE_CARD_ATTR"  , battle_data);
				App.mission.checkProcess("CAPTURE_CARD_RARITY", battle_data);
				App.mission.checkProcess("CAPTURE_CARD_ID"    , battle_data);
				App.mission.checkProcess("CAPTURE_CARD_UNIQU" , battle_data);
				
				_.each(reward_data,function(num,key){ get_text += '<i class="reward">' + __.helper.itemName(df.DATA_TYPE_ITEM, key, num) + '</i>を てにいれた！<br/>'; })
				_.each(captured_list,function(enemy){ get_text += '<i class="reward">' + enemy.get("name") + '</i>を ゲットした！<br/>'; })
				if(!get_text) get_text = '勝利しました！<br/>';
				
				App.popup.message({ view_class: "battle_result_popup", title:"モンスターをやっつけた！",message: get_text}).done(_.bind(function(){
					this.trigger("battle_end",result,this.battle.get("is_boss"));
				},this))
			}
			
			if(result=="lose"){
				this.trigger("battle_end",result,this.battle.get("is_boss"))
			}
		},
	});
	
	return BattleMgr;
})

;
define('controllers/PopupHowtoList',[
	"models/PcREC",
],function(PcREC){
	var HowtoListView = Backbone.View.extend({
		id : "howto_list_view",
		events: {
			"ftap .help_sub_title": "showHelpDetail"
		},
		showHelpDetail: function(e){
			var help_id = $(e.currentTarget).data("help_id");
			var data =st.HelpData[help_id];
			App.popup.message({title:data.sub_title,message:data.text})
		},
		render : function(define){
			var help_data = _.groupBy(st.HelpData,function(data){ return data.group });
			_.map(help_data,function(data){ return data.sort(function(a,b){return a.id - b.id}) })
			help_data = _.reduce(help_data,function(result,data){
				result.push( _.extend(_.cloneDeep(data[0]),{data:data}) )
				return result
			},[])
			
			help_data = help_data.sort(function(a,b){
				if(a.id == define){
					return -1
				}else if(b.id == define){
					return 1
				}else{
					a.id - b.id
				}
			})
			
			var html = "<div>";
			for(var i in help_data){
				html += '<div class="help_title">■ '+help_data[i].title+' ■</div>'
				for(var j in help_data[i].data){
					var data = help_data[i].data[j];
					html += '<div class="help_sub_title" data-help_id="'+data.id+'">'+data.sub_title+'</div>'
				}
			}
			html += "</div>";
			this.$el.append(html)
			
			return this;
		},
	})
	var show = function(define){
		var howtoListView = new HowtoListView()
		var popup = App.popup.message({ title:"遊び方", view_class:"howto_list", yes:{label:"閉じる"} });
		popup.view.$el.find(".message").append(howtoListView.render(define).$el)
		__.scroller.create("howto_list_view");
	}
	return {
		HowtoListView:HowtoListView,
		show:show,
	};
})

;
define('controllers/PopupCardDetailView',[
	"models/PcREC",
],function(PcREC){
	var PopupCardDetailView = Backbone.View.extend({
		tagName:"div",
		events:{
			"ftap .close_btn":"closeBtn",
			"ftap .prev_btn" :"prevBtn",
			"ftap .next_btn" :"nextBtn",
		},
		initialize:function(options){
			this.pc = new PcREC;
			this.options = options;
		},
		closeBtn:function(){
			this.remove();
			this.trigger("tapClose"); //このイベントをpopupsViewが受け取って閉じる
		},
		getPrevIndex: function(){
			var zukan_no = st.CardData[this.options.card_id].zukan_no;
			var index = _.findLastIndex(this.pc.get("zukan_flag"),function(flag,n){ return n<zukan_no && flag });
			return index
		},
		getNextIndex: function(){
			var zukan_no = st.CardData[this.options.card_id].zukan_no;
			var index = _.findIndex(this.pc.get("zukan_flag"),function(flag,n){ return n>zukan_no && flag });
			return index
		},
		prevBtn: function(){
			this.closeBtn();
			var zukan_no   = this.getPrevIndex();
			var card_id    = _.find(st.CardData,function(data){ return data.zukan_no == zukan_no }).id;
			var cardDetail = new PopupCardDetailView({card_id:card_id, type_book:true});
			App.popup.add(cardDetail);
		},
		nextBtn: function(){
			this.closeBtn();
			var zukan_no   = this.getNextIndex();
			var card_id    = _.find(st.CardData,function(data){ return data.zukan_no == zukan_no }).id;
			var cardDetail = new PopupCardDetailView({card_id:card_id, type_book:true});
			App.popup.add(cardDetail);
		},
		
		render:function(){
			if(this.options.type_book){
				var response = _.cloneDeep(st.CardData[this.options.card_id]);
				response.next_index = this.getNextIndex();
				response.prev_index = this.getPrevIndex();
			}else if(this.options.type_dungeon || this.options.type_battle){
				var response = _.cloneDeep(this.options.card_data);
				response.hp_text = "";
				response.skill_remain_text_1 = "(残り回数 " + response.skill_data[0].use_remain + "/" + response.skill_data[0].use_max + ")";
				response.skill_remain_text_2 = "(残り回数 " + response.skill_data[1].use_remain + "/" + response.skill_data[1].use_max + ")";
				response.hp_per = response.hp / response.hp_full ;
				if(this.options.type_dungeon) App.mission.checkProcess("SHOW_CARD_DETAIL_DUNGEON");
				if(this.options.type_battle ) App.mission.checkProcess("SHOW_CARD_DETAIL_BATTLE");
			}else{
				var response = this.pc.getMateData(this.options.card_id);
				var remainTime = new __.RemainTime({ disp:{hour:false,sec:false} , str:{min:"分"} });
				var hp_text  = "(全快まであと" + remainTime.toText( response.hp_time ) + ")";
				if(response.hp_per == 1){ hp_text = "(全快)" };
				response.hp_text = hp_text;
				response.skill_remain_text_1 = "(" + response.skill_data[0].use_remain + "回使用可)";
				response.skill_remain_text_2 = "(" + response.skill_data[1].use_remain + "回使用可)";
				App.mission.checkProcess("SHOW_CARD_DETAIL_LIST");
			}
			response.type_book = (!!this.options.type_book);
			
			this.$el.html( __.template("card/detail", response ) );
			return this;
		},
	});
	return PopupCardDetailView;
})

;
define('controllers/BattleSystemView',[
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

;
define('models/PresentREC',[
	"models/PcREC",
	"models/Mate",
],function(PcREC,Mate){
	
	var PresentREC = Backbone.Model.extend({
		constructor:function(){
			if(!PresentREC.instance){
				PresentREC.instance = this;
				Backbone.Model.apply(PresentREC.instance,arguments);
			}
			return PresentREC.instance;
		},
		localStorage : new Backbone.LocalStorage("PresentREC"),
		itemDefault : function(){
			return {
				id       : 1,
				data_type: df.DATA_TYPE_ITEM,
				item_id  : 1,
				num      : 1,
				message  : "プレゼントメッセージです",
				item_data: {},
				time     : __.baseTime(),
			}
		},
		defaults    :function(){
			this.pc = new PcREC;
			return{
				id :this.pc.get("id"),
				present_list: [], // this.itemDefault()
			}
		},
		initialize : function(){
			console.log("PresentREC#initialize");
			this.pc = new PcREC;
			this.mate = new Mate;
			this.listenTo(this.pc,"reset_data",this.resetData);
			this.fetch();
		},
		save : function(){
			PresentREC.__super__.save.apply(this, arguments);
			this.trigger("on_save",this);
		},
		resetData : function(pc_id,is_data_delete){
			this.destroy();
			this.attributes = (is_data_delete) ? {} : this.defaults();
			this.set("id",pc_id);
			this.save();
		},
		add: function(data){
			__.checkType({undefined:[ data.data_type, data.item_id, data.num ]});
			if(!data.limit    ) data.limit     = 0;
			if(!data.message  ) data.message   = "";
			if(!data.item_data) data.item_data = {};
			if(!data.time     ) data.time      = __.baseTime();
			
			var list = this.attributes.present_list;
			data.id = (!list.length) ? 1 : _.max(list, function(d){ return d.id }).id + 1;
			list.push( data );
			return this
		},
		addSetItem:function(_base_data,set_data_id){
			var base_data = _.cloneDeep(_base_data);
			if(!base_data.limit    ) base_data.limit   = 0;
			if(!base_data.message  ) base_data.message = "";
			if(!base_data.time     ) base_data.time    = __.baseTime();
			var set_data_all = _.cloneDeep(st.ItemSetData[set_data_id]);
			var set_data = _.zip(set_data_all.data_type, set_data_all.item_id, set_data_all.item_num);
			_.each(set_data,function(set){
				if(set[0] && set[1] && set[2]){
					var data = _.extend(base_data,{ data_type: set[0], item_id: set[1], num: set[2] })
					this.add(data);
				}
			},this)
			return this
		},
		receive: function(id){
			var data = _.find(this.attributes.present_list, function(p){ return p.id == id });
			
			this.attributes.present_list = _.filter(this.attributes.present_list, function(p){ return p.id != id });
			
			// 期限切れチェック
			if(data.limit > 0 && data.limit - __.baseTime() < 0){
				return false;
			}
			// item追加
			else if(data.data_type == df.DATA_TYPE_ITEM){
				this.pc.addItem(data.item_id, data.num);
			}
			// モンスター追加
			else if(data.data_type == df.DATA_TYPE_CARD_SEED){
				data.item_data.card_seed_id = data.item_id;
				var new_mate_list = this.mate.createMates(this.pc, data.item_data);
				this.pc.addMates(new_mate_list);
			}
			// DATA_TYPEエラー
			else{
				alert("DATA_TYPEが正しくありません type:"+data.data_type );
				throw __.exception("ERR_DATA_TYPE_INVALID");
			}
			
			return true
		},
		
	});
	
return PresentREC;

});

define('models/TwitterREC',["models/PcREC"],function(PcREC){
	
	var TwitterREC = Backbone.Model.extend({
		constructor:function(){
			if(!TwitterREC.instance){
				TwitterREC.instance = this;
				Backbone.Model.apply(TwitterREC.instance,arguments);
			}
			return TwitterREC.instance;
		},
		localStorage : new Backbone.LocalStorage("TwitterREC"),
		defaults    :function(){
			this.pc = new PcREC;
			return{
				id :this.pc.get("id"),
				screen_name:"",
				token_data : {},
				token_set:[],
				is_connected:false,
				post_log : {},
			}
		},
		initialize:function(option){
			console.log("TwitterREC#initialize");
			this.fetch();
			this.save();
		},
	});
	
return TwitterREC;

});

define('models/Twitter',["models/PcREC","models/TwitterREC"],function(PcREC,TwitterREC){
	
	var Twitter = Backbone.Model.extend({
		initialize:function(option){
			console.log("Twitter#initialize");
			this.rec = new TwitterREC;
			this.api = {
				requestToken  : "https://api.twitter.com/oauth/request_token",
				authorize     : "https://api.twitter.com/oauth/authorize",
				accessToken   : "https://api.twitter.com/oauth/access_token",
				postTweet     : "https://api.twitter.com/1.1/statuses/update.json",
				getTweet      : "https://api.twitter.com/1.1/statuses/show.json?id=", // user_idではなく、tweetのid
				verify        : "https://api.twitter.com/1.1/account/verify_credentials.json?skip_status=true",
				follow        : "https://api.twitter.com/1.1/friendships/create.json?user_id=xxxxxxxxx",
				officialTL    : "https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=nabepon_dev&count=10&callback=callbackGetOfficialTL",
			};
			this.messages = {
				finish:"ツイートしました",
				failed:"ツイートできませんでした",
				cancel:"ツイートキャンセルしました",
				exit  :"キャンセルしました",
			},
			
			this.initializeOauth();
		},
		initializeOauth:function(){
			this.oauth_options = {
				//enablePrivilege: false,
				consumerKey     : '',
				consumerSecret  : '',
				callbackUrl     : "https://twitter.com/",
			};
			this.oauth = OAuth(this.oauth_options);
		},
		getOfficialTL:function(){
			var _this = this;
			this.oauth.setAccessToken(this.rec.get("token_set"))
			this.oauth.get(
				_this.api.officialTL,
				// todo: エラー処理をちゃんとやる（成功時、失敗時の両方）
				function(data){
					var callbackGetOfficialTL = function(data){
						console.log("TwitterREC#callbackGetOfficialTL.Success",data);
						_this.trigger("getOfficialTL",data);
					};
					eval(data.text);
				},
				function(data){
					console.log("TwitterREC#callbackGetOfficialTL.Fail",data);
				}
			);
		},
		getTweet:function(id_str,success,fail){
			if(typeof id_str != "string"){ throw "twitter_id is not string"; }
			this.oauth.get(
				this.api.getTweet + id_str,
				function(data){
					if(typeof success == "function"){
						success( JSON.parse(data.text) )
					}
				},
				function(data){
					if(typeof fail == "function"){
						fail( JSON.parse(data.text) )
					}
				}
			);
		},
		testGet:function(api){
			this.oauth.setAccessToken(this.rec.get("token_set"))
			console.log("TwitterREC#testGet",api);
			this.oauth.get(
				api,
				function(data){ console.log("TwitterREC#testApi.Success",data); },
				function(data){ console.log("TwitterREC#testApi.Fail",data); }
			);
		},
		testPost:function(api){
			this.oauth.setAccessToken(this.rec.get("token_set"))
			console.log("TwitterREC#testPost",api);
			this.oauth.post(
				api,
				function(data){ console.log("TwitterREC#testPost.Success",data); },
				function(data){ console.log("TwitterREC#testPost.Fail",data); }
			);
		},
		postLogger: function(data){
			var post_log = this.rec.get("post_log");
			post_log[data.id_str] = { id: data.id_str, date: __.baseTime() };
			var new_logs = _.omit(post_log,function(log){ return log.date < (__.baseTime() - 1*24*60*60*1000) });
			console.log("TwitterREC#postLogger",new_logs);
			this.rec.set("post_log",new_logs);
		},
		oauthAndPost: function(api_type,text){
			this.post(text, this.api[api_type]);
		},
		//post:function(tweet_text,ret_data,retry){
		post:function(tweet_text,api){
			console.log("TwitterREC#post")
			var _this = this;
			var do_api = (api)? api: _this.api.postTweet;
			this.initializeOauth();
			this.oauth.setAccessToken(this.rec.get("token_set"))
			
			//投稿開始
			_this.oauth.post( do_api, {status: tweet_text + __.baseTime() },
				
				//成功
				function(data) {
					var data_json = JSON.parse(data.text);
					console.log("TwitterREC#post oauth.post success", data_json);
					if(do_api == _this.api.postTweet) _this.postLogger(data_json);
					_this.rec.set("is_connected",true).save();
					_this.tweetFinish(data_json);
				},
				
				//失敗
				function(data) {
					var data_json = JSON.parse(data.text);
					console.log("TwitterREC#post oauth.post failed", data_json);
					var error_code = data_json.errors[0].code;
					
					//アカウントが有効かチェック
					_this.oauth.get( _this.api.verify,
						
						//アカウントが有効で投稿できないのは原因が絞れないのでエラーを返して終了
						function(data) {
							console.log("TwitterREC#post oauth.post failed but verify success");
							alert(_this.getErrorText(error_code).msg)
							_this.tweetFailed(data_json);
						},
						
						//アカウントが有効でないならOAuth認証を開始
						function(data) {
							console.log("TwitterREC#post oauth.post failed and verify fail because oauth start");
							var $dfd = $.Deferred();
							_this.oauthStart($dfd)
							
							//認証成功したらもう一度postを試す
							$dfd.done(function(){
								console.log("TwitterREC#oauth.get verify success done")
								_this.oauth.post(
									do_api,
									{status: tweet_text + __.baseTime() },
									
									//成功
									function(data) {
										var data_json = JSON.parse(data.text);
										console.log("TwitterREC#post retry success", data_json);
										if(do_api == _this.api.postTweet) _this.postLogger(data_json);
										_this.rec.set("is_connected",true).save();
										_this.tweetFinish(data_json);
									},
									
									//それでも失敗したら原因が絞れないのでエラーを返して終了
									function(data){
										var data_json = JSON.parse(data.text);
										console.log("TwitterREC#post retry failed but verify success", data_json);
										var error_code = data_json.errors[0].code;
										alert(_this.getErrorText(error_code).msg)
										_this.tweetFailed(data_json);
									}
								)
							})
							
							//認証に失敗したらエラーを返して終了
							$dfd.fail(function(code){
								console.debug("TwitterREC#oauth.get verify fail", code);
								_this.tweetFailed(code);
							})
						}
					)
				}
			)
		},
		oauthStart:function($dfd){
			console.log("TwitterREC#oauthStart");
			
			if($dfd == undefined){ $dfd = $.Deferred(); }
			var _this = this;
			var paramToJson = this.paramToJson;
			var to = {}; //TwitterOAuth
			to.$childWindowDfd = { resolve:function(){}, reject:function(){} }
			
			//requestTokenが成功したとき実行する関数
			to.requestTokenSuccess = function(data) {
				console.log("TwitterREC#oauthStart.requestTokenSuccess",paramToJson(data.text));
				to.requestTokenResponse = data.text;
				
				//子windowを開いてLocationの監視を開始
				to.twitterWindow = window.open(_this.api.authorize +"?"+ to.requestTokenResponse ,'_blank','location=no');
				__.childWindowEvent({
					type   :"loadstart", // loadstop,loaderror
					window :to.twitterWindow,
					handler:to.windowLocationChange,
					done   :function(){},
					fail   :function(){},
					exit   :function(){ console.log("TwitterREC#tweetExit"); _this.tweetExit(); },
				})
			}
			
			// locationのcheck
			// oauth_verifierがある画面に遷移したらaccessTokenを取りにいく
			to.oauth_verifier_requested = false;
			to.windowLocationChange = function(loc,$childWindowDfd){
				to.$childWindowDfd = $childWindowDfd;
				console.log("TwitterREC#oauthStart.windowLocationChange",loc.url);
				if(!/twitter\.com\//.test(loc.url)){
					to.$childWindowDfd.reject();
					return
				}
				if(/oauth_verifier/.test(loc.url) && !to.oauth_verifier_requested){
					to.oauth_verifier_requested = true;
					var token_url = _this.api.accessToken + "?oauth_verifier=" + paramToJson(loc.url).oauth_verifier + '&' + to.requestTokenResponse
					_this.oauth.get(
						token_url,
						//function(data){ to.accessTokenSuccess(data,$winDfd) },
						//function(data){ to.accessTokenFail(data,$winDfd); }
						to.accessTokenSuccess,
						to.oauthFail
					);
				}
			}
			
			//accessTokenが成功したとき実行する関数
			//to.accessTokenSuccess = function(data,$winDfd) {
			to.accessTokenSuccess = function(data) {
				var token_data = paramToJson(data.text);
				_this.rec.set("token_data", token_data );
				_this.rec.set("token_set", [token_data.oauth_token,token_data.oauth_token_secret] );
				_this.oauth.setAccessToken( _this.rec.get("token_set") );
				
				// ユーザーの有効性チェックと情報とる
				// setするとgetできるようになる
				_this.oauth.get(
					_this.api.verify,
					function(data) {
						var data_json = JSON.parse(data.text)
						console.log("TwitterREC#accessTokenSuccess",data_json);
						_this.rec.set("screen_name",data_json.screen_name)
						_this.rec.save();
						to.$childWindowDfd.resolve();
						$dfd.resolve();
					},
					to.oauthFail
				);
			};
			
			//accessTokenが失敗したとき実行する関数
			to.oauthFail = function(data) { 
				console.log("TwitterREC#oauthFail",data);
				to.$childWindowDfd.reject(data);
				$dfd.reject(data);
			};
			
			//requestToken開始
			this.initializeOauth();
			this.oauth.get(_this.api.requestToken, to.requestTokenSuccess, to.oauthFail );
		},
		paramToJson:function(url){
			url = _.unescape(url);
			var param_json = {};
			var param_str  = url.substr(url.indexOf('?') + 1);
			var params     = param_str.split('&');
			for (var i=0;i<params.length;i++) {
				var data = params[i].split('=');
				param_json[data[0]] = data[1];
			}
			return param_json;
		},
		getErrorText:function(code){
			var msg = "";
			var go_oauth = 0;
			switch (code){
				case  32: go_oauth = 1; msg = "認証に失敗しました"; break;
				case  34: go_oauth = 0; msg = "指定されたAPIは存在しません"; break;
				case  67: go_oauth = 0; msg = "Twitterのバックエンドシステムが落ちています"; break;
				case  68: go_oauth = 0; msg = "廃止されたTwitter API 1.0を呼んでいます"; break;
				case  88: go_oauth = 0; msg = "API の利用回数制限に達しました"; break;
				case  89: go_oauth = 1; msg = "token が正しくありません"; break;
				case  93: go_oauth = 0; msg = "許可されていないダイレクトメッセージアクセスしようとしています"; break;
				case  99: go_oauth = 1; msg = "Token の認証に失敗しています"; break;
				case 130: go_oauth = 0; msg = "Twitter のシステムが限界に達しています"; break;
				case 131: go_oauth = 0; msg = "Twitter のシステムの原因不明の内部エラーが発生しました"; break;
				case 135: go_oauth = 1; msg = "認証に失敗しています"; break;
				case 150: go_oauth = 0; msg = "メッセージ指定のツイートができません。 ツイートの頭の文を変えましょう。"; break;
				case 185: go_oauth = 0; msg = "1日のツイート数制限に達しました"; break;
				case 186: go_oauth = 0; msg = "ツイートが 140 文字を超えています"; break;
				case 187: go_oauth = 0; msg = "重複ツイートしようとしています"; break;
				case 188: go_oauth = 0; msg = "ツイートに含まれるリンク先が不正サイトと判定されています"; break;
				case 189: go_oauth = 1; msg = "原因不明のエラーが発生しました"; break;
				case 190: go_oauth = 0; msg = "url付きツイートが長すぎます。"; break;
				case 191: go_oauth = 0; msg = "画像アップロード数の制限に達しました"; break;
				case 215: go_oauth = 1; msg = "認証に失敗しました"; break;
				case 220: go_oauth = 0; msg = "許可されていないAPIが呼ばれました"; break;
				default:  go_oauth = 1; msg = "原因不明のエラーが発生しました" ; break;
			}
			return {
				msg:msg,
				go_oauth:go_oauth,
			}
		},
		
		
		tweetFinish: function(){
			App.views.indicator.hide()
			App.popup.message({message: this.messages.finish })
		},
		tweetFailed: function(){
			App.views.indicator.hide()
			App.popup.message({message: this.messages.failed })
		},
		tweetCancel: function(){
			App.views.indicator.hide()
			App.popup.message({message: this.messages.cancel })
		},
		tweetExit: function(){
			App.views.indicator.hide()
			App.popup.message({message: this.messages.exit })
			this.rec.set("is_connected",false).save();
		},
		checkConnection: function(){
			if(!__.info.is_phonegap){ return false }
			if( navigator.connection.type == Connection.UNKNOWN || navigator.connection.type == Connection.NONE){
				App.popup.message({message:"通信できませんでした<br/>通信環境のいい場所でご利用ください"})
				return true
			}
			return false
		},
		tweet: function(tweet_msg){
			if(this.checkConnection()) return
			App.views.indicator.show();
			this.post(tweet_msg);
		},
		follow: function(){
			if(this.checkConnection()) return
			App.views.indicator.show();
			this.oauthAndPost("follow");
		},
		
		
		
	});
	
return Twitter;

});

define('models/CaveManager',[
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

;
define('models/DebugConsole',[
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






define('controllers/BattleView',[
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

;
define('controllers/CardBookView',[
	"models/PcREC",
	"models/Mate",
	"controllers/PopupCardDetailView"
],function(PcREC,Mate,PopupCardDetailView){
	
	var BookView = Backbone.View.extend({
		initialize: function(){
			this.pc = new PcREC;
		},
		events: {
			"ftap .book_el": "showDetail",
		},
		showDetail: function(e){
			var card_id = $(e.currentTarget).data("id");
			if(card_id){
				var cardDetail = new PopupCardDetailView({card_id:card_id, type_book:true});
				App.popup.add(cardDetail);
			}
		},
		render: function(){
			var zukan_list = _.reduce(_.cloneDeep(st.CardData),function(result,card){
				if(!result[card.zukan_no]) result[card.zukan_no] = card;
				return result
			},{})
			var discover_list = _.map(this.pc.get("zukan_flag"),function(flag,zukan_no){
				if(zukan_list[zukan_no]){
					zukan_list[zukan_no].has_flag = flag;
					return zukan_list[zukan_no];
				}
			})
			var response = {
				discover_list:_.compact(discover_list)
			}
			this.$el.html( __.template("card/book",response) );
			return this
		},
		setupView: function(){
			__.scroller.create("card_list");
		},
	})
	
	return BookView
})

;
define('models/PageManager',[
],function(){
	
	/**
	 * PageViewのModel。状態、ページ数、1ページあたりのitem数などを管理
	 * @class PageManager
	 */
	var PageManager = Backbone.Model.extend({
		defaults:function(){
			return {
				collection :[],
				list_length:0,
				elem_num   :30,
				elem_max   :0,
				elem_min   :0,
				current    :1,
				page_max   :0,
				is_first   :1,
				is_end     :1,
				is_show    :0,
				show_begin :0,
				show_end   :0,
			}
		},
		initialize:function(option,config){
			var page_max = ( this.get("collection").length / this.get("elem_num") ).ceil();
			this.set("page_max",page_max);
			this.set("elem_max",this.get("collection").length);
			if(this.get("collection").length>0){
				this.set("elem_min",1);
			}else{
				this.set("elem_min",0);
			}
			
			if(this.get("page_max")>=2){
				this.set("is_end",0);
				this.set("is_show",1);
			}else{
				this.set("is_end",1);
				this.set("is_show",0);
			}
			
			if( this.get("current") <= 1 ){
				this.set("is_first",1);
			}else{
				this.set("is_first",0);
			}
			
			if( this.get("current") >= this.get("page_max") ){
				this.set("is_end",1);
			}else{
				this.set("is_end",0);
			}
			
			if(this.get("current")>this.get("page_max")){
				this.set("current",this.get("page_max"));
			}
			
			this.set("show_begin",(this.get("current")-1)*this.get("elem_num"));
			this.set("show_end"  ,(this.get("current")  )*this.get("elem_num"));
			
			console.info("Page#initialize [attributes]",this.attributes);
		},
		updateCollection:function(collection){
			this.set("collection",collection);
			this.set("current",1);
			this.initialize();
			this.trigger("updateCollection",this);
		},
		/**
		 * 1ページ戻り。pageChangeイベントを発火する。
		 * @memberof PageManager
		 * @function prev
		 * @fires pageChange
		 */
		prev:function(){
			if(this.get("is_first")){ return }
			this.set("current",this.get("current")-1);
			this.initialize();
			this.trigger("pageChange",this);
		},
		/**
		 * 1ページ送り。pageChangeイベントを発火する。
		 * @memberof PageManager
		 * @function next
		 * @fires pageChange
		 */
		next:function(){
			if(this.get("is_end")){ return }
			this.set("current",this.get("current")+1);
			this.initialize();
			this.trigger("pageChange",this);
		},
	});
	
	return PageManager;
});






define('controllers/PageView',[
""],function(){
	
	var PageView = Backbone.View.extend({
		el:"#page_view",
		tagName:"div",
		events:{
			"ftap .next_page_btn":"next",
			"ftap .prev_page_btn":"prev"
		},
		next:function(){
			this.model.next();
		},
		prev:function(){
			this.model.prev();
		},
		initialize:function(){
			this.listenTo(this.model,"pageChange",this.render);
			this.listenTo(this.model,"updateCollection",this.render);
		},
		update:function(){
			this.model.initialize();
			this.render();
		},
		render:function(){
			var response = this.model.attributes;
			this.$el.html( __.template("common/page",response) );
			return this
		},
	});
	
	return PageView;
})

;
define('controllers/CardPage',[
	"models/PcREC",
	"models/UserConfigREC",
	"models/Mate",
	"models/PageManager",
	"controllers/PopupCardDetailView",
	"controllers/PageView",
""],function(PcREC,UserConfigREC,Mate,PageManager,PopupCardDetailView,PageView){
	
	/**
	 * 選択中のモンスターのModel。 index、isEmpty、target、dataを持つ。
	 * @memberof CardPage
	 * @attribute Member
	 */
	var Member = Backbone.Model.extend({
		defaults:function(){
			return {
				//id     :0,
				index  :0,
				isEmpty:1,
				target :0,
				data   :{},
			}
		},
	});
	
	/**
	 * 選択中のモンスターのCollection
	 */
	var Members = Backbone.Collection.extend();
	
	/**
	 * 選択中のモンスターのView。event系はcollection(members)に対してtriggerする。
	 * @memberof CardPage
	 * @class MemberView
	 * @fires tapMember
	 * @fires tapRemove
	 * @fires holdMember
	 * @fires changeMember
	 */
	var MemberView = Backbone.View.extend({
		tagName:"div",
		initialize:function(){
			this.listenTo(this.model,"change",this.change);
			var index = this.model.get("index") + 1;
			this.$el.attr("class","card_"+index);
		},
		events: function(){
			return{
				"ftap .member":"tapMember",
				"ftap .remove_btn":"tapRemove",
				"fhold":"holdMember",
			}
		},
		tapMember:function(){
			this.model.collection.trigger("tapMember",this.model);
		},
		tapRemove:function(){
			this.model.collection.trigger("tapMember",this.model);
			this.model.collection.trigger("tapRemove",this.model);
		},
		holdMember:function(){
			this.model.collection.trigger("holdMember",this.model.get("data"));
		},
		change:function(model){
			
			//データに変更があったとき発火
			var id = model.get("data").id;
			
			if( _.has(model.changed,"isEmpty") && model.changed.isEmpty == 1){
				model.attributes.data = {};
				model.collection.trigger("changeMember",model,id);
			}
			if( _.has(model.changed,"data") && !_.isEmpty(model.changed.data) ){
				model.attributes.isEmpty = 0;
				model.collection.trigger("changeMember",model,id);
			}
			
			//ターゲットに変更があったとき再レンダリング
			if( _.has(model.changed,"target") || _.has(model.changed,"isEmpty") ){
				this.render();
			}
		},
		addTargetClass:function(){
			if( this.model.get("target") ){
				return "target";
			}
		},
		render:function(){
			var hp_bar     = '<div class="hp_bar_container"><div class="hp_bar" style="width:' + this.model.get("data").hp_per * 100 + '%;"></div></div>'
			var remove_btn = '<a class="list_menu_btn remove_btn"><i>はずす</i></a>'
			if( this.model.get("isEmpty") ){
				this.$el.html( remove_btn + '<div class="member card_bg '+this.addTargetClass()+'"></div>');
			}else{
				this.$el.html( remove_btn + '<div class="member card_bg '+this.addTargetClass()+'"><img src="'+__.path.card("s",this.model.attributes.data.gra_id)+'">' + hp_bar + '</div>' );
			}
			return this
		},
	});
	
	/**
	 * 選択中のモンスターのコレクションのView
	 * @memberof CardPage
	 * @attribute MembersView
	 */
	var MembersView = Backbone.View.extend({
		el:"#members_view",
		initialize: function(options){
			this.options = options;
		},
		view_list: [],
		render:function(){
			this.$el.empty();
			_.each(this.view_list,function(view){ view.stopListening(); })
			this.view_list = [];
			this.collection.each(function(member){
				var memberView = new this.options.MemberView({model:member});
				this.$el.append( memberView.render().el );
				this.view_list.push(memberView);
			},this);
		},
	});
	
	/**
	 * リスト内モンスターのModel。 selectedのフラグをもつ。
	 * @memberof CardPage
	 * @attribute Card
	 */
	var Card = Backbone.Model.extend({
		defaults:function(){
			return {
				selected:0,
				select_index:0,
			}
		},
	});
	
	/**
	 * モンスター一覧のCollection
	 */
	var CardList = Backbone.Collection.extend();
	
	/**
	 * リスト内モンスターのView。 各イベントはCollectionに対してtriggerする。  
	 * modelのselectedのchangeイベントを受けて再レンダリング。
	 * @memberof CardPage
	 * @class CardView
	 * @fires tapCard
	 * @fires holdCard
	 */
	var CardView = Backbone.View.extend({
		tagName:"div",
		events: function(){
			return {
				"ftap":"tapCard",
				"fhold":"holdCard",
			}
		},
		initialize:function(){
			this.pc = new PcREC;
			this.listenTo(this.model,"change",this.change);
		},
		tapCard:function(){
			this.model.collection.trigger("tapCard",this.model);
		},
		holdCard:function(){
			this.model.collection.trigger("holdCard",this.model.attributes);
		},
		change:function(model){
			if(_.has(model.changed,"selected") || _.has(model.changed,"fav") ){
				this.render();
			}
		},
		response:function(data){
			var res = {
				fav  :0,
			}
			res = _.extend(res,data);
			return res;
		},
		render:function(){
			var data = this.model.attributes;
			this.$el.attr("state-contain_deck",!!data.contain_deck)
			        .attr("state-selected"    ,!!data.selected    )
			        .attr("state-fav"         ,!!data.fav         )
			        .attr("state-select_index",data.select_index  )
			        .html( __.template("card/card_container",this.response(data)) )
			        
			//this.$el.attr("class",select + contain_deck + selected + fav );
			//this.$el.html( __.template("card/card_container",this.response(data)) )
			return this;
		},
	});
	
	/**
	 * モンスター一覧のView
	 * @memberof CardPage
	 * @attribute CardListView
	 */
	var CardListView = Backbone.View.extend({
		el:"#card_list_view",
		initialize:function(options){
			this.options = options;
			this.pc = new PcREC;
		},
		addEmptyMessage: function(){
			this.$el.append('<div class="is_empty_list">選択できるモンスターがいません</div>');
		},
		view_list: [],
		render:function(){
			this.$el.empty();
			_.each(this.view_list,function(view){ view.stopListening(); });
			this.view_list = [];
			if(this.collection.size() === 0){ this.addEmptyMessage(); }
			if(!_.isEmpty(this.options.pageManager)){
				var min = this.options.pageManager.get("show_begin");
				var max = this.options.pageManager.get("show_end");
			}
			this.collection.each(function(card,index){
				if( !_.isEmpty(this.options.pageManager) &&  this.options.pageManager.get("is_show") && (index < min || max <= index) ){ return };
				var cardView = new this.options.CardView({model:card});
				this.$el.append( cardView.render().el );
				this.view_list.push(cardView);
			},this);
			__.scroller.refresh();
			return this;
		},
	});
	
	
	/**
	 * 合成や売却のリアルタイム情報表示
	 * @memberof CardPage
	 * @attribute InfoView
	 */
	var InfoView = Backbone.View.extend({
		el:"#info_view",
		initialize:function(options){
			this.options = options;
			this.pc   = new PcREC;
			this.mate = new Mate;
		},
		render:function(){
			var select_members = _.map( this.options.members.models ,function(member,n){ return member.get("data").id; });
			var mate_ids       = _.map( this.pc.get("mate_list"),function(mate,n){ return mate.id; });
			var sell_result = this.mate.sellResult(this.pc, _.intersection(select_members,mate_ids) );
			var base_member = select_members[0];
			
			if(base_member == undefined){
				var response = {
					mate_num          : _.size(this.pc.get("mate_list")),
					mate_max          : this.pc.get("mate_max"),
					need_powerup_money:0,
					need_limitup_money:0,
					need_mix_money    :0,
					get_mix_exp       :0,
					sell_price        :sell_result.get_game_money,
					have_game_money   :this.pc.getItem( df.ITEM_GAME_MONEY ),
				};
			}else{
				var mat_member  = _.compact(select_members.slice(1));
				var powerup_result = this.mate.powerupResult(this.pc,base_member,mat_member);
				var limitup_result = this.mate.limitupResult(this.pc,base_member,mat_member);
				var mix_result = this.mate.mixResult(this.pc,base_member,mat_member);
				var response = {
					mate_num          : _.size(this.pc.get("mate_list")),
					mate_max          : this.pc.get("mate_max"),
					need_powerup_money:powerup_result.need_game_money,
					need_limitup_money:limitup_result.need_game_money,
					need_mix_money    :mix_result.need_game_money,
					get_mix_exp       :mix_result.get_exp,
					sell_price        :sell_result.get_game_money,
					have_game_money   :this.pc.getItem( df.ITEM_GAME_MONEY ),
				};
			}
			
			this.$el.html( __.template("card/list_info_view",response) );
			return this;
		},
	});
	
	/**
	 * 選択中のメンバーやボタンをラップしているView。
	 * @memberof CardPage
	 * @class SelectView
	 */
	var SelectView = Backbone.View.extend({
		id:"select_view",
		
		Member      :Member      ,
		Members     :Members     ,
		MemberView  :MemberView  ,
		MembersView :MembersView ,
		Card        :Card        ,
		CardList    :CardList    ,
		CardView    :CardView    ,
		CardListView:CardListView,
		InfoView    :InfoView    ,
		
		initialize:function(options,config){
			this.options = options;
			this.request = config.request;
			this.pc   = new PcREC;
			this.userConfig = new UserConfigREC;
			this.mate = new Mate;
			this.pageManager = 1;
		},
		events: function(){
			return {
				"ftap #sort_btn"         :"sortBtn",
				"ftap #toggle_status_btn":"toggleStatusBtn",
			}
		},
		getInitSortData : function(){
			var key = this.userConfig.get("card_sort_key");
			if(!key){ key = "power"; }
			var all_data = this.getSortData();
			var sort_data = _.find(all_data,function(data){ return data.key == key });
			return sort_data;
		},
		getSortData : function(){
			return [
				{ label: "戦闘力順" , key: "power"  , asc: -1 , select_btn: 1 },
				{ label: "入手順"   , key: "id"     , asc: -1 , select_btn: 1 },
				{ label: "レア度順" , key: "rarity" , asc: -1 , select_btn: 1 },
				{ label: "レベル順" , key: "lvl"    , asc: -1 , select_btn: 1 },
				{ label: "HP順"     , key: "hp"     , asc: -1 , select_btn: 1 },
				{ label: "攻撃力順" , key: "atk"    , asc: -1 , select_btn: 1 },
				{ label: "防御力順" , key: "def"    , asc: -1 , select_btn: 1 },
				{ label: "魔力順"   , key: "mag"    , asc: -1 , select_btn: 1 },
				{ label: "図鑑順"   , key: "card_id", asc: -1 , select_btn: 1 },
			];
		},
		sortCardList: function(sort_data){
			//this.cardList.comparator = function(model){ return model.get(sort_data.key) * sort_data.asc; };
			//this.cardList.sort();
			var all_data = this.getSortData();
			var sort_card_id = _.find(all_data,function(data){ return data.key == "card_id" });
			var sort_id      = _.find(all_data,function(data){ return data.key == "id" });
			
			this.cardList.models.sort(function(a,b){
				if(a.get(sort_data.key) != b.get(sort_data.key)){
					return (a.get(sort_data.key) - b.get(sort_data.key) ) * sort_data.asc
				}else if(a.get(sort_card_id.key) != b.get(sort_card_id.key)){
					return a.get(sort_card_id.key) - b.get(sort_card_id.key)
				}else{
					return a.get(sort_id.key) - b.get(sort_id.key)
				}
			});
			this.userConfig.set("card_sort_key",sort_data.key).save();
			
			$("#sort_btn i").html(sort_data.label);
		},
		sortBtn:function(){
			var items  = this.getSortData();
			var config = {
				title: "並び順",
				view_class: "card_sort_select",
				select_btn_class: "cmn_btn_1 select_btn"
			};
			App.popup.select(items, config).done( _.bind(this.selectSortBtn, this) );
		},
		selectSortBtn:function(data,btn){
			console.log("SelectView#selectSortBtn [data,btn]",[data,btn]);
			if(!btn.select_btn) return;
			
			this.sortCardList(btn);
			this.updateCardList();
			this.cardListView.render();
			App.mission.checkProcess("SORT_CARD");
		},
		toggleStatusBtn:function(){
			this.$el.toggleClass("disp_status_2");
		},
		
		
		/**
		 * changeMemberイベントが発火したときに実行。memberのほうは自身でupdateするので、こちらではcardListとinfoViewをupdateする。
		 * @memberof CardPage.SelectView
		 * @function changeMember
		 */
		changeMember:function(model,id){
			this.addChangeCheckList([model.get("data").id]);
			this.addChangeCheckList([model._previousAttributes.data.id]);
			this.updateCardList();
			this.infoView.render();
		},
		/**
		 * 最初に画面を呼ぶときに処理する。
		 * @memberof CardPage.SelectView
		 * @function setupView
		 */
		setupView:function(){
			// cardListView
			var mate_data = _.map( this.pc.get("mate_list"),function(mate,n){ return this.pc.getMateData(mate.id,false) },this);
			this.cardList = new this.CardList( mate_data , { model:this.Card });
			this.sortCardList( this.getInitSortData() );
			this.cardListView = new this.CardListView({ CardView:this.CardView, collection:this.cardList });
			this.filterCollection();
			this.listenTo(this.cardListView.collection,"tapCard"  ,function(){ App.sound.se(1) } );
			this.listenTo(this.cardListView.collection,"tapCard"  ,this.tapCard );
			this.listenTo(this.cardListView.collection,"holdCard" ,this.holdCard);
			
			// pageView
			this.pageManager = new PageManager({ collection:this.cardList , elem_num: this.userConfig.get("page_elem_num") });
			this.pageView    = new PageView({model:this.pageManager});
			this.cardListView.options.pageManager = this.pageManager;
			this.listenTo(this.pageView.model,"pageChange", function(){ this.cardListView.render(); __.scroller.refresh({toTop:true}); });
			
			// membersView
			this.members     = new this.Members(this.initMemberList(), {model:this.Member} );
			this.membersView = new this.MembersView({ MemberView:this.MemberView, collection:this.members });
			this.listenTo(this.membersView.collection,"tapMember"    ,this.tapMember   );
			this.listenTo(this.membersView.collection,"tapRemove"    ,this.tapRemove   );
			this.listenTo(this.membersView.collection,"holdMember"   ,this.holdMember  );
			this.listenTo(this.membersView.collection,"changeMember" ,this.changeMember);
			this.setInitMembersStatus(this.cardListView.collection);
			this.updateTarget();
			
			// infoView
			this.infoView = new this.InfoView({ members:this.members });
			
			// 上記をrender
			this.membersView.render();
			this.addChangeCheckList( _.map(this.members.toJSON(),function(data){ return data.data.id }) );
			this.updateCardList();
			this.cardListView.render();
			this.pageView.render();
			this.infoView.render();
			
			__.scroller.create("card_list");
		},
		filter:function(mate){
			return true
		},
		filterCollection:function(){
			var _this = this;
			var mate_data = _.reduce( this.pc.get("mate_list"),function(result,mate,n){
				if(_this.filter(mate)){
					result.push( _this.pc.getMateData(mate.id,false) )
				}
				return result
			},[]);
			this.cardList.reset(mate_data);
		},
		/**
		 * メンバーの入れ替え対象(ターゲット)を更新
		 * @memberof CardPage.SelectView
		 * @function updateTarget
		 */
		updateTarget:function(){
			var target = this.members.find(function(member){ return member.get("isEmpty") == 1 });
			this.members.each(function(member,index){
				member.set("target", (target != undefined && target.get("index") == member.get("index")) ? 1 : 0 );
			},this);
		},
		changeCheckList:[],
		/**
		 * 更新の必要があるメンバーを配列にして保存しておく。処理したら順次消す。
		 * @memberof CardPage.SelectView
		 * @function addChangeCheckList
		 * @param change_list {array}
		 */
		addChangeCheckList:function(change_list){
			this.changeCheckList = _.union(this.changeCheckList,change_list);
		},
		/**
		 * cardList内でupdateが必要なModelを更新する。modelのchangeイベントで再レンダリングされる。
		 * @memberof CardPage.SelectView
		 * @function updateCardList
		 */
		updateCardList:function(is_all_update){
			//mate_listに無いものをremoveし、selectedを設定する
			var remove_list = _.map(this.cardList.models,function(card){
				if( !_.has(this.pc.get("mate_list"),card.id) ){ return card.id }
			},this);
			remove_list = _.compact(remove_list);
			_.each(remove_list,function(id){ this.cardList.remove({id:id}); },this)
			
			
			var mate_list = this.pc.get("mate_list");
			var select_members = _.map( this.members.models ,function(member,n){ return member.get("data").id; });
			this.cardList.each(function(card){
				if( !_.contains(this.changeCheckList,card.id) && is_all_update != true){ return }; // changeCheckListに含まれてなかったら無駄なので終了
				//_.extend(card.attributes, this.pc.getMateData(card.id,false) )
				card.set( this.pc.getMateData(card.id,false) )
				
				var is_contain = 0;
				var select_index = 0;
				for(var i=0;i<select_members.length;i++){
					if(select_members[i] == card.id){
						is_contain   = 1;
						select_index = i+1;
						continue;
					}
				}
				card.set({select_index:select_index, selected:is_contain});
			},this);
			this.changeCheckList=[];
		},
		/**
		 * 選択をリセットする。isEmptyを変更し、changeイベントを発火させて再レンダリング。。
		 * @memberof CardPage.SelectView
		 * @function resetMembers
		 */
		resetMembers:function(){
			var member = new Member();
			var reset_data = _.map(this.members.toJSON(),function(data){
				return _.extend( member.defaults(), {id:data.id, index:data.index} );
			},this)
			this.members.reset(reset_data)
			
			//何故かイベントが複数回発火するようになる
			//this.members.each(function(member,index){ member.set("isEmpty",1) },this);
		},
		/**
		 * membersに対してまとめてsetする。
		 * @memberof CardPage.SelectView
		 * @function setMembers
		 */
		setMembers:function(members_list,before_members){
			this.members.each(function(member,index){
				if( members_list[index] != before_members[index] ){
					if( members_list[index] == 0){
						member.set("isEmpty",1);
					}else{
						member.set("data", this.pc.getMateData(members_list[index],false) );
					}
				}
			},this);
		},
		/**
		 * tapしたときtargetのchangeイベントを発火させてレンダリング。
		 * @memberof CardPage.SelectView
		 * @function tapMember
		 */
		tapMember:function(model){
			// デッキ内の枠を選択したら、その枠が入れ替えターゲットになるようにする
			this.members.each(function(member,index){
				member.set("target", ( model.get("index") == member.get("index") ) ?1:0 );
			},this);
		},
		holdMember:function(model_data){
			// holdCardと同じだが、一応分けておく
			this.holdCard(model_data);
		},
		holdCard:function(model_data){
			// カード詳細表示
			var cardDetail = new PopupCardDetailView({card_id:model_data.id});
			App.popup.add(cardDetail);
		},
		makeEmptyMemberList : function(num){
			// デッキ部分の数分のデータを作成する
			var member_list = _.map(new Array(num),function(id,n){
				return {
					isEmpty:1,
					index  :n,
					id     :n,
				};
			},this);
			return member_list;
		},
		
		
		//ここから差分
		template: __.getTemplate("card/select_list"),
		render:function(){
			this.$el.html( this.template({type:"deck"}) );
			return this
		},
		tapRemove : function(model){ model.set("isEmpty",1) },
		
		//初期に表示されるメンバーがいればこの関数をオーバーライドする
		setInitMembersStatus:function(cardList){ /* cardListのselectedプロパティを変更 */ },
		
		//tapCard内にて、タップに反応しないカード条件を設定する
		rejectTapCard:function(model){ return false },
		/**
		 * selectのtoggleを処理。
		 * @memberof CardPage.SelectView
		 * @function tapCard
		 */
		tapCard : function(model){
			if(this.rejectTapCard(model)){ return }
			
			var before_members = _.map( this.members.models ,function(member,n){ var id = member.get("data").id; return (id != undefined)? id : 0 ; });
			
			//選択済みだったら解除
			var selected = this.members.find(function(member){ return member.get("data").id == model.get("id") });
			if(selected != undefined){
				this.members.get(selected.get("id")).set("isEmpty",1);
				this.updateTarget();
				return
			}
			
			//targetがなかったら何もしない
			var target_index = _.find(this.members.models, function(member){ return member.get("target") == 1; });
			if(target_index == undefined){ return };
			target_index = target_index.get("index");
			
			//変更後のmember listを作成
			var select_members = _.map( this.members.models ,function(member,n){
				if( n == target_index ){
					// 現在のターゲットに一致していれば、無条件でセットする
					return model.id;
				}else if( member.get("data").id == model.id || member.get("isEmpty") == 1 ){
					return 0;
				}else{
					return member.get("data").id;
				}
			});
			this.setMembers(select_members,before_members); //before_membersにselect_membersをマージ
			this.updateTarget();
		},
		initMemberList : function(){ return this.makeEmptyMemberList(6) },
	});
	 
	/**
	 * モンスター一覧系のクラス
	 * @class CardPage
	 */
	var CardPage = function(){
		return {
			Member      :Member,
			MemberView  :MemberView,
			Members     :Members,
			MembersView :MembersView,
			Card        :Card,
			CardView    :CardView,
			CardList    :CardList,
			CardListView:CardListView,
			SelectView  :SelectView,
		}
	};
	return CardPage;
})

;
define('controllers/CardDeckMemberSelectView',[
	"models/PcREC",
	"models/Mate",
	"controllers/CardPage",
""],function(PcREC,Mate,CardPage){
	
	/*
	* デッキ編成画面
	*/
	
	var cardPage = new CardPage();
	
	var SelectView = cardPage.SelectView.extend({
		// オーバーライド分
		events: function(){
			return _.extend( {"ftap #deck_detail_btn" :"deckDetailBtn"}, cardPage.SelectView.prototype.events.call(this) );
		},
		render:function(){
			this.$el.html( this.template({type:"deck"}) );
			return this
		},
		
		// デッキに含まれているものをinitメンバーにする処理
		setInitMembersStatus:function(cardList){
			var pc_deck = this.pc.get("deck");
			cardList.each(function(card){
				if(_.contains(pc_deck, card.id)){
					card.set("selected",1);
				}
			},this);
		},
		
		// デッキ保存
		setDeck:function(select_members){
			this.pc.setDeck(select_members).save();
			App.mission.checkProcess("CHANGE_DECK");
			return
		},
		
		tapCard:function(model){
			var before_members = _.map( this.members.models ,function(member,n){ var id = member.get("data").id; if( id != undefined ){ return id }else{ return 0 }; });
			
			//選択済みだったら解除
			var selected = this.members.find(function(member){ return member.get("data").id == model.get("id") });
			if(selected != undefined){
				var select_members = _.map( this.pc.get("deck") ,function(id,n){ if( n == selected.get("id") ){ return 0 }else{ return id }; });
				this.setDeck(select_members);
				this.setMembers(select_members,before_members);
				this.updateTarget();
				return
			}
			
			//targetがなかったら何もしない
			var target_index = _.find(this.members.models, function(member){ return member.get("target") == 1; });
			if(target_index == undefined){ return };
			target_index = target_index.get("index");
			
			//変更後のmember listを作成
			var select_members = _.map( this.pc.get("deck") ,function(id,n){
				if( n == target_index ){
					return model.id;
				}else if( id == model.id ){
					return 0;
				}else{
					return id;
				}
			});
			
			this.setDeck(select_members);
			this.setMembers(select_members,before_members); //before_membersにselect_membersをマージ
			this.updateTarget();
		},
		tapRemove:function(model){
			var select_members = _.map( this.pc.get("deck") ,function(id,n){ return (n == model.get("id"))? 0 : id ; });
			this.setDeck(select_members);
			model.set("isEmpty",1);
		},
		initMemberList:function(){
			//collectionに必要なデータを返す
			var deck = _.clone( this.pc.get("deck") );
			var member_list = _.map(deck,function(id,n){
				if(id==0){
					return {
						isEmpty:1,
						index  :n,
						id     :n,
					};
				}else{
					return {
						isEmpty:0,
						index  :n,
						id     :n,
						data   :this.pc.getMateData(id,false),
					};
				}
			},this);
			return member_list;
		},
		
		// 追加分
		deckDetailBtn: function(){
			var response = {
				members: _.map(this.members.toJSON(),function(data){
					if(data.data.id){
						return this.pc.getMateData(data.data.id)
					}
				},this),
			};
			var popup = App.popup.confirm({
				title:"デッキ詳細",
				message:__.template("card/deck_detail",response),
				yes:{label:"全てはずす"},
				no:{label:"閉じる"},
			}).done(_.bind(this.deckResetConfirm,this));
			
			App.mission.checkProcess("SHOW_DECK_DETAIL");
		},
		deckResetConfirm: function(){
			var popup = App.popup.confirm({message:"デッキから全てのモンスターをはずします。<br/>よろしいですか？"})
			popup.done(_.bind(function(){
				var $btns = this.membersView.$el.find(".remove_btn");
				$btns.trigger("ftap");
				this.updateTarget();
			},this));
			popup.fail(_.bind(this.deckDetailBtn,this));
		}
	});
	var CardPage = function(){
		return {
			SelectView  :SelectView,
		}
	};
	return CardPage;
})

;
define('controllers/CardFavSelectView',[
	"models/PcREC",
	"models/Mate",
	"controllers/CardPage",
""],function(PcREC,Mate,CardPage){
	
	/*
	* お気に入り登録画面
	*/
	
	var cardPage = new CardPage();
	
	// メンバー部分を一人にし、強化ボタンに変更
	var MemberView   = cardPage.MemberView.extend({
		response:function(data){
			var res = {
				selected:0,
				fav:0,
			}
			res = _.extend(res,data);
			return res;
		},
		render:function(){
			
			var data = this.model.attributes.data;
			this.$el.attr("state-contain_deck",!!data.contain_deck)
			        .attr("state-selected"    ,!!data.selected    )
			        .attr("state-fav"         ,!!data.fav         )
			
			if( this.model.get("isEmpty") ){
				this.$el.html( '<div class="card_container"></div>' );
				var btn = $('<a id="fav_btn"        class="fav_btn        cmn_btn_1     "><i>お気に入り<br/>登録</i></a>')
				this.$el.append( btn )
			}else{
				this.$el.html( __.template("card/card_container",this.response(data)) )
				if(data.fav){
					var btn = $('<a id="fav_remove_btn" class="fav_remove_btn cmn_btn_4 "><i>お気に入り<br/>解除</i></a>')
				}else{
					var btn = $('<a id="fav_btn"        class="fav_btn        cmn_btn_1 "><i>お気に入り<br/>登録</i></a>')
				}
				
				this.$el.append( btn )
			}
			return this;
			
		},
	});
	
	// 表示するテンプレートを変更
	// お気に入りの処理追加
	// membersのtargetが必ずあるように変更。
	var SelectView = cardPage.SelectView.extend({
		MemberView:MemberView,
		events: function(){
			return _.extend({
				"ftap #fav_btn"        :"favBtn",
				"ftap #fav_remove_btn" :"favRemoveBtn",
			},cardPage.SelectView.prototype.events.call(this) );
		},
		render:function(){
			this.$el.html( this.template({type:"fav_select"}) );
			return this
		},
		initMemberList : function(){ return this.makeEmptyMemberList(1) },
		updateTarget:function(){
			//イベントを起こさせて無理やりupdateするのでなんとか修正したい。
			this.members.first().set("target",0);
			this.members.first().set("target",1);
		},
		favBtn:function(){
			this.updateFav(1);
			App.mission.checkProcess("FAV_CARD");
		},
		favRemoveBtn:function(){ this.updateFav(0) },
		updateFav:function(fav){
			var data = this.members.models[0].get("data");
			data.fav = fav;
			this.pc.get("mate_list")[data.id].fav = fav;
			this.pc.save();
			
			//this.resetMembers();
			this.membersView.render();
			this.addChangeCheckList([data.id]);
			this.updateCardList();
		},
	});
	var CardPage = function(){
		return {
			MemberView  :MemberView,
			SelectView  :SelectView,
		}
	};
	return CardPage;
})

;
define('controllers/CardIndexView',[
	"models/PcREC",
""],function(PcREC){
	
	var CardIndexView = Backbone.View.extend({
		tagName:"div",
		events:{
			"ftap .deck": "showDeckDetail",
		},
		showDeckDetail: function(){
			var response = {
				members: this.getMembers(),
			};
			var popup = App.popup.message({
				title:"デッキ詳細",
				message:__.template("card/deck_detail",response),
				yes:{label:"閉じる"},
			}).done(_.bind(this.deckResetConfirm,this));
		},
		getMembers: function(){
			var pc = new PcREC;
			return _.map(pc.get("deck"),function(id,n){ if(!id){ return } return pc.getMateData(id) })
		},
		render:function(){
			var pc = new PcREC;
			var res = {
				mate_num   :_.size(pc.get("mate_list")),
				mate_max   :pc.get("mate_max"),
				gacha_point:pc.getItem( df.ITEM_GACHA_POINT ),
				game_money :pc.getItem( df.ITEM_GAME_MONEY ),
				real_money :pc.getItem( df.ITEM_REAL_MONEY ),
				deck       :pc.get("deck"),
				members    :this.getMembers(),
			}
			this.$el.html( __.template("card/index",res) );
			return this
		},
		setupView:function(){
			__.scroller.create("card_index_list",{scrollbars:true});
		},
	});
	
	return CardIndexView;
	
})

;
define('controllers/CardLimitupSelectView',[
	"models/PcREC",
	"models/Mate",
	"controllers/CardPage",
""],function(PcREC,Mate,CardPage){
	 
	/*
	* 限界突破合成画面
	*/
	
	var cardPage = new CardPage();
	
	// ベースのモンスターを外せないようにreturnする
	var MemberView   = cardPage.MemberView.extend({
		tapMember:function(){
			if(this.model.id == 0){ return }
			cardPage.MemberView.prototype.tapMember.call(this);
		},
		tapRemove:function(){
			if(this.model.id == 0){ return }
			cardPage.MemberView.prototype.tapRemove.call(this);
		},
		response:function(data){
			var res = {
				selected:0,
				fav:0,
			}
			res = _.extend(res,data);
			return res;
		},
		render:function(){
			var data = this.model.attributes.data;
			if(this.model.id==0){
				if( this.model.get("isEmpty") ){
					this.$el.html( '<div class="member card_bg card_bg_m '+this.addTargetClass()+'"></div>');
				}else{
					var hp_bar = '<div class="hp_bar_container"><div class="hp_bar" style="width:' + this.model.get("data").hp_per * 100 + '%;"></div></div>'
					this.$el.html( '<div class="member card_bg '+this.addTargetClass()+'"><img src="'+__.path.card("s",this.model.attributes.data.gra_id)+'">' + hp_bar + '</div>' );
				}
			}else{
				this.$el.attr("state-contain_deck",!!data.contain_deck)
				        .attr("state-selected"    ,!!data.selected    )
				        .attr("state-fav"         ,!!data.fav         )
				if( this.model.get("isEmpty") ){
					this.$el.html( '<div class="card_container"></div>' );
				}else{
					this.$el.html( __.template("card/card_container",this.response(data)) )
				}
			}
			return this;
			
		},
	});
	
	 
		
		
	
	/**
	 * モンスター一覧のView
	 * @memberof CardPage
	 * @attribute CardListView
	 */
	var CardListView = cardPage.CardListView.extend({
		addEmptyMessage: function(){
			this.$el.append('\
				<div class="limitup_select is_empty_list">\
					限界突破の合成素材にできるモンスターがいません。\
					素材には同じ種類のモンスターが必要です。<br/>\
					<br/>\
					また、お気に入り設定されているモンスター、およびデッキに編成されているモンスターは表示されません。<br/>\
				</div>\
				<a class="trigger_back_key back_btn cmn_btn_1" data-back-default="/html/Card/powerupSelect"><i>戻る</i></a>\
			')
		},
	});
	
	// 表示するテンプレートを変更
	// mixBtnの処理追加
	var SelectView = cardPage.SelectView.extend({
		MemberView:MemberView,
		CardListView:CardListView,
		events: function(){
			return _.extend( {"ftap #limitup_btn" :"limitupBtn"}, cardPage.SelectView.prototype.events.call(this) );
		},
		render:function(){
			this.$el.html( this.template({type:"limitup_select"}) );
			return this
		},
		// 指定したカードをメンバーに含まれた状態に
		initMemberList : function(){
			var ini_members = this.makeEmptyMemberList(2);
			ini_members[0].isEmpty = 0;
			ini_members[0].data = this.pc.getMateData(this.request.query.id,false);
			return ini_members;
		},
		//イベントを起こさせて無理やりupdateする。お気に入りと同じでなんとか修正したい。
		updateTarget:function(){
			this.members.models[1].set("target",0);
			this.members.models[1].set("target",1);
		},
		// ベースと同じカードIDのみにする
		filter:function(mate){
			if( mate.id == this.request.query.id ){ //自分は除外
				return false
			}else if( mate.fav ){ //お気に入りモンスターは除外
				return false
			}else if( _.contains(this.pc.deck.get("member"), mate.id) ){ //デッキに含む場合は除外
				return false
			}else if(mate.card_id == this.pc.get("mate_list")[this.request.query.id].card_id ){
				return true
			}else{
				return false
			}
		},
		// ベースカードを選択状態に
		setInitMembersStatus:function(cardList){
			cardList.each(function(card){
				if(this.request.query.id == card.id){
					card.set("selected",1);
				}
			},this);
			
			// 選択状態がselect_1になるよう更新
			this.updateCardList(true);
		},
		// ベースカードをタップしても反応しないようにする
		rejectTapCard:function(model){
			if(model.id == this.request.query.id){
				return true
			}else{
				return false
			}
		},
		// limitupBtn
		limitupBtn:function(){
			var select_members = _.map( this.members.models ,function(member,n){ return member.get("data").id; });
			var base_member = select_members[0];
			var mat_member  = _.compact(select_members.slice(1));
			var preview     = this.mate.limitupResult(this.pc,base_member,mat_member);
			if( preview.is_max_limit     ){ App.popup.message({message:"これ以上限界突破できません。"}); return; }
			if( preview.contain_base     ){ App.popup.message({message:"ベースに設定しているモンスターが含まれているため、実行できません。"}); return; }
			if( preview.contain_fav      ){ App.popup.message({message:"お気に入りに設定しているモンスターが含まれているため、実行できません。"}); return; }
			if( preview.contain_deck     ){ App.popup.message({message:"デッキ編成されているモンスターが含まれているため、実行できません。"}); return; }
			if( preview.money_not_enough ){ App.popup.message({message:"コインが不足しているため、実行できません"}); return; }
			
			var message = (preview.contain_limit)? '<i class="caution">素材に限界突破したモンスターがいます。<br/><br/></i>限界突破合成しますか？'
			            : (preview.contain_rare_max >= df.RARITY_SR)? '<i class="caution">素材にSR以上のモンスターがいます。<br/><br/></i>限界突破合成しますか？'
			            : '限界突破合成しますか？';
			
			App.popup.confirm({
				title     : "限界突破合成",
				message   : message,
				view_class: "limitup_confirm",
			}).done(_.bind(function(){
				var result = this.mate.limitup(this.pc,base_member,mat_member);
				this.pc.save();
				
				this.resetMembers();
				this.members.first().set({ "data": this.pc.getMateData(base_member), "isEmpty": 0 });
				this.addChangeCheckList(select_members);
				this.updateCardList();
				this.membersView.render();
				this.pageView.update();
				this.cardListView.render();
				this.updateTarget();
				this.infoView.render();
				
				var anim = new App.anim.Limitup({ before:result.before, after:result.after });
				App.popup.add(anim,{view_class:"limitup_anim"});
				App.mission.checkProcess("LIMITUP_CARD");
			},this));
		},
	});
	var CardPage = function(){
		return {
			SelectView  :SelectView,
		}
	};
	return CardPage;
})

;
define('controllers/CardMixSelectView',[
	"models/PcREC",
	"models/Mate",
	"controllers/CardPage",
""],function(PcREC,Mate,CardPage){
	 
	/*
	* 合成画面
	* 
	* 表示するテンプレートを変更
	* 表示するメンバーを6に変更
	* 合成するボタンと処理の追加
	*/
	
	var cardPage = new CardPage();
	
	var SelectView = cardPage.SelectView.extend({
		events: function(){
			return _.extend( {"ftap #mix_btn" :"mixBtn"}, cardPage.SelectView.prototype.events.call(this) );
		},
		render:function(){
			this.$el.html( this.template({type:"mix_select"}) );
			return this
		},
		initMemberList : function(){
			return this.makeEmptyMemberList(6);
		},
		mixBtn:function(){
			var select_members = _.map( this.members.models ,function(member,n){ return member.get("data").id; });
			var base_member = select_members[0];
			var mat_member  = _.compact(select_members.slice(1));
			var preview     = this.mate.mixResult(this.pc,base_member,mat_member);
			if(preview.is_max_level && !preview.is_limit_level){ App.popup.message({message:"これ以上合成できません。<br/>限界突破でレベル上限を解放できます。"}); return; }
			if(preview.is_max_level &&  preview.is_limit_level){ App.popup.message({message:"これ以上合成できません。"}); return; }
			if( preview.money_not_enough ){ App.popup.message({message:"コインが不足しているため、実行できません"}); return; }
			if( preview.contain_base     ){ App.popup.message({message:"ベースに設定しているモンスターが含まれているため、実行できません。"}); return; }
			if( preview.contain_fav      ){ App.popup.message({message:"お気に入りに設定しているモンスターが含まれているため、実行できません。"}); return; }
			if( preview.contain_deck     ){ App.popup.message({message:"デッキ編成されているモンスターが含まれているため、実行できません。"}); return; }
			
			var message = (preview.contain_limit)? '<i class="caution">素材に限界突破したモンスターがいます。<br/><br/></i>合成しますか？'
			            : (preview.contain_rare_max >= df.RARITY_SR)? '<i class="caution">素材にSR以上のモンスターがいます。<br/><br/></i>合成しますか？'
			            : '合成しますか？';
			
			App.popup.confirm({
				title     : "合成確認",
				message   : message,
				view_class: "mix_confirm",
			}).done(_.bind(function(){
				var result = this.mate.mix(this.pc,base_member,mat_member);
				this.pc.save();
				
				this.resetMembers();
				this.members.first().set({ "data": this.pc.getMateData(base_member), "isEmpty": 0 });
				this.addChangeCheckList(select_members);
				this.updateCardList();
				this.membersView.render();
				this.pageView.update();
				this.cardListView.render();
				this.updateTarget();
				this.infoView.render();
			},this));
		},
	});
	var CardPage = function(){
		return {
			SelectView  :SelectView,
		}
	};
	return CardPage;
})

;
define('controllers/CardPowerupSelectView',[
	"models/PcREC",
	"models/Mate",
	"controllers/CardPage",
	"controllers/CardFavSelectView",
""],function(PcREC,Mate,CardPage,CardFavSelectView){
	
	/*
	* 強化画面
	*/
	
	var cardPage = new CardFavSelectView();
	
	// メンバー部分を一人にし、強化ボタンに変更
	var MemberView   = cardPage.MemberView.extend({
		// オーバーライド分
		render:function(){
			var data = this.model.attributes.data;
			this.$el.attr("state-contain_deck",!!data.contain_deck)
			        .attr("state-selected"    ,!!data.selected    )
			        .attr("state-fav"         ,!!data.fav         )
			        
			if( this.model.get("isEmpty") ){
				this.$el.html( '<div class="card_container"></div>' );
				var btn1 = $('<a id="powerup_btn"      class="powerup_btn noselect cmn_btn_1  "><i>強化</i></a>')
				var btn2 = $('<a id="goto_limitup_btn" class="goto_limitup_btn cmn_btn_1 "><i>限界<br/>突破</i></a>')
				this.$el.append( btn1 ).append( btn2 )
			}else{
				var data = this.model.attributes.data;
				this.$el.html( __.template("card/card_container",this.response(data)) )
				
				if(data.levelmax){
					var btn1 = $('<a id="powerup_btn"      class="powerup_btn levelmax cmn_btn_1 "><i>レベルMAX</i></a>')
					var btn2 = $('<a id="goto_limitup_btn" class="goto_limitup_btn cmn_btn_1 "><i>限界<br/>突破</i></a>')
				}else{
					var btn1 = $('<a id="powerup_btn"      class="powerup_btn cmn_btn_1 "><i>強化</i></a>')
					var btn2 = $('<a id="goto_limitup_btn" class="goto_limitup_btn cmn_btn_1 "><i>限界<br/>突破</i></a>')
				}
				
				this.$el.append( btn1 ).append( btn2 )
			}
			return this;
		},
	});
	
	// 表示するテンプレートを変更
	// powerupBtnの処理追加
	var SelectView = cardPage.SelectView.extend({
		
		// オーバーライド分
		MemberView:MemberView,
		events: function(){
			return _.extend({
				"ftap #powerup_btn"      :"powerupBtn",
				"ftap #goto_limitup_btn" :"gotoLimitupBtn",
			},cardPage.SelectView.prototype.events.call(this) );
		},
		render:function(){
			this.$el.html( this.template({type:"powerup_select"}) );
			return this
		},
		// 指定したカードをメンバーに含まれた状態に
		initMemberList : function(){
			var ini_members = this.makeEmptyMemberList(1);
			if(this.request.query.id){
				ini_members[0].isEmpty = 0;
				ini_members[0].data = this.pc.getMateData(this.request.query.id,false);
			}
			return ini_members;
		},
		
		// 追加分
		powerupBtn:function(){
			var select_members = _.map( this.members.models ,function(member,n){ return member.get("data").id; });
			var base_member    = select_members[0];
			if(!base_member){ App.popup.message({message:"モンスターが選択されていません"}); return; }
			var preview        = this.mate.powerupResult(this.pc,base_member);
			if(preview.is_max_level && !preview.is_limit_level){ App.popup.message({message:"これ以上強化できません。<br/>限界突破でレベル上限を解放できます。"}); return; }
			if(preview.is_max_level &&  preview.is_limit_level){ App.popup.message({message:"これ以上強化できません。"}); return; }
			if(preview.money_not_enough){ App.popup.message({message:"コインが不足しています"}); return; }
			
			App.popup.confirm({
				title     :"モンスター強化",
				message   :"レベルアップしますか？<br/>所持コイン：" + this.pc.getItem( df.ITEM_GAME_MONEY ) + "<br/>消費コイン：" + preview.need_game_money,
				view_class:"powerup_confirm",
			}).done(_.bind(function(){
				var result = this.mate.powerup(this.pc,base_member);
				this.pc.save();
				
				this.members.first().set("data", this.pc.getMateData(base_member) );
				this.addChangeCheckList(select_members);
				this.updateCardList();
				this.membersView.render();
				this.pageView.update();
				this.cardListView.render();
				this.infoView.render();
				
				var anim = new App.anim.Powerup({ before:result.before, after:result.after });
				App.popup.add(anim,{view_class:"powerup_anim"});
				App.mission.checkProcess("POWERUP_CARD");
			},this))
		},
		gotoLimitupBtn:function(){
			var select_members = _.map( this.members.models ,function(member,n){ return member.get("data").id; });
			var base_member    = select_members[0];
			if(!base_member){ App.popup.message({message:"モンスターが選択されていません"}); return; }
			var preview        = this.mate.limitupResult(this.pc,base_member);
			if(preview.is_max_limit){ App.popup.message({message:"これ以上限界突破できません。"}); return; }
			
			App.popup.confirm({title:"限界突破合成",message:"限界突破合成の画面に遷移します。<br/><br/>同じモンスターを合成することで、モンスターの最大レベルを上げることができます。"})
			.done(_.bind(function(){
				var select_members = _.map( this.members.models ,function(member,n){ return member.get("data").id; });
				var base_member = select_members[0];
				App.router.navigate("/html/Card/limitupSelect?id="+ base_member,{trigger:true})
			},this))
		},
	});
	var CardPage = function(){
		return {
			MemberView  :MemberView,
			SelectView  :SelectView,
		}
	};
	return CardPage;
})

;
define('controllers/CardSellSelectView',[
	"models/PcREC",
	"models/Mate",
	"controllers/CardPage",
""],function(PcREC,Mate,CardPage){
	 
	/*
	* 売却画面
	*/
	
	var cardPage = new CardPage();
	
	// 表示するテンプレートを変更
	// sellBtnの処理追加
	var SelectView = cardPage.SelectView.extend({
		// オーバーライド分
		events: function(){
			return _.extend( {"ftap #sell_btn" :"sellBtn"}, cardPage.SelectView.prototype.events.call(this) );
		},
		render:function(){
			this.$el.html( this.template({type:"sell_select"}) );
			return this
		},
		filter:function(mate){
			var pc_deck = this.pc.get("deck");
			if(mate.fav || _.contains(pc_deck, mate.id)){
				return false
			}else{
				return true
			}
		},
		initMemberList : function(){
			return this.makeEmptyMemberList(6);
		},
		
		// 追加分
		sellBtn:function(){
			var select_members = _.map( this.members.models ,function(member,n){ return member.get("data").id; });
			if(_.compact(select_members).length === 0){ App.popup.message({message:"モンスターが選択されていません"}); return; }
			var preview        = this.mate.sellResult(this.pc, select_members );
			if( preview.is_have_not_all ){ App.popup.message({message:"所持モンスターが1体もいなくなるため、実行できません。"}); return; }
			if( preview.contain_fav     ){ App.popup.message({message:"お気に入りに設定しているモンスターが含まれているため、実行できません。"}); return; }
			if( preview.contain_deck    ){ App.popup.message({message:"デッキ編成されているモンスターが含まれているため、実行できません。"}); return; }
			
			var message = (preview.contain_limit)? '<i class="caution">素材に限界突破したモンスターがいます。<br/><br/></i>売却しますか？<br/>入手コイン：' + preview.get_game_money
			            : (preview.contain_rare_max >= df.RARITY_SR)? '<i class="caution">素材にSR以上のモンスターがいます。<br/><br/></i>売却しますか？<br/>入手コイン：' + preview.get_game_money
			            : '売却しますか？<br/>入手コイン：' + preview.get_game_money;
			
			App.popup.confirm({
				title     : "売却確認",
				message   : message,
				view_class: "sell_confirm",
			}).done(_.bind(function(){
				var result = this.mate.sell(this.pc, select_members );
				this.pc.save()
				
				this.resetMembers();
				this.addChangeCheckList(select_members);
				this.updateCardList();
				this.membersView.render();
				this.pageView.update();
				this.cardListView.render();
				this.updateTarget();
				this.infoView.render();
				
				App.popup.message({message:"売却しました<br/>"})
				App.mission.checkProcess("SELL_CARD", result);
			},this));
		},
	});
	var CardPage = function(){
		return {
			SelectView  :SelectView,
		}
	};
	return CardPage;
})

;
define('controllers/CaveBgView',[
	"models/CaveMapREC",
],function(CaveMapREC){
	
	// マップグラフィックの固定部分全体
	var BgView = Backbone.View.extend({
		id:"bg_view",
		tagName:"div",
		initialize:function(options){
			this.options = options;
			var canvas = $('<canvas></canvas>')[0];
			this.canvas = canvas;
			this.cacheBgImg = canvas;
			this.caveMap = new CaveMapREC;
			this.cacheBgFlag = 0;
			this.listenTo(this,"createdBg",this.cacheBg);
		},
		cacheBg:function(){
			
			if(this.cacheBgFlag == 1){ return }
			this.cacheBgFlag = 1;
			
			//準備
			var map      = this.caveMap.get("make_data");
			var startPos = this.caveMap.attributes.scratches[0];
			var canvas   = $('<canvas height="300" width="320"></canvas>')[0];
			var ctx      = canvas.getContext('2d');
			
			//切抜き場所を算出
			var width  = map.x * this.options.chip_size;
			var height = map.y * this.options.chip_size;
			var x = startPos.x * this.options.chip_size;
			var y = startPos.y * this.options.chip_size;
			
			//切抜き場所がはみ出していたらその分位置をずらす
			var drawX = x + ctx.canvas.width;
			var drawY = y + ctx.canvas.height ;
			if( width < drawX ){ x -= drawX - width; }
			if( height < drawY ){ y -= drawY - height; }
			
			//描画
			ctx.drawImage(this.canvas,-1*x,-1*y,width,height);
			this.cacheBgImg = canvas;
			//window.open( canvas.toDataURL() )
		},
		render:function(){
			var map              = this.caveMap.get("make_data");
			var floor_sub_gra_id = this.caveMap.get("floor_sub_gra_id");
			var floor_gra_id     = this.caveMap.get("floor_gra_id");
			var wall_gra_id      = this.caveMap.get("wall_gra_id");
			var bg_color         = this.caveMap.get("bg_color");
			var chips_class      = this.options.chips_class;
			var chip_size        = this.options.chip_size;
			var bgofs_1          = 0.4;
			var bgofs_2          = 0.8;
			var chipsf           = []; // 床と壁の境のグラチップリスト
			var chipsw           = []; // 壁グラのチップリスト
			
			for(var i=0; i<map.y; i++){
				for(var j=0; j<map.x; j++){
					if(map.data[i][j].type == df.MAP_TYPE_WALL){
						chipsw.push(map.data[i][j].gra_id);
					}else if(map.data[i][j].type == df.MAP_TYPE_FLOOR){
						chipsf.push(map.data[i][j].gra_id);
					}
				}
			}
			chipsf = _.uniq(chipsf);
			chipsw = _.uniq(chipsw);
			
			// map chipに不足がないかチェック
			var checkMapChipData = function(){
				var wall_chip_data  = ['000010000', '100010000', '001010000', '000010100', '000010001', '101010000', '100010100', '100010001', '001010100', '001010001', '000010101', '101010100', '101010001', '100010101', '001010101', '101010101', '010010000', '010010100', '010010001', '010010101', '000011000', '100011000', '000011100', '100011100', '000010010', '100010010', '001010010', '101010010', '000110000', '001110000', '000110001', '001110001', '010010010', '000111000', '110110110', '011011011', '000111111', '111111000', '111111111', '110110000', '000110110', '110110001', '001110110', '011011000', '000011011', '011011100', '100011011', ];
				var floor_chip_data = ['000000000', '100000000', '001000000', '000000100', '000000001', '101000000', '100000100', '100000001', '001000100', '001000001', '000000101', '101000100', '101000001', '100000101', '001000101', '101000101', '010000000', '010000100', '010000001', '010000101', '000001000', '100001000', '000001100', '100001100', '000000010', '100000010', '001000010', '101000010', '000100000', '001100000', '000100001', '001100001', '010000010', '000101000', '210100210', '012001012', '000101212', '212101000', '212101212', '210100000', '000100210', '210100001', '001100210', '012001000', '000001012', '012001100', '100001012', ];
				console.log("BgView#render.checkMapChipData [chipsw,chipsf]",[chipsw,chipsf]);
				wall_chip_data = _.difference(chipsw, wall_chip_data);
				floor_chip_data = _.difference(chipsf, floor_chip_data);
				if(wall_chip_data.length>0) { console.error("err_wall_chip",wall_chip_data); alert("不明なmap chipを検出しました"); }
				if(floor_chip_data.length>0){ console.error("err_floor_chip",floor_chip_data); alert("不明なmap chipを検出しました"); }
			}
			
			var response = {
				map : map,
				chip_size : chip_size,
				floor_sub_gra_id : floor_sub_gra_id,
				floor_gra_id : floor_gra_id,
				wall_gra_id : wall_gra_id,
				bg_color : bg_color,
				chips_class : chips_class,
				chipsf : chipsf,
				chipsw : chipsw,
				bgofs_1 : bgofs_1,
				bgofs_2 : bgofs_2,
			}
			
			this.$el.html( __.template("cave/bg_view_style",response) );
			this.renderCanvas(response);
			return this;
		},
		renderCanvas:function(res){
			var _this = this;
			var map              = this.caveMap.get("make_data");
			var floor_sub_gra_id = this.caveMap.get("floor_sub_gra_id");
			var floor_gra_id     = this.caveMap.get("floor_gra_id");
			var wall_gra_id      = this.caveMap.get("wall_gra_id");
			var chip_size        = this.options.chip_size * 2;
			
			//画像一覧データ作成
			var chipsf = _.reduce(res.chipsf,function(result,chip){ result["f"+chip] = __.path.img("map_chip/floor_sub/" + floor_sub_gra_id + "/" + chip + ".png");  return result },{});
			var chipsw = _.reduce(res.chipsw,function(result,chip){ result["w"+chip] = __.path.img("map_chip/wall/" + wall_gra_id + "/" + chip + ".png");            return result },{});
			var floor_bg = {floor_bg:__.path.img("map_chip/floor/" + floor_gra_id + ".png")};
			var chips = _.extend(chipsf,chipsw);
			var chips = _.extend(floor_bg,chips);
			
			//canvasを作成して描画
			var draw = function(){
				var canvas = $('<canvas style="zoom:0.5"></canvas>')[0];
				var ctx    = canvas.getContext('2d');
				ctx.canvas.height = map.y * chip_size;
				ctx.canvas.width  = map.x * chip_size;
				console.log("BgView#renderCanvas.draw [ctx]",ctx)
				
				var images = _.reduce(chips,function(result,src,i){
					var img = new Image();
					img.src = src;// + "?" + __.baseTime();
					result[i] = img;
					return result;
				},{})
				
				for(var i=0; i<map.y; i++){
					for(var j=0; j<map.x; j++){
						//console.log("BgView#renderCanvas.draw [i,j,map.data[i][j]]",[i,j,map.data[i][j]]);
						if(map.data[i][j].type == df.MAP_TYPE_WALL){
							ctx.drawImage(images["w" + map.data[i][j].gra_id], j*chip_size, i*chip_size, chip_size, chip_size);
						}
						//ときどきmapが欠けるのを修正。なぜこうなっていたのか不明
						//else if(map.data[i][j].type == df.MAP_TYPE_FLOOR && map.data[i][j].gra_id != "000000000"){
						else if(map.data[i][j].type == df.MAP_TYPE_FLOOR){
							ctx.drawImage(images["floor_bg"], j*chip_size, i*chip_size, chip_size, chip_size);
							ctx.drawImage(images["f" + map.data[i][j].gra_id], j*chip_size, i*chip_size, chip_size, chip_size);
						}
					}
				}
				
				_this.$el.prepend(canvas);
				_this.canvas = canvas;
				_this.trigger("createdBg");
			}
			
			//画像読み込み
			var chip_list = _.values(chips);
			var loader = __.preload(chip_list,draw);
		},
	});
	
	return BgView;
})

;
define('controllers/CaveResultView',[
	"models/PcREC",
	"models/Quest",
	"models/CaveREC",
	"models/CaveMapREC",
	"models/CaveManager",
	"controllers/Animations",
],function(PcREC,Quest,CaveREC,CaveMapREC,CaveManager,Animations){
	
	var CaveResultView = Backbone.View.extend({
		id:"cave_result_view",
		tagName:"div",
		events:{
			"ftap .result_btn": "next"
		},
		initialize:function(){
			this.pc = new PcREC;
			this.quest = new Quest;
			this.cave = new CaveREC;
			this.caveMap = new CaveMapREC;
			this.caveMgr = new CaveManager;
		},
		next: function(){
			this.caveMgr.trigger("Resume","gameEnd");
			App.router.navigate("/html/Quest/selectArea",{trigger:true});
			this.cave.destroy();
			this.caveMap.destroy();
		},
		response:function(){
			var play_result = this.cave.get("status").play_result;
			var quest_id    = this.cave.get("quest_id");
			var quest_play  = this.pc.attributes.quest_play;
			var result      = this.cave.toJSON().result;
			var response = {
				dungeon_name  : st.QuestListData[quest_id].dungeon_name,
				play_result   : (play_result == df.QUEST_RESULT_CLEAR) ? "clear" : "fail" ,
				result        : result,
				exist_reward  : (result.clear_first_reward.length>0 || result.clear_reward.length>0)? 1 : 0,
				is_first_clear: (play_result == 1 && quest_play[quest_id].clear == 1),
				coin          : (result.got_item_data[df.ITEM_GAME_MONEY] )?result.got_item_data[df.ITEM_GAME_MONEY].point :0,
				real_money    : (result.got_item_data[df.ITEM_REAL_MONEY] )?result.got_item_data[df.ITEM_REAL_MONEY].point :0,
				gacha_pt      : (result.got_item_data[df.ITEM_GACHA_POINT])?result.got_item_data[df.ITEM_GACHA_POINT].point:0,
				phrase        : result.got_phrase_data.length,
				capture_num   : result.get_member_list.length,
				battle_cnt    : result.enemy_win_count,
			};
			return response;
		},
		render:function(){
			console.log("CaveResultView#render [this.cave, this.caveMap]",[this.cave, this.caveMap]);
			this.$el.html( __.template("cave/cave_result_view",this.response()) );
			
			this.$el.find(".result .num").css("opacity",0);
			this.$el.find(".clear_reward_container").css("opacity",0);
			this.$el.find(".result_btn").css("opacity",0);
			
			return this;
		},
		setupView:function(){
			var result_anim = new App.anim.CaveResult({ $target: this.$el });
			result_anim.render();
		},
	});
	
	
	return CaveResultView;
})

;
define('controllers/CaveScratchesView',[
	"models/CaveREC",
	"models/CaveMapREC",
],function(CaveREC,CaveMapREC){
	
	var speed = 1;
	var time = 20 * speed;
	var jc = new jChrono({fps:time,updateTime:1000/time});
	window.scratch_jc = jc;
	jc.start();
	
	// スクラッチパネル1つ1つのModel（ScratchesView、ScratchesのBackbone.Model。）
	// @class Scratch
	var Scratch = Backbone.Model.extend({
		defaults:function(){
			return {
				"id"        : "0-0",
				"x"         : 0,
				"y"         : 0,
				"open"      : 0,
				"next"      : 0,
				"event_type": 0,
				//"event_id"  : 0,
				"event_data": "",
				"event_num" : 0,
			}
		},
		initialize:function(){
			this.listenTo(this,"change",this.open)
		},
		//自身のchange eventで実行する。隣接するModelのステータスなども変更する。
		open:function(e){
			if( e.changed.open == 1 ){
				var y = this.get("y");
				var x = this.get("x");
				var ids = [(y-1)+"-"+x, (y+1)+"-"+x, y+"-"+(x-1), y+"-"+(x+1)];
				for(var i in ids){
					var _target = this.collection.get(ids[i]);
					if(typeof _target !== "undefined" && _target.get("open") !== 1 ){
						_target.set("next",1);
					}
				}
			}
		}
	});
	
	// 階段や敵、タッチエフェクトなどの要素画像
	var ScratchObjectView = Backbone.View.extend({
		tagName:"i",
		initialize:function(){
			this.listenTo(this.model,"change",this.modelChange);
		},
		modelChange:function(e){
			if(e.changed.next == 1){
				this.animNext();
			}
			if(e.changed.open == 1){
				this.animOpen();
				this.animOpenObj();
			}
		},
		
		animNext : function(){
			var model = this.model;
			jc.animate({ duration: jc.frameToTime( 3), target: this.$close_el , alpha: [1,0], easing: "linear", });
			jc.animate({ duration: jc.frameToTime( 3), target: this.$next_el  , alpha: [0,1], easing: "linear", onFinish: function(k,anim){ if(model.get("open")) anim.target.css("opacity",0); }  });
			if(this.img_data.next_visible) jc.animate({ duration: jc.frameToTime( 3), target: this.$close_obj, alpha: [0,1], easing: "linear", });
		},
		animOpen : function(){
			this.$close_el.css("opacity",0);
			this.$next_el.css("opacity",0);
			jc.animate({ duration: jc.frameToTime( 5), target: this.$show_obj , alpha: [0,1], easing: "linear", });
			jc.animate({ duration: jc.frameToTime( 5), target: this.$close_obj, alpha: [1,0], easing: "linear", });
			jc.animate({ duration: jc.frameToTime(10), target: this.$open_el  , alpha: [0.7,0], scale: [1,1.6], easing: "easeOutQuart", });
		},
		animOpenObj : function(){
			var type = this.model.get("event_type");
			if(type == df.EVENT_KAIDAN){}
			if(type == df.EVENT_GAME_MONEY){
				var $coin_img = this.$show_obj.find(".treasure_coin_img");
				var $coin_num = this.$show_obj.find(".treasure_num");
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
				jc.animate({ duration: jc.frameToTime(5), target: $coin_img, easing: 'easeOutCubic', x: [0,6] , y: [-5,-25],
				}).animate({ duration: jc.frameToTime(5), target: $coin_img, easing: 'easeInCubic' , x: [6,10], y: [-25,-5],
				}).animate({ delay: jc.frameToTime(10), duration: jc.frameToTime(5), target: $coin_img, easing: 'linear',
					onFrame : function(k,anim){ anim.setStyle(anim.target, {x:10,y:-5,alpha:1-k}) },
					onInit  : function(anim){ anim.setStyle(anim.target, {x:0,y:-5,alpha:1}) }
				});
			}
			if(type == df.EVENT_REAL_MONEY ||
			   type == df.EVENT_GACHA_POINT ||
			   type == df.EVENT_PHRASE ||
			   type == df.EVENT_ITEM ||
			   false){
				var $kirakira = this.$show_obj.find(".treasure_kirakira");
				var $coin_num = this.$show_obj.find(".treasure_num");
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
			}
			if(type == df.EVENT_MIMIC){
				var $smoke = this.$show_obj.find(".treasure_smoke");
				jc.animate({
					duration: jc.frameToTime(15),
					target  : $smoke,
					onFrame : function(k,anim){
						var alpha = (1 - anim.getEase('linear'))*2;
						var linear = anim.getEase('linear');
						anim.setStyle(anim.target, {
							y     : 10 - 10 * linear,
							alpha : (alpha>1)? 1 : alpha,
							scaleX: 1+(linear*0.2),
							scaleY: 1+(linear*0.2),
						})
					},
				});
			}
			if(type == df.EVENT_ENEMY){
				var $show_enemy_img = this.$show_obj.find(".show_obj_img");
				var $close_enemy_img = this.$close_obj.find(".close_obj_img");
				$close_enemy_img.css("-webkit-transform-origin","50% 80%");
				jc.animate({
					duration: jc.frameToTime(20),
					target  : $close_enemy_img,
					scale   : [1.5,1],
					alpha   : [0.999,1],
					easing  : "easeOutElastic",
				});
				
				jc.animate({ duration: jc.frameToTime(30), target: this.$show_obj , alpha: [0,0.00001], onFinish:function(k,anim){ anim.target.css("opacity",1) }, });
				jc.animate({ duration: jc.frameToTime(30), target: this.$close_obj, alpha: [1,0.99999], onFinish:function(k,anim){ anim.target.css("opacity",0) }, });
			}
		},
		
		objImgData : (function(){
			var data = {}
			data[df.EVENT_EMPTY      ] = { show_img:"" , close_img:"" , size:"", next_visible: 0,}
			data[df.EVENT_KAIDAN     ] = { close_img:"map_chip/icon/"+df.EVENT_KAIDAN     +".png"  , show_img:"map_chip/icon/"+df.EVENT_KAIDAN     +".png"  , size:"95% 95%", next_visible: 1,}
			data[df.EVENT_GAME_MONEY ] = { close_img:"map_chip/icon/"+df.EVENT_GAME_MONEY +"_1.png", show_img:"map_chip/icon/"+df.EVENT_GAME_MONEY +"_2.png", size:"85% 85%", next_visible: 1,}
			data[df.EVENT_GACHA_POINT] = { close_img:"map_chip/icon/"+df.EVENT_GACHA_POINT+"_1.png", show_img:"map_chip/icon/"+df.EVENT_GACHA_POINT+"_2.png", size:"85% 85%", next_visible: 1,}
			data[df.EVENT_ITEM       ] = { close_img:"map_chip/icon/"+df.EVENT_ITEM       +"_1.png", show_img:"map_chip/icon/"+df.EVENT_ITEM       +"_2.png", size:"85% 85%", next_visible: 1,}
			data[df.EVENT_REAL_MONEY ] = { close_img:"map_chip/icon/"+df.EVENT_REAL_MONEY +"_1.png", show_img:"map_chip/icon/"+df.EVENT_REAL_MONEY +"_2.png", size:"85% 85%", next_visible: 1,}
			data[df.EVENT_ENEMY      ] = { close_img:"map_chip/icon/"+df.EVENT_ENEMY      +"_1.png", show_img:"map_chip/icon/"+df.EVENT_ENEMY      +"_2.png", size:"80% 80%", next_visible: 0,}
			data[df.EVENT_MIMIC      ] = { close_img:"map_chip/icon/"+df.EVENT_MIMIC      +"_1.png", show_img:"map_chip/icon/"+df.EVENT_MIMIC      +"_2.png", size:"85% 85%", next_visible: 1,}
			data[df.EVENT_PHRASE     ] = { close_img:"map_chip/icon/"+df.EVENT_PHRASE     +"_1.png", show_img:"map_chip/icon/"+df.EVENT_PHRASE     +"_2.png", size:"85% 85%", next_visible: 1,}
			data[df.EVENT_BOSS       ] = data[df.EVENT_EMPTY]
			//data[df.EVENT_BOSS       ] = { close_img:"map_chip/icon/5.png"  , show_img:"map_chip/icon/5.png"  , size:"60% 60%", next_visible: 1,}
			//data[df.EVENT_TRAP       ] = { show_img:"" , close_img:"" , size:"", next_visible: 0,}
			return data
		})(),
		
		objTemplates : (function(){
			var data = {}
			var createTemplate = function(show_tag){
				return __.mustache(('\
					<div class="object_el">\
						<div class="close_obj" style="opacity:{{ (img_data.next_visible && data.next)?1:0 }};">\
							{% if (img_data.close_img){ %}\
								<div class="close_obj_img" style="background-image:url({{ __.path.img(img_data.close_img) }}); -webkit-background-size:{{ img_data.size }};"></div>\
							{% } %}\
						</div>\
						<div class="show_obj " style="opacity:{{ (data.open)?1:0 }};">\
							{% if (img_data.show_img){ %}\
								<div class="show_obj_img" style="background-image:url({{ __.path.img(img_data.show_img) }}); -webkit-background-size:{{ img_data.size }};"></div>\
							{% } %}\
							<div class="show_obj_tags" style="opacity:{{ (data.open)?0:1 }};">' + show_tag + '</div>\
						</div>\
					</div>\
					<div class="close_el" style="opacity:{{ (data.open || data.next)?0:1 }};"></div>\
					<div class="next_el" style="opacity:{{ (data.next)?1:0 }};"></div>\
					<div class="open_el" style="opacity:0;"></div>\
				').replace(/\t/g,""));
			}
			data[df.EVENT_EMPTY      ] = createTemplate('');
			data[df.EVENT_KAIDAN     ] = createTemplate('');
			data[df.EVENT_GAME_MONEY ] = createTemplate('<div class="treasure_coin_img"></div><div class="treasure_num">{{ data.event_num }}<i class="union">コイン</i></div>');
			data[df.EVENT_REAL_MONEY ] = createTemplate('<div class="treasure_kirakira"></div><div class="treasure_num">{{ data.event_num }}<i class="union">魔石</i></div>');
			data[df.EVENT_GACHA_POINT] = createTemplate('<div class="treasure_kirakira"></div><div class="treasure_num">{{ data.event_num }}<i class="union">ガチャpt</i></div>');
			data[df.EVENT_PHRASE     ] = createTemplate('<div class="treasure_kirakira"></div>');
			data[df.EVENT_ITEM       ] = createTemplate('<div class="treasure_kirakira"></div>');
			data[df.EVENT_ENEMY      ] = createTemplate('');
			data[df.EVENT_MIMIC      ] = createTemplate('<div class="treasure_smoke"></div>');
			data[df.EVENT_BOSS       ] = data[df.EVENT_EMPTY];
			//data[df.EVENT_TRAP       ] = createTemplate('');
			
			return data
		})(),
		
		render:function(chips){
			//console.log(Scratch#render);
			var model      = this.model.toJSON();
			var id         = chips.scratch_obj + model.id;
			var class_name = chips.event_type + model.event_type +" "+ chips.row + model.x +" "+ chips.column + model.y +" "+ chips.scratch_obj;
			var img_data   = this.objImgData[model.event_type];
			var objTemplate= this.objTemplates[model.event_type];
			var html       = (objTemplate) ? objTemplate( {data: model, img_data: img_data } ) : alert("model.event_type:" + model.event_type + "がありません");
			
			if(appenv.BUILD_LEVEL == appenv.DEBUG_BUILD){
				var event_text = _(df).pick(function(data,key){ return key.match(/EVENT_/) && data == model.event_type }).keys().value()[0].replace("EVENT_EMPTY","           ");
				this.$el.attr("event", event_text);
			}
			this.$el.attr("id", id).attr("class", class_name).html( html )
			
			this.img_data   = img_data;
			this.$close_el  = this.$el.find(".close_el");
			this.$next_el   = this.$el.find(".next_el");
			this.$open_el   = this.$el.find(".open_el");
			this.$show_obj  = this.$el.find(".show_obj");
			this.$close_obj = this.$el.find(".close_obj");
			return this;
		},
	});
	
	var Scratches = Backbone.Collection.extend({model:Scratch});
	
	var ScratchesView = Backbone.View.extend({
		id:"scratch_view",
		tagName:"div",
		events:{
			"ftap":"tap",
		},
		initialize:function(options){
			this.cave      = new CaveREC;
			this.options = options;
		},
		tap:function(e,touchData){
			// modelはCaveScratch.js
			this.model.tap(this,e,touchData);
		},
		render:function(){
			var chips_class = this.options.chips_class;
			this.collection = new Scratches( _(this.cave.attributes.scratches).values().value() );
			if( this.cave.get("first_touch") == 0 ){
				this.$el.attr("class","first_touch");
			}
			this.$el.empty();
			
			this.collection.each(function(scratch){
				var scratchObjectView = new ScratchObjectView({model:scratch});
				this.$el.append( scratchObjectView.render( chips_class ).el )
			},this);
			
			console.log("ScratchesView#render [collection]", this.collection.toJSON());
			return this;
		}
	});
	
	// ここからCanvas版のObject
	/*
	var ScratchObjectCanvas = Backbone.View.extend({
		tagName:"i",
		initialize:function(config,option){
			this.canvas = option.canvas.stage;
			this.canvasEls = {};
			this.listenTo(this.model,"change",this.modelChange);
		},
		modelChange:function(e){
			
			if(e.changed.next == 1){
				this.canvasEls.cover.alpha = 0.5;
				this.canvasEls.cover.image = $('<img src="' + __.path.img("map_chip/fx/0.png") + '">')[0]
				if( this.model.get("event_type") != df.EVENT_ENEMY){
					this.addCanvas("obj", this.getObjImg(1), {alpha:0})
					createjs.Tween.get(this.canvasEls.obj).to({alpha:1},500)
				}
			}
			
			if(e.changed.open == 1){
				this.canvasEls.cover.alpha = 0;
				this.addOpenFx();
				this.canvasEls.obj.image = this.getObjImg(2);
			}
			
			if(e.changed.show == 1){
				this.canvasEls.cover.alpha = 0;
			}
			
		},
		render:function(){
			var _this = this;
			this.canvasEls.obj   = new createjs.Bitmap();
			this.canvasEls.open  = new createjs.Bitmap();
			
			//カバー画像
			var img = $('<img>')[0];
			var alpha = 0;
			if( !this.model.get("open") ){
				img = $('<img src="' + __.path.img("map_chip/fx/3.png") + '">')[0];
				alpha = 1;
			}
			if( this.model.get("next") ){
				img = $('<img src="' + __.path.img("map_chip/fx/0.png") + '">')[0];
				alpha = 0.5;
			}
			if( this.model.get("open") ){
				img = $('<img>')[0];
				alpha = 0.5;
			}
				// createjs_memo srcのないimgを渡すと警告が出る
				//img = $('<img src="' + __.path.img("map_chip/fx/3.png") + '">')[0];
			this.addCanvas("cover",img,{alpha:alpha})
			
			//アイテム画像
			if( this.model.get("event_type") != df.EVENT_ENEMY && (this.model.attributes.show || this.model.attributes.next) ){
				this.addCanvas("obj", this.getObjImg(2), {alpha:1})
			}
			
			return this;
		},
		
		
		baseLayout:function(img){
			return {
				regX      :60,
				regY      :60,
				x         :60 + this.model.attributes.x*120,
				y         :60 + this.model.attributes.y*120,
				scaleX    :1,
				scaleY    :1,
				alpha     :0.5,
				drawMargin:2,
			}
		},
		addCanvas:function(name,img,option){
			this.canvasEls[name] = new createjs.Bitmap(img);
			_.extend(this.canvasEls[name],this.baseLayout())
			if(option != undefined){ _.extend(this.canvasEls[name],option) }
			this.canvas.addChild(this.canvasEls[name]);
		},
		addOpenFx:function(){
			var img = $('<img src="' + __.path.img("map_chip/fx/1.png") + '">')[0];
			this.addCanvas("open",img,{alpha:1})
			
			createjs.Tween.get(this.canvasEls.open)
				.to({scaleX:1.7, scaleY:1.7, alpha:0 }, 600, createjs.Ease.quintOut)
		},
		getObjImg:function(type){
			var event_type = this.model.get("event_type");
			var img = $('<img>')[0];
				// createjs_memo srcのないimgを渡すと警告が出る
				//img = $('<img src="' + __.path.img("map_chip/icon/1.png") + '">')[0];
			     if(event_type == df.EVENT_KAIDAN      ){ img = $('<img src="' + __.path.img("map_chip/icon/1.png") + '">')[0]; }
			else if(event_type == df.EVENT_GAME_MONEY  ){ img = $('<img src="' + __.path.img("map_chip/icon/2_"+type+".png") + '">')[0]; }
			else if(event_type == df.EVENT_REAL_MONEY  ){ img = $('<img src="' + __.path.img("map_chip/icon/3_"+type+".png") + '">')[0]; }
			else if(event_type == df.EVENT_GACHA_POINT ){ img = $('<img src="' + __.path.img("map_chip/icon/3_"+type+".png") + '">')[0]; }
			else if(event_type == df.EVENT_ITEM        ){ img = $('<img src="' + __.path.img("map_chip/icon/3_"+type+".png") + '">')[0]; }
			else if(event_type == df.EVENT_ENEMY       ){ img = $('<img src="' + __.path.img("map_chip/icon/4.png") + '">')[0]; }
			return img;
		},
	});
	
	var CanvasView = Backbone.View.extend({
		tagName:"canvas",
		events:{
			//"ftap":"stopUpdate"
		},
		stopUpdate:function(){
			console.log("CanvasView#stopUpdate");
			createjs.Ticker.removeEventListener("tick", this.updateStage);
		},
		initialize:function(){
			this.caveMap = new CaveMapREC;
			var map = this.caveMap.get("make_data");
			var chip_size = 60;
			
			this.el.width  = map.x*chip_size*2;
			this.el.height = map.y*chip_size*2;
			this.$el.css({background:"rgba(125,125,125,0)",position:"absolute",top:"0px",left:"0px",height:(map.y*chip_size)+"px",width:(map.x*chip_size)+"px"})
			createjs.Ticker.setFPS(1);
			
			var use_webgl = true; // CreateJSのWebGL版の設定
			if(use_webgl){
				this.stage = new createjs.SpriteStage(this.el);
			}else{
				this.stage = new createjs.Stage(this.el);
			}
			
			this.updateStage = _.bind(function(e){
				this.stage.update(e);
			},this);
			createjs.Ticker.addEventListener("tick", this.stage);
		},
		render:function(){
			return this
		},
	});
	
	// ScratchesViewを上書き
	var ScratchesView = Backbone.View.extend({
		id:"scratch_view",
		tagName:"div",
		events:{
			"ftap":"tap",
		},
		initialize:function(options){
			this.cave      = new CaveREC;
			this.options = options;
		},
		tap:function(e,touchData){
			this.model.tap(this,e,touchData);
		},
		render:function(){
			
			var chips_class = this.options.chips_class;
			this.collection = new Scratches( _(this.cave.attributes.scratches).values().value() );
			if( this.cave.get("first_touch") == 0 ){
				this.$el.attr("class","first_touch");
			}
			this.$el.empty();
			
			__.preload(
				_.map([
					"map_chip/fx/0.png",
					"map_chip/fx/1.png",
					"map_chip/fx/2.png",
					"map_chip/fx/3.png",
					"map_chip/icon/1.png",
					"map_chip/icon/2_1.png",
					"map_chip/icon/3_1.png",
					"map_chip/icon/3_1.png",
					"map_chip/icon/3_1.png",
					"map_chip/icon/2_2.png",
					"map_chip/icon/3_2.png",
					"map_chip/icon/3_2.png",
					"map_chip/icon/3_2.png",
					"map_chip/icon/4.png",
				],
				function(file){ return __.path.img(file) }),
				_.bind(function(){
					this.canvasView = new CanvasView;
					console.log("ScratchesView#render.loaded [this.canvasView]",this.canvasView);
					this.collection.each(function(scratch){
						var scratchObjectCanvas = new ScratchObjectCanvas({model:scratch},{canvas:this.canvasView});
						scratchObjectCanvas.render();
						console.log("ScratchesView#render.loaded collection.each [scratchObjectCanvas]",scratchObjectCanvas);
					},this);
					this.$el.append(this.canvasView.el)
					this.canvasView.render();
				},this)
			)
			
			console.log("ScratchesView#render [collection]", this.collection.toJSON());
			return this;
		}
	});
	*/
	// ここまでCanvas版のObject
	
	return {
		ObjectView   :ScratchObjectView,
		ScratchesView:ScratchesView,
		Scratches    :Scratches
	};
})

;
define('models/CaveMembers',[
],function(){
	
	/**
	 * ダンジョン内の仲間のコレクション
	 * @class CaveMembers
	 */
	var CaveMember = Backbone.Model.extend({});
	var CaveMembers = Backbone.Collection.extend({
		constructor:function(){
			if(!CaveMembers.instance){
				CaveMembers.instance = this;
				Backbone.Collection.apply(CaveMembers.instance,arguments);
			}
			return CaveMembers.instance;
		},
		model:CaveMember,
	});
	
	return CaveMembers;
});






define('models/CaveScratch',[
	"models/Quest",
	"models/CaveREC",
	"models/CaveMapREC",
	"models/CaveManager",
	"models/CaveMembers",
],function(Quest,CaveREC,CaveMapREC,CaveManager,CaveMembers){
	
	var Scratch = Backbone.Model.extend({
		initialize:function(){
			this.touch     = {y:0,x:0}
			this.touchData = {}
			this.cave      = new CaveREC;
			this.caveMgr   = new CaveManager;
			this.disable_tap = 0;
		},
		tap:_.throttle(function(scratchesView,e,touchData){
			if(this.cave.get("status").play == df.RESUME_BATTLE){ return }
			if(this.disable_tap || App.popups.length > 0){ return }
			
			var s = __.scroller.id.map_view;
			var x = (s.pointX/__.adjustView.zoom_value) - s.wrapperOffset.left + (-1 * s.x);
			var y = (s.pointY/__.adjustView.zoom_value) + s.wrapperOffset.top  + (-1 * s.y);
			var pos = {
				y:(y/this.get("chip_size")).floor(),
				x:(x/this.get("chip_size")).floor(),
			}
			
			//if(e.target.tagName != "A"){ return }
			this.touchData  = _.clone(touchData);
			this.collection = scratchesView.collection;
			//var scratch_id  = $(e.target).attr("id").replace("a","")
			var scratch_id  = pos.y +"-"+ pos.x;
			var scratch     = this.collection.get(scratch_id);
			if(_.isUndefined(scratch)){ return }
			var event_type  = scratch.get("event_type");
			//var event_id    = scratch.get("event_id");
			var event_data  = scratch.get("event_data");
			var event_num   = scratch.get("event_num"); // CaveMapREC#setScratchEventNum でタイプ別に計算
			var open_num    = 0;
			var close_num   = 0;
			var positive_open= 0;
			var negative_open= 0;
			var is_open     = 0;
			console.log("Scratch#tap [touchData,scratch.attributes]", [touchData,_.cloneDeep(scratch.attributes)] );
			
			//touch判定とset。ScratchのchangeイベントでScratchViewの変更。
			if( scratch.get("next") === 1 || this.cave.get("first_touch") === 0 ){
				scratch.set({open:1,next:0});
				is_open = 1;
			}
			
			//閉じマスはリターン.
			if( !scratch.get("open") ){ return }
			
			//first_touchの保存とfirst_touchクラスの削除
			if( this.cave.get("first_touch") == 0 ){
				scratchesView.$el.attr("class", scratchesView.$el.attr("class").replace("first_touch","") );
				this.cave.set("first_touch",1);
			}
			
			//scratchの保存
			//開き数のカウント
			this.cave.attributes.scratches = _( this.collection.toJSON() ).reduce(function(result,scratch){
				var t = scratch.event_type;
				if(scratch.open==1){
					open_num++
				}else{
					close_num++
					if(t==df.EVENT_EMPTY || t==df.EVENT_KAIDAN || t==df.EVENT_BOSS){}
					else if(t==df.EVENT_GAME_MONEY || t==df.EVENT_REAL_MONEY || t==df.EVENT_GACHA_POINT || t==df.EVENT_PHRASE || t==df.EVENT_ITEM){ positive_open++ }
					else if(t==df.EVENT_ENEMY || t==df.EVENT_MIMIC || t==df.EVENT_TRAP){ negative_open++ }
				}
				result[scratch.id] = scratch;
				return result;
			},{});
			this.cave.attributes.open_num      = open_num;
			this.cave.attributes.close_num     = close_num;
			this.cave.attributes.positive_open = positive_open;
			this.cave.attributes.negative_open = negative_open;
			
			// 開いたのが最後のイベントならmissionに送る
			if(close_num == 0 && is_open) App.mission.checkProcess("ALL_OPEN_CHIP");
			
			// 開いたときの各種イベント処理
			if( is_open ){
				
				App.sound.se(1);
				
				if(event_type == df.EVENT_KAIDAN){
					this.delayEvent(function(){
						this.cave.scratchLogger(scratch);
						this.caveMgr.kaidanEvent(event_data,event_num);
					})
				}
				if(event_type == df.EVENT_EMPTY){
					this.caveMgr.emptyEvent(event_data,event_num)
				}
				if(event_type == df.EVENT_GAME_MONEY){
					this.cave.scratchLogger(scratch);
					this.caveMgr.gameMoneyEvent(event_data,event_num)
				}
				if(event_type == df.EVENT_REAL_MONEY){
					this.cave.scratchLogger(scratch);
					this.caveMgr.realMoneyEvent(event_data,event_num)
				}
				if(event_type == df.EVENT_GACHA_POINT){
					this.cave.scratchLogger(scratch);
					this.caveMgr.gachaPointEvent(event_data,event_num)
				}
				if(event_type == df.EVENT_PHRASE){
					this.delayEvent(function(){
						this.cave.scratchLogger(scratch);
						this.caveMgr.phraseEvent(event_data,event_num)
						App.mission.checkProcess("FIND_PHRASE");
					})
				}
				if(event_type == df.EVENT_ITEM){
					this.delayEvent(function(){
						this.cave.scratchLogger(scratch);
						this.caveMgr.itemEvent(event_data,event_num)
					})
				}
				if(event_type == df.EVENT_ENEMY){
					this.delayEvent(function(){
						this.cave.scratchLogger(scratch);
						this.caveMgr.enemyEvent(event_data,"is_not_boss");
					})
				}
				if(event_type == df.EVENT_MIMIC){
					this.delayEvent(function(){
						this.cave.scratchLogger(scratch);
						this.caveMgr.enemyEventMimic(event_data,"is_not_boss");
					})
				}
				if(event_type == df.EVENT_TRAP){
					this.cave.scratchLogger(scratch);
					this.caveMgr.trapEvent(event_data,event_num)
				}
			}
			
			// 既に開いているマスをタッチしたときの処理
			if( !is_open ){
				
				if(appenv.BUILD_LEVEL > appenv.DEBUG_BUILD){
					if(event_type == df.EVENT_KAIDAN){
						this.cave.scratchLogger(scratch);
						this.caveMgr.kaidanEvent(event_data,event_num);
					}
				}
				
				if(appenv.BUILD_LEVEL == appenv.DEBUG_BUILD){
					if(event_type == df.EVENT_PHRASE){
						this.delayEvent(function(){
							this.cave.scratchLogger(scratch);
							this.caveMgr.phraseEvent(event_data,event_num);
						})
					}
					if(event_type == df.EVENT_ITEM){
						this.delayEvent(function(){
							this.cave.scratchLogger(scratch);
							this.caveMgr.itemEvent(event_data,event_num)
						})
					}
					if(event_type == df.EVENT_KAIDAN){
						this.delayEvent(function(){
							this.cave.scratchLogger(scratch);
							this.caveMgr.kaidanEvent(event_data,event_num);
						})
					}
					if(event_type == df.EVENT_ENEMY){
						this.delayEvent(function(){
							this.cave.scratchLogger(scratch);
							this.caveMgr.enemyEvent(event_data, "is_not_boss");
						})
					}
					if(event_type == df.EVENT_MIMIC){
						this.delayEvent(function(){
							this.cave.scratchLogger(scratch);
							this.caveMgr.enemyEventMimic(event_data, "is_not_boss");
						})
					}
				}
			}
			
			this.cave.save();
		},300,{trailing: false}),
		delayEvent : function(callback){
			this.disable_tap = 1;
			_.delay(_.bind(function(){
				try{
					_.bind(callback,this)();
					this.cave.save();
				}catch(e){
					console.error(e)
				}
				this.disable_tap = 0;
			},this),300)
		}
	});
	
	return Scratch;
})

;
define('controllers/CaveView',[
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

;
define('controllers/FooterView',[
	'models/PcREC',
	'models/PresentREC',
	'models/DebugConsole',
],function(PcREC, PresentREC, DebugConsole){
	
	// model
	var Footer = Backbone.Model.extend({
		constructor:function(){
			// シングルトン
			if(!Footer.instance){
				Footer.instance = this;
				Backbone.Model.apply(Footer.instance,arguments);
			}
			return Footer.instance;
		},
		initialize:function(){
			this.pc = new PcREC;
			this.present = new PresentREC;
			this.changePc();
			this.changePresent();
			this.listenTo(this.pc     ,"on_save", this.changePc);
			this.listenTo(this.present,"on_save", this.changePresent);
		},
		changePc: function(){
			var gacha_pt  = this.pc.getItem(df.ITEM_GACHA_POINT);
			var price     = st.GachaListData[10100].price;
			var gacha_num = (gacha_pt/price).floor().cap(99);
			this.set("gacha_num", gacha_num);
		},
		changePresent: function(){
			this.set("present_num", this.present.get("present_list").length );
		},
		defaults:function(){
			return {
				active : 0,
				disp   : 1,
				gacha_num   : 0,
				present_num : 0,
			}
		},
	});
	
	// view
	var FooterView = Backbone.View.extend({
		events:{
			"ftap .mypage " :"mypage",
			"ftap .dungeon" :"dungeon",
			"ftap .gacha  " :"gacha",
			"ftap .card   " :"card",
			"ftap .shop   " :"shop",
			"ftap .debug  " :"debug",
		},
		initialize:function(){
			this.listenTo(this.model,"change", this.change);
		},
		change:function(model){
			if(_.has(model.changed,"active")){
				this.$el.find("a").removeClass("active");
				switch (model.changed.active){
					case df.FOOTER_MYPAGE  : this.$el.find(".mypage" ).addClass("active"); break;
					case df.FOOTER_DUNGEON : this.$el.find(".dungeon").addClass("active"); break;
					case df.FOOTER_GACHA   : this.$el.find(".gacha"  ).addClass("active"); break;
					case df.FOOTER_CARD    : this.$el.find(".card"   ).addClass("active"); break;
					case df.FOOTER_SHOP    : this.$el.find(".shop"   ).addClass("active"); break;
				}
			}
			if(_.has(model.changed,"disp")){
				if(model.changed.disp == 0){ this.$el.addClass("hide"); }
				if(model.changed.disp == 1){ this.$el.removeClass("hide"); }
			}
			if(_.has(model.changed,"gacha_num")){
				if( model.get("gacha_num") ){
					this.$el.find(".gacha .gacha_num.batch").show().find("i").html( model.get("gacha_num") );
				}else{
					this.$el.find(".gacha .gacha_num.batch").hide();
				}
			}
			if(_.has(model.changed,"present_num")){
				if( model.get("present_num") ){
					this.$el.find(".mypage .present_num.batch").show().find("i").html( model.get("present_num") );
				}else{
					this.$el.find(".mypage .present_num.batch").hide();
				}
			}
		},
		mypage :function(){ /*App.router.checkLogin();*/ this.model.set("active",df.FOOTER_MYPAGE ); App.router.navigate("html/Top/mypage"      , {trigger: true}); },
		dungeon:function(){ App.router.checkLogin();     this.model.set("active",df.FOOTER_DUNGEON); App.router.navigate("html/Quest/selectArea", {trigger: true}); },
		gacha  :function(){ App.router.checkLogin();     this.model.set("active",df.FOOTER_GACHA  ); App.router.navigate("html/Gacha/index"     , {trigger: true}); },
		card   :function(){ App.router.checkLogin();     this.model.set("active",df.FOOTER_CARD   ); App.router.navigate("html/Card/index"      , {trigger: true}); },
		shop   :function(){ App.router.checkLogin();     this.model.set("active",df.FOOTER_SHOP   ); App.router.navigate("html/Shop/index"      , {trigger: true}); },
		template: __.mustache('\
			<div id="footer_container">\
				<a class="mypage" ><i class="text"></i><span class="present_num batch" style="{{ (present_num)?"" :"display:none;" }}"><i>{{ present_num }}<i></span></a>\
				<a class="dungeon"><i class="text"></i></a>\
				<a class="gacha"  ><i class="text"></i><span class="gacha_num batch" style="{{ (gacha_num)?"" :"display:none;" }}"><i>{{ gacha_num }}<i></span></a>\
				<a class="card"   ><i class="text"></i></a>\
				<a class="shop"   ><i class="text"></i></a>\
				<span class="debug" style="position: absolute; top: -421px; left: 4px; font-size: 12px; color: #9CB4B4;" ><i>デバッグ</i></span>\
			</div>\
		'),
		render:function(){
			this.$el.html( this.template( this.model.toJSON() ) );
			return this;
		},
		debug:function(){
			//this.model.set("active",6);
			var debugConsole = new DebugConsole;
			debugConsole.showSystemDebugView();
		},
	});
	
	return {
		View : FooterView,
		Model: Footer,
	};
})

;
define('models/GachaDraw',[
	"models/Mate"
],function(Mate){

/**
 * ガチャを実行する
 * @class GachaDraw
 */
var GachaDraw = Backbone.Model.extend({
	defaults:function(){
		return {
			result:[]
		};
	},
	gachaTable : _(st.GachaTableData).values().sortBy( function(m){return m.id} ).value(),
	/**
	 * 1回ガチャを引く処理
	 * @memberof GachaDraw
	 * @function once
	 * @param table_id {int} 実行に使うガチャテーブルのID
	 * @param rate_column {int} ガチャテーブル内の更に確率違いの列を選択
	 */
	once : function(table_id,rate_column){
		var lotMax      = 0;
		var lotNo       = 0;
		var electId     = 0;
		var lotSum      = 0;
		// 抽選
			lotMax = _(this.gachaTable).reduce( function(s,m){ return s + m[rate_column][table_id] },0);
			lotNo  = _.random(0, lotMax);
			for(var i in this.gachaTable){
				lotSum += this.gachaTable[i][rate_column][table_id];
				electId = this.gachaTable[i].card_seed_id[table_id];
				if(lotSum >= lotNo){ break };
			};
		// log
			var result = {
				lotMax :lotMax,
				lotNo  :lotNo,
				lotSum :lotSum,
				electId:electId,
			};
			console.log("GachaDraw#once [result]", result);
		return result;
	},
	/**
	 * ガチャを引いてリザルトを返す。1回だけひくガチャもこれを使用する。
	 * @memberof GachaDraw
	 * @function draw
	 * @param pc {object} PcRECのインスタンス
	 * @param gacha {int} GachaListData.updateGachasで取得した中のどれか一つ
	 * @return {object} get_list、new_list、sp_cnt(確変列で引いた回数。test code用)
	 */
	draw : function(pc,gacha){
		// 回数分ガチャる
		var gacha_result  = [];
		var sp_cnt  = 0;
		_(gacha.draw_num).times( function(n){
			if( n < gacha.sp_num ){
				gacha_result.push( this.once( gacha.table_id , "rate_sp" ).electId );
				sp_cnt += 1;
			}else{
				gacha_result.push( this.once( gacha.table_id , "rate" ).electId );
			}
		},this);
		
		//mate set
		var mate = new Mate;
		var get_list = mate.createMates(pc,gacha_result);
		var new_list = mate.mapNewFlag(pc,get_list);
		
		return {
			get_list:get_list,
			new_list:new_list,
			sp_cnt:sp_cnt,
		};
	},
	/**
	 * ガチャ実行前のエラーチェック。所持アイテム不足チェック、所持上限チェック、曜日チェック、期間チェック、回数チェック、ゲリラチェック。
	 * @memberof GachaDraw
	 * @function checkError
	 * @param pc {object} PcRECのインスタンス
	 * @param gacha {int} GachaListData.updateGachasで取得した中のどれか一つ
	 */
	checkError:function(pc,gacha){
		// todo エラーをちゃんと作る
		var have_pt = pc.getItem( gacha.need_item_id );
		var status = pc.attributes.gacha_status[ gacha.id ];
		
		//所持アイテム不足チェック
		if( have_pt < gacha.price ){ return st.ItemData[gacha.need_item_id].name + "が足りません" };
		//所持上限チェック
		if( pc.get("mate_max") <= _(pc.get("mate_list")).size() ){ return "cardが上限値を超えています" };
		//曜日チェック
		if( gacha["week_flag["+ __.moment().day() +"]"] == 0 ){ return "期間が過ぎています" };
		//期間チェック
		if( gacha.begin !== "" && (__.moment().isBefore(gacha.begin) || __.moment().isAfter(gacha.end))  ){ return "期間が過ぎています" };
		//回数チェック
		if( gacha.limit_num > 0 && status.draw_cnt >= gacha.limit_num ){ return "このガチャが引けるのは"+gacha.limit_num+"回までです" };
		//ゲリラチェック
		if( gacha.alive_time > 0 ){
			if( __.baseTime() > status.last_check_time + gacha.reset_hour*60*60*1000 ){ return "期間が過ぎています" } // next_check_timeを過ぎてる
			else if( __.baseTime() < status.last_check_time + gacha.alive_time*60*1000 ){} // ゲリラ中 かつ まだ引ける
			else{ return "期間が過ぎています" }
		}
	},
});


return GachaDraw;

});
define('models/GachaListData',[],function(){

/**
 * ガチャ一覧のBackbone.Model
 * @memberof GachaListData
 */
var Gacha = Backbone.Model.extend({
	defaults:function(){
		return {
			id          :0,
			btn_name    :"gachaBtn",
			gacha_name  :"！ガチャデータがありません",
		};
	}
});

/**
 * ガチャ一覧のBackbone.Collection
 * @memberof GachaListData
 */
var Gachas = Backbone.Collection.extend({model:Gacha});

/**
 * ガチャ一覧の初期状態を取得しておく
 * @memberof GachaListData
 */
var defaultGachas = new Gachas( _(st.GachaListData).values().value() );

/**
 * ガチャ一覧を更新。日付やガチャ可能回数などをチェックする。
 * @memberof GachaListData
 * @function updateGachas
 * @param pc {object} PcRECのインスタンス
 * @return {object} Backbone.Collectionのオブジェクト
 * @todo 中の処理をメソッドに分割
 */
var updateGachas = function(pc){
	
	// todo updateGachasをPcRECに作る
	// todo ガチャを引くときのバリデーションを別途作る
	// todo 時刻修正
	__.adjust();
	var current_time = __.baseTime();
	var moment = __.moment();
	
	var gacha_list = _.cloneDeep(st.GachaListData);
	var lose_gacha_list = [];
	var revival_checked_list = [];
	
	//pcのgacha情報を追加
	_.each(st.GachaListData,function(gacha){
		if(!pc.attributes.gacha_status[gacha.id]){
			pc.attributes.gacha_status[gacha.id] = pc.defaultGacha(gacha.id);
		}
	},this)
	
	//自動n連処理
	gacha_list = _.reduce(gacha_list, function(result, gacha, key){
		var have_pt = pc.getItem( gacha.need_item_id );
		var enable_num = 0;
		if(gacha.draw_num < 0){
			gacha.draw_num = (gacha.draw_num).abs();
			enable_num = (have_pt/gacha.price).floor();
			if( enable_num === 0){
				gacha.draw_num = 1;
			}else if( enable_num < gacha.draw_num ){
				gacha.draw_num = enable_num;
			}
			gacha.price *= gacha.draw_num;
		};
		result.push(gacha);
		return result;
	},[]);
	
	// パラメーターをコピー
	gacha_list = _.each(gacha_list,function(gacha){
		var status = pc.attributes.gacha_status[gacha.id];
		gacha.draw_cnt          = status.draw_cnt;
		gacha.last_check_time   = status.last_check_time;
		gacha.last_revival_time = status.last_revival_time;
		// 以下の条件のとき、復活時間を経過しても、復活前のガチャが残っているため、ガチャを引く→復活判定にまたかかる
		// というのを防ぐため対応。gacha.alive_timeをgacha.reset_hourと同じ時間にする。
		gacha.alive_time = (gacha.alive_time==0 && gacha.reset_hour > 0) ? gacha.reset_hour*60 : gacha.alive_time ;
	});
	
	// 期間、曜日、アイテム不足時に表示を消すもの、をフィルター
	gacha_list = _.filter(gacha_list,function(gacha){ return !gacha.begin || ( moment.isAfter(gacha.begin) && moment.isBefore(gacha.end) ) });
	gacha_list = _.filter(gacha_list,function(gacha){ return gacha.week_flag[moment.day()] == 1 });
	gacha_list = _.filter(gacha_list,function(gacha){ return !(gacha.hide_has_not_item == 1 && pc.getItem(gacha.need_item_id) < gacha.price) });
	
	// コピーを保存
	var gacha_list_need_data = _.cloneDeep(gacha_list);
	var before_gacha_ids = _.map(gacha_list,function(gacha){ return gacha.id });
	
	// 制限回数、有効時間でフィルター
	gacha_list = _.filter(gacha_list,function(gacha){ return  gacha.limit_num == 0 || gacha.draw_cnt < gacha.limit_num });
	gacha_list = _.filter(gacha_list,function(gacha){ return  gacha.alive_time == 0 || gacha.last_revival_time + gacha.alive_time*60*1000 > current_time });
	
	// 制限回数の復活判定
	// 復活判定方法
	// 最後に復活判定を行った時刻から、復活時間が経過していたら、復活判定をする
	// 復活判定を行ったら、その判定結果に関わらず、復活判定時刻を保存する
	var after_gacha_ids = _.map(gacha_list,function(gacha){ return gacha.id });
	var revival_chance_ids = _.difference(before_gacha_ids,after_gacha_ids);
	var revival_chance_gahca_list = _.map(revival_chance_ids,function(id){ return _.find(gacha_list_need_data,function(gacha){ return gacha.id == id }) })
	var revival_checked_list = _.map(revival_chance_gahca_list,function(gacha){
		if(gacha.last_check_time + gacha.reset_hour*60*60*1000 < current_time){
			gacha.last_check_time = current_time;
			if(gacha.reset_rate  > _.random(0,99) ){
				gacha.draw_cnt = 0;
				gacha.last_revival_time = current_time;
			}else{
				gacha.draw_cnt = gacha.limit_num;
			}
			return gacha
		}
	});
	revival_checked_list = _.compact(revival_checked_list);
	
	// 元が[0,1,0,1,0]のようなリストを、復活失敗リスト[0,0,0]と、有効リスト[1,1]に分けたのち、
	// priorityでソートすることで[0,1,0,1,0]の並び順を復元し、最初の1より前のみデータ（例だと[0,1]まで）を取得し、更新を行う
	var update_gacha_list = _.cloneDeep( gacha_list.concat(revival_checked_list) );
	update_gacha_list = _.groupBy(update_gacha_list,function(gacha){ return gacha.group; })
	update_gacha_list = _.map(update_gacha_list,function(group){ return group.sort(function(a,b){ return b.priority - a.priority }) })
	update_gacha_list = _.reduce(update_gacha_list,function(result,group){
		for(var i in group){
			result.push(group[i])
			if( !_.find(revival_checked_list, function(rev){ return rev.id == group[i].id }) ) break
		}
		return result
	},[])
	
	// アップデート状態を保存
	_.each(update_gacha_list,function(gacha){
		pc.attributes.gacha_status[gacha.id].draw_cnt = gacha.draw_cnt ;
		pc.attributes.gacha_status[gacha.id].last_check_time = gacha.last_check_time ;
		pc.attributes.gacha_status[gacha.id].last_revival_time = gacha.last_revival_time ;
	})
	
	// draw_cntをlimit_numにすることで復活を防いでいるので、制限回数で再びフィルターを行う
	gacha_list = _.filter(update_gacha_list,function(gacha){ return  gacha.limit_num == 0 || gacha.draw_cnt < gacha.limit_num });
	
	// グループ分けし、プライオリティでソート、各グループの1番目のみ取り出した配列を用意する
	gacha_list = _.groupBy(gacha_list,function(gacha){ return gacha.group; })
	gacha_list = _.map(gacha_list,function(group){ return group.sort(function(a,b){ return b.priority - a.priority }) })
	gacha_list = _.compact(gacha_list);
	gacha_list = _.reduce(gacha_list,function(result,group){ result.push(group[0]); return result; },[])
	
	//配列を整理して返す
	gacha_list.sort(function(a,b){ return b.position - a.position });
	var gachas = new Gachas( _.compact(gacha_list) );
	return gachas
};

/**
 * ガチャ一覧に必要なデータ
 * @class GachaListData
 */
var GachaListData = function(){
	return {
		Gacha:Gacha,
		Gachas:Gachas,
		defaultGachas:defaultGachas,
		updateGachas:updateGachas,
	};
};

return GachaListData;

});

define('controllers/GachaIndexView',[
	"models/GachaDraw",
	"models/GachaListData",
	"models/PcREC",
	"models/Mate",
""],function(GachaDraw,GachaListData,PcREC,Mate){
	
	var GachaIndexView = Backbone.View.extend({
		tagName:"div",
		events:{
			"ftap .gacha_btn":"gachaConfirm",
		},
		initialize:function(){
			this.pc = new PcREC;
			this.gachaListData = new GachaListData();
			var pc_prev = _.cloneDeep( this.pc.get("gacha_status") );
			this.gachas = this.gachaListData.updateGachas(this.pc);
			// pcのsaveは重いので、isEqualで暫定対応。できればGachaRECを作って対応したい。
			if( !_.isEqual(pc_prev, this.pc.get("gacha_status") ) ){ this.pc.save(); }
			this.gacha = {};
		},
		gachaResponse : function(gacha_id){
			var gacha          = this.gachas.get(gacha_id).toJSON();
			var remainTime     = new __.RemainTime({ disp:{sec:false} , str:{day:"日",hour:"時間",min:"分"} });
			var revival_time   = gacha.last_check_time + gacha.reset_hour*60*60*1000;
			var alive_time     = gacha.last_check_time + gacha.alive_time*60*1000;
			var gacha_end      = st.GachaListData[gacha_id].end;
			var remain_time    = (st.GachaListData[gacha_id].alive_time)? remainTime.toText(alive_time): "";
			var remain_term    = (gacha_end)? __.moment(gacha_end).format("M/D HH:mm (ddd)"): "";
			var gacha_end_time = (gacha_end)?__.moment(gacha_end).valueOf():"";
			if(gacha_end && gacha_end_time - __.baseTime() < 24*60*60*1000){
				remain_time = remainTime.toText(gacha_end_time);
				remain_term = ""
			}
			var response = {
				gacha           : gacha,
				item            : st.ItemData[gacha.need_item_id],
				have_item       : this.pc.getItem(gacha.need_item_id),
				revival_text    : __.moment(revival_time).format("YYYY/MM/DD HH:mm (ddd)"),
				revival_remain  : remainTime.toText(revival_time),
				revival_per     : gacha.reset_rate,
				alive_time      : alive_time,
				alive_remain    : remainTime.toText(alive_time),
				remain_time     : remain_time,
				remain_term     : remain_term,
			}
			return response;
		},
		gachaConfirm: function(e){
			var gacha_id = $(e.currentTarget).data("gacha_id");
			var gacha = this.gachas.get(gacha_id).toJSON();
			console.log("GachaIndexView#gachaConfirm [e,gacha]",[e,gacha]);
			
			var response = this.gachaResponse(gacha_id);
			var html = __.template("gacha/draw_confirm_dialog",response);
			
			App.popup.confirm({view_class: "gacha_confirm_view", title: gacha.name, message:html}).done(_.bind(function(){
				var result = this.drawGacha(gacha);
				if(!result) return;
				
				this.render();
				var anim = new App.anim.Gacha();
				var popup = App.popup.add(anim,{view_class:"gacha_anim"});
				App.mission.checkProcess("DRAW_GACHA");
			},this));
		},
		drawGacha:function(gacha){
			//draw
			var gachaDraw = new GachaDraw;
			var error = gachaDraw.checkError(this.pc,gacha);
			if(error){
				App.popup.message({message:error});
				return false;
			}
			var result = gachaDraw.draw(this.pc,gacha);
			
			//pc set
			var gacha_status = this.pc.attributes.gacha_status[gacha.id];
			if(gacha_status === undefined){ throw "gacha_status:" + gacha.id + " is undefined" };
			if(gacha.limit_num > 0 ){ gacha_status.draw_cnt += 1; };
			gacha_status.total_draw_cnt += 1;
			gacha_status.last_draw_time= __.baseTime();
			
			this.gachas = this.gachaListData.updateGachas(this.pc);
			this.pc.attributes.result.gacha_result = result.new_list;
			this.pc.addMates(result.get_list);
			this.pc.useItem( gacha.need_item_id , gacha.price);
			this.pc.save();
			
			console.log("GachaIndexView#drawGacha [result]",result)
			return result
		},
		response:function(){
			var gacha_list = _.map(_.cloneDeep(this.gachas.toJSON()), function(model){
				_.extend(model, this.gachaResponse(model.id));
				var status = this.pc.attributes.gacha_status[model.id] ;
				if(model.limit_num > 0){ model.rest_num = model.limit_num - status.draw_cnt };
				return model;
			},this);
			var table_id = gacha_list[0].table_id;
			var table_data = _.reduce(st.GachaTableData,function(result,data){ result.push(data.card_seed_id[table_id]); return result; },[]);
			table_data = _.reduce(_.compact(table_data),function(result,seed_id){ result.push( st.CardData[ st.CardSeedData[seed_id].card_id ] ); return result; },[]);
			var top_rarity = _.max(table_data, function(data){ return data.rarity }).rarity;
			table_data = _.filter(table_data, function(data){ return data.rarity == top_rarity });
			table_data = _.shuffle(table_data).slice(0,5).sort(function(a,b){ return b.id - a.id });
			return {
				info_gacha_table_data: table_data,
				info_gacha_data: gacha_list[0],
				gacha_list: gacha_list,
				pc: this.pc.toJSON(),
				gacha_point: this.pc.getItem( df.ITEM_GACHA_POINT ),
				game_money : this.pc.getItem( df.ITEM_GAME_MONEY ),
				real_money : this.pc.getItem( df.ITEM_REAL_MONEY ),
			};
		},
		render:function(){
			this.$el.html( __.template("gacha/index",this.response()) );
			__.scroller.create("gacha_index_list",{scrollbars:true});
			return this;
		},
		remove:function(){
			this.$el.remove();
			this.stopListening();
			//その他、removeする必要があるものをこここでおこなう
			return this;
		}
	});
	
	var ret = {
		page : GachaIndexView,
		draw : function(){alert()},
	};
	
	return ret;
	
})

;
define('controllers/PopupPresentList',[
	"models/PcREC",
	"models/PresentREC",
],function(PcREC,PresentREC){
	var present = new PresentREC;
	var pc = new PcREC;
	
	var Present = Backbone.Model.extend({
		defaults:function(){
			return _.extend( {received : 0, unreceived : 0}, present.itemDefault() )
		},
		initialize: function(){
			
		},
	})
	var PresentList = Backbone.Collection.extend({model:Present})
	var PresentView = Backbone.View.extend({
		className : "present_view",
		tagName: "div",
		initialize: function(){
			this.listenTo(this.model,"change",this.render);
		},
		events:{
			"ftap .receive":"receive",
		},
		receive: function(){
			if( this.model.get("received") ){ return }
			console.log("PopupPresentList#PresentView#receive");
			var data = this.model.toJSON();
			var is_received = present.receive(data.id);
			present.save();
			if( is_received === true ){
				this.model.set("received",1);
				App.popup.message({title:"プレゼント受け取り" ,message: __.helper.itemName(data.data_type, data.item_id, data.num) + "<br/>を受け取りました！" })
			}else{
				this.model.set("received",1);
				this.model.set("unreceived",1);
				App.popup.message({title:"期限切れ" ,message: "期限がすぎているため、<br/>受け取れませんでした" })
			}
			present.trigger("change_present");
		},
		template: __.mustache('\
			<table class="present_container"><tr>\
				<td class="td1">\
					<div class="receive_time">{{ __.moment(time).format("L HH:mm") }}</div>\
					<div class="present_name">{{ __.helper.itemName(data_type, item_id, num) }}</div>\
					<div class="present_text">{{ message }}</div>\
					{% if(limit){ %}<div class="limit_time">{{ __.moment(limit).format("期日 L HH:mm") }}</div>{% } %}\
				</td>\
				<td class="td2">\
					<i class="receive">\
						{{ (unreceived)? "期限切れ" : (received) ? "受取済み" : "受取" }}\
					</i>\
				</td>\
			</tr></table>\
		'),
		render : function(){
			this.$el.attr("state-received", !!this.model.get("received") );
			this.$el.attr("state-unreceived", !!this.model.get("unreceived") );
			var html = this.template( this.model.toJSON() );
			this.$el.html(html);
			return this;
		},
	})
	var PresentListView = Backbone.View.extend({
		id : "present_list_view",
		render : function(){
			this.$el.append('<div style="height:5px;"></div>')
			
			if( !this.collection.size() ){
				this.$el.append('<div class="list_zero_text"><i>プレゼントはありません</i></div>');
			}else{
				this.collection.each(function(model){
					var presentView = new PresentView({model:model});
					this.$el.append( presentView.render().$el );
				},this)
			}
			
			this.$el.append('<div style="height:5px;"></div>');
			return this;
		},
	})
	window.test_present_add = function(){
		_.times(3,function(n){  present.add({ data_type: df.DATA_TYPE_CARD_SEED, num :  1, item_id : 10090000, message : "カメックスです" + n   })  });
		_.times(7,function(n){  present.add({ data_type: df.DATA_TYPE_ITEM,      num : 10, item_id :        1, message : "プレゼントテスト" + n })  });
		present.save();
	};
	var show = function(){
		console.log("PopupPresentList#show [present_list]", present.get("present_list"));
		var presentList = new PresentList( present.get("present_list") );
		var presentListView = new PresentListView({collection:presentList})
		var popup = App.popup.confirm({
			title:"プレゼント一覧",
			view_class:"present_list",
			no:{label:"閉じる"},
			yes:{label:"一括受取",action: function(){ popup.resolve() } }
		}).done(function(){
			console.log("PopupPresentList#show popup.done 一括受取");
			presentList.each(function(model){
				if( model.get("received") ){ return }
				var is_received = present.receive( model.get("id") );
				model.set("received",1);
				if(!is_received) model.set("unreceived",1);
			})
			present.save();
			pc.save();
			App.popup.message({title:"プレゼント受け取り" ,message: "受取可能なプレゼントを<br/>全て受け取りました！" });
			present.trigger("change_present");
		});
		
		popup.view.$el.find(".message").append(presentListView.render().$el)
		__.scroller.create("present_list_view");
	}
	return {
		Present        :Present,
		PresentList    :PresentList,
		PresentView    :PresentView,
		PresentListView:PresentListView,
		show           :show,
	};
})

;
define('controllers/PopupPhraseList',[
	"models/PcREC",
],function(PcREC){
	
	var RECENTLY_NUM = 50;
	var STATE_RECENTLY = 1;
	var STATE_ALL = 2;
	var STATE_FAV = 3;
	var DATA_ID   = 0;
	var DATA_FLAG = 1;
	var DATA_NUM  = 2;
	var DATA_DATE = 3;
	var DATA_FAV  = 4;
	
	var Phrase = Backbone.Model.extend({
		defaults:function(){
			return { fav : 0 }
		},
		initialize: function(){
			
		},
	})
	var PhraseList = Backbone.Collection.extend({model:Phrase})
	var PhraseView = Backbone.View.extend({
		className : "phrase_view",
		tagName: "div",
		events:{
			"ftap .fav_star":"fav",
		},
		initialize: function(){
			this.listenTo(this.model, "change", this.render);
			this.pc = new PcREC();
		},
		fav: function(){
			console.log("PhraseView#fav");
			if( this.model.get("fav") ){
				this.model.set("fav",0);
				this.model.attributes.data[DATA_FAV] = 0;
			}else{
				this.model.set("fav",1);
				this.model.attributes.data[DATA_FAV] = 1;
				App.mission.checkProcess("FAV_PHRASE");
			}
		},
		render : function(){
			var star   = ( this.model.get("fav") ) ? "★" : "☆";
			var _class = ( this.model.get("fav") ) ? "fav" : "";
			var id     = this.model.get("id");
			var phrase = st.PhraseData[id];
			
			var html = ''
					+'<table class="phrase_container">'
					+'	<tr>'
					+'		<td class="td1">'
					+'			<div class="no">No.' + phrase.id     + '</div>'
					+'			<div class="text">'  + phrase.text   + '</div>'
					+'			<div class="author">'+ phrase.author + '</div>'
					+'		</td>'
					+'		<td class="td2"><i class="fav_star ' + _class + '">' + star + '</i></td>'
					+'	</tr>'
					+'</table>'
					
			this.$el.html(html);
			return this;
		},
	})
	var PhraseListView = Backbone.View.extend({
		id : "phrase_list_view",
		render : function(type){
			this.$el.empty();
			this.$el.append('<div style="height:5px;"></div>')
			if(type==undefined) type = STATE_RECENTLY;
			// ソート方法変更
			// [id, flag, num, date, fav_state]
			if(type == STATE_RECENTLY){
				this.collection.comparator = function (model) { return model.get("data")[DATA_DATE] * -1 };
			}else{
				this.collection.comparator = function (model) { return model.get("data")[DATA_ID] };
			}
			this.collection.sort();
			
			// ソート表示内容
			var is_list_zero = 1;
			if(type == STATE_FAV){
				this.collection.each(function(model){
					if(model.get("data")[DATA_FLAG] && model.get("data")[DATA_FAV]){
						is_list_zero = 0;
						var phraseView = new PhraseView({model:model});
						this.$el.append( phraseView.render().$el );
					}
				},this)
			}else if(type == STATE_RECENTLY){
				var disp_cnt = 0;
				this.collection.each(function(model,n){
					if(disp_cnt < RECENTLY_NUM && model.get("data")[DATA_FLAG]){
						is_list_zero = 0;
						disp_cnt += 1;
						var phraseView = new PhraseView({model:model});
						this.$el.append( phraseView.render().$el );
					}
				},this)
			}else{
				this.collection.each(function(model){
					if(model.get("data")[DATA_FLAG]){
						is_list_zero = 0;
						var phraseView = new PhraseView({model:model});
						this.$el.append( phraseView.render().$el );
					}
				},this)
			}
			
			if(is_list_zero){
				this.$el.append('<div class="list_zero_text"><i>フレーズはありません</i></div>');
			}
			
			this.$el.append('<div style="height:5px;"></div>')
			
			__.scroller.create("phrase_list_view");
			App.mission.checkProcess("SHOW_PHRASE_DICT");
			return this;
		},
	})
	var PhraseBtn = Backbone.Model.extend({
		defaults:function(){
			return {
				select : 0,
				type: "",
				label:"",
			}
		},
	})
	var PhraseBtnView = Backbone.View.extend({
		className : "phrase_btn_view",
		tagName : "a",
		events: {
			"ftap": "tap",
		},
		initialize: function(){
			this.listenTo(this.model, "change", this.render);
		},
		tap: function(event){
			this.model.set("select",1);
		},
		render : function(){
			this.$el.html( "<i>" + this.model.get("label") + "</i>" );
			if( this.model.get("select") ){
				this.$el.addClass("cmn_btn_1").removeClass("cmn_btn_2");
			}else{
				this.$el.addClass("cmn_btn_2").removeClass("cmn_btn_1");
			}
			return this;
		},
	})
	var PhraseBtnsView = Backbone.View.extend({
		className : "phrase_btns_view",
		tagName : "div",
		initialize: function(option){
			this.phraseListView = option.phraseListView;
			this.btnModel1 = new PhraseBtn({id:STATE_RECENTLY ,label:"最近入手"  ,type:"new", select:1});
			this.btnModel2 = new PhraseBtn({id:STATE_ALL      ,label:"全て"      ,type:"all"});
			this.btnModel3 = new PhraseBtn({id:STATE_FAV      ,label:"お気に入り",type:"fav"});
			this.btnView1  = new PhraseBtnView({model:this.btnModel1});
			this.btnView2  = new PhraseBtnView({model:this.btnModel2});
			this.btnView3  = new PhraseBtnView({model:this.btnModel3});
			this.models    = [this.btnModel1, this.btnModel2, this.btnModel3];
			this.listenTo(this.btnModel1,"change",this.updateBtn)
			this.listenTo(this.btnModel2,"change",this.updateBtn)
			this.listenTo(this.btnModel3,"change",this.updateBtn)
		},
		updateBtn: function(model){
			if(model.changed.select == 1){
				_.each(this.models,function(data){
					if( model.get("id") != data.get("id") ) data.set("select",0);
				})
				this.phraseListView.render( model.get("id") );
			}
		},
		render : function(){
			this.$el.append( this.btnView1.render().$el )
			        .append( this.btnView2.render().$el )
			        .append( this.btnView3.render().$el )
			return this;
		},
	})
	var show = function(){
		var pc              = new PcREC();
		var phrase_list     = _.map(pc.get("phrase_list"),function(data,n){ return {id: n, data: data, fav:data[DATA_FAV] } });
		var phraseList      = new PhraseList(phrase_list);
		var phraseListView  = new PhraseListView({collection:phraseList})
		var phraseBtnsView  = new PhraseBtnsView({phraseListView:phraseListView})
		var popup = App.popup.message({ title:"フレーズ一覧", view_class:"phrase_list", yes:{label:"閉じる"} });
		popup.done(function(){
			console.log("PopupPhraseList#show popup.done");
			var phrase_list = _.map(phraseList.models, function(model){ return model.get("data") });
			phrase_list = phrase_list.sort(function(a,b){ return a[DATA_ID] - b[DATA_ID] });
			pc.set("phrase_list", phrase_list).save();
		})
		popup.view.$el.find(".message").append( phraseBtnsView.render().$el ).append( phraseListView.$el )
		phraseListView.render();
	}
	return {
		Phrase        :Phrase,
		PhraseList    :PhraseList,
		PhraseView    :PhraseView,
		PhraseListView:PhraseListView,
		PhraseBtn     :PhraseBtn,
		PhraseBtnView :PhraseBtnView,
		PhraseBtnsView:PhraseBtnsView,
		show          :show,
	};
})

;
define('controllers/PopupUserConfig',[
	"models/UserConfigREC",
],function(UserConfigREC){
	var show = function(){
		var userConfig = new UserConfigREC;
		var template = __.mustache('\
			<div class="user_config_container">\
				■ 戦闘スピード<br/>\
					{% if(battle_speed==1){ %}\
						<a class="battle_speed_1 cmn_btn_1"><i>等倍</i></a>\
						<a class="battle_speed_2 cmn_btn_2"><i>2倍速</i></a>\
					{% }else{ %}\
						<a class="battle_speed_1 cmn_btn_2"><i>等倍</i></a>\
						<a class="battle_speed_2 cmn_btn_1"><i>{{ battle_speed }}倍速</i></a>\
					{% } %}\
					<br/><br/>\
				■ 1ページに表示するモンスター数<br/>\
					{% if(page_elem_num==50){ %}\
						<a class="page_elem_num_50  cmn_btn_1"><i>50体</i></a>\
						<a class="page_elem_num_100 cmn_btn_2"><i>100体</i></a>\
					{% }else{ %}\
						<a class="page_elem_num_50  cmn_btn_2"><i>50体</i></a>\
						<a class="page_elem_num_100 cmn_btn_1"><i>{{ page_elem_num }}体</i></a>\
					{% } %}\
					<br/><br/>\
				■ 音楽<br/>\
					{% if(sound){ %}\
						<a class="sound_on  cmn_btn_1"><i>ON</i></a>\
						<a class="sound_off cmn_btn_2"><i>OFF</i></a>\
					{% }else{ %}\
						<a class="sound_on  cmn_btn_2"><i>ON</i></a>\
						<a class="sound_off cmn_btn_1"><i>OFF</i></a>\
					{% } %}\
					<br/><br/>\
			</div>\
		')
		var html = template(userConfig.toJSON());
		
		var popup = App.popup.message({title:"設定", message:'<div class="user_config_view">' + html + '</div>', yes:{label:"閉じる"} },{},{
			events:{
				"ftap .battle_speed_1"   :"setBattleSpeed1",
				"ftap .battle_speed_2"   :"setBattleSpeed2",
				"ftap .page_elem_num_50" :"setPageElemNum50",
				"ftap .page_elem_num_100":"setPageElemNum100",
				"ftap .sound_on"         :"setSoundOn",
				"ftap .sound_off"        :"setSoundOff",
			},
			setBattleSpeed1  :function(){ this.setBattleSpeed(1) },
			setBattleSpeed2  :function(){ this.setBattleSpeed(2) },
			setPageElemNum50 :function(){ this.setPageElemNum(50) },
			setPageElemNum100:function(){ this.setPageElemNum(100) },
			setSoundOn       :function(){ this.setSound(1) },
			setSoundOff      :function(){ this.setSound(0) },
			setBattleSpeed   :function(battle_speed){
				userConfig.set("battle_speed",battle_speed).save();
				popup.view.$el.find(".user_config_view").html( template(userConfig.toJSON()) );
			},
			setPageElemNum:function(page_elem_num){
				userConfig.set("page_elem_num",page_elem_num).save();
				popup.view.$el.find(".user_config_view").html( template(userConfig.toJSON()) );
			},
			setSound:function(sound){
				userConfig.set("sound",sound).save();
				popup.view.$el.find(".user_config_view").html( template(userConfig.toJSON()) );
				if(sound){
					App.sound.bgm(1);
					App.sound.resumeBgm();
				}else{
					App.sound.pauseBgm();
				}
			},
		});
		App.mission.checkProcess("SHOW_CONFIG");
		console.log("config_popup",popup.view);
	}
	return {
		show:show,
	};
})

;
define('controllers/PopupOtherMenu',[
	"models/UserConfigREC",
],function(UserConfigREC){
	var show = function(){
		var userConfig = new UserConfigREC;
		var template = __.mustache('\
			<div class="other_menu_container">\
				<a class="cmn_btn_2 goto_title"><i>タイトルへ</i></a>\
				<a class="cmn_btn_2 goto_koryaku"><i>攻略情報</i></a>\
				<br/>\
				<a class="cmn_btn_2 invite_code"><i>招待コード</i></a>\
				<a class="cmn_btn_2 serial_code"><i>シリアルコード</i></a>\
				<br/>\
				<a class="cmn_btn_2 credit"><i>クレジット</i></a>\
				<a class="cmn_btn_2 rights"><i>権利表記</i></a>\
				<br/>\
				<a class="cmn_btn_2 twitter_login"><i>Twitterログイン</i></a>\
			</div>\
		')
		var html = template(userConfig.toJSON());
		
		var popup = App.popup.message({title:"その他メニュー", message:'<div class="other_menu_view">' + html + '</div>', yes:{label:"閉じる"} },{},{
			events:{
				"ftap .goto_title"    :"gotoTitle",
				"ftap .goto_koryaku"  :"gotoKoryaku",
				"ftap .invite_code"   :"inviteCode",
				"ftap .serial_code"   :"serialCode",
				"ftap .credit"        :"credit",
				"ftap .rights"        :"rights",
				"ftap .twitter_login" :"twitterLogin",
			},
			gotoTitle   :function(){ App.popup.confirm({message:"タイトルへ戻りますか？"}).done(function(){ location.href = location.href.replace(/#.*/,""); }) },
			gotoKoryaku :function(){},
			inviteCode  :function(){},
			serialCode  :function(){},
			credit      :function(){},
			rights      :function(){},
			twitterLogin:function(){},
		});
		App.mission.checkProcess("SHOW_MENU");
		console.log("menu_popup",popup.view);
	}
	return {
		show:show,
	};
})

;
define('controllers/PopupMissionDetail',[
	"models/PcREC",
	"models/Twitter",
],function(PcREC,Twitter){
	var show = function(mission_id, _this){
		var mission_state = App.mission.get("mission_state")[mission_id];
		var mission_data  = _.find(App.mission.mission_list, function(data){ return data.id == mission_id });
		var process_type  = (App.mission.detailResponseList[mission_data.type_str])? mission_data.type_str : "DEFAULT_RESPONSE";
		var response      = _.bind(App.mission.detailResponseList[process_type], App.mission)(mission_data);
		
		var message_text  = mission_data.discription + '<hr/>' + '進行度：{{ progress }}/{{ progress_max }}';
		var dubug_clear_btn = '<hr/><a class="cmn_btn_2 debug_clear" style="width:100px; height: 38px;">debug_clear</a>';
		if(appenv.BULD_LEVEL == appenv.DEBUG_BULD && !mission_data.is_clear) message_text += dubug_clear_btn;
		if(mission_data.type_str == "FOLLOW_TWITTER" && !mission_data.is_clear) message_text += '<hr/><a class="cmn_btn_2 follow" style="width:100px; height: 38px;">フォローする</a>';
		if(mission_data.kind == "GUERRILLA" && !mission_data.is_clear){
			var remainTime = new __.RemainTime({ disp:{sec:false} , str:{day:"日",hour:"時間",min:"分"} });
			var end_text = remainTime.toText(mission_data.guerrilla_end);
			message_text += '<hr/><div>残り:' + end_text + '</div>';
		}
		
		var base_title    = __.mustache(mission_data.title)(response);
		var base_message  = __.mustache(message_text)(response);
		
		console.log("MypageView#missionDetail",mission_id,mission_state,mission_data);
		
		var donePopup = function(){
			if(!mission_data.is_clear){ return }
			App.mission.clear(mission_data.id);
			var reward_data = __.excelArrayToJSON(mission_data, ["reward_type","reward_id","reward_vol"])
			var template = __.mustache('\
				以下の報酬を付与しました<br/><br/>\
				{% _.each(reward_data,function(reward){ %}\
					{{ __.helper.itemName(reward.reward_type, reward.reward_id, reward.reward_vol) }}<br/>\
				{% }) %}\
			');
			var rewardPopup = App.popup.message({
				yes: {label: 'OK'},
				title  : 'ミッションクリア！',
				message: template({reward_data: reward_data})
			}).done(function(){
				_this.trigger("changedData");
			})
		}
		var extend_view_data = {
			events:{
				"ftap .debug_clear":"debugClear",
				"ftap .follow"     :"follow",
			},
			debugClear: function(){
				this.close();
				App.mission.testClear(mission_data.id);
				_this.trigger("changedData");
			},
			follow: function(){
				this.close();
				var twitter = new Twitter;
				twitter.tweetFinish = function(){
					App.mission.checkProcess("FOLLOW_TWITTER");
					App.popup.message({message:"フォローしました。"});
					App.views.indicator.hide()
					_this.trigger("changedData");
				};
				twitter.follow();
			}
		}
		
		var yes_btn = {label: (mission_data.is_clear)?'報酬GET':'OK'};
		var no_btn  = {show:false};
		var cancel_mission = {
			show:true,
			label:"ミッション辞退",
			action:function(){
				var mission_detail_popup = this;
				var confirm_popup = App.popup.confirm({message:"ミッションを辞退しますか？"}).done(function(){
					App.mission.cancel(mission_data.id);
					App.popup.message({message:"ミッションを辞退しました"});
					confirm_popup.view.close();
					mission_detail_popup.close();
					_this.trigger("changedData");
				})
			}
		}
		if( !mission_data.is_clear && (mission_data.kind == "CONVERSION" || mission_data.kind == "COUNT" || mission_data.kind == "WANTED") ){
			no_btn  = cancel_mission;
		}
		var popup = App.popup.message({ yes: yes_btn, no: no_btn, title: base_title, message: base_message },{},extend_view_data).done(donePopup)
	}
	return {
		show:show,
	};
})

;
define('controllers/MypageView',[
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

;
define('controllers/PopupQuestConfirmView',[
	"models/PcREC",
	"models/Quest",
""],function(PcREC,Quest){
	
	var PopupQuestConfirmView = Backbone.View.extend({
		tagName:"div",
		initialize:function(data){
			this.data = data;
		},
		render:function(){
			var _this = this;
			var quest = new Quest();
			var floor_max = this.data.quest_data.floor_max;
			var quest_id = this.data.quest_data.id;
			var quest_info = quest.getQuestInfo(quest_id);
			
			var pc = new PcREC;
			var res = {
				enemys     : quest_info.enemys,
				floor_max  : quest_info.floor_max,
				level      : quest_info.level,
				deck       :pc.get("deck"),
				members    :_.map(pc.get("deck"),function(id,n){ if(!id){ return } return pc.getMateData(id) }),
				packun_n   :pc.getItem( df.ITEM_PACKUN_NORMAL ),
				packun_s   :pc.getItem( df.ITEM_PACKUN_SUPER ),
				packun_d   :pc.getItem( df.ITEM_PACKUN_DRAGON ),
				packun_n_id:df.ITEM_PACKUN_NORMAL,
				packun_s_id:df.ITEM_PACKUN_SUPER ,
				packun_d_id:df.ITEM_PACKUN_DRAGON,
			}
			res.response = res;
			var dialog_res = {
				title : this.data.quest_data.dungeon_name ,
				message : __.template("quest/quest_confirm",res) ,
			}
			this.$el.html( __.template("dialog/common",dialog_res) );
			return this
		},
	});
	
	return PopupQuestConfirmView;
	
})

;
define('controllers/PopupsView',[],function(){
	
	
	var Btn = Backbone.Model.extend({
		defaults:function(){
			return {
				se       :1,
				name     :"",
				btn_class:"btn_sample",
				label    :"label_sample",
				show     :1,
				action   :function(){},
				key      : "default_key",
				sort     : -1,
				asc      : -1,
			}
		},
	});
	
	var BtnView = Backbone.View.extend({
		tagName:"a",
		events:{
			"ftap":"tapBtn"
		},
		tapBtn:function(){
			this.trigger("tap",this.model.attributes);
		},
		render:function(){
			this.$el.addClass( this.model.get("btn_class") );
			this.$el.attr("data-se", this.model.get("se"));
			this.$el.html("<i>"+this.model.get("label")+"</i>");
			return this
		},
	});
	
	var Popup       = Backbone.Model.extend({
		defaults:function(){
			var deferred = $.Deferred();
			return {
				deferred  :deferred,
				open_se  : 1,
				open_fx  : 1,
				close_se : 1,
				close_fx : 1,
				data_id   :"",
				view_class:"sample",
				select_btn_class:"",
				type      :1,
				close_btn :0,
				message   :"",
				title     :"",
				status    :0,
				auto_close:true,
				selected  :{},
			}
		}
	});
	
	var Items = Backbone.Collection.extend();
	
	var ItemsView = Backbone.View.extend({
		initialize: function(options){
			this.options = options;
		},
		render :function(dialog){
			this.$el.addClass("item_view")
			this.collection.each(function(model,n){
				var btnView = new BtnView({model:model});
				btnView.$el.addClass(model.get("select_btn_class"))
				this.options.popupView.listenTo(btnView,"tap",this.options.popupView.tapClose );
				this.$el.append( btnView.render(dialog).el );
			},this)
			return this
		},
	});
	
	
	var PopupView   = Backbone.View.extend({
		yes:function(e){
			this.model.attributes.deferred.resolve(this.model.attributes,e);
			this.model.destroy()
		},
		no :function(e){
			this.model.attributes.deferred.reject(this.model.attributes,e);
			this.model.destroy()
		},
		close:function(e){
			this.model.attributes.deferred.reject(this.model.attributes,e);
			this.model.destroy()
		},
		tapClose:function(e){
			this.model.attributes.deferred.resolve(this.model.attributes,e);
			this.model.destroy()
		},
		initialize:function(config,view_option){
			//this.listenTo(this.model,"destroy",this.remove);
			this.options = config;
			this.listenTo(this.model,"destroy",this.animClose);
			this.$el.attr("id",this.cid)
			this.$el.addClass(" popup_view ").addClass(this.model.get("view_class"));
			for(var i in view_option){
				this[i] = view_option[i]
			}
			
		},
		animClose: function(){
			var _this = this;
			this.$el.addClass("close");
			setTimeout(function(){
				_this.remove();
			},250)
		},
		render:function(){
			var option = this.model.attributes;
			if( _.isFunction(option.response) ){ var response = option.response()   }
			if( _.isObject(option.response)   ){ var response = option.response     }
			if( !_.has(option,"response")     ){ var response = this.model.toJSON() }
			this.$el.html( option.template(response) );
			this.appendBtn();
			return this
		},
		appendBtn:function(){
			//はい、いいえ、閉じるボタンの作成と挿入
			var option = this.model.attributes;
			this.btn = {
				yes  :{se:1, btn_class :"yes_btn"  , label:"　はい　", show:true, action: this.yes },
				no   :{se:1, btn_class :"no_btn"   , label:" いいえ ", show:true, action: this.no },
				close:{se:1, btn_class :"close_btn", label:"×"      , show:true, action: this.close },
			};
			if( _.has(option,"yes")   ){ _.extend( this.btn.yes  , option.yes   ) };
			if( _.has(option,"no")    ){ _.extend( this.btn.no   , option.no    ) };
			if( _.has(option,"close") ){ _.extend( this.btn.close, option.close ) };
			
			//html作成後、ボタンのviewをappend
			if( this.btn.no.show    ){
				this.noBtn        = new this.options.Btn( this.btn.no );
				this.noBtnView    = new this.options.BtnView({ model:this.noBtn });
				this.listenTo( this.noBtnView ,"tap", this.btn.no.action );
				this.$el.find(".append_btn_container").append( this.noBtnView.render().el  );
			}
			if( this.btn.yes.show   ){
				this.yesBtn       = new this.options.Btn(this.btn.yes );
				this.yesBtnView   = new this.options.BtnView({ model:this.yesBtn });
				this.listenTo( this.yesBtnView ,"tap", this.btn.yes.action );
				this.$el.find(".append_btn_container").append( this.yesBtnView.render().el );
			}
			if( this.btn.close.show ){
				this.closeBtn     = new this.options.Btn(this.btn.close);
				this.closeBtnView = new this.options.BtnView({ model:this.closeBtn });
				this.listenTo( this.closeBtnView, "tap", this.btn.close.action );
				this.$el.find(".append_close_btn_container").append( this.closeBtnView.render().el )
			}
			return this
		},
	});
	
	var Popups      = Backbone.Collection.extend();
	
	/*
	使い方
		App.popup.confirm({title:"拡張title",message:"拡張メッセージ"}).done(_.bind(function(){
			this.caveMgr.gameNext();
		},this));
		App.popup.confirm( df.NEXT_FLOOR_CONFIRM ).done(_.bind(function(){
			this.caveMgr.gameNext();
		},this));
		App.popup.confirm( df.NEXT_FLOOR_CONFIRM ,{title:"拡張title",message:"拡張メッセージ"} ).done(_.bind(function(){
			this.caveMgr.gameNext();
		},this));
		returnのdeferredはvar dialog = App.popup.confirm(4).model.get("deferred").reject("aaa","ddd")という形で使える。
	*/
	var PopupsView = Backbone.View.extend({
		el:"#assign_popup_container_id",
		Btn        :Btn        ,
		BtnView    :BtnView    ,
		Items      :Items      ,
		ItemsView  :ItemsView  ,
		Popup      :Popup      ,
		PopupView  :PopupView  ,
		Popups     :Popups     ,
		//PopupsModel:PopupsModel,
		events:{},
		initialize:function(config){
			if(!_.has(config,"data")){ alert("メッセージデータが設定されていません") }
			console.log("PopupsView#initialize",arguments,this)
			this.options = config;
			this.data       = config.data;
			this.template   = config.template;
			this.collection = new this.Popups([],{ model:this.Popup });
			this.listenTo(this.collection,"add"   ,this.change);
			this.listenTo(this.collection,"remove",this.change);
		},
		getFrontView: function(){
			return this.collection.last().view;
		},
		doYesOrYes: function(){
			// 最前面のpopupを常にyesで実行する
			var view = this.collection.last().view;
			if( _.has(view, "yesBtnView") ){
				view.yesBtnView.tapBtn();
			}
		},
		doNoOrYes: function(){
			// 最前面のpopupを、noボタンがあればnoを、なければyesで実行する
			var view = this.collection.last().view;
			if( _.has(view, "noBtnView") ){
				view.noBtnView.tapBtn();
			}else if( _.has(view, "yesBtnView") ){
				view.yesBtnView.tapBtn();
			}
		},
		closeTimer: 0,
		change:function(model){
			clearTimeout(this.closeTimer);
			if(this.collection.length > 0){
				this.$el.css("display","block");
			}else{
				var _this = this;
				this.closeTimer = setTimeout(function(){
					_this.$el.css("display","none");
				},250)
				//this.$el.css("display","none");
			}
		},
		
		//基本的にoptionはつけないでシンプルに使う。YESのみダイアログ
		message:function(data_id,option,view_option){
			if(data_id==undefined){ alert("dialogのID指定がありません"); return };
			if(view_option==undefined){ view_option = {}; }
			
			var config = {
				template:this.options.messageTemplate,
				yes     :{show:true },
				no      :{show:false},
				close   :{show:false},
				title   :"",
				message :"",
				data    :{},
			}
			if( _.isNumber(data_id)){
				config.title   = this.data[data_id].title;
				config.message = this.data[data_id].message;
				config.data    = this.data[data_id];
			}
			if( _.isObject(data_id) ){ _.extend(config,data_id) }
			if( _.isObject(option)  ){ _.extend(config,option) }
			
			var popup     = new this.Popup(config);
			var popupView = new this.PopupView({model:popup, Btn:this.Btn, BtnView:this.BtnView},view_option);
			
			popup.view = popupView;
			this.collection.add(popup);
			this.$el.append( popupView.render().el );
			
			var deferred       = popup.get("deferred");
			    deferred.view  = popupView;
			    deferred.model = popup;
			
			return deferred;
		},
		
		//基本的にoptionはつけないでシンプルに使う。YES/NOダイアログ
		confirm:function(data_id,option,view_option){
			var config = {
				no   :{show:true },
				close:{show:false},
			}
			if( _.isObject(data_id) ){ _.extend(config,data_id) }
			if( _.isObject(option)  ){ _.extend(config,option) }
			return this.message(data_id,config,view_option);
		},
		
		//データで設定された値をもとに使う。設定でmessageかconfirmかを決められるようにし、
		//ある程度Y/N時のメソッドをデータで指定できるようにしたい。
		dialog:function(data_id,option,view_option){
			var config = {
				no   :{show:true },
				close:{show:false},
			}
			if( _.isObject(data_id) ){ _.extend(config,data_id) }
			if( _.isObject(option)  ){ _.extend(config,option) }
			return this.message(data_id,config,view_option);
		},
		
		//ソートなどのボタンが一覧のときに使う
		select:function(item_list,option,view_option){
			if(view_option==undefined){ view_option = {}; }
			var config = {
				yes  :{show:true ,label:"閉じる"},
				no   :{show:false},
				close:{show:false},
			}
			if( _.isObject(option)  ){ _.extend(config,option) }
			var popup     = new this.Popup(config);
			var popupView = new this.PopupView({model:popup, Btn:this.Btn, BtnView:this.BtnView},view_option);
			popupView.$el.html( this.options.selectTemplate(popup.toJSON()) );
			popupView.appendBtn();
			
			_.each(item_list,function(item){
				if(!item.btn_class){ item.btn_class = "select_btn" }
				if(!_.has(item,"select_btn_class") && _.has(option,"select_btn_class")){
					item.select_btn_class = option.select_btn_class;
				}
			});
			var items     = new this.Items(item_list,{model:this.Btn});
			var itemsView = new this.ItemsView({collection:items, popupView:popupView , el: popupView.$el.find(".append_select_btn_container") });
			itemsView.render();
			
			popup.view = popupView;
			this.collection.add(popup);
			this.$el.append( popupView.el );
			
			var deferred       = popup.get("deferred");
			    deferred.view  = popupView;
			    deferred.model = popup;
			
			return deferred;
		},
		
		//ページやアニメをオーバーレイ表示したいときに使う
		add:function(backboneView,config,view_option){
			if(view_option==undefined){ view_option = {}; }
			var popup     = new this.Popup(config);
			var popupView = new this.PopupView({model:popup, Btn:this.Btn, BtnView:this.BtnView},view_option);
			popupView.$el.html( backboneView.render().el );
			popupView.listenTo( backboneView,"tapClose close",popupView.tapClose );
			popupView.listenTo( backboneView,"allClose",popupView.tapClose );
			
			popup.addedview = backboneView;
			popup.view = popupView;
			this.collection.add(popup);
			this.$el.append( popupView.appendBtn().el );
			
			var deferred       = popup.get("deferred");
			    deferred.view  = popupView;
			    deferred.model = popup;
			    
			return deferred;
		},
	});
	
	var obj = function(){
		return {
			Btn        :Btn        ,
			BtnView    :BtnView    ,
			Items      :Items      ,
			ItemsView  :ItemsView  ,
			Popup      :Popup      ,
			PopupView  :PopupView  ,
			Popups     :Popups     ,
			PopupsView :PopupsView ,
		}
	}
	return obj;
})

;
define('controllers/QuestSelectAreaView',[
	"models/PcREC",
	"models/Quest",
],function(PcREC,Quest){
	
	var SelectAreaView = Backbone.View.extend({
		id:"select_area_view",
		tagName:"div",
		events:{
		},
		initialize:function(){
			this.pc = new PcREC;
			this.quest = new Quest;
		},
		response:function(){
			// saveを行うと重い。updateを他で行うと処理場所がバラけて微妙。
			// ただ重すぎなのでQuestSelectCaveViewでもupdateするよう対応。
			// ゲリラクエストをやると、Gachaと同じくsaveする必要がでてくるので注意。
			this.pc.updateQuest()//.save()
			var current_world = this.pc.get("current_world");
			
			var quest_status_all = this.pc.get("quest_status");
			var area_list_all = _.reduce(quest_status_all, function(result,quest_status){
				if(quest_status.is_available_world){
					var quest_data = this.quest.createQuestList(quest_status.available_world, quest_status.available_area, quest_status);
					    quest_data = this.quest.appendPlayStatus(this.pc.get("quest_play"),quest_data);
					var area_list = _.values(quest_data.area_list).sort(function(a,b){ return b.area_id - a.area_id });
					result.push(area_list);
				}
				return result;
			},[],this);
			area_list_all.sort(function(a,b){ return b[0].world_id - a[0].world_id })
			
			// 時間判定
			var remainTime   = new __.RemainTime({ disp:{sec:false} , str:{day:"日",hour:"時間",min:"分"} });
			var current_time = __.baseTime();
			var area_list = _.reduce(area_list_all,function(result,area_data){
				var area_list = _.reduce(area_data,function(result,area){
					if(!area.week_flag[__.moment().day()]){
						return result
					}
					if(area.begin){
						var begin = __.moment(area.begin).valueOf();
						if(begin > current_time) return result;
					}
					if(area.end){
						var end = __.moment(area.end).valueOf();
						if(end < current_time) return result;
						
						area.remain_term = __.moment(end).format("M/D HH:mm (ddd)");
						area.remain_time = (end - current_time < 24*60*60*1000)?remainTime.toText(end):"";
					}
					result.push(area_data);
					return result
				},[],this)
				
				if(area_list.length > 0){
					result.push(area_data);
				}
				return result
			},[],this)
			
			return { area_list : area_list }
		},
		render:function(){
			this.$el.html( __.template("quest/select_area_view",this.response()) )
			return this;
		},
		setupView:function(){
			__.scroller.create("area_list",{scrollbars:true});
		},
	});
	
	
	return SelectAreaView;
})

;
define('controllers/QuestSelectCaveView',[
	"models/PcREC",
	"models/Quest",
	"controllers/PopupQuestConfirmView",
	"controllers/CardIndexView",
],function(PcREC,Quest,PopupQuestConfirmView,CardIndexView){
	
	var SelectAreaView = Backbone.View.extend({
		id:"select_area_view",
		tagName:"div",
		events:{
			"ftap .E_select_quest" : "questPlayConfirm",
		},
		initialize:function(){
			this.pc = new PcREC;
			this.quest = new Quest;
		},
		response:function(request){
			__.checkType("undefined",[request.query.id]);
			
			console.log("SelectAreaView#response [request.query.id]", request.query.id);
			this.pc.updateQuest(); // QuestSelectAreaViewでsaveするのをやめる代わりに、ここでもupdateする
			var area = st.QuestListData[request.query.id]
			var quest_data = this.quest.createQuestList(area.world_id, area.area_id, this.pc.get("quest_status")[area.world_id] );
			quest_data = this.quest.appendPlayStatus(this.pc.get("quest_play"),quest_data)
			console.log("SelectAreaView#response [quest_data]", quest_data);
			
			this.map_icon_data = st.QuestMapIconData[(request.query.id/1000000).floor()];
			console.log("SelectAreaView#response [this.map_icon_data]", this.map_icon_data);
			
			return {
				area          : area,
				quest_list    : _.values(quest_data.quest_list).sort(function(a,b){return b.id - a.id}),
				map_icon_data : this.map_icon_data,
			}
		},
		render:function(request){
			var res = this.response(request);
			this.request = request;
			this.quest_data = _.find(res.quest_list,function(quest){ return quest.id == request.query.id })
			this.$el.html( __.template("quest/select_cave_view",res) )
			return this;
		},
		setupView:function(){
			__.scroller.create("cave_list",{scrollbars:true});
			__.scroller.create("area_map_img",{ freeScroll: true, scrollX: true,scrollY: true });
			__.scroller.id.area_map_img.scrollTo(-1*this.map_icon_data.map_pos_x,-1*this.map_icon_data.map_pos_y,0);
			
		},
		questPlayConfirm:function(e,f){
			var is_exist_deck = _.find(this.pc.get("deck"),function(id){ return id>0 })
			if(!is_exist_deck){
				App.popup.confirm({
					yes:{label:"デッキ編成へ"},
					no:{label:"閉じる"},
					message:"デッキが編成されていません<br/><br/>モンスターメニューから<br/>デッキを編成しよう！"
				}).done(function(){
					App.router.navigate("/html/Card/deckMemberSelect" ,{trigger:true})
				})
				return this
			}
			var quest_id = $(f.fstartTarget).data("quest_id");
			var res = this.response(this.request);
			var quest_data = _.find(res.quest_list,function(quest){ return quest.id == quest_id })
			var popupQuestConfirmView = new PopupQuestConfirmView({quest_data:quest_data});
			
			var popup = App.popup.add(popupQuestConfirmView,{close:{show:false}}).done(function(){
				App.router.navigate("/html/Cave/start?id="+quest_id ,{trigger:true});
			});
			popup.view.$el.on("ftap",".deck_contaner",function(){
				var cardIndexView = new CardIndexView();
				cardIndexView.showDeckDetail();
			})
		},
	});
	
	
	return SelectAreaView;
})

;
define('controllers/SampleMateList',[
	"models/PcREC",
	"models/Mate",
""],function(PcREC,Mate){
	
	var MateSellView = Backbone.View.extend({
		tagName:"div",
		events:{
			"click [type=submit]" : "submit",
			"ftap  .sell_submit" : "sell",
			"ftap  .deck_submit" : "setDeck",
			"ftap  .mix_submit" : "mix",
			"ftap  .reset_render" : "render",
		},
		initialize:function(){
			this.pc = new PcREC;
			this.mate = new Mate;
			this.listenTo(this.pc,"sync",this.render);
		},
		submit:function(e){
			e.preventDefault();
		},
		sell:function(e){
			e.preventDefault();
			var query = __.formQuery(e);
			this.mate.sell(this.pc,query.mate).save();
		},
		setDeck : function(e){
			e.preventDefault();
			var select_mate = __.formQuery(e).mate;
			if(select_mate.length > 5){ alert("deckは5つまでしか選択できません"); return }
			_(5 - select_mate.length).times(function(){ select_mate.push(0) });
			this.pc.set("deck",select_mate).save();
		},
		mix : function(e){
			e.preventDefault();
			var query = __.formQuery(e);
			console.log("MateSellView#mix [query]",query);
			var base = query.base;
			var mat_list = query.mat;
			this.mate.mix(this.pc,base,mat_list).save();
		},
		response:function(){
			var mate_list = _.cloneDeep(this.pc.get("mate_list") );
			_(mate_list).each(function(mate){
				if(_.contains( this.pc.get("deck"), mate.id ) ){ mate.is_deck = 1; }else{ mate.is_deck = 0; }
			},this);
			
			var deck = [];
			_( this.pc.get("deck") ).each(function(id,n){
				if( this.pc.get("deck")[n] !== 0){
					deck.push( this.pc.get("mate_list")[ this.pc.get("deck")[n] ].card_id );
				}
			},this);
			
			return {
				mate_list:mate_list,
				deck:deck,
			};
		},
		render:function(){
			this.$el.html( __.template("sample_mate_list",this.response()) );
			//this.$el.html( __.jsTemplate("sample_mate_list",this.response()) );
			return this;
		},
	});
	
	
	return MateSellView;
	
})

;
define('controllers/SamplePc',[
	"models/PcREC",
	"models/Mate",
""],function(PcREC,Mate){
	
	var PcView = Backbone.View.extend({
		tagName:"div",
		events:{
			"submit .time_edit"       : "setBaseTime",
			"ftap   .time_edit .reset": "resetBaseTime",
			"submit .pc_edit"         : "setPcData",
			"ftap   .pc_edit .reset"  : "resetPcData",
			"submit .mate_edit"       : "addMates",
		},
		model : new PcREC,
		initialize:function(){
			//this.model = new PcREC;
			this.listenTo(this.model,"sync",this.render);
			this.listenTo(this.model,"destroy",this.newPcRec);
			this.mate = new Mate;
		},
		setBaseTime:function(e){
			e.preventDefault();
			var query = __.formQuery(e,false);
			__.setBaseTime(query.time);
			this.render();
		},
		resetBaseTime:function(e){
			__.setBaseTime( (new Date()).getTime() );
			this.render();
		},
		setPcData:function(e){
			e.preventDefault();
			this.model.set( __.formQuery(e) );
			this.model.save();
			console.log("PcView#setPcData [this.model]", this.model);
		},
		resetPcData:function(){
			this.model.destroy();
			this.model.attributes = this.model.defaults();
			this.model.attributes.id = localStorage.device_id + "_" + localStorage.save_id;
			this.model.save();
			this.trigger("reset_data",this.model.get("id"));
		},
		deleteStorageAll:function(){
			for(var i in localStorage){
				localStorage.removeItem(i)
			}
			location.reload();
		},
		newPcRec:function(e){
			//this.stopListening();
			this.model = new PcREC;
			this.mate = new Mate;
			//this.initialize();
			this.model.attributes = this.model.defaultAttr();
			//this.model.addMates( this.mate.createMates(this.model,[10010000]) );
			this.model.save();
			console.log("PcView#newPcRec [this.model]", this.model);
		},
		addMates:function(e){
			e.preventDefault();
			var query = __.formQuery(e);
			var mate = new Mate;
			var new_mate_list = [];
			if(_.isArray(query.card_seed_id)){
				new_mate_list = mate.createMates(this.model,query.card_seed_id);
			}else{
				new_mate_list = mate.createMates(this.model,[query]);
			}
			this.model.addMates(new_mate_list).save();
		},
		render:function(){
			var res = {
				pc:this.model.attributes,
			};
			this.$el.html( __.template("sample_pc",res) );
			//this.$el.html( __.jsTemplate("sample_pc",res) );
			return this;
		},
		remove:function(){
			this.$el.remove();
			this.stopListening();
			//その他、removeする必要があるものをこここでおこなう
			return this;
		}
	});
	
	return PcView;
})

;
define('controllers/SampleQuestData',[
	"models/GachaDraw",
	"models/GachaListData",
	"models/PcREC",
	"models/Mate",
	"models/CaveMapREC",
	"models/CaveREC",
	"models/BattleREC",
	"models/Quest",
""],function(GachaDraw,GachaListData,PcREC,Mate,CaveMapREC,CaveREC,BattleREC,Quest){
	
	var SampleQuestData = Backbone.View.extend({
		tagName:"div",
		initialize:function(){
			this.quest   = new Quest;
			this.battle  = new BattleREC;
			this.cave    = new CaveREC;
			this.caveMap = new CaveMapREC;
		},
		createResponse:function(){
			var caveScratchDataAll = this.caveMap.makeCaveScratchDataAll()
			var questDispData = _.reduce(st.QuestListData,function(result,data,id){
				var floor_num = 1;
				var floor_data_num = 0;
				var floor_data_list = [];
				for(var i=0;i<data.floor.length;i++){
					var end_floor = data.floor[i];
					if(end_floor > data.floor_max){ end_floor = data.floor_max };
					var floor_data = {
						scratch_id  : id + (i).pad(3),
						start_floor : floor_num,
						end_floor   : end_floor,
						floor_num   : data.floor[i] + 1,
						rate_max    :_.reduce(scratch_data,function(sum,data){ sum += data.rate; return sum },0),
						level       : data.level[i],
						cave_map_id : data.cave_map_id[i],
						floor_max   : data.floor_max,
					};
					
					var scratch_data = caveScratchDataAll[floor_data.scratch_id];
					var rate_max = _.reduce(scratch_data,function(sum,data){ sum += data.rate; return sum },0)
					var events = _.groupBy(scratch_data,function(data){ return data.event_type })
					
					floor_data.rate_max =rate_max;
					floor_data.events   ={
						money    :events[ 1],
						kiseki   :events[ 2],
						gacha_pt :events[ 3],
						drop_item:events[ 9],
						trap     :events[10],
						enemy    :events[11],
					}
					floor_data.rates    ={
						money    :_.reduce(events[ 1],function(sum,data){ sum += data.rate; return sum },0) / rate_max  * 100,
						kiseki   :_.reduce(events[ 2],function(sum,data){ sum += data.rate; return sum },0) / rate_max  * 100,
						gacha_pt :_.reduce(events[ 3],function(sum,data){ sum += data.rate; return sum },0) / rate_max  * 100,
						drop_item:_.reduce(events[ 9],function(sum,data){ sum += data.rate; return sum },0) / rate_max  * 100,
						trap     :_.reduce(events[10],function(sum,data){ sum += data.rate; return sum },0) / rate_max  * 100,
						enemy    :_.reduce(events[11],function(sum,data){ sum += data.rate; return sum },0) / rate_max  * 100,
					}
					
					floor_data_list.push(floor_data);
					if(data.floor[i] >= data.floor_max){ break }
				}
				
				result[id] = {
					id:id,
					world:data.world_id,
					area :data.area_id,
					group:data.group_id,
					quest:data.quest_id,
					name :data.dungeon_name,
					floor_data:floor_data_list,
				};
				
				return result
			},{})
			return {questDispData:questDispData};
		},
		render:function(){	
			
			var enemys = this.battle.createEnemyParty([10010000,10020000],[10,100]);
			console.log("SampleQuestData#render [enemys]",enemys);
			
			var response = this.createResponse();
			console.log("SampleQuestData#render [response]",response);
			
			this.$el.html( __.template("sample/quest_data",response) );
			return this;
		},
	});
	
	return SampleQuestData;
	
})

;
define('models/ShopREC',["models/PcREC"],function(PcREC){
	
	var ShopREC = Backbone.Model.extend({
		constructor:function(){
			if(!ShopREC.instance){
				ShopREC.instance = this;
				Backbone.Model.apply(ShopREC.instance,arguments);
			}
			return ShopREC.instance;
		},
		localStorage : new Backbone.LocalStorage("ShopREC"),
		defaults    :function(){
			this.pc = new PcREC;
			return{
				id :this.pc.get("id"),
				last_report_time       : 0,
				bug_report_count       : 0,
				last_tweet_arbeit_time : 0,
				tweet_arbeit_count     : 0,
				is_reviewed : 0,
			}
		},
		initialize:function(option){
			console.log("ShopREC#initialize");
			this.fetch();
			this.listenTo(this.pc,"reset_data",this.resetData);
			this.listenTo(this.pc,"fetch_user_id",this.fetchUserId);
			this.listenTo(this.pc,"change_user_id",this.changeUserId);
			this.save();
		},
		fetchUserId  : function(id){ console.log("ShopREC#fetchUserId",arguments); this.set("id",id).fetch() },
		changeUserId : function(id){ console.log("ShopREC#changeUserId",arguments); this.set("id",id).save() },
		resetData : function(pc_id,is_data_delete){
			this.destroy();
			this.attributes = (is_data_delete) ? {} : this.defaults();
			this.set("id",pc_id);
			this.save();
		},
	});
	
return ShopREC;

});

define('controllers/ShopIndexView',[
	"models/PcREC",
	"models/BillingREC",
	"models/Mate",
""],function(PcREC,BillingREC,Mate){
	
	var ShopIndexView = Backbone.View.extend({
		tagName:"div",
		events:{
			"ftap #arbeit a"   :"arbeit",
			"ftap #realMoney a":"realMoney",
			"ftap #packun a"   :"packun",
			"ftap #recover a"  :"recover",
		},
		initialize:function(){
			this.pc = new PcREC;
			this.mate = new Mate;
		},
		arbeit:function(){
			App.router.navigate("/html/Shop/arbeit"   ,{trigger:true})
		},
		realMoney:function(){
			App.views.indicator.show()
			App.sound.se(1);
			setTimeout(_.bind(function(){ //リペイントを発生させるためsetTimeout
				this.billingREC = new BillingREC({pc_id:this.pc.get("id"),pc:this.pc});
				this.listenTo(this.billingREC,"finishInit",this.billingFinishInit);
				this.listenTo(this.billingREC,"failBilling",this.billingFailInit);
				if(__.info.is_phonegap){
					this.billingREC.init()
				}else{
					setTimeout(this.billingFinishInit,2000)
				}
			},this),0)
		},
		billingFinishInit:function(){
			App.views.indicator.hide();
			App.router.navigate("/html/Shop/realMoney",{trigger:true});
		},
		billingFailInit:function(){
			App.views.indicator.hide();
		},
		packun:function(){
			App.router.navigate("/html/Shop/packun"   ,{trigger:true})
		},
		recover:function(){
			var is_exist_deck = _.find(this.pc.get("deck"),function(id){ return id>0 })
			if(!is_exist_deck){
				App.popup.message({message:"デッキが編成されていません<br/><br/>モンスターメニューから<br/>デッキを編成しましょう"})
				return this
			}
			
			// todo : 回復に必要な金額を計算する
			var _this = this;
			var mate_list = this.pc.get("mate_list");
			var members = _.map( _.compact(this.pc.get("deck")) ,function(id,n){ return this.pc.getMateData(id) },this);
			var need_game_money = _.reduce(members,function(sum,member){
				var exp_data = this.mate.getExpData(member)
				var hp_per = (1-member.hp_per);
				sum += exp_data.next_exp * hp_per / 10;
				return sum
			},0,this).ceil()
			
			console.log("ShopIndexView#recover [need_game_money,members]",[need_game_money,members]);
			if(need_game_money>0){
				App.popup.confirm({message:"現在のデッキのモンスターを<br/>回復させますか？<br/><br/>消費コイン："+need_game_money+" 枚<br/>所持コイン："+this.pc.getItem(df.ITEM_GAME_MONEY)+" 枚" }).done(function(){
					if(_this.pc.getItem(df.ITEM_GAME_MONEY) >= need_game_money){
						_.each(members,function(member){
							mate_list[member.id].hp_time = __.baseTime();
						})
						_this.pc.set("mate_list",mate_list)
						_this.pc.useItem(df.ITEM_GAME_MONEY, need_game_money)
						App.popup.message({message:"モンスターが全回復しました！",yes:{label:"OK"}})
						App.mission.checkProcess("RECOVER_CARD");
					}else{
						App.popup.message({message:"コインが不足しています"})
					}
				})
			}else{
				App.popup.message({message:"回復の必要はないみたいです<br/>全員元気です！<br/>",yes:{label:"OK"}})
			}
		},
		response : function(){
			var pc = new PcREC;
			var res = {
				mate_num   :_.size(pc.get("mate_list")),
				mate_max   :pc.get("mate_max"),
				gacha_point:pc.getItem( df.ITEM_GACHA_POINT ),
				game_money :pc.getItem( df.ITEM_GAME_MONEY ),
				real_money :pc.getItem( df.ITEM_REAL_MONEY ),
				deck       :pc.get("deck"),
				members    :_.map(pc.get("deck"),function(id,n){ if(!id){ return } return pc.getMateData(id) }),
				packun_n   :pc.getItem( df.ITEM_PACKUN_NORMAL ),
				packun_s   :pc.getItem( df.ITEM_PACKUN_SUPER ),
				packun_d   :pc.getItem( df.ITEM_PACKUN_DRAGON ),
				packun_n_id:df.ITEM_PACKUN_NORMAL,
				packun_s_id:df.ITEM_PACKUN_SUPER ,
				packun_d_id:df.ITEM_PACKUN_DRAGON,
			}
			res.response = res;
			return res;
		},
		render:function(){
			var response = this.response()
			this.$el.html( __.template("shop/index",response) );
			return this
		},
		setupView:function(){
			__.scroller.create("shop_index_list",{scrollbars:true});
		},
	});
	
	return ShopIndexView;
	
})

;
define('controllers/ShopArbeitView',[
	"models/PcREC",
	"models/ShopREC",
	"models/Twitter",
	"models/PresentREC",
	"controllers/ShopIndexView",
""],function(PcREC,ShopREC,Twitter,PresentREC,ShopIndexView){
	
	var ShopArbeitView = Backbone.View.extend({
		tagName:"div",
		events:{
			"ftap #bug_reports a" :"bugReports",
			"ftap #store_review a":"storeReview",
			"ftap #twitter a"     :"tweetBtn",
		},
		initialize:function(){
			this.pc = new PcREC;
			this.shop = new ShopREC;
			this.present = new PresentREC;
		},
		resetReward: function(){
			//debug用
			this.shop.set("is_reviewed",0);
			this.shop.set("last_review_time",0);
			this.shop.set("last_report_time",0);
			this.shop.set("last_tweet_time",0);
			this.shop.set("last_phrase_time",0);
			this.shop.save();
		},
		alertConnection:function(){
			App.popup.message({message: "通信できませんでした<br/>通信環境のいい場所でご利用ください"})
		},
		checkConnection:function(){
			if(!__.info.is_phonegap){ return false }
			if( navigator.connection.type == Connection.UNKNOWN || navigator.connection.type == Connection.NONE){
				return true
			}
			return false
		},
		getNextReportTime: function(){ return this.shop.get("last_report_time") + 10000000; },
		getNextTweetTime : function(){ return this.shop.get("last_tweet_time") + 10000000; },
		getNextPhraseTime: function(){ return this.shop.get("last_phrase_time") + 10000000; },
		
		//バグ報告ボタン
		bugReports:function(){
			var _this = this;
			if(this.checkConnection()){ this.alertConnection(); return }
			var childView = window.open("index_sub.html#html/Shop/bugReports",'_blank','location=no');
			console.log("ShopArbeitView#bugReports [childView]",childView);
			var changeWindowEvent = function(e,$check){
				if(/bug_report_complete/.test(e.url)){ $check.resolve("complete") }
				if(/bug_report_cancel/.test(e.url)  ){ $check.resolve("cancel") }
				if(/bug_report_failed/.test(e.url)  ){ $check.reject() }
				if(_this.checkConnection()){ $check.reject() }
			}
			__.childWindowEvent({
				type   :"loadstart",
				window :childView,
				handler:changeWindowEvent,
				done   :_.bind(_this.successBugReports,this),
				fail   :function(){ alert("送信に失敗しました\n通信環境のいいところでご利用ください。") },
			})
		},
		successBugReports:function(arg){
			var type = arg[0];
			if(type=="cancel"){
				App.popup.message({message:"キャンセルしました"});
			}
			if(type=="complete"){
				var time = __.baseTime();
				if(time < this.getNextReportTime()){
					App.popup.message({message:"送信しました。<br/>ご協力ありがとうございました。"});
				}else{
					this.present.addSetItem({message:"バグ報告のお礼です", time:time}, df.ITEM_SET_ARBEIT_BUG_REPORT).save();
					this.shop.set("last_report_time",time).save();
					App.popup.message({message:"送信しました。<br/>報酬をプレゼントに送りました。<br/><br/>ご協力ありがとうございました。"});
					this.render().setupView();
				}
			}
		},
		
		//レビューボタン
		storeReview:function(){
			if(this.shop.get("is_reviewed")){ return }
			if(this.checkConnection()){ this.alertConnection(); return }
			//if(this.shop.get("is_reviewed")){ alert("既に報酬を受け取っています"); return }
			if(__.info.is_android) window.open(df.URL_GOOGLEPLAY_APP,'_system');
			if(__.info.is_ios) location.href = df.URL_APPSTORE_APP;
			
			var time = __.baseTime();
			this.present.addSetItem({message:"アプリレビューのお礼です", time:time}, df.ITEM_SET_ARBEIT_REVIEW).save();
			this.shop.set("last_review_time",time).set("is_reviewed",1).save();
			_.delay(_.bind(function(){
				this.render().setupView();
				App.popup.message({message:"アプリレビュー報酬を<br/>プレゼントに送りました。"});
			},this),1000)
		},
		
		//ツイッター関連
		tweetBtn:function(){
			if(__.baseTime() < this.getNextTweetTime()){ return }
			if(this.checkConnection()){ this.alertConnection(); return }
			
			var _this       = this;
			var tweet_msg   = '"深イイ" 探検RPG登場！？\nアイテムでモンスターを捕まえ、\n無限のダンジョンを攻略しよう！\n ' + appenv.twitter_hash_tag + ' code' + __.baseTime().toString().substr(5,5);
			var twitter     = this.createTwitter();
			
			if( twitter.rec.get("is_connected") ){
				var popup = App.popup.confirm({
					title:'ツイート確認',
					yes:{label:"ツイート報酬GET"},
					no:{label:"閉じる"},
					message:'以下の内容でツイートします。<br/><hr/>' + tweet_msg.replace(/\n/g,'<br />') + '<hr/>',
				}).done(function(){ twitter.tweet(tweet_msg) });
			}else{
				var popup = App.popup.confirm({
					title:'ツイート確認',
					yes:{label:"次へ"},
					no:{label:"閉じる"},
					message:'以下の内容でツイートします。<br/><hr/>' + tweet_msg.replace(/\n/g,'<br />') + '<hr/>',
				}).done(function(){
					App.popup.message({
						title:'ツイート確認',
						message:'報酬付与のため連携アプリ認証を行います<br/>報酬付与以外の目的には使用しません'
					}).done(function(){ twitter.tweet(tweet_msg) })
				});
			}
		},
		createTwitter: function(){
			var _this = this;
			var twitter = new Twitter;
			twitter.tweetFinish = function(){
				App.views.indicator.hide()
				var time = __.baseTime();
				_this.present.addSetItem({message:"ツイート報酬です", time:time}, df.ITEM_SET_ARBEIT_TWEET).save();
				_this.shop.set("last_tweet_time",time).save();
				App.popup.message({message:"ツイートしました。<br />報酬をプレゼントに送りました。"});
				_this.render().setupView();
				App.mission.checkProcess("POST_TWITTER_ARBEIT");
			}
			return twitter
		},
		
		response:function(){
			var shopIndexView = new ShopIndexView();
			var base_response = shopIndexView.response()
			var pc = new PcREC;
			var next_report_time    = this.getNextReportTime();
			var next_tweet_time     = this.getNextTweetTime();
			var next_phrase_time    = this.getNextPhraseTime();
			var res = {
				is_reviewed : this.shop.get("is_reviewed"),
				next_report_time    : next_report_time,
				next_tweet_time     : next_tweet_time,
				next_phrase_time    : next_phrase_time,
				is_next_report_time : (__.baseTime() < next_report_time) ? true : false,
				is_next_tweet_time  : (__.baseTime() < next_tweet_time) ? true : false,
				is_next_phrase_time : (__.baseTime() < next_phrase_time) ? true : false,
				tweet_reward_num : 10,
				review_reward_num : 1000,
			}
			return _.extend(base_response,res)
		},
		render:function(){
			this.$el.html( __.template("shop/arbeit",this.response()) );
			return this
		},
		setupView:function(){
			__.scroller.create("shop_index_list",{scrollbars:true});
		},
	});
	
	return ShopArbeitView;
	
})

;
define('controllers/ShopArbelt_BugReportsView',[
	"models/PcREC",
""],function(PcREC){
	
	var ShopArbeitView = Backbone.View.extend({
		tagName:"div",
		initialize:function(){
		},
		events:{
			"ftap .submit":"submit",
			"ftap .cancel":"cancel",
		},
		cancel:function(){
			location.href = "index_sub.html#bug_report_cancel";
		},
		submit:function(e){
			e.preventDefault();
			App.views.indicator.show();
			this.post(true);
		},
		post :function(retry,self){
			$.post(appenv.bug_report_php, {
				device_id : localStorage.device_id ,
				save_id   : localStorage.save_id ,
				storage   : JSON.stringify(localStorage),
				name      : document.form.name.value,
				mail      : document.form.mail.value,
				content   : document.form.content.value,
			}).done(function( data ) {
				location.href = "index_sub.html#bug_report_complete";
			}).fail(_.bind(function() {
				//if(retry){
				//	this.post(false);
				//}else{
					alert(JSON.stringify(arguments))
					location.href = "index_sub.html#bug_report_failed";
				//}
			},this));
		},
		render:function(){
			this.$el.html( __.template("shop/arbeit_bug_reports") );
			return this
		},
		setupView:function(){
		},
	});
	
	return ShopArbeitView;
	
})

;
define('controllers/ShopPackunView',[
	"models/PcREC",
	"controllers/ShopIndexView",
""],function(PcREC,ShopIndexView){
	
	var ShopPackunView = Backbone.View.extend({
		tagName:"div",
		events:{
			"ftap .buy_packun":"buyCinform",
		},
		buyCinform:function(e){
			var id = $(e.currentTarget).data("id");
			var shop_item = st.PackunShopData[id];
			var need_item = st.ItemData[shop_item.need_item];
			var buy_item  = st.ItemData[shop_item.item_id];
			App.popup.confirm({
				title:"パックン購入",
				message:need_item.name + "を" + shop_item.price + "使って<br/>" + buy_item.name + "を" + shop_item.num + "個購入しますか？",
			}).done(function(){
				var pc = new PcREC;
				if(pc.getItem(shop_item.need_item) < shop_item.price){
					App.popup.message({message:need_item.name + "が不足しています"});
					return
				}
				pc.addItem(shop_item.item_id, shop_item.num);
				pc.useItem(shop_item.need_item, shop_item.price);
				App.popup.message({message:"購入しました"}).done(function(){
					App.router.navi.Shop.packun();
					if(shop_item.item_id == df.ITEM_PACKUN_NORMAL) App.mission.checkProcess("BUY_PACKUN_NORMAL");
					if(shop_item.item_id == df.ITEM_PACKUN_SUPER)  App.mission.checkProcess("BUY_PACKUN_SUPER");
					if(shop_item.item_id == df.ITEM_PACKUN_DRAGON) App.mission.checkProcess("BUY_PACKUN_DRAGON");
				});
			});
		},
		response : function(){
			var shopIndexView = new ShopIndexView();
			var base_response = shopIndexView.response()
			
			//shop用のデータ加工
			var packun_data = _.groupBy(st.PackunShopData,function(data){ return data.item_id });
			_.each(packun_data,function(data){
				data.sort(function(a,b){ return a.priority - b.priority })
			});
			var packun_keys = _.keys(packun_data).sort(function(a,b){
				return packun_data[a][0].priority - packun_data[b][0].priority 
			});
			
			var pc = new PcREC;
			var res = {
				packun_data:packun_data,
				packun_keys:packun_keys,
			}
			return _.extend(base_response,res)
		},
		render:function(){
			this.$el.html( __.template("shop/packun",this.response()) );
			return this
		},
		setupView:function(){
			__.scroller.create("shop_index_list",{scrollbars:true});
		},
	});
	
	return ShopPackunView;
	
})
;
define('controllers/ShopRealMoneyView',[
	"models/PcREC",
	"models/BillingREC",
	"controllers/ShopIndexView",
""],function(PcREC,BillingREC,ShopIndexView){
	
	var ShopRealMoneyView = Backbone.View.extend({
		tagName:"div",
		initialize:function(){
			this.pc = new PcREC;
			this.billingREC = new BillingREC({pc_id:this.pc.get("id"),pc:this.pc});
			this.listenTo(this.billingREC,"successBuy" ,this.successBuy );
			this.listenTo(this.billingREC,"finishBuy"  ,this.finishBuy  );
			this.listenTo(this.billingREC,"failBilling",this.failBilling);
		},
		events:{
			//"ftap a"                :"sample",
			"ftap .init"                :"init",
			"ftap .getAvailableProducts":"getAvailableProducts",
			"ftap .getPurchases"        :"getPurchases",
			"ftap .buy"                 :"buy",
			"ftap .consumePurchase"     :"consumePurchase",
			"ftap .item_btn"            :"itemBtn",
		},
		init                :function(){ this.billingREC.init()                 },
		getAvailableProducts:function(){ this.billingREC.getAvailableProducts() },
		getPurchases        :function(){ this.billingREC.getPurchases()         },
		buy                 :function(){ this.billingREC.buy("xeno_test_10000") },
		consumePurchase     :function(){ this.billingREC.consumePurchase()      },
		
		itemBtn:function(e){
			App.views.indicator.show();
			App.sound.se(1);
			var _this = this;
			var id = $(e.currentTarget).data("id");
			setTimeout(function(){ _this.billingREC.buy(id) },0)
		},
		successBuy:function(){
			navigator.notification.alert("通信に時間がかかることがあります。\nしばらくお待ちください。",function(){},"購入完了処理中です")
		},
		finishBuy:function(){
			App.views.indicator.hide();
		},
		failBilling:function(){
			App.views.indicator.hide();
		},
		sample:function(e){
			var $target = $(e.currentTarget)
			console.log("ShopRealMoneyView#sample [$target.data('num')]",$target.data("num"));
		},
		response:function(){
			var shopIndexView = new ShopIndexView();
			var base_response = shopIndexView.response()
			var res = {
				product_list: this.billingREC.get("available_product_list"),
			}
			return _.extend(base_response,res)
		},
		render:function(){
			this.$el.html( __.template("shop/real_money",this.response()) );
			return this
		},
		setupView:function(){
			__.scroller.create("shop_index_list",{scrollbars:true});
		},
	});
	
	return ShopRealMoneyView;
	
})

;
define('controllers/ShopRecoverView',[
	"models/PcREC",
""],function(PcREC){
	
	var ShopRecoverView = Backbone.View.extend({
		tagName:"div",
		render:function(){
			var pc = new PcREC;
			var res = {
				mate_num   :_.size(pc.get("mate_list")),
				mate_max   :pc.get("mate_max"),
				gacha_point:pc.getItem( df.ITEM_GACHA_POINT ),
				game_money :pc.getItem( df.ITEM_GAME_MONEY ),
				real_money :pc.getItem( df.ITEM_REAL_MONEY ),
				deck       :pc.get("deck"),
				members    :_.map(pc.get("deck"),function(id,n){ if(!id){ return } return pc.getMateData(id) }),
			}
			this.$el.html( __.template("shop/recover",res) );
			return this
		},
		setupView:function(){
			__.scroller.create("shop_index_list",{scrollbars:true});
		},
	});
	
	return ShopRecoverView;
	
})

;
define('models/AnalyzeREC',["models/PcREC"],function(PcREC){
	
	var AnalyzeREC = Backbone.Model.extend({
		constructor:function(){
			if(!AnalyzeREC.instance){
				AnalyzeREC.instance = this;
				Backbone.Model.apply(AnalyzeREC.instance,arguments);
			}
			return AnalyzeREC.instance;
		},
		localStorage : new Backbone.LocalStorage("AnalyzeREC"),
		defaults    :function(){
			this.pc = new PcREC;
			return{
				id :this.pc.get("id"),
			}
		},
		initialize : function(){
			console.log("AnalyzeREC#initialize");
			if(__.info.is_phonegap){
				if(!window.plugins) window.plugins = {};
				if(window.plugins.gaPlugin){
					this.gaPlugin = window.plugins.gaPlugin;
				}else{
					var noop = function(){};
					this.gaPlugin = {
						init       :noop,
						trackEvent :noop,
						trackPage  :noop,
						setVariable:noop,
						exit       :noop,
					};
				}
				this.gaPlugin.init(this.successInit, this.errorInit, "UA-47247527-1", 10);
			}
			this.pc = new PcREC;
			this.listenTo(this.pc,"reset_data",this.resetData);
			this.listenTo(this.pc,"fetch_user_id",this.fetchUserId);
			this.listenTo(this.pc,"change_user_id",this.changeUserId);
			this.fetch();
			this.save();
		},
		fetchUserId  : function(id){ console.log("AnalyzeREC#fetchUserId",arguments); this.set("id",id).fetch() },
		changeUserId : function(id){ console.log("AnalyzeREC#changeUserId",arguments); this.set("id",id).save() },
		resetData : function(pc_id,is_data_delete){
			this.destroy();
			this.attributes = (is_data_delete) ? {} : this.defaults();
			this.set("id",pc_id);
			this.save();
		},
		successInit:function(data){
			console.log("AnalyzeREC#successInit")
			console.log(data)
		},
		errorInit:function(data){
			console.log("AnalyzeREC#errorInit")
			console.log(data)
		},
		checkNoop : function(callback){
			if(callback == undefined || callback == ""){
				return function(){}
			}else{
				return callback
			}
		},
		trackEvent : function(success, fail, category, eventAction, eventLabel, eventValue){
			if(!__.info.is_phonegap){ return }
			var success = this.checkNoop(success);
			var fail = this.checkNoop(fail);
			this.gaPlugin.trackEvent(success, fail, category, eventAction, eventLabel, eventValue);
		},
		trackPage : function(success, fail, pageURL){
			if(!__.info.is_phonegap){ return }
			var success = this.checkNoop(success);
			var fail = this.checkNoop(fail);
			
			this.gaPlugin.trackPage(success, fail, pageURL);
		},
		setVariable : function(success, fail, index, value){
			if(!__.info.is_phonegap){ return }
			var success = this.checkNoop(success);
			var fail = this.checkNoop(fail);
			
			this.gaPlugin.setVariable(success, fail, index, value)
		},
		exit : function(success, fail){
			if(!__.info.is_phonegap){ return }
			var success = this.checkNoop(success);
			var fail = this.checkNoop(fail);
			
			this.gaPlugin.exit(success, fail)
		},
	});
	
return AnalyzeREC;

});

define('models/BattleSkill',[
],function(){
	
	var BattleSkill = Backbone.Model.extend({
		constructor:function(){
			if(!BattleSkill.instance){
				BattleSkill.instance = this;
				Backbone.Model.apply(BattleSkill.instance,arguments);
			}
			return BattleSkill.instance;
		},
		initialize:function(prop,option){
			this.enemys  = option.enemys;
			this.members = option.members;
		},
		skill : function(id){
			return _.bind(this.aiData[id],this);
		},
		skillData : {
			0 : function(){
				return this.randomCommand([60,10,15,15]);
			}
		}
	});
	
	return BattleSkill;
})

;
define('models/Footer',[
],function(){
	
	var Footer = Backbone.Model.extend({
		constructor:function(){
			// �V���O���g��
			if(!Footer.instance){
				Footer.instance = this;
				Backbone.Model.apply(Footer.instance,arguments);
			}
			return Footer.instance;
		},
		defaults:function(){
			return {
				active : 0,
				disp : 1,
				present_num : 0,
			}
		},
	});
	
	return Footer;
});






define('models/LoginREC',[
	"models/PcREC",
	"models/PresentREC"
],function(PcREC,PresentREC){
	
	var TYPE_MORNING   = 0;
	var TYPE_NOON      = 1;
	var TYPE_EVENING   = 2;
	var TYPE_NIGHT     = 3;
	
	var PERIOD_LATE    = 5;
	var PERIOD_MORNING = 10;
	var PERIOD_NOON    = 14;
	var PERIOD_EVENING = 20;
	var PERIOD_NIGHT   = 24;
	
	var PERIOD_LIST    = ["10:00:00", "14:00:00", "20:00:00", "05:00:00"];
	
	var LoginREC = Backbone.Model.extend({
		constructor:function(){
			if(!LoginREC.instance){
				LoginREC.instance = this;
				Backbone.Model.apply(LoginREC.instance,arguments);
			}
			return LoginREC.instance;
		},
		defaults: function(){
			this.pc = new PcREC;
			return{
				id :this.pc.get("id"),
				last_login_count_time : 1000000000,
				next_login_count_time : 1000000000,
				next_login_bonus_time : 1000000000,
				login_day_count       : 0,
				chain_login_day_count : 1,
				bonus_count_logs      : [0,0,0,0],
			}
		},
		localStorage : new Backbone.LocalStorage("LoginREC"),
		initialize : function(){
			console.log("LoginREC#initialize");
			this.pc = new PcREC;
			this.listenTo(this.pc,"reset_data",this.resetData);
			this.fetch();
		},
		resetData : function(pc_id,is_data_delete){
			this.destroy();
			this.attributes = (is_data_delete) ? {} : this.defaults();
			this.set("id",pc_id);
			this.save();
		},
		check: function(){
			console.log("LoginREC#check");
			var is_count = this.checkLoginCount();
			var is_get   = this.checkLoginBonus();
			this.save();
			return is_get;
		},
		checkLoginCount: function(){
			var next_login_count_time = this.get("next_login_count_time");
			if(__.baseTime() >= next_login_count_time ){
				var count = this.get("login_day_count") + 1;
				this.set("login_day_count", count );
				this.set("next_login_count_time", this.getNextLoginCountTime() );
				this.set("last_login_count_time", __.baseTime() );
				
				var chain = this.get("chain_login_day_count") + 1;
				if( this.get("next_login_count_time") - next_login_count_time > 24*60*60*1000) chain = 1;
				this.set("chain_login_day_count", chain );
				
				console.log("LoginREC#checkLoginCount [count,chain]", count,chain );
				
				App.mission.resetClearComeback( this.get("next_login_count_time") - next_login_count_time );
				App.mission.checkProcess("LOGIN");
				//App.mission.checkProcess("CHAIN_LOGIN", chain);
				
				return {
					count:count,
					chain:chain,
				}
			}
			return false
		},
		checkLoginBonus: function(){
			if(__.baseTime() >= this.get("next_login_bonus_time") ){
				var next_time = this.getNextLoginBonusTime();
				var zone      = this.getCurrentZone();
				this.get("bonus_count_logs")[zone] += 1;
				this.set("next_login_bonus_time", next_time );
				this.addLoginBonus();
				App.mission.checkProcess("LOGIN_BONUS");
				console.log("LoginREC#checkLoginBonus ログボ！", "now:"+__.moment().format("MM/DD HH:mm") ,"next:"+__.moment(next_time).format("MM/DD HH:mm"), zone, this.get("bonus_count_logs") );
				return {
					time_type: zone,
				}
			}
			return false
		},
		getNextLoginCountTime: function(){
			var hour     = __.moment().hour();
			var today    = __.moment().format("YYYY-MM-DDT");
			var tomorrow = __.moment().add(1,"d").format("YYYY-MM-DDT");
			var next = (hour < 5) ? today + "05:00:00" : tomorrow + "05:00:00";
			return __.moment(next).valueOf();
		},
		getNextLoginBonusTime: function(){
			var hour     = __.moment().hour();
			var today    = __.moment().format("YYYY-MM-DDT");
			var tomorrow = __.moment().add(1,"d").format("YYYY-MM-DDT");
			var next = (hour < PERIOD_LATE   ) ? today + PERIOD_LIST[TYPE_NIGHT]   
			         : (hour < PERIOD_MORNING) ? today + PERIOD_LIST[TYPE_MORNING]      
			         : (hour < PERIOD_NOON   ) ? today + PERIOD_LIST[TYPE_NOON]     
			         : (hour < PERIOD_EVENING) ? today + PERIOD_LIST[TYPE_EVENING]       
			         : (hour < PERIOD_NIGHT  ) ? tomorrow + PERIOD_LIST[TYPE_NIGHT]
			         : "";
			return __.moment(next).valueOf();
		},
		getCurrentZone: function(){
			var hour = __.moment().hour();
			if(hour < PERIOD_LATE   ) return TYPE_NIGHT;
			if(hour < PERIOD_MORNING) return TYPE_MORNING;
			if(hour < PERIOD_NOON   ) return TYPE_NOON;
			if(hour < PERIOD_EVENING) return TYPE_EVENING;
			if(hour < PERIOD_NIGHT  ) return TYPE_NIGHT;
		},
		addLoginBonus: function(){
			var zone = this.getCurrentZone();
			var bonus_list = [ 
				df.ITEM_SET_LOGIN_BONUS_MORNING,
				df.ITEM_SET_LOGIN_BONUS_NOON,
				df.ITEM_SET_LOGIN_BONUS_EVENING,
				df.ITEM_SET_LOGIN_BONUS_NIGHT
			];
			var messages = [
				"朝のログインボーナスです",
				"昼のログインボーナスです",
				"夕のログインボーナスです",
				"夜のログインボーナスです",
			]
			var present = new PresentREC();
			present.addSetItem({ message: messages[zone] }, bonus_list[zone]).save();
		},
	});
	
return LoginREC;

});

define('models/MissionREC',[
	"models/PcREC",
	"models/ShopREC",
	"models/Twitter",
	"models/Quest",
],function(PcREC,ShopREC,Twitter,Quest){
	
	var CLEAR_TOTAL   = 0;
	var CLEAR_DAY     = 1;
	var CLEAR_TIME    = 2;
	var CLEAR_COMEBACK= 3;
	var PROGRESS      = 4;
	var CANCEL_TIME   = 5;
	var GUERRILLA_END = 6;
	
	var QUEST_WORLD = 1;
	
	var MissionREC = Backbone.Model.extend({
		constructor:function(){
			if(!MissionREC.instance){
				MissionREC.instance = this;
				Backbone.Model.apply(MissionREC.instance,arguments);
			}
			return MissionREC.instance;
		},
		localStorage : new Backbone.LocalStorage("MissionREC"),
		defaults    :function(){
			this.pc = new PcREC;
			return {
				id :this.pc.get("id"),
				mission_state : {},
				current_mission_list : [],
				last_reset_time : 0,
				last_guerrilla_check_time : 0,
			}
		},
		defaultState : function(){
			return [0,0,0,0,0,0,0];
		},
		initialize:function(option){
			console.log("MissionREC#initialize");
			this.fetch();
			this.listenTo(this.pc,"reset_data",this.resetData);
			this.listenTo(this.pc,"fetch_user_id",this.fetchUserId);
			this.listenTo(this.pc,"change_user_id",this.changeUserId);
			this.save();
			
			_.bindAll(this,"afterBegin","beforeEnd","inPeriod","meetKey","meetKeyForDay","meetKeyForTotal","notClearDay","notClearTotal","notClearComeback","notClearComebackCnt3","afterCancelForDay","afterCancelForTime","afterFailedForTime")
			var mission_data   = this.addNextIdAndDefaultState(st.MissionData);
			this.mission_data  = _(mission_data).sort(function(a,b){ return b.id - a.id }).groupBy("kind").valueOf();
			this.updateList();
		},
		fetchUserId  : function(id){ console.log("MissionREC#fetchUserId",arguments); this.set("id",id).fetch() },
		changeUserId : function(id){ console.log("MissionREC#changeUserId",arguments); this.set("id",id).save() },
		resetData : function(pc_id,is_data_delete){
			this.destroy();
			this.attributes = (is_data_delete) ? {} : this.defaults();
			this.set("id",pc_id);
			this.save();
		},
		
		/*************************************************
		**- define
		*************************************************/
		CLEAR_TOTAL   :CLEAR_TOTAL   ,
		CLEAR_DAY     :CLEAR_DAY     ,
		CLEAR_TIME    :CLEAR_TIME    ,
		CLEAR_COMEBACK:CLEAR_COMEBACK,
		PROGRESS      :PROGRESS      ,
		CANCEL_TIME   :CANCEL_TIME   ,
		GUERRILLA_END :GUERRILLA_END ,
		
		/*************************************************
		**- utils
		*************************************************/
		// current_mission_listにstateを追加したデータを返す
		getMissionDataList: function(){
			this.updateList();
			var current_mission_list = _.cloneDeep( this.get("current_mission_list") );
			return _.map( current_mission_list, function(data){
				var state = this.get("mission_state")[data.id];
				return _.extend( {state: _.cloneDeep(state) }, data );
			},this)
		},
		
		// next_idの追加と、stateに初期値の設定
		addNextIdAndDefaultState: function(st_mission_data){
			var mission_state = this.get("mission_state");
			_.each(st_mission_data,function(data,key){ data.next_id = [] });
			_.each(st_mission_data,function(data,key){
				// st.MissionDataにnext_idを追加する
				_.each(data.key_id,function(key){ if(key) st_mission_data[key].next_id.push(data.id); })
				
				// mission_stateにdefaultStateを追加する
				if(!mission_state[key]) mission_state[key] = this.defaultState();
			},this);
			return st_mission_data;
		},
		
		// 1日経過でCLEAR_DAYを0にリセット
		resetClearDay: function(){
			var reset_day = __.moment( this.get("last_reset_time") ).format("YYYY-MM-DD");
			var today = __.moment().format("YYYY-MM-DD");
			if( __.moment(reset_day).valueOf() < __.moment(today).valueOf() ){
				_.each(this.get("mission_state"), function(data){
					data[CLEAR_DAY] = 0;
					//data[PROGRESS] = 0;
				})
				this.set("last_reset_time", __.baseTime() ).save();
			}
		},
		
		// 1日経過でCLEAR_DAYを0にリセット
		resetClearComeback: function(term){
			if(term < 7*24*60*60*1000) return;
			_.each(this.get("mission_state"), function(data){
				data[CLEAR_COMEBACK] = 0;
			})
			this.save();
		},
		
		//cancel
		cancel: function(mission_id){
			this.get("mission_state")[mission_id][CANCEL_TIME] = __.baseTime();
			this.omitMission(mission_id);
			this.save();
		},
		
		//ミッションの削除
		omitMission: function(mission_id){
			var mission_list = _.filter(this.get("current_mission_list"), function(data){ return data.id != mission_id })
			this.set("current_mission_list",mission_list);
		},
		
		//クリア判定結果を追加
		checkClear: function(mission){
			var state = this.get("mission_state")[mission.id];
			console.log("MissionREC#checkClear [state,mission]",state,mission);
			if(state[PROGRESS] >= mission.progress_max && !mission.is_clear){
				mission.is_clear = 1;
				console.log("MissionREC#checkClear CLEAR! [state,mission]",state,mission);
			}
		},
		
		//Progressを追加
		incProgress: function(mission,cnt){
			console.log("MissionREC#incProgress [mission,cnt]",mission,cnt)
			if(mission.is_clear) return;
			var state = this.get("mission_state")[mission.id];
			state[PROGRESS] += cnt;
		},
		
		//Progressを任意の値にset
		setProgress: function(mission,cnt){
			if(mission.is_clear) return;
			var state = this.get("mission_state")[mission.id];
			state[PROGRESS] = cnt;
		},
		
		//clear、報酬受け取り処理
		clear: function(mission_id){
			console.log("MissionREC#clear [mission_id]",mission_id);
			var mission_data = _.find(this.mission_list, function(data){ return data.id == mission_id });
			var reward_data  = __.excelArrayToJSON(mission_data, ["reward_type","reward_id","reward_vol"])
			_.each(reward_data,function(reward){
				this.pc.addItem(reward.reward_id, reward.reward_vol, reward.reward_type)
			},this)
			this.omitMission(mission_id);
			
			var state = this.get("mission_state")[mission_id];
			    state[CLEAR_TOTAL]    += 1;
			    state[CLEAR_COMEBACK] += 1;
			    state[CLEAR_DAY]       = 1;
			    state[PROGRESS]        = 0;
			
			this.pc.save();
			this.save();
		},
		
		//debug
		testClear: function(mission_id){
			var state = this.get("mission_state")[mission_id];
			var mission = _.find(this.mission_list, function(mission){ return mission.id == mission_id });
			state[PROGRESS] = mission.progress_max;
			this.checkClear(mission);
		},
		
		/*************************************************
		**- predicate
		* filterの判定メソッド
		*************************************************/
		// 開始期間チェック
		afterBegin : function(data){ return !(data.begin && __.baseTime() < __.moment(data.begin).valueOf()) },
		
		// 終了期間チェック
		beforeEnd : function(data){ return !(data.end   && __.moment(data.end).valueOf() < __.baseTime()) },
		
		// 期間内チェック
		inPeriod : function(data){ return (this.afterBegin(data) && this.beforeEnd(data)) },
		
		// KeyIdの条件を満たして(meet)いるかチェック
		meetKey : function(data,type,cnt){
			var key_ids = _.compact(data.key_id);
			//console.log(key_ids);
			if(key_ids.length == 0) return 1;
			
			var judge_result = 1;
			_.each(key_ids,function(key){
				if(this.get("mission_state")[key][type] < cnt) judge_result = 0;
			},this)
			return judge_result;
		},
		
		// KeyIdの条件を、今日満たしたかチェック
		meetKeyForDay        : function(data){ return this.meetKey(data, CLEAR_DAY  , 1) },
		
		// KeyIdの条件を、今までに満たしたことがあるかチェック
		meetKeyForTotal      : function(data){ return this.meetKey(data, CLEAR_TOTAL, 1) },
		
		// 今日クリアしていないもののみ
		notClearDay          : function(data){ return this.get("mission_state")[data.id][CLEAR_DAY] == 0 },
		
		// 今までクリアしたことがないもののみ
		notClearTotal        : function(data){ return this.get("mission_state")[data.id][CLEAR_TOTAL] == 0 },
		
		// 今までクリアしたことがないもののみ
		notClearComeback     : function(data){ return this.get("mission_state")[data.id][CLEAR_COMEBACK] == 0 },
		
		// いままでのクリア回数3以下のもののみ
		notClearComebackCnt3 : function(data){ return this.get("mission_state")[data.id][CLEAR_COMEBACK] < 3 },
		
		// cancelしたものを翌日復活させる
		afterCancelForDay  : function(data){
			var cancel_time = this.get("mission_state")[data.id][CANCEL_TIME];
			var cancel_day  = __.moment(cancel_time).format("YYYY-MM-DD");
			var today       = __.moment().format("YYYY-MM-DD");
			return (cancel_time == 0 || __.moment(cancel_day).valueOf() < __.moment(today).valueOf() )
		},
		
		// cancelしたものを一定時間後復活させる
		afterCancelForTime : function(data){
			var compare_time = 6*60*60*1000; // 6時間後
			var cancel_time  = this.get("mission_state")[data.id][CANCEL_TIME];
			return (__.baseTime() - cancel_time > compare_time)
		},
		
		// ミッション失敗判定
		afterFailedForTime : function(data){ return this.afterCancelForTime(data) },
		
		//kind内で有効なNextIdが存在しないもののみにする
		emptyNextIdWithKind: function(data){
			var has_next_id = 0;
			_.each(data.next_id,function(id){
				if(this.mission_data[id].kind == data.kind){
					has_next_id = 1;
				}
			},this)
			return (has_next_id)?0:1;
		},
		
		
		/*************************************************
		**- updateList
		*************************************************/
		updateList: function(){
			console.log("MissionREC#updateList")
			this.resetClearDay();
			this.mission_list_data = {}
			
			var mission_data = this.mission_data;
			var tutorial     = _(mission_data.TUTORIAL).filter(this.meetKeyForTotal).filter(this.notClearComeback).first();
			var tutorial_ad  = _(mission_data.TUTORIAL_AD).filter(this.meetKeyForDay).filter(this.notClearComebackCnt3).filter(this.notClearDay).first();
			var guerrilla    = _(mission_data.GUERRILLA).filter(this.meetKeyForDay).filter(this.notClearDay).filter(this.afterFailedForTime).shuffle().first();
			var event_list   = _(mission_data.EVENT).filter(this.inPeriod).filter(this.meetKeyForTotal).filter(this.notClearTotal).shuffle().slice(0,3).value();
			var event_list   = _(mission_data.EVENT).filter(this.inPeriod).filter(this.meetKeyForTotal).filter(this.notClearTotal).value();
			var routine      = _(mission_data.ROUTINE).filter(this.meetKeyForDay).filter(this.notClearDay).first();
			var count        = _(mission_data.COUNT).filter(this.meetKeyForTotal).filter(this.notClearDay).filter(this.afterCancelForTime).shuffle().first();
			var wanted       = _(mission_data.WANTED).filter(this.afterCancelForTime).shuffle().first();
			//var wanted       = _(mission_data.WANTED).filter(this.afterCancelForTime).filter(function(data){ return data.type_str == "SLAY_CARD_ATTR" }).first();
			var book         = _(mission_data.BOOK).filter(this.meetKeyForTotal).filter(this.notClearTotal).first();
			var conversion   = _(mission_data.CONVERSION).filter(this.meetKeyForTotal).filter(this.notClearTotal).filter(this.afterCancelForDay).first();
			
			    tutorial     =                         this.createMission("TUTORIAL"   , tutorial   );
			    if(appenv.BUILD_LEVEL == appenv.DEBUG_BUILD) tutorial = false;
			    tutorial_ad  =                         this.createMission("TUTORIAL_AD", tutorial_ad);
			    guerrilla    = (tutorial)? undefined : this.createMission("GUERRILLA"  , guerrilla  );
			    event_list   =                         this.createMission("EVENT"      , event_list );
			    routine      =                         this.createMission("ROUTINE"    , routine    );
			    count        =                         this.createMission("COUNT"      , count      );
			    wanted       = (tutorial)? undefined : this.createMission("WANTED"     , wanted     );
			    book         = (tutorial)? undefined : this.createMission("BOOK"       , book       );
			    conversion   = (tutorial)? undefined : this.createMission("CONVERSION" , conversion );
			    
			this.mission_list_data = {
				tutorial   : tutorial   ,
				tutorial_ad: tutorial_ad,
				guerrilla  : guerrilla  ,
				event_list : event_list ,
				routine    : routine    ,
				count      : count      ,
				wanted     : wanted     ,
				book       : book       ,
				conversion : conversion ,
			}
			
			this.mission_list = _.compact( [].concat([tutorial, tutorial_ad, guerrilla]).concat(event_list).concat([routine, count, wanted, book, conversion]) );
			this.set("current_mission_list", this.mission_list);
		},
		
		//ミッションの存在判定を行う
		createMission: function(kind, mission){
			var mission = _.cloneDeep(mission);
			var current_list = _.filter(this.get("current_mission_list"), function(data){ return data.kind == kind });
			
			if(kind == "GUERRILLA") return this.createMissionGuerrilla(mission,current_list);
			if(kind == "WANTED"   ) return this.createMissionWanted(mission, current_list);
			if(kind == "COUNT"    ) return this.createMissionCount(mission, current_list);
			if(kind == "EVENT"    ) return this.createMissionEvent(mission, current_list);
			
			return (current_list.length > 0)? current_list[0]: mission;
		},
		
		//ゲリラミッションの加工
		createMissionGuerrilla: function(mission, current_list){
			var current = current_list[0];
			var now = __.baseTime();
			
			// 発生中のミッションがあり、ゲリラ終了前なら現在のものを返す。
			// ミッションがなかったらundefinedを返す
			// 最後のゲリラ発生チェックから12時間経過していなかったらundefinedを返す
			if(current_list.length > 0 && now < current.guerrilla_end) return current;
			if(!mission) return;
			if( __.baseTime() - this.get("last_guerrilla_check_time") < 8*60*60*1000 ) return;
			
			// ここまで抜けたら、新規ミッション作成とゲリラ発生時刻を保存
			// 半分の確率でmissionデータを作成する
			this.set("last_guerrilla_check_time", __.baseTime() );
			var is_create = _.random(0,1);
			if(is_create){
				mission.guerrilla_end = now + 3*60*60*1000;
				return mission;
			}
		},
		
		//Countミッションの加工
		createMissionCount: function(mission, current_list){
			if(current_list.length > 0) return current_list[0];
			if(!mission) return 
			
			var progress_data  = JSON.parse(mission.type_data);
			var clear_total    = this.get("mission_state")[mission.id][CLEAR_TOTAL];
			var progress_index = Math.min(clear_total, progress_data.length-1);
			mission.progress_max = progress_data[progress_index];
			return mission
		},
		//Wantedミッションの加工
		createMissionWanted: function(mission, current_list){
			if(current_list.length > 0) return current_list[0];
			if(!mission) return 
			
			var type_data = mission.type_data.split("/");
			var progress_data  = JSON.parse(type_data[0]);
			var progress_index =_.random(0,progress_data.length-1);
			mission.progress_max = progress_data[progress_index];
			if(mission.type_str=="SLAY_CARD_LEVEL" ) mission = this.addWantedDataSlayCardLevel(mission);
			if(mission.type_str=="SLAY_CARD_ATTR"  ) mission = this.addWantedDataSlayCardAttr(mission);
			if(mission.type_str=="SLAY_CARD_RARITY") mission = this.addWantedDataSlayCardRarity(mission);
			return mission
		},
		addWantedDataSlayCardLevel: function(mission){
			var type_data = mission.type_data.split("/");
			var type = type_data[1];
			mission.level = 1;
			if(type == "current_quest"){
				var pc = new PcREC;
				var available_quest = pc.get("quest_status")[QUEST_WORLD].available_quest;
				var quest = new Quest;
				mission.level = quest.getQuestInfo(available_quest).level;
			}else{
				mission.level = type.toNumber();
			}
			return mission
		},
		addWantedDataSlayCardAttr: function(mission){
			var type = mission.type_data.split("/")[1];
			mission.attr = (type == "random")? _.random(1,5): type.toNumber();
			return mission
		},
		addWantedDataSlayCardRarity: function(mission){
			var type_data = mission.type_data.split("/");
			mission[ type_data[1] ]  = 1; // is_under is_equal is_upperのどれかを1にする
			mission.rarity = type_data[2].toNumber();
			return mission
		},
		
		//Eventミッション加工
		createMissionEvent: function(mission_list, current_list){
			if(current_list.length > 0) return current_list;
			
			mission_list = _.map(mission_list,function(mission){
				
				     if(mission.type_str=="PLAY_QUEST_ID"      ) mission = this.addEventdDataPlayQuestId(mission);
				else if(mission.type_str=="CLEAR_QUEST_ID"     ) mission = this.addEventdDataClearQuestId(mission);
				else if(mission.type_str=="SLAY_CARD_UNIQU"    ) mission = this.addEventdDataSlayCardUniqu(mission);
				else if(mission.type_str=="SLAY_CARD_ID"       ) mission = this.addEventdDataSlayCardId(mission);
				else if(mission.type_str=="SLAY_CARD_LEVEL"    ) mission = this.addEventdDataSlayCardLevel(mission);
				else if(mission.type_str=="SLAY_CARD_ATTR"     ) mission = this.addEventdDataSlayCardAttr(mission);
				else if(mission.type_str=="SLAY_CARD_RARITY"   ) mission = this.addEventdDataSlayCardRarity(mission);
				else if(mission.type_str=="CAPTURE_CARD_UNIQU" ) mission = this.addEventdDataCaptureCardUniqu(mission);
				else if(mission.type_str=="CAPTURE_CARD_ID"    ) mission = this.addEventdDataCaptureCardId(mission);
				else if(mission.type_str=="CAPTURE_CARD_ATTR"  ) mission = this.addEventdDataCaptureCardAttr(mission);
				else if(mission.type_str=="CAPTURE_CARD_RARITY") mission = this.addEventdDataCaptureCardRarity(mission);
				
				return mission
			},this)
			return mission_list
		},
		addEventdDataPlayQuestId: function(mission){
			mission.quest_id = mission.type_data.split("/")[0].toNumber();
			return mission
		},
		addEventdDataClearQuestId: function(mission){
			mission.quest_id = mission.type_data.split("/")[0].toNumber();
			return mission
		},
		addEventdDataSlayCardUniqu: function(mission){
			var type_data = mission.type_data.split("/");
			mission.quest_id = type_data[0].toNumber();
			mission.card_id = type_data[1].toNumber();
			return mission
		},
		addEventdDataSlayCardId: function(mission){
			mission.card_id = mission.type_data.split("/")[0].toNumber();
			return mission
		},
		addEventdDataSlayCardLevel: function(mission){
			mission.level = mission.type_data.split("/")[0].toNumber();
			return mission
		},
		addEventdDataSlayCardAttr: function(mission){
			mission.attr = (mission.type_data=="random")? _.random(1,5): mission.type_data.split("/")[0].toNumber();
			return mission
		},
		addEventdDataSlayCardRarity: function(mission){
			var type_data = mission.type_data.split("/");
			mission.rarity = type_data[0].toNumber();
			mission[ type_data[1] ] = 1;
			return mission
		},
		addEventdDataCaptureCardUniqu : function(mission){ return this.addEventdDataSlayCardUniqu(mission)  },
		addEventdDataCaptureCardId    : function(mission){ return this.addEventdDataSlayCardId(mission)     },
		addEventdDataCaptureCardAttr  : function(mission){ return this.addEventdDataSlayCardAttr(mission)   },
		addEventdDataCaptureCardRarity: function(mission){ return this.addEventdDataSlayCardRarity(mission) },
		
		
		/*************************************************
		**- checkProcess
		*************************************************/
		checkProcess: function(process_type,data){
			console.log("MissionREC#checkProcess [process_type,data]",process_type,data)
			// todo;findではなくfilterにする必要有り
			var target_list = _.filter(this.get("current_mission_list"), function(data){ return data.type_str == process_type });
			if(target_list.length == 0) return;
			
			_.each(target_list,function(mission){
				process_type = (this.processList[process_type])? process_type : "INC_PROGRESS";
				_.bind(this.processList[process_type],this)(mission, data);
			},this)
			
			this.save();
		},
		processList: {
			CURRENT_AREA: function(mission,quest_id){
				var pc = new PcREC;
				var available_quest = pc.get("quest_status")[QUEST_WORLD].available_quest;
				var play_area      = (quest_id.toNumber()/1000).floor()
				var available_area = (available_quest/1000).floor()
				if(play_area == available_area){
					this.incProgress(mission, 1);
					this.checkClear(mission);
				}
			},
			PLAY_QUEST_ID: function(mission,quest_id){
				if(mission.quest_id == quest_id){
					this.incProgress(mission, 1);
					this.checkClear(mission);
				}
			},
			CLEAR_QUEST_ID: function(mission,data){
				var quest_id = data[0];
				var result = data[1];
				if(mission.quest_id == quest_id && result == df.QUEST_RESULT_CLEAR){
					this.incProgress(mission, 1);
					this.checkClear(mission);
				}
			},
			CAPTURE_CARD: function(mission,get_member_list){
				this.incProgress(mission, get_member_list.length);
				this.checkClear(mission);
			},
			REVIEW_APP: function(mission,capture_num){
				var shop = new ShopREC;
				this.incProgress(mission, shop.get("is_reviewed")?1:0);
				this.checkClear(mission);
			},
			COMP_CARD: function(mission){
				var zukan_num = _.reduce(this.pc.get("zukan_flag"),function(sum,flag){ if(flag){sum++}; return sum },0);
				this.setProgress(mission, zukan_num);
				this.checkClear(mission);
			},
			SELL_CARD: function(mission,result){
				this.incProgress(mission, result.sell_materials.length );
				this.checkClear(mission);
			},
			
			SLAY_CARD_LEVEL: function(mission, battle_data, list_type){
				if(!list_type) list_type = "enemy_list";
				var need_lvl = mission.level;
				var cnt = 0;
				_.each(battle_data[list_type],function(enemy){
					if(enemy.lvl >= need_lvl) cnt += 1;
				})
				this.incProgress(mission, cnt);
				this.checkClear(mission);
			},
			SLAY_CARD_ATTR: function(mission, battle_data, list_type){
				if(!list_type) list_type = "enemy_list";
				var need_attr = mission.attr;
				var cnt = 0;
				_.each(battle_data[list_type],function(enemy){
					if(enemy.attribute == need_attr) cnt += 1;
				})
				this.incProgress(mission, cnt);
				this.checkClear(mission);
			},
			SLAY_CARD_RARITY: function(mission, battle_data, list_type){
				if(!list_type) list_type = "enemy_list";
				var need_rarity = mission.rarity;
				var cnt = 0;
				_.each(battle_data[list_type],function(enemy){
					if(mission.is_under){
						if(enemy.rarity <= need_rarity) cnt += 1;
					}else if(mission.is_upper){
						if(enemy.rarity >= need_rarity) cnt += 1;
					}else{
						if(enemy.rarity == need_rarity) cnt += 1;
					}
				})
				this.incProgress(mission, cnt);
				this.checkClear(mission);
			},
			SLAY_CARD_ID: function(mission, battle_data, list_type){
				if(!list_type) list_type = "enemy_list";
				var need_card_id = mission.card_id;
				var cnt = 0;
				_.each(battle_data[list_type],function(enemy){
					if(enemy.card_id == need_card_id) cnt += 1;
				})
				this.incProgress(mission, cnt);
				this.checkClear(mission);
			},
			SLAY_CARD_UNIQU: function(mission, battle_data, list_type){
				if(!list_type) list_type = "enemy_list";
				var need_quest_id = mission.quest_id;
				if(battle_data.quest_id != need_quest_id) return;
				
				var need_card_id = mission.card_id;
				var cnt = 0;
				_.each(battle_data[list_type],function(enemy){
					if(enemy.card_id == need_card_id) cnt += 1;
				})
				this.incProgress(mission, cnt);
				this.checkClear(mission);
			},
			CAPTURE_CARD_LEVEL : function(mission, battle_data){ _.bind(this.processList.SLAY_CARD_LEVEL ,this)(mission, battle_data, "captured_list") },
			CAPTURE_CARD_ATTR  : function(mission, battle_data){ _.bind(this.processList.SLAY_CARD_ATTR  ,this)(mission, battle_data, "captured_list") },
			CAPTURE_CARD_RARITY: function(mission, battle_data){ _.bind(this.processList.SLAY_CARD_RARITY,this)(mission, battle_data, "captured_list") },
			CAPTURE_CARD_ID    : function(mission, battle_data){ _.bind(this.processList.SLAY_CARD_ID    ,this)(mission, battle_data, "captured_list") },
			CAPTURE_CARD_UNIQU : function(mission, battle_data){ _.bind(this.processList.SLAY_CARD_UNIQU ,this)(mission, battle_data, "captured_list") },
			INC_PROGRESS : function(mission){
				this.incProgress(mission,1);
				this.checkClear(mission);
			},
		},
		
		/*************************************************
		**- MissionDetailのresponse
		*************************************************/
		defaultResponse: function(mission){
			var state = this.get("mission_state")[mission.id];
			return _.extend({
				num     : mission.progress_max,
				progress: state[PROGRESS],
			}, _.cloneDeep(mission));
		},
		detailResponseList: {
			CURRENT_AREA: function(mission,quest_id){
				var pc = new PcREC;
				var available_quest = pc.get("quest_status")[1].available_quest;
				var quest_data = st.QuestListData[available_quest];
				return _.extend(this.defaultResponse(mission), { area_name: quest_data.area_name })
			},
			PLAY_QUEST_ID: function(mission){
				var quest = new Quest;
				var quest_name = quest.getQuestInfo(mission.quest_id).data.dungeon_name;
				var world_id = (mission.quest_id/1000000000).floor();
				var area_id = (mission.quest_id).toString();
				    area_id = area_id.slice(area_id.length-9,area_id.length-6).toNumber()
				var area_name = quest.get("area_data")[world_id][area_id][0].area_name;
				
				return _.extend(this.defaultResponse(mission), { area_name: area_name, quest_name: quest_name })
			},
			CLEAR_QUEST_ID: function(mission){
				return _.bind(this.detailResponseList.PLAY_QUEST_ID,this)(mission)
			},
			SLAY_CARD_LEVEL : function(mission){
				return _.extend(this.defaultResponse(mission), { level: mission.level })
			},
			SLAY_CARD_ATTR  : function(mission){
				return _.extend(this.defaultResponse(mission), { attr: __.helper.attrText(mission.attr) })
			},
			SLAY_CARD_RARITY: function(mission){
				return _.extend(this.defaultResponse(mission), { rarity: __.helper.rarityShortText(mission.rarity) })
			},
			SLAY_CARD_ID : function(mission){
				return _.extend(this.defaultResponse(mission), { card_name : _.cloneDeep(st.CardData[mission.card_id]).name })
			},
			SLAY_CARD_UNIQU : function(mission){
				return _.extend( _.bind(this.detailResponseList.PLAY_QUEST_ID ,this)(mission), {
					card_name : _.cloneDeep(st.CardData[mission.card_id]).name,
				})
			},
			CAPTURE_CARD_LEVEL : function(mission){ return _.bind(this.detailResponseList.SLAY_CARD_LEVEL ,this)(mission) },
			CAPTURE_CARD_ATTR  : function(mission){ return _.bind(this.detailResponseList.SLAY_CARD_ATTR  ,this)(mission) },
			CAPTURE_CARD_RARITY: function(mission){ return _.bind(this.detailResponseList.SLAY_CARD_RARITY,this)(mission) },
			CAPTURE_CARD_ID    : function(mission){ return _.bind(this.detailResponseList.SLAY_CARD_ID    ,this)(mission) },
			CAPTURE_CARD_UNIQU : function(mission){ return _.bind(this.detailResponseList.SLAY_CARD_UNIQU ,this)(mission) },
			
			CONNECT_TWITTER: function(mission){
				App.mission.checkProcess("CONNECT_TWITTER");
				return this.defaultResponse(mission);
			},
			DEFAULT_RESPONSE: function(mission){
				return this.defaultResponse(mission);
			},
		},
	});
	
return MissionREC;

});


define('models/ResumeREC',[
	"models/BattleREC",
	"models/CaveREC",
	"models/CaveMapREC",
	"models/CaveManager",
	"models/DeckREC",
	"models/PcREC",
],function(
	BattleREC,
	CaveREC,
	CaveMapREC,
	CaveManager,
	DeckREC,
	PcREC
){
	
	var ResumeREC = Backbone.Model.extend({
		constructor:function(){
			if(!ResumeREC.instance){
				ResumeREC.instance = this;
				Backbone.Model.apply(ResumeREC.instance,arguments);
			}
			return ResumeREC.instance;
		},
		defaults    : function(){ return this.defaultAttr() },
		defaultAttr : function(){
			this.pc = new PcREC;
			return{
				id :this.pc.get("id"),
				status : df.RESUME_CREATE_NEW_DATA,
			}
		},
		localStorage : new Backbone.LocalStorage("ResumeREC"),
		initialize : function(){
			console.log("ResumeREC#initialize");
			this.battle  = new BattleREC;
			this.cave    = new CaveREC;
			this.caveMap = new CaveMapREC;
			this.caveMgr = new CaveManager;
			this.deck    = new DeckREC;
			this.pc      = new PcREC;
			this.set("id",this.pc.get("id"))
			this.fetch();
			this.listenTo(this.battle ,"Resume",this.changeBattleStatus);
			this.listenTo(this.cave   ,"Resume",this.changeCaveStatus);
			this.listenTo(this.caveMap,"Resume",this.changeCaveMapStatus);
			this.listenTo(this.caveMgr,"Resume",this.changeCaveMgrStatus);
			this.listenTo(this.deck   ,"Resume",this.changeDeckStatus);
			this.listenTo(this.pc     ,"Resume",this.changePcStatus);
			this.listenTo(this.pc,"reset_data",this.resetData);
			this.listenTo(this.pc,"fetch_user_id",this.fetchUserId);
			this.listenTo(this.pc,"change_user_id",this.changeUserId);
			this.save();
		},
		validate : function(attrs,opt){
		},
		error : function(model,error,opt){
			console.log("ResumeREC#error");
		},
		fetchUserId  : function(id){ console.log("ResumeREC#fetchUserId",arguments); this.set("id",id).fetch() },
		changeUserId : function(id){ console.log("ResumeREC#changeUserId",arguments); this.set("id",id).save() },
		resetData : function(pc_id,is_data_delete){
			this.destroy();
			this.attributes = (is_data_delete) ? {} : this.defaults();
			this.set("id",pc_id);
			this.save();
		},
		changeBattleStatus :function(type){
			
			if(type == "battleEnd"){
				console.log("ResumeREC#changeBattleStatus battleEnd");
				this.cave.attributes.status.play = df.STATE_CAVE_NOW;
				this.set("status",df.RESUME_CAVE)
				this.cave.save();
				this.save();
			}else{
				console.log("ResumeREC#changeBattleStatus battleStart");
				this.cave.attributes.status.play = df.RESUME_BATTLE;
				this.set("status",df.RESUME_BATTLE)
				this.cave.save();
				this.save();
			}
		},
		changeCaveStatus   :function(model){
			
		},
		changeCaveMapStatus:function(model){
			
		},
		changeCaveMgrStatus:function(type){
			if(type == "gameNext"){
				this.cave.attributes.status.play = df.STATE_CAVE_NOW;
				this.set("status",df.RESUME_CAVE)
			}
			if(type == "gameResult"){
				this.cave.attributes.status.play = df.STATE_CAVE_AFTER;
				this.set("status",df.RESUME_CAVE_RESULT)
			}
			if(type == "gameEnd"){
				this.cave.attributes.status.play = df.STATE_CAVE_BEFORE;
				this.set("status",df.RESUME_VIEW_AREA_SELECT)
			}
			this.save();
		},
		changeDeckStatus   :function(model){
			
		},
		changePcStatus     :function(model){
			
		},
		
	});
	
	return ResumeREC;
});






define('models/Sound',["models/UserConfigREC"],function(UserConfigREC){
	
	/*
	OSアプデしたら、音消えるようになった。  
	エミュで確認しようとしたら、401エラー出る…plugin戻してもダメ。  
	access origin="*" で401エラー解決  
	しかし今度は「deviceready has not fired after 5 seconds」というエラー  
	phonegap4.xなのを3.xに戻すと直るらしい？→ビルドできなくなった→5.x系にしたら動いた  
	やっと本題のmedia、fileの更新をしてビルドしてみたが、サウンドのバグは直らない  
	そもそもエミュだと再現しない  
	お手上げなので、ios版のbgmはhtml5のAudioに修正する  
	
	nativeaudio使ったら消えなくなった
	https://github.com/floatinghotpot/cordova-plugin-nativeaudio
	
	BGMはmediaで、SEはnativeaudioで対応すれば良さそう。
	
	var path = decodeURI( window.location.pathname.replace("html/index.html","") ) + 'sound/';
	window.NA = window.plugins.NativeAudio;
	var is_loaded = 0
	NA.preloadSimple('click', path + 'se_btn_main.mp3', function(msg){
		is_loaded = 1;
	});
	NA.play('click')
	
	*/
	
	// 「&& use_html5」になってる箇所が対象。bgmだけかと思ったらseも変えないとダメでした。
	var use_html5_se  = false;
	var use_html5_bgm = true;
	if(__.info.is_android){
		use_html5_bgm = false;
	}
	if(!__.info.is_phonegap){
		use_html5_se  = true;
	}
	
	var Sound = Backbone.Model.extend({
		constructor:function(){
			// シングルトン
			if(!Sound.instance){
				Sound.instance = this;
				Backbone.Model.apply(Sound.instance,arguments);
			}
			return Sound.instance;
		},
		defaults    : function(){ return this.defaultAttr() },
		defaultAttr : function(){
			return {
				available_se:1,
				current_bgm :0,
				bgm_paused  :0,
			}
		},
		initialize:function(option){
			console.log("Sound#initialize",option);
			this.userConfig = new UserConfigREC;
			this.NativeAudio = (typeof plugins == "undefined" || typeof plugins.NativeAudio == "undefined")? false : plugins.NativeAudio;
			
			if(__.info.is_android){
				this.sound_path = "file:///android_asset/www/sound/";
			}else if(__.info.is_ios){
				var path = window.location.pathname.replace("html/index.html","");
				this.sound_path = decodeURI(path) + 'sound/';
			}else{
				var path = window.location.pathname.replace("html/index.html","");
				this.sound_path = decodeURI(path) + 'sound/';
			}
			
			this.se_list = {};
			for(var i in option.se_list){
				if(use_html5_se){
					this.se_list[i] = new Audio(this.sound_path + option.se_list[i]);
				}else if(this.NativeAudio){
					this.NativeAudio.preloadSimple(option.se_list[i], this.sound_path + option.se_list[i]);
					this.se_list[i] = option.se_list[i];
				}else if(__.info.is_phonegap){
					this.se_list[i] = new Media(this.sound_path + option.se_list[i], _.bind(this.availableSe,this), function(e){ console.error("Sound#Media se error",e); } );
				}else{
					alert("sound error : initialize se");
				}
			}
			
			this.bgm_list = {};
			for(var i in option.bgm_list){
				if(use_html5_bgm){
					this.bgm_list[i] = new Audio(this.sound_path + option.bgm_list[i]);
					this.bgm_list[i].loop = true;
				}else if(__.info.is_phonegap){
					this.bgm_list[i] = new Media(this.sound_path + option.bgm_list[i] , _.bind(this.loopBgm,this), function(e){ console.error("Sound#Media bgm error",e); } );
				}else{
					alert("sound error : initialize bgm");
				}
			}
		},
		availableSe:function(){
			this.set("available_se",1)
		},
		se:function(id){
			if(this.userConfig.get("sound") == 0){ return }
			if(id == 0){ return }
			if(use_html5_se){
				// mobile端末は対応していない
				try{
					this.se_list[id].currentTime = 0;
					this.se_list[id].play();
				}catch(e){
					console.error("Sound#se error",e);
				}
			}else if(this.NativeAudio){
				this.NativeAudio.play( this.se_list[id] );
			}else if(__.info.is_phonegap){
				this.se_list[id].stop()
				this.se_list[id].play()
			}else{
				alert("sound error : se");
			}
		},
		loopBgm:function(){
			if(!__.info.is_main_view){ return } //index.htmlのときのみ有効にする
			
			if(use_html5_bgm){
				this.bgm_list[ this.get("current_bgm") ].play();
			}else if(__.info.is_ios && __.info.is_phonegap){
				this.bgm_list[ this.get("current_bgm") ].play({ numberOfLoops:"infinite" , playAudioWhenScreenIsLocked : false });
			}else{
				alert("sound error : loopBgm");
			}
		},
		pauseBgm:function(){
			if(!__.info.is_main_view){ return } //index.htmlのときのみ有効にする
			
			this.set("bgm_paused",1);
			this.bgm_list[ this.get("current_bgm") ].pause();
		},
		resumeBgm:function(){
			if(this.userConfig.get("sound") == 0){ return }
			if(!__.info.is_main_view){ return } //index.htmlのときのみ有効にする
			
			this.set("bgm_paused",0);
			this.bgm_list[ this.get("current_bgm") ].play();
		},
		bgm:function(id){
			if(this.userConfig.get("sound") == 0){ return }
			if(!__.info.is_main_view){ return } //index.htmlのときのみ有効にする
			
			if(id != this.get("current_bgm") ){
				this.set("current_bgm",id);
				this.bgm_list[id].play();
				return
				
				if(use_html5_bgm){
					this.bgm_list[id].play();
				}else if(__.info.is_ios && __.info.is_phonegap){
					this.bgm_list[id].play({ numberOfLoops:"infinite" , playAudioWhenScreenIsLocked : false });
				}else if(__.info.is_android && __.info.is_phonegap){
					this.bgm_list[id].play();
				}else{
					alert("sound error : bgm");
				}
			}
		},
	});
	
return Sound;

});

require([
'controllers/Animations',
'controllers/BattleAnimation',
'controllers/BattleChara',
'controllers/BattleSystemView',
'controllers/BattleView',
'controllers/CardBookView',
'controllers/CardDeckMemberSelectView',
'controllers/CardFavSelectView',
'controllers/CardIndexView',
'controllers/CardLimitupSelectView',
'controllers/CardMixSelectView',
'controllers/CardPage',
'controllers/CardPowerupSelectView',
'controllers/CardSellSelectView',
'controllers/CaveBgView',
'controllers/CaveResultView',
'controllers/CaveScratchesView',
'controllers/CaveView',
'controllers/FooterView',
'controllers/GachaIndexView',
'controllers/MypageView',
'controllers/PageView',
'controllers/PopupCardDetailView',
'controllers/PopupHowtoList',
'controllers/PopupMissionDetail',
'controllers/PopupOtherMenu',
'controllers/PopupPhraseList',
'controllers/PopupPresentList',
'controllers/PopupQuestConfirmView',
'controllers/PopupUserConfig',
'controllers/PopupsView',
'controllers/QuestSelectAreaView',
'controllers/QuestSelectCaveView',
'controllers/SampleMateList',
'controllers/SamplePc',
'controllers/SampleQuestData',
'controllers/ShopArbeitView',
'controllers/ShopArbelt_BugReportsView',
'controllers/ShopIndexView',
'controllers/ShopPackunView',
'controllers/ShopRealMoneyView',
'controllers/ShopRecoverView',
'models/AnalyzeREC',
'models/BattleEnemyAi',
'models/BattleManager',
'models/BattleREC',
'models/BattleSkill',
'models/BillingForAppStore',
'models/BillingForGooglePlay',
'models/BillingREC',
'models/CaveManager',
'models/CaveMapMake',
'models/CaveMapREC',
'models/CaveMembers',
'models/CaveREC',
'models/CaveScratch',
'models/DebugConsole',
'models/DeckREC',
'models/Footer',
'models/GachaDraw',
'models/GachaListData',
'models/LoginREC',
'models/Mate',
'models/MissionREC',
'models/PageManager',
'models/PcREC',
'models/PresentREC',
'models/Quest',
'models/ResumeREC',
'models/ShopREC',
'models/Sound',
'models/Twitter',
'models/TwitterREC',
'models/UserConfigREC',
],function(){});
define("require_define", function(){});

define('AppRouter',[
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
});
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


;
define("AppWakeup", function(){});

})(window);
this["JST"] = this["JST"] || {};

this["JST"]["_macro"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<macro id="card_list_menu"><div class="text_hold_info"><i>※長押しで詳細が見れます</i></div><a id="toggle_status_btn" class="toggle_status_btn list_menu_btn"><i>ステータス切替</i></a><a id="sort_btn" class="sort_btn list_menu_btn"><i>攻撃力順</i></a></macro><macro id="card_list_content"><div id="card_list" class="scroll_wrapper"><div class="up_spacer"></div><div id="card_list_view" class="card_list_container"></div><div class="bottom_spacer"></div></div><div id="info_view"></div><div class="kei_1"></div><div class="kei_2"></div><div id="page_view"></div></macro><macro id="shop_info"><div class="info_container"><div class="menu_info_bg"></div><div class="status_bg"><div class="status"><div class="status_1">所持コイン:' +
((__t = (game_money)) == null ? '' : __t) +
'</div><div class="status_2">所持魔石:' +
((__t = (real_money)) == null ? '' : __t) +
'</div><div class="status_3">所持パックン:&nbsp;&nbsp;<span class="packun_' +
((__t = (packun_n_id)) == null ? '' : __t) +
'"></span>x' +
((__t = (packun_n)) == null ? '' : __t) +
'&nbsp;&nbsp;<span class="packun_' +
((__t = (packun_s_id)) == null ? '' : __t) +
'"></span>x' +
((__t = (packun_s)) == null ? '' : __t) +
'&nbsp;&nbsp;<span class="packun_' +
((__t = (packun_d_id)) == null ? '' : __t) +
'"></span>x' +
((__t = (packun_d)) == null ? '' : __t) +
'</div></div></div></div></macro><macro id="quest_base_info"><div class="quest_base_info"><div class="quest_data_info_contaner">最大難易度：' +
((__t = (level)) == null ? '' : __t) +
'　最大フロア：' +
((__t = (floor_max)) == null ? '' : __t) +
'</div><div class="quest_enemy_info_contaner"><div class="enemy_info_text">出現モンスター</div><div class="enemys">';
 _.each(enemys,function(enemy,n){ ;
__p += '<div class="card_bg_s"><img src="' +
((__t = (__.path.card('s',enemy.card_data.gra_id))) == null ? '' : __t) +
'"></div>' +
((__t = (( (n+1)%6 == 0 ) ? "<br/>" : "")) == null ? '' : __t);
 }) ;
__p += '</div></div></div></macro><macro id="dev_menu"><hr/><a class="hoge" data-href="/html/Sample/index"       ><span>sample>index          </span></a><br/><a class="hoge" data-href="/html/Sample/pc"          ><span>sample>pc             </span></a><br/><a class="hoge" data-href="/html/Sample/questdata"   ><span>sample>questdata      </span></a><br/><a class="hoge" data-href="/html/Top/index"          ><span>top>index             </span></a><br/><hr/><a class="hoge" data-href="/html/Sample/gacha"       ><span>sample>gacha          </span></a><br/><a class="hoge" data-href="/html/Test/index"         ><span>test>index            </span></a><br/><a class="hoge" data-href="/html/Sample/localstorage"><span>sample>localstorage   </span></a><br/><hr/></macro>';

}
return __p
};

this["JST"]["anim/floor-change"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div id="FC-an-anim"><ol><li id="FC-S-floor-change" ><div class="FC-an-stage"><div id="FC-an-obj-1"><div id="FC-an-obj-2"><div id="FC-an-obj-3"></div><div id="FC-an-obj-4"><div id="FC-an-obj-5"><div id="FC-an-obj-6" class="before-floor"><div>' +
((__t = (before_num_html)) == null ? '' : __t) +
'</div></div></div></div><div id="FC-an-obj-7"><div id="FC-an-obj-8"><div id="FC-an-obj-9" class="after-floor"><div>' +
((__t = (after_num_html)) == null ? '' : __t) +
'</div></div></div></div></div></div><div id="FC-an-obj-10" class="controller"></div></div></li></ol></div>';

}
return __p
};

this["JST"]["battle/battle"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div id="battle_container"><!-- 戦闘背景 --><div id="battle_bg_view"><div class="battle_stage_contaner"><div class="battle_canvas_bg"></div><div class="battle_stage_bg"></div><div class="battle_log_bg"></div><div class="battle_deck_bg"></div><div class="keisen_1"></div><div class="keisen_2"></div></div></div><!-- 味方一覧 --><div id="battle_members_view" class="member charas_view"><!-- 画像 --><div class="chara_list_container member"></div><script data-class="chara_view" type="text/template" id="chara_view_template"><div class="chara_img_container"><img src="<%= __.path.card(img_type, gra_id) %>"></div><div class="chara_turn_mark"></div><div class="chara_frame"></div></script><!-- HP --><div class="hp_list_container"></div><script data-class="hp_view" type="text/template" id="hp_view_template"><div class="chara_hp_num_bg"></div><div class="chara_hp_num"><%= hp %>/<%= hp_full %></div><div class="chara_hp_container"><i class="chara_hp_diff" style="width:100%; -webkit-transform: scale( <%= hp/hp_full %> , 1);"></i><i class="chara_hp_bar"  style="width:<%= hp*100/hp_full %>%;"></i></div><img class="attr_icon" src="<%= __.path.img_ui(\'attr_icon/attr_\'+ attribute +\'.png\') %>"></script><!-- ターン数 --><div class="turn_list_container"></div><script data-class="turn_view" type="text/template" id="turn_view_template"><% if(disp_turn >= 0){ %><div class="chara_turn_num"><%= __.helper.toNumClass(disp_turn) %></div><% } %></script><!-- エフェクト表示用 --><div class="chara_effect_list_container member"></div><script data-class="chara_effect_view" type="text/template" id="chara_effect_view_template"><div class="icon_contaner"></div></script></div><!-- 敵一覧 基本構造は味方と同じ --><div id="battle_enemys_view" class="enemy charas_view"><div class="chara_list_container enemy"></div><div class="hp_list_container enemy"></div><div class="turn_list_container enemy"></div><div class="chara_effect_list_container enemy"></div></div><!-- ターン切り替え演出表示用コンテナ --><div id="battle_turn_change_view"></div><script type="text/template" id="battle_turn_change_view_template"></script><!-- 戦闘ログ --><div id="battle_log_view"></div><script type="text/template" id="battle_log_view_template"><div class="battle_log_container"><div class="text_1"><%= messages[0] %></div><div class="text_2"><%= messages[1] %></div></div></script><!-- コマンド画面 --><div id="battle_command_view"></div><script type="text/template" id="battle_command_view_template"><div class="battle_command_container"><div class="target_select_view enemy"><% _.each(enemys,function(enemy,n){ %><span class="target_mark_contaner command_enemy_select command_attack enemy_<%= n+1 %> size_<%= enemys.length %>" data-enemy_id="<%= enemy.id %>" ><span class="target_mark <%= (enemy.hp <= 0)?\'is_death\':\'is_alive\' %> <%= (enemy.captured)?\'is_captured\':\'\' %>" data-enemy_id="<%= enemy.id %>"><i data-enemy_id="<%= enemy.id %>"></i></span></span><% }) %></div><div class="target_select_view show_detail"><% _.each(members,function(member,n){ %><div class="target_mark_contaner command_member_detail member_<%= n+1 %>" data-member_id="<%= member.id %>" ></div><% }) %></div><div class="target_select_view member"><% _.each(members,function(member,n){ %><span class="target_mark_contaner command_member_select member_<%= n+1 %>" data-member_id="<%= member.id %>" ><span class="target_mark <%= (member.hp <= 0)?\'is_death\':\'is_alive\' %> <%= (member.captured)?\'is_captured\':\'\' %>" data-member_id="<%= member.id %>"><i data-member_id="<%= member.id %>"></i></span></span><% }) %></div><div class="command_attack_info">攻撃は目標をタップしてください</div><div class="player_command_bg"></div><div class="player_command_container"><% if(appenv.BUILD_LEVEL==appenv.DEBUG_BUILD){ %><a class="command_debug" style="position:absolute; top:-350px; left:0px;">【デバッグ】</a><% } %><a class="command_btn command_howto"></a><a class="command_btn command_capture"><i>つかまえる</i></a><a class="command_btn command_guard"><i>ぼうぎょ</i></a><a class="command_btn command_skill skill_1" data-skill-slot="0" state-remain="<%= (!!member.skill_data[0].use_remain) %>"><i><%= member.skill_data[0].name %></i><i class="remain_bg"><i class="remain_text">残り</i><i class="remain_num"><%= member.skill_data[0].use_remain %>/<%= member.skill_data[0].use_max %></i></i></a><a class="command_btn command_skill skill_2" data-skill-slot="1" state-remain="<%= (!!member.skill_data[1].use_remain) %>"><i><%= member.skill_data[1].name %></i><i class="remain_bg"><i class="remain_text">残り</i><i class="remain_num"><%= member.skill_data[1].use_remain %>/<%= member.skill_data[1].use_max %></i></i></a></div></div></script><!-- 全画面演出用 --><div id="full_screen_effect_view"></div></div>';

}
return __p
};

this["JST"]["battle/capture_confirm_inner"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class="capture_confirm_inner menu_info_list_contaner"><div class="text">使用するアイテムを選択してください</div><div class="packun_info menu_info_contaner"><div class="title_text">所持パックン</div><div class="packun_list_contaner"><div class="packun_contaner packun_1 item normal" data-item_id="' +
((__t = (df.ITEM_PACKUN_NORMAL)) == null ? '' : __t) +
'"><div class="packun_icon"></div><div class="packun_num"><i>' +
((__t = (item[df.ITEM_PACKUN_NORMAL])) == null ? '' : __t) +
'</i></div></div><div class="packun_contaner packun_2 item super " data-item_id="' +
((__t = (df.ITEM_PACKUN_SUPER )) == null ? '' : __t) +
'"><div class="packun_icon"></div><div class="packun_num"><i>' +
((__t = (item[df.ITEM_PACKUN_SUPER ])) == null ? '' : __t) +
'</i></div></div><div class="packun_contaner packun_3 item dragon" data-item_id="' +
((__t = (df.ITEM_PACKUN_DRAGON)) == null ? '' : __t) +
'"><div class="packun_icon"></div><div class="packun_num"><i>' +
((__t = (item[df.ITEM_PACKUN_DRAGON])) == null ? '' : __t) +
'</i></div></div></div></div></div>';

}
return __p
};

this["JST"]["card/book"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p +=
((__t = (__.helper.startPage("card-book","card_list_page"))) == null ? '' : __t) +
'<div class="list_bg"></div><div class="page_title"><i>図鑑</i></div><div class="page_content"><div class="list_container"><div id="card_list" class="scroll_wrapper"><div class="up_spacer"></div><div id="card_list_view" class="card_list_container">';
 _.each(discover_list,function(data){ ;

 if(data.has_flag){ ;
__p += '<div class="book_el" data-id="' +
((__t = (data.id)) == null ? '' : __t) +
'"><img class="face_img" src="' +
((__t = (__.path.card('list',data.gra_id))) == null ? '' : __t) +
'"><div class="status_1">No.' +
((__t = (data.zukan_no)) == null ? '' : __t) +
'<br/>' +
((__t = (data.name)) == null ? '' : __t) +
'<br/></div><div class="status_2">' +
((__t = (__.helper.rarityText(data.rarity))) == null ? '' : __t) +
' [' +
((__t = (__.helper.attrText(data.attribute))) == null ? '' : __t) +
']<br/>HP' +
((__t = (data.hp_max )) == null ? '' : __t) +
' 攻' +
((__t = (data.atk_max)) == null ? '' : __t) +
' 防' +
((__t = (data.def_max)) == null ? '' : __t) +
' 魔' +
((__t = (data.mag_max)) == null ? '' : __t) +
'<br/></div></div>';
 }else{ ;
__p += '<div class="book_el"><div class="status_1 has_not">No.' +
((__t = (data.zukan_no)) == null ? '' : __t) +
'<br/>??????<br/></div><div class="status_2 has_not">??????<br/>HP??? 攻??? 防??? 魔???<br/></div></div>';
 } ;

 }) ;
__p += '</div><div class="bottom_spacer"></div></div><div class="kei_1"></div><div class="kei_2"></div></div></div>' +
((__t = (__.helper.endPage())) == null ? '' : __t);

}
return __p
};

this["JST"]["card/card_container"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class="card_container"><img class="card_img" src="' +
((__t = (__.path.card('list',gra_id))) == null ? '' : __t) +
'" /><div class="status_container_1"><div class="card_status_bg_1"></div><div class="lvl">' +
((__t = ((is_max_limit)?"限界":(is_max_level)?"最大":lvl)) == null ? '' : __t) +
'</div><div class="fav_mark">★</div><div class="use_deck_mark">使用中</div><div class="attr attr_' +
((__t = (attribute)) == null ? '' : __t) +
'">[' +
((__t = (__.helper.attrText(attribute))) == null ? '' : __t) +
']</div><div class="atk">' +
((__t = (atk)) == null ? '' : __t) +
'</div><div class="def">' +
((__t = (def)) == null ? '' : __t) +
'</div><div class="mag">' +
((__t = (mag)) == null ? '' : __t) +
'</div><div class="hp" >' +
((__t = (hp )) == null ? '' : __t) +
' / ' +
((__t = (hp_full)) == null ? '' : __t) +
'</div><div class="hp_time">' +
((__t = (hp_text)) == null ? '' : __t) +
'</div><div class="hp_bar_container"><div class="hp_bar" style="width:' +
((__t = (hp_per * 100)) == null ? '' : __t) +
'%;"></div></div></div><div class="status_container_2"><div class="fav_mark">★</div><div class="use_deck_mark">使用中</div><div class="title  ">スキル</div><div class="skill_1">' +
((__t = (skill_data[0].name)) == null ? '' : __t) +
'</div><div class="skill_2">' +
((__t = (skill_data[1].name)) == null ? '' : __t) +
'</div></div><div class="rarity rarity_icon_' +
((__t = (rarity)) == null ? '' : __t) +
'"></div></div>';

}
return __p
};

this["JST"]["card/deck_detail"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<div class="deck_detail_container"><div class="members_container"><div class="members">';
 _.each(members,function(member){ ;

 if(member){ ;
__p +=
((__t = (__.template("card/card_container",member))) == null ? '' : __t);
 }else{ ;
__p += '<div class="card_container"></div>';
 } ;

 }) ;
__p += '</div></div><div class="status_info_container"><div class="status_info"><div class="title">戦闘力情報</div><div class="status_1"> 火 : ' +
((__t = (_.reduce(members,function(sum,member){ if(member && member.attribute==1){ sum += member.power }; return sum; },0))) == null ? '' : __t) +
'</div><div class="status_2"> 水 : ' +
((__t = (_.reduce(members,function(sum,member){ if(member && member.attribute==2){ sum += member.power }; return sum; },0))) == null ? '' : __t) +
'</div><div class="status_3"> 雷 : ' +
((__t = (_.reduce(members,function(sum,member){ if(member && member.attribute==3){ sum += member.power }; return sum; },0))) == null ? '' : __t) +
'</div><div class="status_4"> 闇 : ' +
((__t = (_.reduce(members,function(sum,member){ if(member && member.attribute==4){ sum += member.power }; return sum; },0))) == null ? '' : __t) +
'</div><div class="status_5"> 光 : ' +
((__t = (_.reduce(members,function(sum,member){ if(member && member.attribute==5){ sum += member.power }; return sum; },0))) == null ? '' : __t) +
'</div><div class="status_6">総戦闘力: ' +
((__t = (_.reduce(members,function(sum,member){  if(member){ sum += member.power }; return sum; },0))) == null ? '' : __t) +
'</div><div class="line_1"></div><div class="line_2"></div></div></div></div>';

}
return __p
};

this["JST"]["card/detail"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p +=
((__t = (__.helper.startPage("card-detail","card_detail_page"))) == null ? '' : __t) +
'<div class="card_detail_bg"></div><div class="page_title"><i>モンスター詳細</i></div><div class="page_content"><div class="card_name_container"><div class="name">' +
((__t = (name)) == null ? '' : __t) +
'</div><div class="rarity rarity_icon_' +
((__t = (rarity)) == null ? '' : __t) +
'"></div><div class="attr attr_icon_' +
((__t = (attribute)) == null ? '' : __t) +
'"></div></div><div id="cd_img" class="card_img_container"><div class="card_earth_img"><img src="' +
((__t = (__.path.card('earth',1))) == null ? '' : __t) +
'" width="320" height="250"></div><div class="card_l_img    "><img src="' +
((__t = (__.path.card('l',gra_id)    )) == null ? '' : __t) +
'" width="320" height="250"></div></div>';
 if(type_book){ ;
__p += '<div class="card_status_container book"><div class="el_1 lvl    ">最大Lv.' +
((__t = (lvl_max)) == null ? '' : __t) +
'</div><div class="el_2 lim_lvl">限界Lv.' +
((__t = (lvl_max + lim_lvl_max)) == null ? '' : __t) +
'</div><div class="el_3 hp     ">最大HP' +
((__t = (hp_max)) == null ? '' : __t) +
'</div><div class="el_4 atk    ">最大攻撃力' +
((__t = (atk_max)) == null ? '' : __t) +
'</div><div class="el_5 def    ">最大防御力' +
((__t = (def_max)) == null ? '' : __t) +
'</div><div class="el_6 mag    ">最大魔力' +
((__t = (mag_max)) == null ? '' : __t) +
'</div></div>' +
((__t = ((prev_index>0)? '<a class="prev_btn arrow_btn_1"><i>前へ</i></a>' : "")) == null ? '' : __t) +
'' +
((__t = ((next_index>0)? '<a class="next_btn arrow_btn_2"><i>次へ</i></a>' : "")) == null ? '' : __t);
 }else{ ;
__p += '<div class="card_status_container"><div class="lvl">';
 if(is_max_limit){ ;
__p += 'Lv.' +
((__t = (lvl)) == null ? '' : __t) +
'/(' +
((__t = (lvl_max)) == null ? '' : __t) +
'+' +
((__t = (lim_lvl)) == null ? '' : __t) +
') 限界レベル ';
 }else if(is_max_level){ ;
__p += 'Lv.' +
((__t = (lvl)) == null ? '' : __t) +
'/(' +
((__t = (lvl_max)) == null ? '' : __t) +
'+' +
((__t = (lim_lvl)) == null ? '' : __t) +
') 最大レベル ';
 }else if(lim_lvl){ ;
__p += 'Lv.' +
((__t = (lvl)) == null ? '' : __t) +
'/(' +
((__t = (lvl_max)) == null ? '' : __t) +
'+' +
((__t = (lim_lvl)) == null ? '' : __t) +
') ';
 }else{ ;
__p += 'Lv.' +
((__t = (lvl)) == null ? '' : __t) +
'/' +
((__t = (lvl_max)) == null ? '' : __t) +
' ';
 } ;
__p += '</div><!--<div class="exp_bar_container"><div class="exp_bar" style="width:' +
((__t = (exp_per * 100)) == null ? '' : __t) +
'%;"></div></div>--><!-- <div class="lvl_text">';
 if(is_max_level){ ;
__p += '(最大レベル)';
 }else{ ;
__p += '(次レベルまで' +
((__t = (next_need_exp)) == null ? '' : __t) +
')';
 } ;
__p += '</div> --><div class="hp">HP:' +
((__t = (hp)) == null ? '' : __t) +
'/' +
((__t = (hp_full)) == null ? '' : __t) +
'</div><div class="hp_bar_container"><div class="hp_bar" style="width:' +
((__t = (hp_per * 100)) == null ? '' : __t) +
'%;"></div></div><div class="hp_text">' +
((__t = (hp_text)) == null ? '' : __t) +
'</div><div class="atk">攻撃力:' +
((__t = (atk)) == null ? '' : __t) +
'</div><div class="def">防御力:' +
((__t = (def)) == null ? '' : __t) +
'</div><div class="mag">魔力:' +
((__t = (mag)) == null ? '' : __t) +
'</div><div class="skill_1">スキル：' +
((__t = (skill_data[0].name)) == null ? '' : __t) +
' ' +
((__t = (skill_remain_text_1)) == null ? '' : __t) +
'<br/>' +
((__t = (skill_data[0].discription)) == null ? '' : __t) +
'<br/></div><div class="skill_2">スキル：' +
((__t = (skill_data[1].name)) == null ? '' : __t) +
' ' +
((__t = (skill_remain_text_2)) == null ? '' : __t) +
'<br/>' +
((__t = (skill_data[1].discription)) == null ? '' : __t) +
'<br/></div></div>';
 } ;
__p += '<a class="close_btn cmn_btn_1"><i>閉じる</i></a></div>' +
((__t = (__.helper.endPage())) == null ? '' : __t);

}
return __p
};

this["JST"]["card/index"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p +=
((__t = (__.helper.startPage("card-index"))) == null ? '' : __t) +
'<div class="list_bg"></div><div class="page_title"><i>モンスターメニュー</i></div><div class="page_content"><div class="info_container"><div class="menu_info_bg"></div><div class="status_bg"><div class="status"><div class="status_1">所持モンスター:' +
((__t = (mate_num)) == null ? '' : __t) +
'/' +
((__t = (mate_max)) == null ? '' : __t) +
'</div><div class="status_2">所持ガチャP:' +
((__t = (gacha_point)) == null ? '' : __t) +
'</div><div class="status_3">所持コイン:' +
((__t = (game_money)) == null ? '' : __t) +
'</div><div class="status_4">所持魔石:' +
((__t = (real_money)) == null ? '' : __t) +
'</div></div></div><div class="deck">';
 _.each(members,function(member,n){ ;
__p += '<div class="card_bg_s card_' +
((__t = (n + 1)) == null ? '' : __t) +
'">';
 if (member != undefined){ ;
__p += '<img src="' +
((__t = (__.path.card('s',member.gra_id))) == null ? '' : __t) +
'"><div class="hp_bar_container"><div class="hp_bar" style="width:' +
((__t = (member.hp_per * 100)) == null ? '' : __t) +
'%;"></div></div>';
 } ;
__p += '</div>';
 }) ;
__p += '</div></div><div class="list_container"><div id="card_index_list" class="scroll_wrapper"><div class="up_spacer"></div><a class="list_btn_1" data-after_se="1" data-href="/html/Card/deckMemberSelect"><i>デッキ編成</i></a><a class="list_btn_1" data-after_se="1" data-href="/html/Card/powerupSelect"   ><i>強化</i></a><a class="list_btn_1" data-after_se="1" data-href="/html/Card/sellSelect"      ><i>売却</i></a><a class="list_btn_1" data-after_se="1" data-href="/html/Card/favSelect"       ><i>お気に入り登録</i></a><a class="list_btn_1" data-after_se="1" data-href="/html/Card/book"            ><i>図鑑</i></a><a class="list_btn_1" data-after_se="1" data-href="/html/Card/mixSelect"       style="display:none;"><i>合成</i></a><div class="bottom_spacer"></div></div><div class="kei_1"></div><div class="kei_2"></div></div></div>' +
((__t = (__.helper.endPage())) == null ? '' : __t);

}
return __p
};

this["JST"]["card/list_info_view"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class="card_info_container"><div class="have_mate_num     ">モンスター:' +
((__t = (mate_num)) == null ? '' : __t) +
'/' +
((__t = (mate_max)) == null ? '' : __t) +
'</div><div class="have_game_money   ">所持コイン:' +
((__t = (have_game_money   )) == null ? '' : __t) +
'</div><div class="need_powerup_money">必要コイン:' +
((__t = (need_powerup_money)) == null ? '' : __t) +
'</div><div class="need_limitup_money">必要コイン:' +
((__t = (need_limitup_money)) == null ? '' : __t) +
'</div><div class="need_mix_money    ">必要コイン:' +
((__t = (need_mix_money    )) == null ? '' : __t) +
'</div><div class="get_mix_exp       ">入手経験値:' +
((__t = (get_mix_exp       )) == null ? '' : __t) +
'</div><div class="sell_price        ">入手コイン:' +
((__t = (sell_price        )) == null ? '' : __t) +
'</div></div>';

}
return __p
};

this["JST"]["card/select_list"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p +=
((__t = (__.helper.startPage("card-" + type,"card_list_page"))) == null ? '' : __t) +
'<div class="list_bg"></div><div class="card_list_bg"></div><div class="page_title"><i>' +
((__t = ((type=="mix_select")    ? '合成'           : '')) == null ? '' : __t) +
'' +
((__t = ((type=="fav_select")    ? 'お気に入り登録' : '')) == null ? '' : __t) +
'' +
((__t = ((type=="deck")          ? 'デッキ編成'     : '')) == null ? '' : __t) +
'' +
((__t = ((type=="sell_select")   ? '売却'           : '')) == null ? '' : __t) +
'' +
((__t = ((type=="limitup_select")? '限界突破合成  ' : '')) == null ? '' : __t) +
'' +
((__t = ((type=="powerup_select")? 'モンスター強化' : '')) == null ? '' : __t) +
'</i></div><div class="page_content"><div class="members_bg"></div><div id="members_view" class="member_container"></div>' +
((__t = ((type=="mix_select")    ? '<div class="left_arrow"></div>' : '')) == null ? '' : __t) +
'' +
((__t = ((type=="limitup_select")? '<div class="left_arrow"></div>' : '')) == null ? '' : __t) +
'' +
((__t = ((type=="mix_select")    ? '<a id="mix_btn"         class="cmn_btn_1 mix_btn        "><i>合成</i></a>           ' : '')) == null ? '' : __t) +
'' +
((__t = ((type=="fav_select")    ? '                                                                                    ' : '')) == null ? '' : __t) +
'' +
((__t = ((type=="deck")          ? '<a id="deck_detail_btn" class="cmn_btn_1 deck_detail_btn"><i>デッキ<br/>詳細</i></a>' : '')) == null ? '' : __t) +
'' +
((__t = ((type=="sell_select")   ? '<a id="sell_btn"        class="cmn_btn_1 sell_btn       "><i>売却</i></a>           ' : '')) == null ? '' : __t) +
'' +
((__t = ((type=="limitup_select")? '<a id="limitup_btn"     class="cmn_btn_1 limitup_btn    "><i>限界突破</i></a>       ' : '')) == null ? '' : __t) +
'' +
((__t = ((type=="powerup_select")? '                                                                                    ' : '')) == null ? '' : __t) +
'<div class="text_hold_info"><i>※長押しで詳細が見れます</i></div><a id="toggle_status_btn" class="toggle_status_btn list_menu_btn"><i>ステータス切替</i></a><a id="sort_btn" class="sort_btn list_menu_btn"><i>攻撃力順</i></a><div class="list_container"><div id="card_list" class="scroll_wrapper"><div class="up_spacer"></div><div id="card_list_view" class="card_list_container"></div><div class="bottom_spacer"></div></div><div id="info_view"></div><div class="kei_1"></div><div class="kei_2"></div><div id="page_view"></div></div></div>' +
((__t = (__.helper.endPage())) == null ? '' : __t);

}
return __p
};

this["JST"]["cave/bg_view_style"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<style>#stage_view *,#stage_view,.scroller *,.scroller{ -webkit-transform-style: preserve-3d; }#map_view {width: ' +
((__t = (map.x*chip_size)) == null ? '' : __t) +
'px;height:' +
((__t = (map.y*chip_size)) == null ? '' : __t) +
'px;position:relative;width :320px;height:300px;overflow:hidden;background:#' +
((__t = (bg_color)) == null ? '' : __t) +
';}#map_view .scroller{width: ' +
((__t = (map.x*chip_size)) == null ? '' : __t) +
'px;height:' +
((__t = (map.y*chip_size)) == null ? '' : __t) +
'px;}#scratch_view {width: ' +
((__t = (map.x*chip_size)) == null ? '' : __t) +
'px;height:' +
((__t = (map.y*chip_size)) == null ? '' : __t) +
'px;position:relative;top:0px;left:0px;}#bg_view {width: ' +
((__t = (map.x*chip_size-1)) == null ? '' : __t) +
'px;height:' +
((__t = (map.y*chip_size-1)) == null ? '' : __t) +
'px;position:absolute;top:0px;left:0px;}.' +
((__t = (chips_class.floor      )) == null ? '' : __t) +
',.' +
((__t = (chips_class.block      )) == null ? '' : __t) +
',.' +
((__t = (chips_class.wall       )) == null ? '' : __t) +
'{width: ' +
((__t = (chip_size+0.8)) == null ? '' : __t) +
'px;height:' +
((__t = (chip_size+0.8)) == null ? '' : __t) +
'px;position:absolute;display:block;}.' +
((__t = (chips_class.scratch_obj)) == null ? '' : __t) +
',.' +
((__t = (chips_class.anchor     )) == null ? '' : __t) +
'{width: ' +
((__t = (chip_size+0.4)) == null ? '' : __t) +
'px;height:' +
((__t = (chip_size+0.4)) == null ? '' : __t) +
'px;position:absolute;display:block;}.' +
((__t = (chips_class.block      )) == null ? '' : __t) +
'{background-color:#' +
((__t = (bg_color)) == null ? '' : __t) +
';}/* マップチップポジション */';
 for(var i=0; i<map.y; i++) { ;
__p += '.' +
((__t = (chips_class.column + i)) == null ? '' : __t) +
'{ top:' +
((__t = (i * chip_size -0.4)) == null ? '' : __t) +
'px; }';
 } ;

 for(var i=0; i<map.x; i++) { ;
__p += '.' +
((__t = (chips_class.row + i)) == null ? '' : __t) +
'   { left:' +
((__t = (i * chip_size -0.4)) == null ? '' : __t) +
'px; }';
 } ;
__p += '/* 壁・床グラフィック絵の指定 */';
 for(var i in chipsf) { ;
__p += '.' +
((__t = (chips_class.floor + chipsf[i])) == null ? '' : __t) +
'{background:url(' +
((__t = (__.path.img())) == null ? '' : __t) +
'map_chip/floor_sub/' +
((__t = (floor_sub_gra_id)) == null ? '' : __t) +
'/' +
((__t = (chipsf[i])) == null ? '' : __t) +
'.png);-webkit-background-size: ' +
((__t = (chip_size+0.8)) == null ? '' : __t) +
'px ' +
((__t = (chip_size+0.8)) == null ? '' : __t) +
'px;background-position:-0.4px -0.4px;}';
 } ;

 for(var i in chipsw) { ;
__p += '.' +
((__t = (chips_class.wall + chipsw[i])) == null ? '' : __t) +
'{background:url(' +
((__t = (__.path.img())) == null ? '' : __t) +
'map_chip/wall/' +
((__t = (wall_gra_id)) == null ? '' : __t) +
'/' +
((__t = (chipsw[i])) == null ? '' : __t) +
'.png);-webkit-background-size: ' +
((__t = (chip_size+0.8)) == null ? '' : __t) +
'px ' +
((__t = (chip_size+0.8)) == null ? '' : __t) +
'px;background-position:-0.4px -0.4px;}';
 } ;
__p += '/* jChrono対応 */.' +
((__t = (chips_class.scratch_obj)) == null ? '' : __t) +
' .close_el,.' +
((__t = (chips_class.scratch_obj)) == null ? '' : __t) +
' .first_touch_el,.' +
((__t = (chips_class.scratch_obj)) == null ? '' : __t) +
' .next_el,.' +
((__t = (chips_class.scratch_obj)) == null ? '' : __t) +
' .open_el,.' +
((__t = (chips_class.scratch_obj)) == null ? '' : __t) +
' .object_el,.' +
((__t = (chips_class.scratch_obj)) == null ? '' : __t) +
' .object_el *,.' +
((__t = (chips_class.scratch_obj)) == null ? '' : __t) +
' .object_el .show_obj,.' +
((__t = (chips_class.scratch_obj)) == null ? '' : __t) +
' .object_el .close_obj{width: ' +
((__t = (chip_size+0.4)) == null ? '' : __t) +
'px;height:' +
((__t = (chip_size+0.4)) == null ? '' : __t) +
'px;position:absolute;display:block;background-size    : 100% 100%;background-repeat  : no-repeat;background-position: center center;top:0px;left:0px;}.' +
((__t = (chips_class.scratch_obj)) == null ? '' : __t) +
' .close_el{opacity:0;-webkit-border-radius: 5px;background:-webkit-gradient(linear, left top, left bottom, from(rgba(30,30,30,0.5)), to(rgba(0,0,0,0.5)));}.' +
((__t = (chips_class.scratch_obj)) == null ? '' : __t) +
' .next_el{opacity:0;background-image:url(' +
((__t = (__.path.img('map_chip/fx/2.png'))) == null ? '' : __t) +
');}.first_touch .' +
((__t = (chips_class.scratch_obj)) == null ? '' : __t) +
' .close_el{opacity:0;background-image:url(' +
((__t = (__.path.img('map_chip/fx/2.png'))) == null ? '' : __t) +
');}.' +
((__t = (chips_class.scratch_obj)) == null ? '' : __t) +
' .open_el{opacity:0;background-image:url(' +
((__t = (__.path.img('map_chip/fx/1.png'))) == null ? '' : __t) +
');}</style>';

}
return __p
};

this["JST"]["cave/cave_result_view"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p +=
((__t = (__.helper.startPage("cave-result","cave_result_page"))) == null ? '' : __t) +
'<div class="list_bg"></div><div class="page_title"><i>クエスト結果</i></div><div class="page_content ' +
((__t = ( (exist_reward)? 'exist_reward' : '')) == null ? '' : __t) +
'"><div class="result_bg"></div><div class="kei_1"></div><div class="kei_2"></div><div class="quest_title">- ' +
((__t = (dungeon_name)) == null ? '' : __t) +
' -</div><div class="result_img ' +
((__t = (play_result)) == null ? '' : __t) +
'"></div><div class="result_content"><div class="result"><i class="name">獲得コイン            </i><i class="num">' +
((__t = (coin       )) == null ? '' : __t) +
'</i></div><div class="result"><i class="name">獲得ガチャポイント    </i><i class="num">' +
((__t = (real_money )) == null ? '' : __t) +
'</i></div><div class="result"><i class="name">獲得魔石              </i><i class="num">' +
((__t = (gacha_pt   )) == null ? '' : __t) +
'</i></div><div class="result"><i class="name">獲得フレーズ数        </i><i class="num">' +
((__t = (phrase     )) == null ? '' : __t) +
'</i></div><div class="result"><i class="name">獲得モンスター捕獲数  </i><i class="num">' +
((__t = (capture_num)) == null ? '' : __t) +
'</i></div><div class="result"><i class="name">獲得モンスター討伐回数</i><i class="num">' +
((__t = (battle_cnt )) == null ? '' : __t) +
'</i></div></div>';
 if(result.clear_first_reward.length>0){  ;
__p += '<div class="result_content_clear_reward first"><div class="clear_reward_container"><div class="clear_reward_text"><i>初クリアボーナス！</i></div>';
 _.each(result.clear_first_reward,function(reward){ ;
__p += '<div class="clear_reward_item"><i>' +
((__t = (__.helper.itemName(reward.first_reward_type, reward.first_reward_id, reward.first_reward_vol))) == null ? '' : __t) +
'</i></div>';
 }) ;
__p += '</div></div>';
 } ;

 if(result.clear_reward.length>0){  ;
__p += '<div class="result_content_clear_reward"><div class="clear_reward_container"><div class="clear_reward_text"><i>クリアボーナス！</i></div>';
 _.each(result.clear_reward,function(reward){ ;
__p += '<div class="clear_reward_item"><i>' +
((__t = (__.helper.itemName(reward.reward_type, reward.reward_id, reward.reward_vol))) == null ? '' : __t) +
'</i></div>';
 }) ;
__p += '</div></div>';
 } ;
__p += '<a class="result_btn"><i>OK</i></a></div><div class="result_black_screen"></div>' +
((__t = (__.helper.endPage())) == null ? '' : __t);

}
return __p
};

this["JST"]["cave/event_info_view"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class="bottom_info"><div class="item_event_info">' +
((__t = (cave.positive_open)) == null ? '' : __t) +
'/' +
((__t = (cave.positive_num)) == null ? '' : __t) +
'</div><div class="enemy_event_info">' +
((__t = (cave.negative_open)) == null ? '' : __t) +
'/' +
((__t = (cave.negative_num)) == null ? '' : __t) +
'</div></div>';

}
return __p
};

this["JST"]["cave/info_view"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class="top_info"><div class="floor_info">' +
((__t = (cave.floor_now)) == null ? '' : __t) +
'/' +
((__t = (quest_data.floor_max)) == null ? '' : __t) +
'</div><div class="level_info">' +
((__t = (cave.difficulty)) == null ? '' : __t) +
'</div><div class="enemy_info">' +
((__t = (cave.result.enemy_win_count)) == null ? '' : __t) +
'</div></div><div class="command_btn"><a class="dungeon_main_btn menu_btn "><i>メニュー</i></a><a class="dungeon_main_btn info_btn "><i>ダンジョン<br/>詳細</i></a><a class="dungeon_main_btn howto_btn"><i>遊び方</i></a></div><div class="top_keisen"></div><div class="bottom_keisen"></div>';

}
return __p
};

this["JST"]["cave/member_view"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<!--' +
((__t = (member.id)) == null ? '' : __t) +
': ' +
((__t = (member.name)) == null ? '' : __t) +
'<br/>Lv:' +
((__t = (member.lvl)) == null ? '' : __t) +
' 属性:' +
((__t = (member.attribute)) == null ? '' : __t) +
'<br/>HP:' +
((__t = (member.hp)) == null ? '' : __t) +
'/' +
((__t = (member.hp_full)) == null ? '' : __t) +
'<br/>--><div class="chara_view member"><div class="chara_img_container"><img src="' +
((__t = (__.path.card("s",member.gra_id))) == null ? '' : __t) +
'"></div><div class="chara_frame"></div></div><div class="hp_view member"><div class="chara_hp_num_bg"></div><div class="chara_hp_num">' +
((__t = (member.hp)) == null ? '' : __t) +
'/' +
((__t = (member.hp_full)) == null ? '' : __t) +
'</div><div class="chara_hp_container"><i class="chara_hp_bar" style="width:' +
((__t = ((member.hp / member.hp_full * 100).floor())) == null ? '' : __t) +
'%;"></i></div><img class="attr_icon" src="' +
((__t = (__.path.img_ui('attr_icon/attr_' + member.attribute + '.png'))) == null ? '' : __t) +
'"></div>';

}
return __p
};

this["JST"]["cave/menu_more_card"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<div id="more_get_card_list"><div style="height:10px;"></div><div class="get_card_list_contaner">';
 _.each(member_list,function(member){ ;
__p += '<div class="get_card_contaner"><div class="card_bg_s"><img src="' +
((__t = (__.path.card('s', st.CardData[ st.CardSeedData[member.card_seed_id].card_id ].gra_id ))) == null ? '' : __t) +
'"></div></div>';
 }) ;
__p += '</div><div style="height:10px;"></div></div>';

}
return __p
};

this["JST"]["cave/menu_more_phrase"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<div id="more_get_phrase_list"><div style="height:10px;"></div>';
 _.each(phrase_list,function(id){ ;
__p += '<div class="phrase_contaner"><div class="phrase_text">' +
((__t = (st.PhraseData[id].text)) == null ? '' : __t) +
'</div><div class="phrase_info">' +
((__t = (st.PhraseData[id].author)) == null ? '' : __t) +
'</div></div>';
 }) ;
__p += '<div style="height:10px;"></div></div>';

}
return __p
};

this["JST"]["cave/menu_view"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<div class="menu_info_list_contaner"><div class="packun_info menu_info_contaner"><div class="title_text">所持パックン</div><div class="packun_list_contaner"><div class="packun_contaner packun_1"><div class="packun_icon"></div><div class="packun_num"><i>' +
((__t = (item_data[df.ITEM_PACKUN_NORMAL])) == null ? '' : __t) +
'</i></div></div><div class="packun_contaner packun_2"><div class="packun_icon"></div><div class="packun_num"><i>' +
((__t = (item_data[df.ITEM_PACKUN_SUPER])) == null ? '' : __t) +
'</i></div></div><div class="packun_contaner packun_3"><div class="packun_icon"></div><div class="packun_num"><i>' +
((__t = (item_data[df.ITEM_PACKUN_DRAGON])) == null ? '' : __t) +
'</i></div></div></div></div><div class="get_item_info menu_info_contaner"><div class="title_text">入手物</div><div class="get_item_list_contaner"><div class="get_item_contaner coin"><div class="text">コイン：</div><div class="item_num"><i>' +
((__t = (result.got_item_data[df.ITEM_GAME_MONEY].point)) == null ? '' : __t) +
'</i></div></div><div class="get_item_contaner gacha_pt"><div class="text">ガチャpt：</div><div class="item_num"><i>' +
((__t = (result.got_item_data[df.ITEM_GACHA_POINT].point)) == null ? '' : __t) +
'</i></div></div><div class="get_item_contaner money"><div class="text">魔石：</div><div class="item_num"><i>' +
((__t = (result.got_item_data[df.ITEM_REAL_MONEY_FREE].point)) == null ? '' : __t) +
'</i></div></div></div></div><div class="get_phrase_info menu_info_contaner"><div class="title_text">入手フレーズ</div><a class="more_phrase more_btn"></a><div class="get_phrase_list_contaner">';
 _.times(3,function(n){ ;
__p += '<div class="get_phrase_contaner">';
 if(phrase_list[n]){ ;
__p += '<div class="phrase_text"><i>' +
((__t = (st.PhraseData[phrase_list[n]].text)) == null ? '' : __t) +
'</i></div>';
 }else{ ;
__p += '<div class="phrase_text"><i>　</i></div>';
 } ;
__p += '</div>';
 }) ;
__p += '</div></div><div class="get_card_info menu_info_contaner"><div class="title_text">入手モンスター</div><a class="more_card more_btn"></a><div class="get_card_list_contaner">';
 _.times(5,function(n){ ;
__p += '<div class="card_bg_s card_' +
((__t = (n + 1)) == null ? '' : __t) +
'">';
 if(member_list[n]){ ;
__p += '<img src="' +
((__t = (__.path.card('s', st.CardData[ st.CardSeedData[member_list[n].card_seed_id].card_id ].gra_id ))) == null ? '' : __t) +
'">';
 } ;
__p += '</div>';
 }) ;
__p += '</div></div></div>';

}
return __p
};

this["JST"]["cave/start"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<style>#map_container{position:relative;width:' +
((__t = (map.chip_size * map.x)) == null ? '' : __t) +
'px;height:' +
((__t = (map.chip_size * map.y)) == null ? '' : __t) +
'px;-webkit-transform: rotate(0deg);}.menu{position:relative;}textarea{min-width:316px;height: 30px;}input[type="text"]{min-width:318px;}</style><hr/><div class="menu"><input type="button" id="start_btn"   value="開始"><input type="button" id="end_btn"     value="終了"><input type="button" id="next_btn"    value="次へ"><br/><input type="button" id="retire_btn"  value="リタイア"><input type="button" id="death_btn"   value="全滅"><input type="button" id="clear_btn"   value="クリア"><br/><input type="button" id="console_btn" value="コンソール"><input type="button" id="zoom_btn"    value="ズーム"><br/>';
 /* ;
__p += '<hr/><form class="cave_form"><table><tr><td>CaveREC</td></tr>';
 _.each(cave,function(attr,key){ ;
__p += '<tr><td>' +
((__t = (key)) == null ? '' : __t) +
'</td>';
 if(key=='result' || key=='status' || key=='members' || key=='members_start' || key=='scratches'){ ;
__p += '<td><textarea name="' +
((__t = (key)) == null ? '' : __t) +
'" >' +
((__t = (__.toJSON(attr))) == null ? '' : __t) +
'</textarea></td>';
 }else{ ;
__p += '<td><input type="text" name="' +
((__t = (key)) == null ? '' : __t) +
'" value="' +
__e( __.toJSON(attr) ) +
'" /></td>';
 } ;
__p += '</tr>';
 }) ;
__p += '<tr><td>CaveMapREC</td></tr>';
 _.each(map,function(attr,key){ ;
__p += '<tr><td>' +
((__t = (key)) == null ? '' : __t) +
'</td>';
 if(key=='map' || key=='scratches' || key=='caveMapData' || key=='questListData' || key=='make_data'){ ;
__p += '<td><textarea name="' +
((__t = (key)) == null ? '' : __t) +
'" >' +
((__t = (__.toJSON(attr))) == null ? '' : __t) +
'</textarea></td>';
 }else{ ;
__p += '<td><input type="text" name="' +
((__t = (key)) == null ? '' : __t) +
'" value="' +
__e( __.toJSON(attr) ) +
'" /></td>';
 } ;
__p += '</tr>';
 }) ;
__p += '</table></form>';
 */ ;
__p +=
((__t = (__.macro("dev_menu"))) == null ? '' : __t) +
'<div style="height:500px;"></div></div>';

}
return __p
};

this["JST"]["common/page"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {

 if(is_show){ ;
__p += '<div class="paee_num"><i>' +
((__t = (current)) == null ? '' : __t) +
' / ' +
((__t = (page_max)) == null ? '' : __t) +
'</i></div><a class="prev_page_btn arrow_btn_1 ' +
((__t = (is_first ? "is_first" : "")) == null ? '' : __t) +
'"><i>前へ</i></a><a class="next_page_btn arrow_btn_2 ' +
((__t = (is_end   ? "is_end"   : "")) == null ? '' : __t) +
'"><i>次へ</i></a>';
 } ;


}
return __p
};

this["JST"]["dialog/common"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<table class="cmn_win_root_table"><tr><td class="cmn_win_root_td"><div class="cmn_win_container"><div class="cmn_win_bg"></div><div class="cmn_win_min_size"   comment="ウィンドウサイズを縦横両方を指定"><div class="cmn_win_margin" comment="マージンを指定"><div class="cmn_win_pos"    comment="中コンテンツの縦位置調整。横は自動。"><table class="dialog_message_container"><tr><td>';
 if(title != ""){ ;
__p += '<div class="dialog_message_title"><i class="title">' +
((__t = (title)) == null ? '' : __t) +
'</i></div>';
 } ;
__p += '<div class="dialog_message_text center"><div class="dialog_message_text_bg"></div><table class="common_dialog_message center"><tr><td><i class="message">' +
((__t = (message)) == null ? '' : __t) +
'</i></td></tr></table></div></td></tr></table><div class="clear"></div><section class="append_btn_container"></section><section class="append_close_btn_container"></section></div></div></div></div></td></tr></table>';

}
return __p
};

this["JST"]["dialog/select"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<table class="cmn_win_root_table"><tr><td class="cmn_win_root_td"><div class="cmn_win_container"><div class="cmn_win_bg"></div><div class="cmn_win_min_size"   comment="ウィンドウサイズを縦横両方を指定"><div class="cmn_win_margin" comment="マージンを指定"><div class="cmn_win_pos"    comment="中コンテンツの縦位置調整。横は自動。"><table class="dialog_message_container"><tr><td>';
 if(title != ""){ ;
__p += '<div class="dialog_message_title"><i class="title">' +
((__t = (title)) == null ? '' : __t) +
'</i></div>';
 } ;
__p += '<div class="dialog_message_text center"><div class="dialog_message_text_bg"></div><table class="common_dialog_message center"><tr><td><div class="select_content append_select_btn_container"></div></td></tr></table></div></td></tr></table><div class="clear"></div><section class="append_btn_container"></section><section class="append_close_btn_container"></section></div></div></div></div></td></tr></table>';

}
return __p
};

this["JST"]["gacha/draw_confirm_dialog"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<div class="gacha_confirm_inner"><div class="description_container"><div class="confirm_text">';
 if(st.GachaListData[gacha.id].draw_num<0){ ;
__p +=
((__t = (gacha.name)) == null ? '' : __t) +
'を ' +
((__t = (gacha.draw_num)) == null ? '' : __t) +
'回引きますか？';
 }else{ ;
__p +=
((__t = (gacha.name)) == null ? '' : __t) +
'を引きますか？';
 } ;
__p += '</div><div class="description">' +
((__t = (gacha.description)) == null ? '' : __t) +
'</div></div>';
 if(gacha.limit_num>0){ ;
__p += '<div class="remain_info">このガチャは <i class="limit_num">' +
((__t = (gacha.limit_num)) == null ? '' : __t) +
'回</i> まで引けます<br/>残りあと <i class="remain_num">' +
((__t = (gacha.limit_num-gacha.draw_cnt)) == null ? '' : __t) +
'回</i> 引けます<br/></div>';
 } ;
__p += '<hr/><div class="need_item_info"><div class="text">所持' +
((__t = (item.name)) == null ? '' : __t) +
'：' +
((__t = (have_item)) == null ? '' : __t) +
'' +
((__t = (item.count_name)) == null ? '' : __t) +
'<br/>消費' +
((__t = (item.name)) == null ? '' : __t) +
'：' +
((__t = (gacha.price)) == null ? '' : __t) +
'' +
((__t = (item.count_name)) == null ? '' : __t) +
'<br/></div></div><hr/><div class="debug_info" style="display:' +
((__t = ((appenv.BUILD_LEVEL == appenv.DEBUG_BUILD)?'block':'none')) == null ? '' : __t) +
';"><br/>終了日： ' +
((__t = (st.GachaListData[gacha.id].end)) == null ? '' : __t) +
'<br/>復活日： ' +
((__t = (revival_text)) == null ? '' : __t) +
'<br/>復活まであと： ' +
((__t = (revival_remain)) == null ? '' : __t) +
'<br/>復活確率： ' +
((__t = (revival_per)) == null ? '' : __t) +
'％<br/>あと ' +
((__t = (alive_remain)) == null ? '' : __t) +
' で消えます</div></div>';

}
return __p
};

this["JST"]["gacha/index"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p +=
((__t = (__.helper.startPage("gacha-index"))) == null ? '' : __t) +
'<div class="list_bg"></div><div class="page_title"><i>ガチャ一覧</i></div><div class="page_content"><div class="info_container"><div class="menu_info_bg"></div><div class="status_bg"><div class="status"><div class="status_1">所持魔石:<i data-name="pc_real_money">' +
((__t = (real_money)) == null ? '' : __t) +
'</i></div><div class="status_2">所持ガチャP:<i data-name="pc_gacha_point">' +
((__t = (gacha_point)) == null ? '' : __t) +
'</i></div></div></div><div class="gacha_data_text">' +
((__t = (info_gacha_data.name)) == null ? '' : __t) +
' 出現モンスター</div><div class="deck">';
 _.each(info_gacha_table_data,function(card,n){ ;
__p += '<div class="card_bg_s card_' +
((__t = (n + 1)) == null ? '' : __t) +
'">';
 if (card != undefined){ ;
__p += '<img src="' +
((__t = (__.path.card('s',card.gra_id))) == null ? '' : __t) +
'">';
 } ;
__p += '</div>';
 }) ;
__p += '</div></div><div class="list_container"><div id="gacha_index_list" class="scroll_wrapper"><div class="up_spacer"></div>';
 _.each(gacha_list,function(gacha){ ;
__p += '<a class="gacha_btn list_btn_1 ' +
((__t = (gacha.design_class)) == null ? '' : __t) +
'" data-after_se="1" data-gacha_id="' +
((__t = (gacha.id)) == null ? '' : __t) +
'" ><i>' +
((__t = (gacha.name)) == null ? '' : __t) +
'<!-- ';
 if(gacha.limit_num){ ;
__p += ' (' +
((__t = (gacha.rest_num)) == null ? '' : __t) +
'/' +
((__t = (gacha.limit_num)) == null ? '' : __t) +
') ';
 } ;
__p += ' --></i></a>';
 if(gacha.remain_term){ ;
__p += '<div class="gacha_info">└ ' +
((__t = (gacha.remain_term)) == null ? '' : __t) +
' まで! ┘</div>';
 }else if(gacha.remain_time){ ;
__p += '<div class="gacha_info">└ あと ' +
((__t = (gacha.remain_time)) == null ? '' : __t) +
'! ┘</div>';
 } ;

 }) ;
__p += '<div class="bottom_spacer"></div></div><div class="kei_1"></div><div class="kei_2"></div></div></div>' +
((__t = (__.helper.endPage())) == null ? '' : __t);

}
return __p
};

this["JST"]["quest/quest_confirm"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p +=
((__t = (__.helper.startPage("quest-quest_confirm"))) == null ? '' : __t) +
'<div class="info_container"><div class="packun_info_container">所持パックン:&nbsp;&nbsp;<span class="packun_' +
((__t = (packun_n_id)) == null ? '' : __t) +
'"></span>x' +
((__t = (packun_n)) == null ? '' : __t) +
'&nbsp;&nbsp;<span class="packun_' +
((__t = (packun_s_id)) == null ? '' : __t) +
'"></span>x' +
((__t = (packun_s)) == null ? '' : __t) +
'&nbsp;&nbsp;<span class="packun_' +
((__t = (packun_d_id)) == null ? '' : __t) +
'"></span>x' +
((__t = (packun_d)) == null ? '' : __t) +
'</div><div class="deck_contaner"><div class="deck">';
 _.each(members,function(member,n){ ;
__p += '<div class="card_bg_s card_' +
((__t = (n + 1)) == null ? '' : __t) +
'">';
 if (member != undefined){ ;
__p += '<img src="' +
((__t = (__.path.card('s',member.gra_id))) == null ? '' : __t) +
'"><div class="hp_bar_container"><div class="hp_bar" style="width:' +
((__t = (member.hp_per * 100)) == null ? '' : __t) +
'%;"></div></div>';
 } ;
__p += '</div>';
 }) ;
__p += '</div><div class="quest_confirm_text">このメンバーで冒険しますか？<br/>※モンスターはショップで回復できます</div></div>' +
((__t = (__.macro("quest_base_info",response))) == null ? '' : __t) +
'</div>' +
((__t = (__.helper.endPage())) == null ? '' : __t);

}
return __p
};

this["JST"]["quest/select_area_view"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p +=
((__t = (__.helper.startPage("quest-select_area_view"))) == null ? '' : __t) +
'<div class="list_bg"></div><div class="page_title"><i>シナリオ一覧</i></div><div class="page_content"><div class="word_map_container"><div id="world_map_img" class="map_img_wrapper"><div class="world_map_img"></div></div><div class="kei_1"></div><div class="kei_2"></div></div><div class="list_container"><div id="area_list"       class="scroll_wrapper"><div class="up_spacer"></div>';
 _.each(area_list,function(quest_list,n){ ;

 _.each(quest_list,function(area,n){ ;
__p += '<a class="area_list_btn list_btn_' +
((__t = ((area.world_id<100)? 1 : (area.world_id<500)? 3 : 5)) == null ? '' : __t) +
'" data-after_se="1" data-href="/html/Quest/selectCave?id=' +
((__t = (area.id)) == null ? '' : __t) +
'" ><i>' +
((__t = (area.area_name)) == null ? '' : __t) +
'</i>';
 if( area.clear_flag >= 1 ){ ;
__p += '<div class="quest_clear_icon"></div>';
 }else if( area.play_flag == 0 ){ ;
__p += '<div class="quest_new_icon"></div>';
 } ;
__p += '</a>';
 if(area.remain_time){ ;
__p += '<div class="quest_info">└ あと ' +
((__t = (area.remain_time)) == null ? '' : __t) +
'! ┘</div>';
 }else if(area.remain_term){ ;
__p += '<div class="quest_info">└ ' +
((__t = (area.remain_term)) == null ? '' : __t) +
' まで! ┘</div>';
 } ;

 }) ;

 }) ;
__p += '<div class="bottom_spacer"></div></div><div class="please_select"><i>クエストを選択してください</i></div><div class="kei_1"></div><div class="kei_2"></div></div></div>' +
((__t = (__.helper.endPage())) == null ? '' : __t);

}
return __p
};

this["JST"]["quest/select_cave_view"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p +=
((__t = (__.helper.startPage("quest-select_cave_view"))) == null ? '' : __t) +
'<div class="list_bg"></div><div class="page_title"><i>ダンジョン一覧</i></div><div class="page_content"><div class="word_map_container"><div  id="area_map_img" class="map_img_wrapper"><div class="world_map_img"></div><div class="world_map_icon_container" style=" position:absolute; left:' +
((__t = (map_icon_data.map_pos_x)) == null ? '' : __t) +
'px; top :' +
((__t = (map_icon_data.map_pos_y)) == null ? '' : __t) +
'px;">';
 _.each(map_icon_data.icon_id,function(id,n,data){ ;

 if(map_icon_data.icon_id[n] != 0){ ;
__p += '<img class="world_map_icons"src="' +
((__t = (__.path.world_map_icon(map_icon_data.icon_id[n]))) == null ? '' : __t) +
'"style="height:30px;width:30px;position:absolute;left:' +
((__t = (map_icon_data.icon_x[n])) == null ? '' : __t) +
'px;top :' +
((__t = (map_icon_data.icon_y[n])) == null ? '' : __t) +
'px;">';
 } ;

 }) ;
__p += '</div></div><div class="kei_1"></div><div class="kei_2"></div><div class="area_name"><i>' +
((__t = (area.area_name)) == null ? '' : __t) +
'</i></div></div><div class="list_container"><div id="cave_list" class="scroll_wrapper"><div class="up_spacer"></div>';
 _.each(quest_list,function(quest,n){ ;
__p += '<a class="area_list_btn list_btn_' +
((__t = ((quest.world_id<100)? 1 : (quest.world_id<500)? 3 : 5)) == null ? '' : __t) +
' E_select_quest" data-after_se="1" data-quest_id="' +
((__t = (quest.id)) == null ? '' : __t) +
'" ><i>' +
((__t = (quest.dungeon_name)) == null ? '' : __t) +
'</i>';
 if( quest.clear_flag >= 1 ){ ;
__p += '<div class="quest_clear_icon"></div>';
 }else if( quest.play_flag == 0 ){ ;
__p += '<div class="quest_new_icon"></div>';
 } ;
__p += '</a>';
 }) ;
__p += '<div class="bottom_spacer"></div></div><div class="please_select_2"><i>ダンジョンを選択してください</i></div><div class="kei_1"></div><div class="kei_2"></div><a class="trigger_back_key back_to_area_select arrow_btn_1" data-back-default="/html/Quest/selectArea"><i>戻る</i></a></div></div>' +
((__t = (__.helper.endPage())) == null ? '' : __t);

}
return __p
};

this["JST"]["sample/index"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += 'top<br/>' +
((__t = (__.macro("dev_menu"))) == null ? '' : __t);

}
return __p
};

this["JST"]["sample/localStorage"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<script type="text/javascript">/* ①Web Storageの実装確認*/if (typeof localStorage === \'undefined\') {window.alert("このブラウザはWeb Storage機能が実装されていません");} else {/* window.alert("このブラウザはWeb Storage機能を実装しています"); */var storage = localStorage;/* ③localStorageへの格納 */function setlocalStorage() {var key = document.getElementById("textkey").value;var value = document.getElementById("textdata").value;/* 値の入力チェック */if (key && value) {storage.setItem(key, value);}/* 変数の初期化 */key = "";value = "";viewStorage();}/* ③localStorageからのデータの取得と表示 */function viewStorage() {var list = document.getElementById("list");while (list.firstChild) list.removeChild(list.firstChild);/* localStorageすべての情報の取得 */for (var i=0; i < storage.length; i++) {var _key = storage.key(i);/* localStorageのキーと値を表示 */var tr = document.createElement("tr");var td1 = document.createElement("td");var td2 = document.createElement("td");list.appendChild(tr);tr.appendChild(td1);tr.appendChild(td2);td1.innerHTML = _key;td2.innerHTML = "<textarea>" + storage.getItem(_key) + "</textarea>";}}/* ④localStorageから削除 */function removeStorage() {var key = document.getElementById("textkey").value;storage.removeItem(key);/* 変数の初期化 */key = "";viewStorage();}/* ⑤localStorageからすべて削除 */function removeallStorage() {storage.clear();viewStorage();}}</script><style>table{ margin-left:10px; }textarea{width:600px; height:100px; position:relative; top:1px;}*{margin:0px; padding:0px; border-spacing:0px;}td                   { background:#ddd; }tr:nth-child(odd) td { background:#ccc; }td:nth-child(1){padding:0px 5px 0px 10px; min-width:160px;}</style><h2 style="margin:5px;">　localStorage</h2><table>    <tr></tr>    <tr>        <td>        保存するKey、値：<br/>        <input id="textkey" type="text" /><br/><br/><button id="button" onclick="setlocalStorage()">保存</button><button id="button" onclick="removeStorage()">削除</button><button id="button" onclick="removeallStorage()">全て削除</button>        </td>        <td><textarea id="textdata" ></textarea>        </td>    </tr></table><table><tbody id="list"></tbody></table><script>viewStorage();</script>';

}
return __p
};

this["JST"]["sample/quest_data"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += 'sample quest_data<br/><hr/><style>.root_table *{vertical-align:top;}.quest_world,.quest_area,.quest_group,.quest_name{text-align:center;}table.root_table > tbody > tr > td{border-bottom: 2px solid #aaa;}.floor_data{border-bottom: 2px solid #aaa;}</style><table class="root_table">';
 _.each(questDispData,function(quest_data,id){ ;
__p += '<tr><td class="quest_world">world_' +
((__t = (quest_data.world)) == null ? '' : __t) +
'&nbsp;</td><td class="quest_area ">area_' +
((__t = (quest_data.area)) == null ? '' : __t) +
'&nbsp;</td><td class="quest_group">group_' +
((__t = (quest_data.group)) == null ? '' : __t) +
'&nbsp;</td><td class="quest_name ">' +
((__t = (quest_data.name)) == null ? '' : __t) +
'&nbsp;</td><td style="padding-left:10px;">';
 _.each(quest_data.floor_data,function(floor_data,n){ ;
__p += '<table class="floor_data"><tr><td>' +
((__t = (floor_data.start_floor)) == null ? '' : __t) +
'～' +
((__t = (floor_data.end_floor)) == null ? '' : __t) +
'&nbsp;/' +
((__t = (floor_data.floor_max)) == null ? '' : __t) +
'階　レベル:' +
((__t = (floor_data.level)) == null ? '' : __t) +
'　</td><td>|| アイテム ' +
((__t = (floor_data.rates.drop_item)) == null ? '' : __t) +
'% || 敵       ' +
((__t = (floor_data.rates.enemy    )) == null ? '' : __t) +
'% || ガチャpt ' +
((__t = (floor_data.rates.gacha_pt )) == null ? '' : __t) +
'% || 魔石     ' +
((__t = (floor_data.rates.kiseki   )) == null ? '' : __t) +
'% || お金     ' +
((__t = (floor_data.rates.money    )) == null ? '' : __t) +
'% || 罠       ' +
((__t = (floor_data.rates.trap     )) == null ? '' : __t) +
'% ||</td></tr><tr><td><table><tr><td><table><tr><td>アイテム</td></tr>';
 _.each(floor_data.events.drop_item,function(item,n){ ;
__p += '<tr><td>　id:' +
((__t = (item.id)) == null ? '' : __t) +
'</td><td>　' +
((__t = (item.rate / floor_data.rate_max * 100)) == null ? '' : __t) +
'%</td></tr>';
 }) ;
__p += '</table></td><td><table><tr><td>敵</td></tr>';
 _.each(floor_data.events.enemy,function(enemy,n){ ;
__p += '<tr><td>　id:' +
((__t = (enemy.id)) == null ? '' : __t) +
'</td><td>　' +
((__t = (enemy.rate / floor_data.rate_max * 100)) == null ? '' : __t) +
'%</td></tr>';
 }) ;
__p += '</table></td></tr></table></td></tr></table>';
 }) ;
__p += '</td></tr>';
 }) ;
__p += '</table>';

}
return __p
};

this["JST"]["sample/sample_index"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += 'sample_index<br/>' +
((__t = (__.macro("dev_menu"))) == null ? '' : __t);

}
return __p
};

this["JST"]["sample_mate_list"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<style></style><hr/><div>-- 売却 --</div><form id="mate_sell_list"><table><tr>';
 _.each(mate_list,function(mate,index){ ;
__p += '<td><input name="mate[]" value="' +
((__t = (mate.id)) == null ? '' : __t) +
'" type="checkbox" />' +
((__t = (st.CardData[mate.card_id].name)) == null ? '' : __t) +
'</td>';
 if (index % 6 == 0){ ;
__p += '</tr><tr>';
 } ;

 }) ;
__p += '</tr></table><input class="sell_submit" type="submit" value="　売却　"><input class="reset_render" type="submit" value="リセット"></form><hr/><div>-- デッキ編成 --  | ';
 _.each(deck,function(id,index){ ;
__p +=
((__t = (st.CardData[id].name)) == null ? '' : __t) +
' | ';
 }) ;
__p += '</div><form id="deck_select"><table><tr>';
 _.each(mate_list,function(mate,index){ ;
__p += '<td><input name="mate[]" value="' +
((__t = (mate.id)) == null ? '' : __t) +
'" type="checkbox" ';
 if(mate.is_deck){ ;
__p += ' checked="checked" ';
 } ;
__p += ' />' +
((__t = (st.CardData[mate.card_id].name)) == null ? '' : __t) +
'</td>';
 if (index % 6 == 0){ ;
__p += '</tr><tr>';
 } ;

 }) ;
__p += '</tr></table><input class="deck_submit" type="submit" value="デッキ編成"><input class="reset_render" type="submit" value="リセット"></form><hr/><div>-- 合成 -- </div><form id="mix_list"><table><tr>';
 _.each(mate_list,function(mate,index){ ;
__p += '<td><input name="base" value="' +
((__t = (mate.id)) == null ? '' : __t) +
'" type="radio" />' +
((__t = (st.CardData[mate.card_id].name)) == null ? '' : __t) +
'</td>';
 if (index % 6 == 0){ ;
__p += '</tr><tr>';
 } ;

 }) ;
__p += '</tr></table>---------- 素材選択 ---------<br/><table><tr>';
 _.each(mate_list,function(mate,index){ ;
__p += '<td><input name="mat[]" value="' +
((__t = (mate.id)) == null ? '' : __t) +
'" type="checkbox" />' +
((__t = (st.CardData[mate.card_id].name)) == null ? '' : __t) +
'</td>';
 if (index % 6 == 0){ ;
__p += '</tr><tr>';
 } ;

 }) ;
__p += '</tr></table><input class="mix_submit" type="submit" value="　合成　"><input class="reset_render" type="submit" value="リセット"></form>' +
((__t = (__.macro("dev_menu"))) == null ? '' : __t);

}
return __p
};

this["JST"]["sample_pc"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<style>textarea{min-width:316px;height: 30px;}input[type="text"]{min-width:318px;}#sample-tools{height:430px;width:320px;}.sample-tools{height:2000px;width:500px;position:relative;display:block;text-align:left;}</style>' +
((__t = (__.helper.startPage("sample-tools"))) == null ? '' : __t) +
'<hr/><form class="time_edit">時刻設定:<input name="time" type="text" value="' +
((__t = (__.moment().format('YYYY/MM/DD HH:mm:ss'))) == null ? '' : __t) +
'" /><input class="submit" type="submit" value="決定" /><input class="reset" type="button" value="初期化" /></form><hr/><span>■PcREC</span><form class="pc_edit"><br/><table>';
 for(key in pc) { ;
__p += '<tr><td>' +
((__t = (key)) == null ? '' : __t) +
'</td><td><textarea name=\'' +
((__t = (key)) == null ? '' : __t) +
'\' >' +
((__t = (__.toJSON(pc[key]))) == null ? '' : __t) +
'</textarea></td>';
 /*if ( key=='deck' || key=='item_list' || key=='zukan_flag' || key=='mate_list' || key=='result' || key=='gacha_status' ){ ;
__p += '<td><textarea name=\'' +
((__t = (key)) == null ? '' : __t) +
'\' >' +
((__t = (__.toJSON(pc[key]))) == null ? '' : __t) +
'</textarea></td>';
 }else{ ;
__p += '<td><input type="text" name=\'' +
((__t = (key)) == null ? '' : __t) +
'\' value=\'' +
((__t = (__.toJSON(pc[key]))) == null ? '' : __t) +
'\' /></td>';
 }*/ ;
__p += '</tr>';
 } ;
__p += '</table><input class="submit" type="submit" value="決定" /><br/><input class="reset" type="button" value="初期化" /></form><hr/><span>■Mate</span><form class="mate_edit"><table><tr><td>card_seed_id</td><td><textarea name="card_seed_id" >' +
((__t = (JSON.stringify(_.keys(st.CardSeedData)))) == null ? '' : __t) +
'</textarea></td></tr><tr><td>lvl</td><td><textarea name="lvl" >1</textarea></td></tr></table><input class="add" type="submit" value="追加" /><br/></form><hr/><span>■Set Mate</span><form class="mate_get">get_mate_id<input type="text" name="id" value="1001" /><input class="submit" type="submit" value="取得" /></form><form class="mate_set">set_mate<input type="text" value="1" /><input class="submit" type="submit" value="取得" /></form>' +
((__t = (__.macro("dev_menu"))) == null ? '' : __t) +
'' +
((__t = (__.helper.endPage())) == null ? '' : __t);

}
return __p
};

this["JST"]["shop/arbeit"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p +=
((__t = (__.helper.startPage("shop-arbeit","shop_page"))) == null ? '' : __t) +
'<div class="list_bg"></div><div class="page_title"><i>アルバイト一覧</i></div><div class="page_content"><div class="info_container"><div class="menu_info_bg"></div><div class="status_bg"><div class="status arbeit_info_message">アプリの開発、宣伝にご協力いただくことで<br/> 魔石やコインをゲットすることができます。</div></div></div><div class="list_container"><div id="shop_index_list" class="scroll_wrapper"><div class="up_spacer"></div>';
 var remain = new __.RemainTime( { disp:{sec:false} , str:{hour:"時間",min:"分"} } ); ;
__p += '<div id="bug_reports">    <div class="description"><i>    バグ報告してコインゲット！<br/>    ' +
((__t = ((is_next_report_time) ? '次の報酬復活まであと <span class="time" style="color:#FFFF4E;">' + remain.toText(next_report_time) + '</span>' : '')) == null ? '' : __t) +
'    </i></div>    <a class="' +
((__t = ((is_next_report_time) ? 'list_btn_2' : 'list_btn_1')) == null ? '' : __t) +
'"><i>バグ報告</i></a></div><div id="twitter">    <div class="description"><i>    <span style="color:#fff;"></span>ツイートで報酬 <span style="color:#FF8B2A;">' +
((__t = (tweet_reward_num)) == null ? '' : __t) +
'魔石！</span><br/>    ' +
((__t = ((is_next_tweet_time) ? '次の報酬復活まであと <span class="time" style="color:#FFFF4E;">' + remain.toText(next_tweet_time) + '</span>' : '')) == null ? '' : __t) +
'    </i></div>    <a class="' +
((__t = ((is_next_tweet_time) ? 'list_btn_2' : 'list_btn_1')) == null ? '' : __t) +
'"><i>ツイッター投稿</i></a></div><!--<div id="phrase">    <div class="description"><i>    フレーズを投稿してコインゲット！<br/>    ' +
((__t = ((is_next_phrase_time) ? '次の報酬復活まであと <span class="time">' + remain.toText(next_phrase_time) + '</span>' : '')) == null ? '' : __t) +
'    </i></div>    <a class="list_btn_1"><i>フレーズライター</i></a></div>--><div id="store_review">    <div class="description"><i>    ';
 if(is_reviewed){ ;
__p += '    報酬は獲得済みです    ';
 }else{ ;
__p += '    <span style="color:#fff;">★5評価</span>すると報酬 <span style="color:#FF8B2A;">' +
((__t = (review_reward_num)) == null ? '' : __t) +
'魔石！</span>    ';
 } ;
__p += '    </i></div>    <a class="' +
((__t = ((is_reviewed) ? 'list_btn_2' : 'list_btn_1')) == null ? '' : __t) +
'"><i>アプリレビュー(初回限定)</i></a></div><div class="bottom_spacer"></div></div><div class="arbeit_thanks_message">ご協力ありがとうございます<br/>これからもアプリを良くしていきますので<br/>今後ともよろしくお願い致します<br/></div><div class="kei_1"></div><div class="kei_2"></div><a class="trigger_back_key back_btn arrow_btn_1" data-back-default="/html/Shop/index"><i>戻る</i></a></div></div>' +
((__t = (__.helper.endPage())) == null ? '' : __t);

}
return __p
};

this["JST"]["shop/arbeit_bug_reports"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p +=
((__t = (__.helper.startPage("shop-arbelt_bug_reports"))) == null ? '' : __t) +
'<div class="list_bg"></div><div class="page_title"><i>バグ報告</i></div><div class="page_content"><div class="form_container"><form name="form"><div class="name_container"><div class="text_name">お名前</div><input class="form_name" name="name" type="text" placeholder="名前を入力してください" /></div><div class="mail_container"><div class="text_mail">メールアドレス(任意)</div><input class="form_mail" name="mail" type="text" placeholder="メールアドレスを入力してください" /></div><div class="content_container"><div class="text_content">バグ内容、再現方法</div><textarea class="form_content" name="content" placeholder="バグ内容と再現方法を入力してください"></textarea></div><div class="btn_container"><a class="cmn_btn_1 cancel" ><i>キャンセル</i></a><a class="cmn_btn_1 submit" ><i>送信する</i></a></div></form></div></div>' +
((__t = (__.helper.endPage())) == null ? '' : __t);

}
return __p
};

this["JST"]["shop/game_money"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p +=
((__t = (__.helper.startPage("shop-game_money","shop_page"))) == null ? '' : __t) +
'<div class="list_bg"></div><div class="page_title"><i>魔石ショップ</i></div><div class="page_content">' +
((__t = (__.macro("shop_info",response))) == null ? '' : __t) +
'<div class="list_container"><div id="shop_index_list" class="scroll_wrapper"><div class="up_spacer"></div><div class="description"><i>現在の販売魔石<br/></i></div>';
 _.each(product_list,function(product){ ;
__p += '<a class="list_btn_1 item_btn" data-se="0" data-id="' +
((__t = (product.productId)) == null ? '' : __t) +
'"><i>' +
((__t = (product.price)) == null ? '' : __t) +
'/' +
((__t = (product.productId)) == null ? '' : __t) +
'</i></a>';
 }) ;

 /* ;
__p += '<a class="list_btn_1" data-after_se="0" data-num="500"   ><i>500魔石 500円</i></a><a class="list_btn_1" data-after_se="0" data-num="1500"  ><i>1500魔石 1500円</i></a><a class="list_btn_1" data-after_se="0" data-num="5000"  ><i>5000魔石 5000円</i></a><a class="list_btn_1" data-after_se="0" data-num="10000" ><i>10000魔石 10000円</i></a><div class="description"><i>billing methods</i></div><a class="list_btn_1 init                 " data-after_se="0"><i>init</i></a><a class="list_btn_1 getAvailableProducts " data-after_se="0"><i>getAvailableProducts</i></a><a class="list_btn_1 getPurchases         " data-after_se="0"><i>getPurchases</i></a><a class="list_btn_1 buy                  " data-after_se="0"><i>buy</i></a><a class="list_btn_1 consumePurchase      " data-after_se="0"><i>consumePurchase</i></a>';
 */ ;
__p += '<div class="spacer" style="height:15px;"></div><div class="bottom_spacer"></div></div><div class="kei_1"></div><div class="kei_2"></div><a class="trigger_back_key back_btn arrow_btn_1" data-back-default="/html/Shop/index"><i>戻る</i></a></div></div>' +
((__t = (__.helper.endPage())) == null ? '' : __t);

}
return __p
};

this["JST"]["shop/index"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p +=
((__t = (__.helper.startPage("shop-index","shop_page"))) == null ? '' : __t) +
'<div class="list_bg"></div><div class="page_title"><i>ショップ一覧</i></div><div class="page_content">' +
((__t = (__.macro("shop_info",response))) == null ? '' : __t) +
'<div class="list_container"><div id="shop_index_list" class="scroll_wrapper"><div class="up_spacer"></div>';
 var linkMacro = function(se,text,id,label){return ""       +'<div id="' +id+ '">'       +'    <div class="description"><i>' +text+ '</i></div>'       +'    <a class="list_btn_1" data-se="' + se + '"><i>' +label+ '</i></a>'       +'</div>'} ;
__p +=
((__t = (linkMacro(1,"魔石やコインをゲットしよう！"      ,"arbeit"   ,"アルバイト一覧"   ))) == null ? '' : __t) +
'' +
((__t = (linkMacro(0,"魔石を買うならこちらから！"        ,"realMoney","魔石ショップ"     ))) == null ? '' : __t) +
'' +
((__t = (linkMacro(1,"モンスターを捕まえる準備をしよう！","packun"   ,"パックンショップ" ))) == null ? '' : __t) +
'' +
((__t = (linkMacro(1,"モンスターを回復させよう！"        ,"recover"  ,"モンスター回復"   ))) == null ? '' : __t) +
'<div class="bottom_spacer"></div></div><div class="kei_1"></div><div class="kei_2"></div></div></div>' +
((__t = (__.helper.endPage())) == null ? '' : __t);

}
return __p
};

this["JST"]["shop/packun"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p +=
((__t = (__.helper.startPage("shop-packun","shop_page"))) == null ? '' : __t) +
'<div class="list_bg"></div><div class="page_title"><i>パックンショップ</i></div><div class="page_content">' +
((__t = (__.macro("shop_info",response))) == null ? '' : __t) +
'<div class="list_container"><div id="shop_index_list" class="scroll_wrapper"><div class="up_spacer"></div>';
 _.each(packun_keys,function(key,n){ ;
__p += '<div class="description"><i><span class="packun_' +
((__t = (key)) == null ? '' : __t) +
'"></span>' +
((__t = (st.ItemData[key].name)) == null ? '' : __t) +
'<br/>' +
((__t = (packun_data[key][0].text)) == null ? '' : __t) +
'</i></div>';
 _.each(packun_data[key],function(packun){ ;
__p += '<a class="list_btn_1 buy_packun" data-after_se="1" data-id="' +
((__t = (packun.id)) == null ? '' : __t) +
'"><i>' +
((__t = (packun.num)) == null ? '' : __t) +
'個購入 ' +
((__t = (packun.price)) == null ? '' : __t) +
'' +
((__t = (st.ItemData[packun.need_item].name)) == null ? '' : __t) +
'</i></a>';
 }) ;
__p += '<div class="spacer" style="height:5px;"></div>';
 }) ;
__p += '<div class="bottom_spacer"></div></div><div class="kei_1"></div><div class="kei_2"></div><a class="trigger_back_key back_btn arrow_btn_1" data-back-default="/html/Shop/index"><i>戻る</i></a></div></div>' +
((__t = (__.helper.endPage())) == null ? '' : __t);

}
return __p
};

this["JST"]["shop/real_money"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p +=
((__t = (__.helper.startPage("shop-real_money","shop_page"))) == null ? '' : __t) +
'<div class="list_bg"></div><div class="page_title"><i>魔石ショップ</i></div><div class="page_content">' +
((__t = (__.macro("shop_info",response))) == null ? '' : __t) +
'<div class="list_container"><div id="shop_index_list" class="scroll_wrapper"><div class="up_spacer"></div><div class="description"><i>現在の販売魔石<br/></i></div>';
 _.each(product_list,function(product){ ;
__p += '<a class="list_btn_1 item_btn" data-se="0" data-id="' +
((__t = (product.productId)) == null ? '' : __t) +
'"><i>' +
((__t = (product.price)) == null ? '' : __t) +
'/' +
((__t = (product.productId)) == null ? '' : __t) +
'</i></a>';
 }) ;

 /* ;
__p += '<a class="list_btn_1" data-after_se="0" data-num="500"   ><i>500魔石 500円</i></a><a class="list_btn_1" data-after_se="0" data-num="1500"  ><i>1500魔石 1500円</i></a><a class="list_btn_1" data-after_se="0" data-num="5000"  ><i>5000魔石 5000円</i></a><a class="list_btn_1" data-after_se="0" data-num="10000" ><i>10000魔石 10000円</i></a><div class="description"><i>billing methods</i></div><a class="list_btn_1 init                 " data-after_se="0"><i>init</i></a><a class="list_btn_1 getAvailableProducts " data-after_se="0"><i>getAvailableProducts</i></a><a class="list_btn_1 getPurchases         " data-after_se="0"><i>getPurchases</i></a><a class="list_btn_1 buy                  " data-after_se="0"><i>buy</i></a><a class="list_btn_1 consumePurchase      " data-after_se="0"><i>consumePurchase</i></a>';
 */ ;
__p += '<div class="spacer" style="height:15px;"></div><div class="bottom_spacer"></div></div><div class="info_message">※通信環境のいい所でご利用ください。また、通信には時間がかかることがあります。<br/>※購入処理中に通信が切れると、正しく購入処理が行われない場合があります。もし正しく処理が終了しなかった場合、端末の電源を一度落とし、通信環境のいい所で再度魔石ショップへアクセスするようお願いします。</div><div class="kei_1"></div><div class="kei_2"></div><a class="trigger_back_key back_btn arrow_btn_1" data-back-default="/html/Shop/index"><i>戻る</i></a></div></div>' +
((__t = (__.helper.endPage())) == null ? '' : __t);

}
return __p
};

this["JST"]["shop/recover"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p +=
((__t = (__.helper.startPage("shop-recover","shop_page"))) == null ? '' : __t) +
'<div class="list_bg"></div><div class="page_title"><i>モンスタースパ</i></div><div class="page_content">' +
((__t = (__.macro("shop_info",response))) == null ? '' : __t) +
'<div class="list_container"><div id="shop_index_list" class="scroll_wrapper"><div class="up_spacer"></div><div class="description"><i>魔石やコインをゲットしよう！</i></div><a class="list_btn_1" data-after_se="1" data-href="/html/Shop/arbeit"   ><i>アルバイト</i></a><div class="description"><i>魔石を買うならこちらから！</i></div><a class="list_btn_1" data-after_se="1" data-href="/html/Shop/realMoney"><i>魔石ショップ</i></a><div class="description"><i>モンスターを捕まえる準備をしよう！</i></div><a class="list_btn_1" data-after_se="1" data-href="/html/Shop/packun"   ><i>パックンショップ</i></a><div class="description"><i>モンスターを回復させよう！</i></div><a class="list_btn_1" data-after_se="1" data-href="/html/Shop/recover"  ><i>モンスタースパ</i></a><div class="bottom_spacer"></div></div><div class="kei_1"></div><div class="kei_2"></div><a class="trigger_back_key back_btn arrow_btn_1" data-back-default="/html/Shop/index"><i>戻る</i></a></div></div>' +
((__t = (__.helper.endPage())) == null ? '' : __t);

}
return __p
};

this["JST"]["test_index"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<h1>Test Index</h1><br/><a data-href="/html/Test/sampleJasmine">sampleJasmine</a><br/><a data-href="/html/Test/modelQuest">modelQuest</a>';

}
return __p
};

this["JST"]["top/index"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += 'top<br/>' +
((__t = (__.macro("dev_menu"))) == null ? '' : __t);

}
return __p
};

this["JST"]["top/mypage"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p +=
((__t = (__.helper.startPage("top-mypage"))) == null ? '' : __t) +
'<div class="page_title"><i>マイページ</i></div><div id="map_view" class="page_content"><div id="mypage_map" class="map_img_wrapper"><div class="world_map_img"></div></div><a class="on_back_key back_to_mypage arrow_btn_1 hide"><i>戻る</i></a><div class="kei_1"></div><div class="kei_2"></div></div><div id="info_view" class="page_content"><div class="chara_bg"></div><div class="chara chara_' +
((__t = (chara_type)) == null ? '' : __t) +
'" data-chara_type="' +
((__t = (chara_type)) == null ? '' : __t) +
'"></div><div class="status" style="display:none;"><div class="status_0">名前:' +
((__t = (pc.name)) == null ? '' : __t) +
'</div><div class="status_1">最大到達深度:test</div><div class="status_2">所持モンスター:' +
((__t = (mate_num)) == null ? '' : __t) +
'/' +
((__t = (mate_max)) == null ? '' : __t) +
'</div><div class="status_3">発見モンスター:' +
((__t = (zukan_num)) == null ? '' : __t) +
'</div><div class="status_4">ログイン日数:' +
((__t = (login_count)) == null ? '' : __t) +
'</div><div class="status_5">クリアダンジョン数:test</div><div class="status_6">所持ガチャpt:' +
((__t = (gacha_point)) == null ? '' : __t) +
'</div><div class="status_7">所持コイン:' +
((__t = (game_money)) == null ? '' : __t) +
'</div><div class="status_8">所持魔石:' +
((__t = (real_money)) == null ? '' : __t) +
'</div></div><div class="mission_contaner"><div class="mission_title">ミッション(タップで詳細)</div><div id="mission_item_container"><div style="height:6px;"></div>';
 _.times(2,function(times){ _.each(mission_list,function(mission){ ;

 if(times==0 && !mission.is_clear){ return } ;

 if(times==1 &&  mission.is_clear){ return } ;
__p += '<a class="mission mission_item_bg ' +
((__t = (mission.kind)) == null ? '' : __t) +
'" data-mission_id="' +
((__t = (mission.id)) == null ? '' : __t) +
'"><div class="mission_item_text">' +
((__t = (mission.kind)) == null ? '' : __t) +
' ' +
((__t = (mission.title)) == null ? '' : __t) +
'</div>' +
((__t = ((mission.is_clear)?'<div class="mission_clear_icon"></div> ':'')) == null ? '' : __t) +
'</a>';
 if(mission.guerrilla_end_text){ ;
__p += '<div class="mission_time_text">└残り ' +
((__t = (mission.guerrilla_end_text)) == null ? '' : __t) +
'┘</div>';
 }else if(mission.end_text){ ;
__p += '<div class="mission_time_text">└' +
((__t = (mission.end_text)) == null ? '' : __t) +
' まで┘</div>';
 } ;

 }) }) ;
__p += '</div></div><div class="menu_btns"><a class="menu_0 mypage_menu_btn information"><i>お知らせ</i></a><a class="menu_1 mypage_menu_btn present    "><i>プレゼント</i><span class="batch" style="' +
((__t = ((present_num)?'' :'display:none;')) == null ? '' : __t) +
'"><i>' +
((__t = (present_num)) == null ? '' : __t) +
'</i></span></a><a class="menu_2 mypage_menu_btn how_to     "><i>遊び方</i></a><a class="menu_3 mypage_menu_btn phrase_dict"><i>フレーズ辞典</i></a><a class="menu_4 mypage_menu_btn config     "><i>設定</i></a><a class="menu_5 mypage_menu_btn other_menu "><i>メニュー</i></a></div><a class="chara_change arrow_btn_1"><i>変更</i></a><a class="goto_map arrow_btn_2"><i>地図</i></a></div>' +
((__t = (__.helper.endPage())) == null ? '' : __t);

}
return __p
};

this["JST"]["top_index"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += 'top<br/>' +
((__t = (__.macro("dev_menu"))) == null ? '' : __t);

}
return __p
};

this["JST"]["_macro/card_list_content"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div id="card_list" class="scroll_wrapper"><div class="up_spacer"></div><div id="card_list_view" class="card_list_container"></div><div class="bottom_spacer"></div></div><div id="info_view"></div><div class="kei_1"></div><div class="kei_2"></div><div id="page_view"></div>';

}
return __p
};

this["JST"]["_macro/card_list_menu"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class="text_hold_info"><i>※長押しで詳細が見れます</i></div><a id="toggle_status_btn" class="toggle_status_btn list_menu_btn"><i>ステータス切替</i></a><a id="sort_btn" class="sort_btn list_menu_btn"><i>攻撃力順</i></a>';

}
return __p
};

this["JST"]["_macro/dev_menu"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<hr/><a class="hoge" data-href="/html/Sample/index"       ><span>sample>index          </span></a><br/><a class="hoge" data-href="/html/Sample/pc"          ><span>sample>pc             </span></a><br/><a class="hoge" data-href="/html/Sample/questdata"   ><span>sample>questdata      </span></a><br/><a class="hoge" data-href="/html/Top/index"          ><span>top>index             </span></a><br/><hr/><a class="hoge" data-href="/html/Sample/gacha"       ><span>sample>gacha          </span></a><br/><a class="hoge" data-href="/html/Test/index"         ><span>test>index            </span></a><br/><a class="hoge" data-href="/html/Sample/localstorage"><span>sample>localstorage   </span></a><br/><hr/>';

}
return __p
};

this["JST"]["_macro/quest_base_info"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<div class="quest_base_info"><div class="quest_data_info_contaner">最大難易度：' +
((__t = (level)) == null ? '' : __t) +
'　最大フロア：' +
((__t = (floor_max)) == null ? '' : __t) +
'</div><div class="quest_enemy_info_contaner"><div class="enemy_info_text">出現モンスター</div><div class="enemys">';
 _.each(enemys,function(enemy,n){ ;
__p += '<div class="card_bg_s"><img src="' +
((__t = (__.path.card('s',enemy.card_data.gra_id))) == null ? '' : __t) +
'"></div>' +
((__t = (( (n+1)%6 == 0 ) ? "<br/>" : "")) == null ? '' : __t);
 }) ;
__p += '</div></div></div>';

}
return __p
};

this["JST"]["_macro/shop_info"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class="info_container"><div class="menu_info_bg"></div><div class="status_bg"><div class="status"><div class="status_1">所持コイン:' +
((__t = (game_money)) == null ? '' : __t) +
'</div><div class="status_2">所持魔石:' +
((__t = (real_money)) == null ? '' : __t) +
'</div><div class="status_3">所持パックン:&nbsp;&nbsp;<span class="packun_' +
((__t = (packun_n_id)) == null ? '' : __t) +
'"></span>x' +
((__t = (packun_n)) == null ? '' : __t) +
'&nbsp;&nbsp;<span class="packun_' +
((__t = (packun_s_id)) == null ? '' : __t) +
'"></span>x' +
((__t = (packun_s)) == null ? '' : __t) +
'&nbsp;&nbsp;<span class="packun_' +
((__t = (packun_d_id)) == null ? '' : __t) +
'"></span>x' +
((__t = (packun_d)) == null ? '' : __t) +
'</div></div></div></div>';

}
return __p
};})(window);