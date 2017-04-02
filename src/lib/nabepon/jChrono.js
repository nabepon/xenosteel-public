/*!
 * Copyright (C) watanabe
 * version: 1.1.1
 * last update: 2014-02-06
 * outher watanabe <siokosyo@gmail.com>
 * 
 * 依存ライブラリ : jQuery, jQuery.easing.js
 * http://robertpenner.com/easing/
 * 世間のAnimationがfpsを設定して管理してくれるものが無かったので作成
 * fps間隔でのupdateを管理させる。regist()で処理を追加し、start()で開始。再生中のregist()も可。
 * new時の第二引数には、Animのデフォルト値を設定する。
 * @class FrameAnimation
 * @example
 * var jc = new jChrono({fps:24,updateTime:1000/24},{easing:"easeOutCirc"});
 * jc.start();
 * jc.animate({
 * 		duration : 1000,
 * 		delay : 300,
 * 		step : 1 * 1000/12,
 * 		target: $("#test"),
 * 		onEnd : function(){},
 * 		x     : [100,100],
 * 		y     : [0,100],
 * 		alpha : [1,0],
 * 		scale : [1,1.5],
 * 		rotate: [0,-720],
 * 		onInit   : function(anim){ console.log("onInit  ") },
 * 		onStart  : function(ease_val,anim){ console.log("onStart ") },
 * 		onFrame  : function(ease_val,anim){
 * 			console.log("onFrame ")
 * 			console.log("inTime(500)",anim.inTime(500))
 * 			console.log("getEase(type)",anim.getEase('linear'))
 * 			console.log("animate(target,ease_val,properties)") // target animate
 * 		},
 * 		onEnd    : function(ease_val,anim){ console.log("onEnd   ") },
 * 		onFinish : function(ease_val,anim){ console.log("onFinish") },
 * 		autoChain : false,
 * 		onFinish : function(ease_val,anim){ console.log("case autoChain false"); anim.excuteChain(); },
 * 	})
 * 	.animate({
 * 		//sprite animation sample. duration is auto setting for frame length.
 * 		delay : 300,
 * 		step : 1 * 1000/12,
 * 		images : ["fire_lv1.png"],
 * 		frames : [ [2, 2, 300, 250], [304, 2, 300, 250], [606, 2, 300, 250], [2, 254, 300, 250], [304, 254, 300, 250], [606, 254, 300, 250], [2, 506, 300, 250], [304, 506, 300, 250], [606, 506, 300, 250], [2, 758, 300, 250], [304, 758, 300, 250], [606, 758, 300, 250] ],
 * 		target : $("#test"),
 * 		x     : [0,100],
 * 		y     : [0,0],
 * 		alpha : [1,0],
 * 		onInit   : function(anim){ console.log("onInit  ") },
 * 		onChain  : function(prevAnim,currentAnim){console.log("prevAnim",prevAnim,"currentAnim",currentAnim)},
 * 	})
 */
 
(function(window,$){
'use strict';
	
	//-- Manager Class ---------
	var Manager = function(){ this.initialize.apply(this,arguments) };
	Manager.prototype = {
		initialize : function(mgrConfig){
			for(var i in this){
				if(i != "initialize"){ this[i] = this[i] }
			}
			// objectは参照が同じになるため別途追加する
			this.animationList = [];
			this.frameEndExcuteList = [];
			this.$ = $(document.createElement("div"));
			
			if(typeof mgrConfig == "object" ){
				if(mgrConfig.hasOwnProperty("fps")){
					this.setFps(mgrConfig.fps);
				}
				for(var i in mgrConfig){
					this[i] = mgrConfig[i];
				}
			}
		},
		
		// property
		fps : 10,
		frameTime : 100,
		updateTime : 100,
		playState : 1,
		tickCnt : 0,
		is_started  : 0,
		intervalObj : 0,
		animationList : [],
		frameEndExcuteList : [],
		
		// utility
		frameToTime : function(frame_num){
			return (1000*frame_num)/this.fps
		},
		setFps : function(fps){
			this.fps = fps;
			this.updateTime = this.frameTime = this.frameToTime(1);
		},
		add : function(anim){
			this.animationList[this.animationList.length] = anim;
		},
		
		// event
		on : function(event_type,handler){
			this.$.on(event_type,handler)
		},
		off : function(event_type,handler){
			this.$.off(event_type,handler)
		},
		// animation
		onFrame : function(){
			if(this.playState==0){ return }
			
			this.$.trigger("onFrame");
			this.tickCnt += 1;
			
			var len = this.animationList.length;
			for(var i=0; i<len; i++){
				var anim = this.animationList[i];
				
				//stop処理。最後に書いてあるのをコピペ。
				if(anim.isEnd){
					if(typeof anim.onFinish == "function"){
						if(anim.isSpriteAnim){ anim.$spriteContainr.remove(); }
						anim.onFinish(ease_val, anim);
					}
					this.animationList.splice(i,1);
					len -= 1; //lengthは途中で変わる可能性があるのでlengthからは取らない
					i--;
				}
				//pause処理
				if(anim.playState == 0){ continue }
				
				// delay処理
				if(anim.isDelay){
					
					//step処理
					if(anim.delayCnt % anim.stepFrame != 0){
						anim.delayCnt += 1;
						continue
					}
					
					if(anim.delay > anim.delayCnt*this.frameTime ){
						anim.delayCnt += 1;
						continue
					}else{
						anim.delayCnt += 1;
						anim.isDelay = 0;
					}
				}
				
				//step処理
				if(anim.frameCnt % anim.stepFrame != 0){
					anim.frameCnt += 1;
					continue
				}
				
				// onFrame処理
				anim.setTimeRange();
				var current_time = (anim.frameCnt*this.frameTime).ceil();
				var next_time = (anim.frameCnt*this.frameTime + anim.step).ceil();
				if(current_time > anim.duration){
					current_time = anim.duration;
				}
				var ease_val = this.$easing[anim.easing](0, current_time, 0, 1, anim.duration); //function (x, "current time", "beginning value", "change In value", duration)
				if(anim.frameCnt==0){
					if(typeof anim.onStart == "function"){
						if(anim.isSpriteAnim){ anim.$spriteImg.css({opacity:1}) }
						anim.onStart(ease_val, anim);
					}
				}
				
				if(anim.isSpriteAnim && anim.cnt < anim.frames.length){
					anim.$spriteImg.css({ "-webkit-transform":"translate(" + -anim.frames[anim.cnt][0] + "px,"+ -anim.frames[anim.cnt][1] +"px) translateZ(0px)" })
					if(anim.isTransRect){ anim.changeSpriteSize(anim.cnt) }
				}
				if(anim.isTargetAnim){
					anim.currentStyleData = anim.setStyleForData(anim.target, ease_val, {x:anim.x, y:anim.y, alpha:anim.alpha, scale:anim.scale, scaleX:anim.scaleX, scaleY:anim.scaleY, rotate:anim.rotate} )
				}
				anim.onFrame(ease_val, anim);
				
				//終了フレーム
				var is_last_frame = (current_time < anim.duration && next_time >= anim.duration) ? true : false;
				if(is_last_frame){
					if(typeof anim.onEnd == "function"){
						anim.onEnd(ease_val, anim);
					}
					if(anim.nextAnim){ anim.chain() }
				}
				//終了処理。onFinishを呼んだあと、animationListから削除
				if(current_time >= anim.duration){
					if(typeof anim.onFinish == "function"){
						if(anim.isSpriteAnim){ anim.$spriteContainr.remove(); }
						anim.onFinish(ease_val, anim);
					}
					this.animationList.splice(i,1);
					len -= 1; //lengthは途中で変わる可能性があるのでlengthからは取らない
					i--;
				}
				
				anim.frameCnt += 1;
				anim.cnt += 1;
			}
			
			this.onFrameEnd();
		},
		onFrameEnd : function(){
			this.$.trigger("onFrameEnd");
			// se再生など、描画を途中で止めてしまう処理を実行したい場合、
			// frameAnimation.frameEndExcuteList.push(fn)をし、frameの最後にまとめて呼び出すようにする
			var len = this.frameEndExcuteList.length;
			for(var i=0; i<len; i++){
				this.frameEndExcuteList[i]();
			}
			this.frameEndExcuteList = [];
			this.$.trigger("onFrameFinish");
		},
		nextFrame : function(){
			this.onFrame();
		},
		changeFps : function(fps){
			var _this = this;
			clearInterval(this.intervalObj);
			this.setFps(fps);
			this.is_started = 1;
			this.intervalObj = setInterval(function(){
				_this.onFrame();
			},this.updateTime)
		},
		start : function(){
			var _this = this;
			if(this.is_started==0){
				this.is_started = 1;
				this.intervalObj = setInterval(function(){
					_this.onFrame();
				},this.updateTime)
			}
		},
		stop : function(){
			clearInterval(this.intervalObj);
			this.is_started = 0;
			this.$.off();
		},
		resume : function(){
			this.playState = 1;
		},
		pause : function(){
			this.playState = 0;
		},
		addTimeline : function(anim){
			if(typeof anim.length == "number" && typeof anim == "object"){
				var len = anim.length;
				for(var i=0; i<len; i++){
					this.animationList[ this.animationList.length ] = anim[i];
				}
			}else{
				this.animationList[ this.animationList.length ] = anim;
			}
		},
		getAnim : function(id){
			var anim = false;
			for(var i in this.animationList){
				if(this.animationList[i].id == id){
					anim = this.animationList[i];
				}
				continue
			}
			return anim;
		},
	}
	
	
	//-- AnimTool Class ---------
	var AnimTool = function(){ this.initialize.apply(this,arguments) };
	AnimTool.prototype = {
		initialize:function(config){
			this.vender = this.checkVender();
			this.hasPerspective = this.checkPerspective();
		},
		vender : false,
		hasPerspective : false,
		checkPerspective : function(){
			var vender = this.checkVender();
			var perspective = (vender)? "Perspective" : "perspective" ;
			return perspective in document.createElement('div').style;
		},
		checkVender : function(){
			var dummyStyle = document.createElement('div').style;
			var vender = (function () {
				var vendors = 't,webkitT,MozT,msT,OT'.split(','),
					t,
					i = 0,
					l = vendors.length;
				for ( ; i < l; i++ ) {
					t = vendors[i] + 'ransform';
					if ( t in dummyStyle ) {
						return vendors[i].substr(0, vendors[i].length - 1);
					}
				}
				return false;
			})();
			return vender
		},
		defaultStyleData : function(){
			return {
				x     : 0,
				y     : 0,
				alpha : 1,
				scale : 1,
				scaleX: 1,
				scaleY: 1,
				rotate: 0
			}
		},
		defaultData : function(){
			return {
				x     : [0,0],
				y     : [0,0],
				alpha : [1,1],
				scale : [1,1],
				scaleX: [1,1],
				scaleY: [1,1],
				rotate: [0,0]
			}
		},
		setStyleWithVender : function(target,data){
			var vender = this.vender;
			var translateZ = (this.hasPerspective)? 'translateZ(0px)' : '' ;
			var transform = 'translate(' + data.x + 'px,' + data.y + 'px)' + ' ' + translateZ
			              + '    scale(' + data.scaleX + ',' + data.scaleY + ')'
			              + '  rotateZ(' + data.rotate + 'deg)';
			if( vender == "webkit" ){ target.css({ '-webkit-transform':transform, 'opacity':data.alpha }) }
			else if( vender == "moz" ){ target.css({ '-moz-transform':transform, 'opacity':data.alpha }) }
			else if( vender == "o" ){ target.css({ '-o-transform':transform, 'opacity':data.alpha }) }
			else { target.css({ 'transform':transform, 'opacity':data.alpha }) }
		},
		setStyleForData : function(target,ease_val,config){
			var data = this.defaultData();
			for(var i in config){
				for(var j in config[i]){
					data[i][j] = config[i][j];
				}
			}
			var style_data = {
				x     : this.getEaseVal(data.x     ,ease_val),
				y     : this.getEaseVal(data.y     ,ease_val),
				alpha : this.getEaseVal(data.alpha ,ease_val),
				scaleX: this.getEaseVal(data.scaleX,ease_val),
				scaleY: this.getEaseVal(data.scaleY,ease_val),
				rotate: this.getEaseVal(data.rotate,ease_val)
			}
			this.setStyleWithVender(target,style_data);
			return style_data;
		},
		getEaseVal : function(param,k){
			return param[0] + (param[1]-param[0]) * k;
		}
	};
	
	//-- Anim Class ---------
	var Anim = function(){ this.initialize.apply(this,arguments) };
	Anim.prototype = {
		initialize:function(config){
			if(config==undefined)return;
			
			for(var i in this){ if(i != "initialize" ){ this[i] = this[i] } } //initialize以外のプロパティをコピー
			this.images = [];
			this.frames = [ [2, 2, 300, 250] ];
			this.timeRange = [0,100];
			
			var defaultAnimationData = this.animTool.defaultData();
			this.currentStyleData =this.animTool.defaultStyleData();
			for(var i in defaultAnimationData){ this[i] = defaultAnimationData[i] } //defaultsをプロパティとして展開
			this.step = this.mgr.frameTime; //stepのmsベースを設定
			for(var i in config){ this[i] = config[i]; }
			this.stepFrame = Math.ceil( this.step / this.mgr.frameTime ); //stepのframe数ベースを設定
			if(this.delay){ this.isDelay = 1; }
			
			if(this.scale[0] != this.scale[1]){ this.scaleX[0] = this.scaleY[0] = this.scale[0];  this.scaleX[1] = this.scaleY[1] = this.scale[1]; }
			if( this.target != "" && (this.x[0] != this.x[1] || this.y[0] != this.y[1] || this.alpha[0] != this.alpha[1] || this.scaleX[0] != this.scaleX[1] || this.scaleY[0] != this.scaleY[1] || this.rotate[0] != this.rotate[1]) ){
				this.isTargetAnim = true;
				this.currentStyleData = this.setStyleForData(this.target,0, {x:this.x, y:this.y, alpha:this.alpha, scale:this.scale, scaleX:this.scaleX, scaleY:this.scaleY, rotate:this.rotate} )
			}
			
			this.isSpriteAnim = (this.images.length > 0 && this.frames.length > 0) ? true : false;
			if(this.isSpriteAnim){
				if(this.duration = -1) this.duration = this.stepFrame * this.frames.length * this.mgr.frameTime; // spriteの場合かつdurationの指定が無い場合、durationを自動設定
				var width  = this.frames[0][2];
				var height = this.frames[0][3];
				for(var i in this.frames){
					if(width != this.frames[i][2] || height != this.frames[i][3]){
						this.isTransRect == true; // サイズが可変するタイプか。可変ならアニメーション時にdivのwidth、height、left、topを動的に変える。重くなるためサイズを変えるのは非推奨。
						continue
					}
				}
				this.$spriteImg = $('<img class="jChrono_sprite_image" style="opacity:0; position:absolute; top:0px; left:0px; width:auto; height:auto;" />');
				this.$spriteContainr = $('<div class="jChrono_sprite_container" style="overflow:hidden; position:absolute;'  +  "width:"+width+"px;"  +  "height:"+height+"px;"  +  "left:"+(-1*width/2)+"px;"  +  "top:"+(-1*height/2)+"px;"  + '">');
				this.$spriteContainr.append(this.$spriteImg);
				this.target.append(this.$spriteContainr);
				this.mgr.pause();
				var _this = this;
				this.$spriteImg[0].onload = function(){ _this.mgr.resume() };
				this.$spriteImg[0].src = this.images[0];
			}
			
			this.onInit(this);
		},
		
		// common prop
		easing : "linear",
		delay : 0,
		step : 100 ,
		frameCnt : 0,
		duration : -1, //sprite auto setting
		isTargetAnim : false,
		autoChain : true,
		playState : 1,
		isEnd : 0,
		
		// use sprite animation
		images: [],
		frames: [ [2, 2, 300, 250] ],
		isTransRect: false,
		isSpriteAnim: false,
		changeSpriteSize : function(frame){
			var width  = this.frames[frame][2];
			var height = this.frames[frame][3];
			this.$spriteContainr.css({
				width : width ,
				height: height ,
				left  : -1*width/2 ,
				top   : -1*height/2 ,
			})
		},
		
		// local properties
		isDelay : 0,
		time : 0,
		cnt : 0,
		delayCnt : 0,
		timeRange : [0,100],
		nextAnim : false,
		prevAnim : false,
		
		// events
		onInit : function(){},
		onStart : function(){},
		onFrame : function(){},
		onEnd : function(){},
		onFinish : function(){},
		onChain : function(prevAnim,currentAnim){},
		chain : function(){},
		excuteChain : function(){ this.nextAnim.$dfd.resolve() },
		
		// utility
		inFrame : function(cnt){
			return (this.frameCnt == cnt) ? true : false;
		},
		inTime : function(time){
			return (this.timeRange[0] < time && time <= this.timeRange[1]) ? true : false;
		},
		setTimeRange : function(){
			var before = this.mgr.frameTime * (this.cnt - 1);
			var after = this.mgr.frameTime * this.cnt;
			this.timeRange = [before,after];
		},
		getEase : function(easing_type){
			var current_time = this.cnt*this.mgr.frameTime;
			if(current_time > this.duration){
				current_time = this.duration;
			}
			var ease_val = this.$easing[easing_type](0, current_time, 0, 1, this.duration);
			return ease_val
		},
		//animTool : animTool,
		setStyleForData : function(){ return this.animTool.setStyleForData.apply(this.animTool,arguments) },
		setStyle : function(target,config){
			var data = this.currentStyleData;
			for(var i in config){
				data[i] = config[i]
			}
			this.animTool.setStyleWithVender(target,data)
		},
		reverse : function(reverse_cnt){
			// 0～1～0の繰り返しをreverse_cntで分割して返す
			if(reverse_cnt==undefined)reverse_cnt=1;
			var cnt = this.cnt % (reverse_cnt * 2);
			return (cnt >= reverse_cnt)? 2-(cnt/reverse_cnt) : cnt/reverse_cnt;
		},
		stop : function(){
			this.isEnd = 1;
		},
		resume : function(){
			this.playState = 1;
		},
		pause : function(){
			this.playState = 0;
		},
		extend : function(){
			var AnimClass = function(){ this.initialize.apply(this, arguments) }
			AnimClass.prototype = $.extend(new Anim(),{})
			return AnimClass
		},
	};
	
	
	//-- AnimationChain Class ---------
	var AnimChain = function(){ this.initialize.apply(this,arguments) };
	AnimChain.prototype = {
		initialize : function(manager,Anim,firstData){
			this.mgr = manager;
			this.Anim = Anim;
			
			this.prev = {};
			this.animList = [];
			this.firstData = firstData;
		},
		start : function(){
			var anim = new this.Anim(this.firstData);
			this.animList.push(anim);
			this.prev = anim;
			this.mgr.addTimeline(anim);
			return this
		},
		firstData : {},
		prev : {},
		animList : [],
		animate : function(prop){
			var _this = this;
			var anim = new this.Anim(prop);
			this.animList.push(anim);
			var prev = this.prev;
			anim.prevAnim = prev;
			prev.nextAnim = anim;
			prev.chain = function(){
				if(prev.autoChain){
					prev.nextAnim.$dfd.resolve()
				}
			};
			anim.$dfd = new $.Deferred;
			anim.$dfd.done(function(){
				anim.onChain(anim);
				_this.mgr.addTimeline(anim);
			});
			this.prev = anim;
			return this
		},
		getAnim : function(id){
			var anim = false;
			for(var i in this.animList){
				if(this.animList[i].id == id){
					anim = this.animList[i];
				}
				continue
			}
			return anim;
		},
	}
	
	
	//-- jChrono Class ---------
	window.jChrono = function(){ this.initialize.apply(this, arguments) }
	jChrono.prototype = {
		Manager    : Manager,
		Anim       : Anim,
		AnimChain  : AnimChain,
		AnimTool   : AnimTool,
		initialize : function(mgrConfig,animConfig,easeExtends){
			$.extend( $.easing, easeExtends )
			this.$easing = $.easing;
			this.$easing.linear = function(x,t,b,c,d){return c*t/d + b};
			
			var AnimClass = new this.Anim();
			this.Anim = AnimClass.extend();
			var Anim = this.Anim;
			
			var manager = new this.Manager(mgrConfig);
			this.$ = manager.$;
			var animTool = new this.AnimTool()
			manager.$easing = this.$easing;
			Anim.prototype.animTool = animTool;
			Anim.prototype.mgr = manager;
			Anim.prototype.$easing = this.$easing;
			this.mgr = manager;
			this.animTool = animTool;
			for(var i in animConfig){ Anim.prototype[i] = animConfig[i] }
		},
		//$           : $(this),
		insert      : function(){ console.log("jc insert !") },
		on          : function(){ this.$.on.apply(this.$,arguments) },
		off         : function(){ this.$.off.apply(this.$,arguments) },
		trigger     : function(){ console.log("Do you like Chrono Trigger ?"); this.$.trigger.apply(this.$,arguments); },
		animData    : {},
		regist      : function(data){ this.animData[data.id] = data; },
		create      : function(id  ){ return new this.Anim(this.animData[id]) },
		animate     : function(data){ var chain = new this.AnimChain(this.mgr,this.Anim ,data); return chain.start(); },
		addTimeline : function(){ this.mgr.addTimeline.apply(this.mgr,arguments) },
		start       : function(){ this.mgr.start.apply(this.mgr,arguments) },
		stop        : function(){ this.mgr.stop.apply(this.mgr,arguments) },
		resume      : function(){ this.mgr.resume.apply(this.mgr,arguments) },
		pause       : function(){ this.mgr.pause.apply(this.mgr,arguments) },
		nextFrame   : function(){ this.mgr.nextFrame.apply(this.mgr,arguments) },
		getAnim     : function(){ return this.mgr.getAnim.apply(this.mgr,arguments) },
		frameToTime : function(){ return this.mgr.frameToTime.apply(this.mgr,arguments) },
		extend      : function(prop){
			var jChronoClass = function(){ this.initialize.apply(this, arguments) }
			jChronoClass.prototype = $.extend(new jChrono(),prop)
			return jChronoClass
		},
	}
	
})(window,jQuery)
