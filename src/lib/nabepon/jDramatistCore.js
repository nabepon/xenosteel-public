(function(window,$){
'use strict';

	//== クラス ====================================================================================
	var util = {
		createViews : function($main_view){
			var views = {
				$main_view     : $main_view,
				$stage_view    : $('<div class="stage_view"></div>'),
				$bg_view       : $('<div class="bg_view"></div>'),
				$window_view   : $('<div class="window_view"></div>'),
				$drama_view    : $('<div class="drama_view"></div>'),
				$name_view_L   : $('<div class="name_view_L"></div>'),
				$name_view_R   : $('<div class="name_view_R"></div>'),
				$text_view     : $('<div class="text_view"></div>'),
				$next_icon_view: $('<div class="next_icon_view"></div>'),
			}
			views.$stage_view.append(views.$bg_view)
			                .append(views.$drama_view)
			                .append(views.$window_view)
			                .append(views.$name_view_L)
			                .append(views.$name_view_R)
			                .append(views.$text_view)
			                .append(views.$next_icon_view)
			return views;
		},
		htmlParser : function(chr){
			var html = "";
			var inTag = 0;
			var tagTemp = "";
			var cnt = 0;
			for(var i=0;i<chr.length;i++){
				if(inTag){
					tagTemp += chr[i];
					if(chr[i] == ">"){
						inTag = 0;
						html += tagTemp;
						tagTemp = "";
					}
					continue;
				}
				if(chr[i] != "<"){
					cnt++;
					html += '<i style="opacity:0;" class="chr chr_'+ cnt +'">' + chr[i] + '</i>';
				}else{
					inTag = 1;
					tagTemp += chr[i];
				}
			}
			return html;
		},
		mergeArg : function(array,argObj){
			var args = Array.prototype.slice.call(argObj);
			return array.concat(args)
		},
		createClass : function(superClass) {
			var superClass = superClass || {};
			return function() {
				var proto = { superclass: superClass.prototype };
				$.extend(true, proto, superClass.prototype, this);
				$.extend(true, this, proto);
				if ($.isFunction(this.initialize)) { this.initialize.apply(this, arguments); }
			};
		},
		createScenarioData : function(msg_text) {
			var $scenario_html = $('<div>' + msg_text.replace(/\t/gm,"") + '</div>');
			var $scene_html    = $( $scenario_html.find("[data-jd-scene]")[0] );
			var msg_html_list  = $scene_html.find("[data-jd-message]");
			var scenario_data = [];
			$.each(msg_html_list,function(n,el){
				scenario_data[n] = {
					el : el,
					text : el.innerHTML.replace(/\r/gm,"").replace(/^\n/gm,"").replace(/$\n/gm,""),
				}
			});
			return scenario_data
		},
		
		// bind and compile is subset of Underscore.js.
		/*!
		 * Underscore.js 1.5.1
		 * http://underscorejs.org
		 * (c) 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
		 * Underscore may be freely distributed under the MIT license.
		 */
		bind : function(func, context) {
			var args, bound;
			var slice = Array.prototype.slice;
			args = slice.call(arguments, 2);
			return bound = function() {
				if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
				ctor.prototype = func.prototype;
				var self = new ctor;
				ctor.prototype = null;
				var result = func.apply(self, args.concat(slice.call(arguments)));
				if (Object(result) === result) return result;
				return self;
			};
		},
		compile : function(text) {
			var settings = {
				evaluate    : /{\%([\s\S]+?)\%}/g,
				interpolate : /\{\{([\s\S]+?)\}\}/g,
			}
			var noMatch = /(.)^/;
			var matcher = RegExp([(settings.interpolate || noMatch).source, (settings.evaluate || noMatch).source].join('|') + '|$', 'g');
			var index = 0;
			var source = "__p+='";
			var escapes = { "'": "'", '\\': '\\', '\r': 'r', '\n': 'n', '\u2028': 'u2028', '\u2029': 'u2029' };
			var escaper = /\\|'|\r|\n|\u2028|\u2029/g;//'
			var escapeChar = function(match) { return '\\' + escapes[match]; };
			text.replace(matcher, function(match, interpolate, evaluate, offset) {
				source += text.slice(index, offset).replace(escaper, escapeChar);
				index = offset + match.length;
				if (interpolate) {
					source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
				} else if (evaluate) {
					source += "';\n" + evaluate + "\n__p+='";
				}
				return match;
			});
			source += "';\n";
			if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';
			source = "var __t,__p='',__j=Array.prototype.join," + "print=function(){__p+=__j.call(arguments,'');};\n" + source + 'return __p;\n';
			try {
				var render = new Function(settings.variable || 'obj', '_', source);
			} catch(e) {
				e.source = source;
				throw e;
			}
			var template = function(data) { return render.call(this, data, _); };
			var argument = settings.variable || 'obj';
			template.source = 'function(' + argument + '){\n' + source + '}';
			return template;
		},
	}
	
	var Chr = function(){ this.initialize.apply(this,arguments) };
	Chr.prototype = {
		initialize : function(el,msg){
			var _this    = this;
			this.el      = el; // 自分自身のhtml要素
			this.$el     = $(this.el);
			this.msg     = msg; // 親になるobject
			this.time    = msg.root.text_speed;
			this.$parent = this.$el.parent()
			this.onInit(_this);
		},
		// Chr#write は、タイプライターのように表示するとき、呼び出されます。ここを改造すればアニメーションが付けられる。
		write : function($dfd){ $dfd.resolve(); this.show() },
		// Chr#show は、画面をクリックし、文字を全て表示するときに呼び出されます。
		show : function(){ this.el.style.opacity = 1; },
		hide : function(){ this.el.style.opacity = 0; },
		onInit : function(){},
	}
	
	var Msg = function(){ this.initialize.apply(this,arguments) };
	Msg.prototype = {
		initialize : function(jsonData,root){
			var _this = this;
			this.root = root; // 親になるobject
			$.extend(_this,jsonData);
			
			this.text     = this.convertMsg( this.root.msgVariableData );
			this._htmlStr = util.htmlParser( this.text );
			this.el       = $(this.el).html('<div>' + this._htmlStr + '</div>');
			this.$el      = $(this.el);
			this.chr_list = [];
			var chr_list = this.$el.find(".chr");
			$.each(chr_list,function(n,chr){
				_this.chr_list[n] = new Chr(chr,_this)
			})
			
			this.onInit(_this);
		},
		util : util,
		convertMsg : function(data){
			var template = this.util.compile(this.text);
			var text = template(data);
			return text;
		},
		toEnd   : function(){},
		onInit  : function(){},
	}
	
	//== 本体 ====================================================================================
	window.jDramatist = function(test){ this.initialize.apply(this, arguments) };
	jDramatist.prototype = {
		
		// Main ///////////////////////////////////////////////////////////////////
		util           : util,
		Chr            : Chr,
		Msg            : Msg,
		onInitScene    : function(){},
		onSceneEnd     : function(){},
		onInitMsg      : function(){},
		onInitChr      : function(){},
		msgVariableData: {},
		text_speed     : 30,
		current_message: 0,
		
		initialize : function($main_view, ScenarioData, config){
			if(!$main_view || !ScenarioData){ return }
			
			$.extend(this,config);
			var _this    = this;
			this.views   = util.createViews($main_view);
			this.$view   = $main_view; // 意味ない？
			this.msg_cnt = 0;
			this.msg_num = ScenarioData.length;
			
			//override
			this.Chr.prototype.onInit      = this.onInitChr;
			this.Msg.prototype.onInit      = this.onInitMsg;
			
			//setup
			this.msgData = [];
			$.each(ScenarioData,function(n,data){
				_this.msgData[n] = new Msg(data,_this)
			})
			this.currentMsg = this.msgData[this.current_message];
			this.views.$text_view.append( this.currentMsg.$el );
			
			this.onInitScene();
			this.$view.html( this.views.$stage_view );
		},
		startScene : function(){
			this.checkNext("startScene");
		},
		
		// 現在の状態を判別して処理を振り分ける
		noop : function(){ console.log("noop") },
		next : function(){},
		checkNext : function(type){
			switch (type) {
				case "startScene"   : this.startTyping(); break;
				case "onTypingNext" :
					var _this = this;
					if( this.checkNextMsg() ){
						var $dfd_waitForTap = new $.Deferred;
						this.dfd_waitForTap = $dfd_waitForTap;
						this.waitForTap($dfd_waitForTap);
						$dfd_waitForTap.done(function(){
							_this.setNextMsg();
							_this.startTyping();
						})
					}else{
						this.onSceneEnd();
					}
					break;
				default :alert("undefined type : " + type); break;
			}
			
		},
		searchIdIndex: function(id){
			for(var i=0;i<this.msgData.length; i++){
				if(this.msgData[i].$el.data("id") == id){
					return i
				}
			}
		},
		getNextMsdIndex: function(){
			var data = this.msgData[this.current_message].$el.data();
			return (data.nextId)? this.searchIdIndex(data.nextId) : this.current_message+1 ;
		},
		checkNextMsg : function(){
			var next_index = this.getNextMsdIndex();
			if(this.msgData[next_index]){
				return true
			}else{
				return false
			}
		},
		setNextMsg : function(){
			this.currentMsg.$el.remove();
			this.current_message = this.getNextMsdIndex();
			this.currentMsg = this.msgData[this.current_message];
			this.views.$text_view.append( this.currentMsg.$el );
		},
		
		// tapイベント
		tap : function(){
			this.onTap.call(arguments);
		},
		setDisableTap : function(){
			this.tap = function(){}
		},
		setDefaultTap : function(){
			var _this = this;
			this.tap = function(){
				this.onTap.call(arguments);
			}
		},
		onTap : function(){},
		dfd_waitForTap: "",
		waitForTap : function($dfd_waitForTap){
			$(document).one("click", function(){
				$dfd_waitForTap.resolve();
			})
		},
		setDefaultWaitForTap : function(){
			this.waitForTap = function($dfd_waitForTap){
				$(document).one("click", function(){
					$dfd_waitForTap.resolve();
				})
			}
		},
		setDisablseWaitForTap : function(){
			this.waitForTap = function(){}
		},
		nextMsg : function(){
			console.log("nextMsg")
			this.dfd_waitForTap.resolve();
		},
		
		// Sequence ///////////////////////////////////////////////////////////////////
		// テキスト表示
		startTyping : function(){
			var _this = this;
			var $dfd_onTypingEnd    = new $.Deferred
			var $dfd_onTypingNext   = new $.Deferred
			
			_this.onTap = _this.next = $dfd_onTypingEnd.resolve;
			_this.onTypingStart($dfd_onTypingEnd);
			
			$dfd_onTypingEnd.done(function(){
				_this.onTap = _this.next = _this.noop;
				var args = Array.prototype.slice.call(arguments);
				args.unshift($dfd_onTypingNext);
				_this.onTypingEnd.apply(_this,args);
			})
			$dfd_onTypingNext.done(function(){
				_this.checkNext("onTypingNext");
			})
		},
		
		// メッセージの表示処理を行うのに使用します。
		// オーバーライドしない場合は、デフォルトの表示処理を行います。
		// 通常の使用範囲であれば、オーバーライドする必要はありません。
		onTypingStart  : function($dfd_onTypingEnd ){ console.log("onTypingStart");  this.default_onTypingStart.apply(this,arguments)  }, // Timer系開始処理など
		onTypingEnd    : function($dfd_onTypingNext){ console.log("onTypingEnd");    this.default_onTypingEnd.apply(this,arguments)    }, // Timer系終了処理など
		
		default_onTypingStart : function($dfd_onTypingEnd){
			var _this = this;
			var typing_cnt = 0;
			var typing_max = _this.currentMsg.chr_list.length;
			var timerObj = {end : 0};
			_this.currentMsg.$el.find(".chr").css("opacity",0);
			_this.currentMsg.$el.trigger("start");
			_this.currentMsg.toEnd = function(){ $dfd_onTypingEnd.resolve(timerObj); };
			var timer = function(){
				if(timerObj.end){ return }
				typing_cnt++;
				if(typing_cnt > typing_max ){
					_this.currentMsg.$el.trigger("end");
					$dfd_onTypingEnd.resolve(timerObj)
				}else{
					var $dfd = new $.Deferred;
					var chr = _this.currentMsg.chr_list[typing_cnt - 1];
					chr.write($dfd);
					$dfd.done(function(){
						setTimeout(timer,chr.time)
						_this.onTap = function(){ $dfd_onTypingEnd.resolve(timerObj); }
					})
				}
			}
			this.onTap = function(){ $dfd_onTypingEnd.resolve(timerObj); }
			timer();
		},
		default_onTypingEnd : function($dfd_onTypingNext,timerObj){
			timerObj.end = 1;
			for(var i in this.currentMsg.chr_list){
				this.currentMsg.chr_list[i].show();
			}
			$dfd_onTypingNext.resolve();
		},
		extend : function(prop){
			var jDramatistClass = function(){ this.initialize.apply(this, arguments) }
			jDramatistClass.prototype = $.extend(new jDramatist(),prop)
			return jDramatistClass
		}
	}
	
})(window,jQuery)
