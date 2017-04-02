/*!
 * DeviceInfo
 * Copyright (C) watanabe
 * Date: 2013-12-28
 */
 
(function(){
	DeviceInfo = function(main_view_str){
		
		var regex = new RegExp(main_view_str);
		var is_cordova  = ((typeof cordova  == "undefined") ? false : true);
		var is_phonegap = ((typeof phonegap == "undefined") ? false : true);
		var deviceinfo = {
			//環境チェック
			is_touch           : isTouch(),
			is_ios             : isIos(),
			is_ios4            : isIos(4),
			is_ios5            : isIos(5),
			is_ios6            : isIos(6),
			is_ios7            : isIos(7),
			is_ios8            : isIos(8),
			is_ios9            : isIos(9),
			is_ipad            : checkDevice("ipad"),
			is_android         : checkDevice("android"),
			is_mobile          : isMobile(),
			is_high_resolution : isHighResolution(),
			clickevent         : clickType("click"),
			touchstart         : clickType("touchstart"),
			touchend           : clickType("touchend"),
			touchmove          : clickType("touchmove"),
			checkDevice        : checkDevice,
			is_main_view       : regex.test(location.href),
			is_phonegap        : (is_cordova || is_phonegap) ? true : false,
		}
		
		//Private methods
		//環境チェック Tools
		function isTouch(){
			if('ontouchstart' in window && window.orientation != undefined ){
				return true;
			}else{
				return false;
			}
		}
		
		function isIos(os_ver){
			var is_ios = false;
			if(os_ver == undefined){ is_ios = navigator.userAgent.match(/OS [0-9_]+ like Mac OS X/i) !== null; }
			else if(os_ver == 3){ is_ios = navigator.userAgent.match(/OS 3_[0-9_]+ like Mac OS X/i) !== null; }
			else if(os_ver == 4){ is_ios = navigator.userAgent.match(/OS 4_[0-9_]+ like Mac OS X/i) !== null; }
			else if(os_ver == 5){ is_ios = navigator.userAgent.match(/OS 5_[0-9_]+ like Mac OS X/i) !== null; }
			else if(os_ver == 6){ is_ios = navigator.userAgent.match(/OS 6_[0-9_]+ like Mac OS X/i) !== null; }
			else if(os_ver == 7){ is_ios = navigator.userAgent.match(/OS 7_[0-9_]+ like Mac OS X/i) !== null; }
			else if(os_ver == 8){ is_ios = navigator.userAgent.match(/OS 8_[0-9_]+ like Mac OS X/i) !== null; }
			else if(os_ver == 9){ is_ios = navigator.userAgent.match(/OS 9_[0-9_]+ like Mac OS X/i) !== null; }
			return is_ios;
		}
		
		function isMobile(){
			var media = ['iPhone','iPod','iPad','Android','mobile'];
			var pattern = new RegExp(media.join('|'), 'i');
			return pattern.test(navigator.userAgent);
		}
		
		function checkDevice(type){
			var is_type = false;
			var media = [];
			var pattern = new RegExp('mobile', 'i');
			var is_mobile = pattern.test(navigator.userAgent);
			switch (type){
				case "android"  : media = ['Android'] ; break;
				case "iphone"   : media = ['iPhone']  ; break;
				case "ipad"     : media = ['iPad']    ; break;
				case "ipodtouch": media = ['iPod']    ; break;
				case "ios"      : media = ['iPhone','iPod','iPad']; break;
				case "android_tablet"   : if(isTouch() == true && is_mobile == false){ is_type = true }; break;
				default: media = [type] ; break;
			}
			if( media != "" ){
				var join_arry = new RegExp(media.join('|'), 'i');
				var is_type = join_arry.test(navigator.userAgent);
			}
			return is_type;
		}
		
		function isHighResolution(){
			if(1.8 <= window.devicePixelRatio && isMobile() == true && isTouch() == true){
				return true;
			}else{
				return false;
			}
		}
		
		function clickType(event){
			var event_name;
			if(isTouch() == true){
				switch (event){
					case "click"     : event_name = "click";      break;
					case "touchstart": event_name = "touchstart"; break;
					case "touchend"  : event_name = "touchend";   break;
					case "touchmove" : event_name = "touchmove";  break;
				}
			}else{
				switch (event){
					case "click"     : event_name = "click";      break;
					case "touchstart": event_name = "mousedown";  break;
					case "touchend"  : event_name = "mouseup";    break;
					case "touchmove" : event_name = "mousemove";  break;
				}
			}
			return event_name;
		}
		
		return deviceinfo;
	}
})();
