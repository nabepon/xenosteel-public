

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
