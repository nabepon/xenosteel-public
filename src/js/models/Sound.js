define(["models/UserConfigREC"],function(UserConfigREC){
	
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
