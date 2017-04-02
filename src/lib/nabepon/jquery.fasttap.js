/*!
 * jquery.fasttapjs
 * Copyright (C) watanabe
 * Date: 2012-12-02
 * @author vgd_watanabe
 */

(function($){
	$.fn.fasttap = function(moveEventDeley,disableTouchStartEvent){
		//== setup ========================================================================//
			var _self = {
				startX : 0,
				startY : 0,
				endX   : 0,
				endY   : 0,
				moveX  : 0,
				moveY  : 0,
				tapcnt : 0,
				touch_start_time : 0,
				touch_end_time   : 0,
				CLICK_TIME       : 600,
				target :{}
			};
			if( 'ontouchstart' in window && window.orientation != undefined ){
				_self.clickevent = "click";
				_self.touchstart = "touchstart";
				_self.touchend   = "touchend";
				_self.touchmove  = "touchmove";
			}else{
				_self.clickevent = "click";
				_self.touchstart = "mousedown";
				_self.touchend   = "mouseup";
				_self.touchmove  = "mousemove";
			}
			if(moveEventDeley==undefined || moveEventDeley=="" || moveEventDeley==0){ moveEventDeley = 50 }
			
		//== main ========================================================================//
			this.on(_self.touchstart, touchStartEvent );
			if(moveEventDeley>0){
				this.on(_self.touchmove , touchMoveEvent  );
			}
			this.on(_self.touchend  , touchEndEvent   );
			this.on(_self.clickevent, clickEvent      );
			
			function touchStartEvent(e){
				// 事情がない限りtrueにしない
				if(disableTouchStartEvent == true){ rejectEvent(e); }
				
				_self.target = e.target;
				_self.touch_start_time = new Date();
				_self.tapcnt++;
				setStartPos(e);
				startHold(e);
				dispatchTouchStart(e);
			}
			function touchMoveEvent(e){
				setCurrentPos(e);
				dispatchMove(e);
			}
			function touchEndEvent(e){
				_self.touch_end_time = new Date();
				endHold(e);
				dispatchTap(e);
				dispatchTouchEnd(e);
			}
			function clickEvent(e){
				rejectEvent(e);
				dispatchClick(e);
			}
			function rejectEvent(e){
				var tag = e.target.tagName;
				if( (tag != "INPUT") && (tag != "TEXTAREA") && (tag != "SELECT") && (tag != "OPTION") && (tag != "BUTTON") ){
					e.preventDefault();
				}
			}
		//座標取得
			function setStartPos(e){
				if(typeof e.originalEvent !== "undefined" && typeof e.originalEvent.touches !== "undefined"){
					_self.moveX = _self.endX = _self.startX = e.originalEvent.touches[0].pageX;
					_self.moveY = _self.endY = _self.startY = e.originalEvent.touches[0].pageY;
				}else if(typeof e.touches !== "undefined"){
					_self.moveX = _self.endX = _self.startX = e.touches[0].pageX;
					_self.moveY = _self.endY = _self.startY = e.touches[0].pageY;
				}else{
					_self.moveX = _self.endX = _self.startX = e.pageX;
					_self.moveY = _self.endY = _self.startY = e.pageY;
				};
			}
			function setCurrentPos(e){
				if(typeof e.originalEvent !== "undefined" && typeof e.originalEvent.touches !== "undefined"){
					_self.endX = e.originalEvent.touches[0].pageX;
					_self.endY = e.originalEvent.touches[0].pageY;
				}else if(typeof e.touches !== "undefined"){
					_self.endX = e.touches[0].pageX;
					_self.endY = e.touches[0].pageY;
				}else{
					_self.endX = e.pageX;
					_self.endY = e.pageY;
				};
			}
			function setMovePos(e){
				if(typeof e.originalEvent !== "undefined" && typeof e.originalEvent.touches !== "undefined"){
					_self.moveX = e.originalEvent.touches[0].pageX;
					_self.moveY = e.originalEvent.touches[0].pageY;
				}else if(typeof e.touches !== "undefined"){
					_self.moveX = e.touches[0].pageX;
					_self.moveY = e.touches[0].pageY;
				}else{
					_self.moveX = e.pageX;
					_self.moveY = e.pageY;
				};
			}
			
		//move
			var dispatchMove = throttle(function(e){
				setMovePos(e)
				$(e.target).trigger("fmove",[_self,e])
			},moveEventDeley,{trailing: false});
			
		//hold
			function startHold(e){
				var tapcnt = _self.tapcnt;
				var $target = $(e.target);
				$target.prop("hold_flag",true)
				setTimeout(function(){
					if( _self.tapcnt == tapcnt ){
						if( Math.abs(_self.startX - _self.endX) < 15 &&  Math.abs(_self.startY - _self.endY) < 15 ){
							if( $target.prop("hold_flag") ){
								$target.trigger("fhold",[_self,e])
								$target.prop("hold_flag",false)
							};
						};
					};
				}, (_self.CLICK_TIME + 10 ) );
			}
			function endHold(e){
				$(e.target).prop("hold_flag",false);
			}
		//click
			function dispatchTap(e){
				if( Math.abs(_self.startX - _self.endX) < 15 &&  Math.abs(_self.startY - _self.endY) < 15 ){
					if( _self.touch_end_time - _self.touch_start_time < _self.CLICK_TIME ){
						$(e.target).trigger("ftap",[_self,e])
					};
				};
			}
		//click
			function dispatchClick(e){
				$(e.target).trigger("fclick",[_self,e])
			}
		//touchstart
			function dispatchTouchStart(e){
				$(e.target).trigger("fstart",[_self,e])
			}
		//touchend
			function dispatchTouchEnd(e){
				$(e.target).trigger("fend",[_self,e])
			}
		
		
		//== utility ========================================================================//
		//undersocre.jsのthrottle
			function throttle(func, wait, options) {
				var context, args, result;
				var timeout = null;
				var previous = 0;
				options || (options = {});
				var later = function() {
					previous = options.leading === false ? 0 : new Date;
					timeout = null;
					result = func.apply(context, args);
				};
				return function() {
					var now = new Date;
					if (!previous && options.leading === false) previous = now;
					var remaining = wait - (now - previous);
					context = this;
					args = arguments;
					if (remaining <= 0) {
						clearTimeout(timeout);
						timeout = null;
						previous = now;
						result = func.apply(context, args);
					} else if (!timeout && options.trailing !== false) {
						timeout = setTimeout(later, remaining);
					}
					return result;
				};
			};
		
		return _self;
	}
})($);

