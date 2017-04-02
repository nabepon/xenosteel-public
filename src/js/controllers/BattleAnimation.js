define(["models/PcREC","models/UserConfigREC"],function(PcREC,UserConfigREC){
	
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

