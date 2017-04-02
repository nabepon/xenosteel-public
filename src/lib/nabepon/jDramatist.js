(function(window,$){
'use strict';

var JD = new window.jDramatist();
jDramatist = JD.extend({
	proto : JD,
	text_speed     : 30,
	
	onInitScene : function(){
	},
	
	onSceneEnd : function(){
		console.log("onSceneEnd");
		var _this = this;
		var data = _this.$el.data();
		if(!data.stopMessage){
			this.views.$stage_view.hide(2000);
		}
	},
	
	onInitMsg : function(){
		var _this = this;
		var data = _this.$el.data();
		if(data.disableTap){
			_this.$el.on("start",function(){
				_this.root.setDisableTap();
			})
			_this.$el.on("end",function(){
				_this.root.setDefaultTap();
			})
		}
		if(data.stopMessage){
			_this.$el.on("start",function(){
				_this.root.setDisablseWaitForTap();
			})
		}
	},
	
	onInitChr : function(){
		this.write = function($defferd_object){
			var chrFx = this.msg.root.fxData.chr;
			var data = this.$parent.data();
			for(var i in data){
				if(chrFx[i]){
					chrFx[i](this,data)
				}else{
					console.error(i + " is not defined")
				}
			}
			$defferd_object.resolve();
			this.show();
		}
	},
	
	msgVariableData : {
		data: {
			name:"「変数」",
		},
		ev: {
			next:'<i style="display:none;" data-ev-next="1"> </i>',
			toEnd:'<i style="display:none;" data-ev-to-end="1"> </i>',
			tapOn: '<i style="display:none;" data-ev-tap-on="1"> </i>',
			tapOff: '<i style="display:none;" data-ev-tap-off="1"> </i>',
		},
		fn: {
			wait:function(time){
				return '<i style="display:none;" data-fn-wait="' + time + '"> </i>';
			},
			C_jump:function(){},
		},
		fx: {
			swing:function(text,time){
				var str = "";
				for(var i in text){
					str += '<i data-fx-swing="' + time + '">' + text[i] + '</i>';
				}
				return str
			},
			speed:function(text,time){
				var str = "";
				for(var i in text){
					str += '<i data-fx-speed="' + time + '">' + text[i] + '</i>';
				}
				return str
			},
		},
		end: "",
	},
	
	fxData : {
		chr : {
			evNext:function(obj,data){
				console.log("next")
				obj.time = 0;
				obj.msg.toEnd();
				obj.msg.root.nextMsg();
			},
			evToEnd:function(obj,data){
				obj.time = 0;
				obj.msg.toEnd();
			},
			evTapOn:function(obj,data){
				obj.time = 0;
				obj.msg.root.setDefaultTap();
			},
			evTapOff:function(obj,data){
				obj.time = 0;
				obj.msg.root.setDisableTap();
			},
			fnWait:function(obj,data){
				obj.time = data.fnWait;
			},
			fxSpeed:function(obj,data){
				obj.time = data.fxSpeed;
			},
			fxSwing:function(obj,data){
			},
		},
		A_next                 : function(){},
		A_select               : function(){},
		I_slideInCenterToSide  : function(){},
		I_slideInOutToSide     : function(){},
		I_slideOutSideToCenter : function(){},
		I_slideOutSideToOut    : function(){},
		I_fadeIn               : function(){},
		I_fadeOut              : function(){},
		C_jump                 : function(){},
		C_jumpjump             : function(){},
		C_vibrate              : function(){},
		C_down                 : function(){},
		C_scaleIn              : function(){},
		C_scaleOut             : function(){},
		C_scaleNormal          : function(){},
		E_joy                  : function(){},
		E_anger                : function(){},
		E_sad                  : function(){},
		S_quake                : function(){},
		S_flash                : function(){},
		S_fadeIn               : function(){},
		S_fadeOut              : function(){},
	},
});

})(window,jQuery)
