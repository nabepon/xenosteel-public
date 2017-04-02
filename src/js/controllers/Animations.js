define([
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

