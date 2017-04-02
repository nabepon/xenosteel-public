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



