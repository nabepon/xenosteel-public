define([
	"models/CaveREC",
	"models/CaveMapREC",
],function(CaveREC,CaveMapREC){
	
	var speed = 1;
	var time = 20 * speed;
	var jc = new jChrono({fps:time,updateTime:1000/time});
	window.scratch_jc = jc;
	jc.start();
	
	// スクラッチパネル1つ1つのModel（ScratchesView、ScratchesのBackbone.Model。）
	// @class Scratch
	var Scratch = Backbone.Model.extend({
		defaults:function(){
			return {
				"id"        : "0-0",
				"x"         : 0,
				"y"         : 0,
				"open"      : 0,
				"next"      : 0,
				"event_type": 0,
				//"event_id"  : 0,
				"event_data": "",
				"event_num" : 0,
			}
		},
		initialize:function(){
			this.listenTo(this,"change",this.open)
		},
		//自身のchange eventで実行する。隣接するModelのステータスなども変更する。
		open:function(e){
			if( e.changed.open == 1 ){
				var y = this.get("y");
				var x = this.get("x");
				var ids = [(y-1)+"-"+x, (y+1)+"-"+x, y+"-"+(x-1), y+"-"+(x+1)];
				for(var i in ids){
					var _target = this.collection.get(ids[i]);
					if(typeof _target !== "undefined" && _target.get("open") !== 1 ){
						_target.set("next",1);
					}
				}
			}
		}
	});
	
	// 階段や敵、タッチエフェクトなどの要素画像
	var ScratchObjectView = Backbone.View.extend({
		tagName:"i",
		initialize:function(){
			this.listenTo(this.model,"change",this.modelChange);
		},
		modelChange:function(e){
			if(e.changed.next == 1){
				this.animNext();
			}
			if(e.changed.open == 1){
				this.animOpen();
				this.animOpenObj();
			}
		},
		
		animNext : function(){
			var model = this.model;
			jc.animate({ duration: jc.frameToTime( 3), target: this.$close_el , alpha: [1,0], easing: "linear", });
			jc.animate({ duration: jc.frameToTime( 3), target: this.$next_el  , alpha: [0,1], easing: "linear", onFinish: function(k,anim){ if(model.get("open")) anim.target.css("opacity",0); }  });
			if(this.img_data.next_visible) jc.animate({ duration: jc.frameToTime( 3), target: this.$close_obj, alpha: [0,1], easing: "linear", });
		},
		animOpen : function(){
			this.$close_el.css("opacity",0);
			this.$next_el.css("opacity",0);
			jc.animate({ duration: jc.frameToTime( 5), target: this.$show_obj , alpha: [0,1], easing: "linear", });
			jc.animate({ duration: jc.frameToTime( 5), target: this.$close_obj, alpha: [1,0], easing: "linear", });
			jc.animate({ duration: jc.frameToTime(10), target: this.$open_el  , alpha: [0.7,0], scale: [1,1.6], easing: "easeOutQuart", });
		},
		animOpenObj : function(){
			var type = this.model.get("event_type");
			if(type == df.EVENT_KAIDAN){}
			if(type == df.EVENT_GAME_MONEY){
				var $coin_img = this.$show_obj.find(".treasure_coin_img");
				var $coin_num = this.$show_obj.find(".treasure_num");
				jc.animate({
					duration: jc.frameToTime(25),
					target  : $coin_num,
					onFrame : function(k,anim){
						var alpha = (1 - anim.getEase('linear'))*2;
						anim.setStyle(anim.target, {
							y    : 10 - 10 * anim.getEase('linear'),
							alpha: (alpha>1)? 1 : alpha,
						})
					},
				});
				jc.animate({ duration: jc.frameToTime(5), target: $coin_img, easing: 'easeOutCubic', x: [0,6] , y: [-5,-25],
				}).animate({ duration: jc.frameToTime(5), target: $coin_img, easing: 'easeInCubic' , x: [6,10], y: [-25,-5],
				}).animate({ delay: jc.frameToTime(10), duration: jc.frameToTime(5), target: $coin_img, easing: 'linear',
					onFrame : function(k,anim){ anim.setStyle(anim.target, {x:10,y:-5,alpha:1-k}) },
					onInit  : function(anim){ anim.setStyle(anim.target, {x:0,y:-5,alpha:1}) }
				});
			}
			if(type == df.EVENT_REAL_MONEY ||
			   type == df.EVENT_GACHA_POINT ||
			   type == df.EVENT_PHRASE ||
			   type == df.EVENT_ITEM ||
			   false){
				var $kirakira = this.$show_obj.find(".treasure_kirakira");
				var $coin_num = this.$show_obj.find(".treasure_num");
				jc.animate({
					duration: jc.frameToTime(25),
					target  : $coin_num,
					onFrame : function(k,anim){
						var alpha = (1 - anim.getEase('linear'))*2;
						anim.setStyle(anim.target, {
							y    : 10 - 10 * anim.getEase('linear'),
							alpha: (alpha>1)? 1 : alpha,
						})
					},
				});
				jc.animate({
					duration: jc.frameToTime(25),
					target  : $kirakira,
					onFrame : function(k,anim){
						var alpha = (1 - anim.getEase('linear'))*2;
						anim.setStyle(anim.target, {
							y    : 10 - 10 * anim.getEase('linear'),
							alpha: (alpha>1)? 1 : alpha,
						})
					},
				});
			}
			if(type == df.EVENT_MIMIC){
				var $smoke = this.$show_obj.find(".treasure_smoke");
				jc.animate({
					duration: jc.frameToTime(15),
					target  : $smoke,
					onFrame : function(k,anim){
						var alpha = (1 - anim.getEase('linear'))*2;
						var linear = anim.getEase('linear');
						anim.setStyle(anim.target, {
							y     : 10 - 10 * linear,
							alpha : (alpha>1)? 1 : alpha,
							scaleX: 1+(linear*0.2),
							scaleY: 1+(linear*0.2),
						})
					},
				});
			}
			if(type == df.EVENT_ENEMY){
				var $show_enemy_img = this.$show_obj.find(".show_obj_img");
				var $close_enemy_img = this.$close_obj.find(".close_obj_img");
				$close_enemy_img.css("-webkit-transform-origin","50% 80%");
				jc.animate({
					duration: jc.frameToTime(20),
					target  : $close_enemy_img,
					scale   : [1.5,1],
					alpha   : [0.999,1],
					easing  : "easeOutElastic",
				});
				
				jc.animate({ duration: jc.frameToTime(30), target: this.$show_obj , alpha: [0,0.00001], onFinish:function(k,anim){ anim.target.css("opacity",1) }, });
				jc.animate({ duration: jc.frameToTime(30), target: this.$close_obj, alpha: [1,0.99999], onFinish:function(k,anim){ anim.target.css("opacity",0) }, });
			}
		},
		
		objImgData : (function(){
			var data = {}
			data[df.EVENT_EMPTY      ] = { show_img:"" , close_img:"" , size:"", next_visible: 0,}
			data[df.EVENT_KAIDAN     ] = { close_img:"map_chip/icon/"+df.EVENT_KAIDAN     +".png"  , show_img:"map_chip/icon/"+df.EVENT_KAIDAN     +".png"  , size:"95% 95%", next_visible: 1,}
			data[df.EVENT_GAME_MONEY ] = { close_img:"map_chip/icon/"+df.EVENT_GAME_MONEY +"_1.png", show_img:"map_chip/icon/"+df.EVENT_GAME_MONEY +"_2.png", size:"85% 85%", next_visible: 1,}
			data[df.EVENT_GACHA_POINT] = { close_img:"map_chip/icon/"+df.EVENT_GACHA_POINT+"_1.png", show_img:"map_chip/icon/"+df.EVENT_GACHA_POINT+"_2.png", size:"85% 85%", next_visible: 1,}
			data[df.EVENT_ITEM       ] = { close_img:"map_chip/icon/"+df.EVENT_ITEM       +"_1.png", show_img:"map_chip/icon/"+df.EVENT_ITEM       +"_2.png", size:"85% 85%", next_visible: 1,}
			data[df.EVENT_REAL_MONEY ] = { close_img:"map_chip/icon/"+df.EVENT_REAL_MONEY +"_1.png", show_img:"map_chip/icon/"+df.EVENT_REAL_MONEY +"_2.png", size:"85% 85%", next_visible: 1,}
			data[df.EVENT_ENEMY      ] = { close_img:"map_chip/icon/"+df.EVENT_ENEMY      +"_1.png", show_img:"map_chip/icon/"+df.EVENT_ENEMY      +"_2.png", size:"80% 80%", next_visible: 0,}
			data[df.EVENT_MIMIC      ] = { close_img:"map_chip/icon/"+df.EVENT_MIMIC      +"_1.png", show_img:"map_chip/icon/"+df.EVENT_MIMIC      +"_2.png", size:"85% 85%", next_visible: 1,}
			data[df.EVENT_PHRASE     ] = { close_img:"map_chip/icon/"+df.EVENT_PHRASE     +"_1.png", show_img:"map_chip/icon/"+df.EVENT_PHRASE     +"_2.png", size:"85% 85%", next_visible: 1,}
			data[df.EVENT_BOSS       ] = data[df.EVENT_EMPTY]
			//data[df.EVENT_BOSS       ] = { close_img:"map_chip/icon/5.png"  , show_img:"map_chip/icon/5.png"  , size:"60% 60%", next_visible: 1,}
			//data[df.EVENT_TRAP       ] = { show_img:"" , close_img:"" , size:"", next_visible: 0,}
			return data
		})(),
		
		objTemplates : (function(){
			var data = {}
			var createTemplate = function(show_tag){
				return __.mustache(('\
					<div class="object_el">\
						<div class="close_obj" style="opacity:{{ (img_data.next_visible && data.next)?1:0 }};">\
							{% if (img_data.close_img){ %}\
								<div class="close_obj_img" style="background-image:url({{ __.path.img(img_data.close_img) }}); -webkit-background-size:{{ img_data.size }};"></div>\
							{% } %}\
						</div>\
						<div class="show_obj " style="opacity:{{ (data.open)?1:0 }};">\
							{% if (img_data.show_img){ %}\
								<div class="show_obj_img" style="background-image:url({{ __.path.img(img_data.show_img) }}); -webkit-background-size:{{ img_data.size }};"></div>\
							{% } %}\
							<div class="show_obj_tags" style="opacity:{{ (data.open)?0:1 }};">' + show_tag + '</div>\
						</div>\
					</div>\
					<div class="close_el" style="opacity:{{ (data.open || data.next)?0:1 }};"></div>\
					<div class="next_el" style="opacity:{{ (data.next)?1:0 }};"></div>\
					<div class="open_el" style="opacity:0;"></div>\
				').replace(/\t/g,""));
			}
			data[df.EVENT_EMPTY      ] = createTemplate('');
			data[df.EVENT_KAIDAN     ] = createTemplate('');
			data[df.EVENT_GAME_MONEY ] = createTemplate('<div class="treasure_coin_img"></div><div class="treasure_num">{{ data.event_num }}<i class="union">コイン</i></div>');
			data[df.EVENT_REAL_MONEY ] = createTemplate('<div class="treasure_kirakira"></div><div class="treasure_num">{{ data.event_num }}<i class="union">魔石</i></div>');
			data[df.EVENT_GACHA_POINT] = createTemplate('<div class="treasure_kirakira"></div><div class="treasure_num">{{ data.event_num }}<i class="union">ガチャpt</i></div>');
			data[df.EVENT_PHRASE     ] = createTemplate('<div class="treasure_kirakira"></div>');
			data[df.EVENT_ITEM       ] = createTemplate('<div class="treasure_kirakira"></div>');
			data[df.EVENT_ENEMY      ] = createTemplate('');
			data[df.EVENT_MIMIC      ] = createTemplate('<div class="treasure_smoke"></div>');
			data[df.EVENT_BOSS       ] = data[df.EVENT_EMPTY];
			//data[df.EVENT_TRAP       ] = createTemplate('');
			
			return data
		})(),
		
		render:function(chips){
			//console.log(Scratch#render);
			var model      = this.model.toJSON();
			var id         = chips.scratch_obj + model.id;
			var class_name = chips.event_type + model.event_type +" "+ chips.row + model.x +" "+ chips.column + model.y +" "+ chips.scratch_obj;
			var img_data   = this.objImgData[model.event_type];
			var objTemplate= this.objTemplates[model.event_type];
			var html       = (objTemplate) ? objTemplate( {data: model, img_data: img_data } ) : alert("model.event_type:" + model.event_type + "がありません");
			
			if(appenv.BUILD_LEVEL == appenv.DEBUG_BUILD){
				var event_text = _(df).pick(function(data,key){ return key.match(/EVENT_/) && data == model.event_type }).keys().value()[0].replace("EVENT_EMPTY","           ");
				this.$el.attr("event", event_text);
			}
			this.$el.attr("id", id).attr("class", class_name).html( html )
			
			this.img_data   = img_data;
			this.$close_el  = this.$el.find(".close_el");
			this.$next_el   = this.$el.find(".next_el");
			this.$open_el   = this.$el.find(".open_el");
			this.$show_obj  = this.$el.find(".show_obj");
			this.$close_obj = this.$el.find(".close_obj");
			return this;
		},
	});
	
	var Scratches = Backbone.Collection.extend({model:Scratch});
	
	var ScratchesView = Backbone.View.extend({
		id:"scratch_view",
		tagName:"div",
		events:{
			"ftap":"tap",
		},
		initialize:function(options){
			this.cave      = new CaveREC;
			this.options = options;
		},
		tap:function(e,touchData){
			// modelはCaveScratch.js
			this.model.tap(this,e,touchData);
		},
		render:function(){
			var chips_class = this.options.chips_class;
			this.collection = new Scratches( _(this.cave.attributes.scratches).values().value() );
			if( this.cave.get("first_touch") == 0 ){
				this.$el.attr("class","first_touch");
			}
			this.$el.empty();
			
			this.collection.each(function(scratch){
				var scratchObjectView = new ScratchObjectView({model:scratch});
				this.$el.append( scratchObjectView.render( chips_class ).el )
			},this);
			
			console.log("ScratchesView#render [collection]", this.collection.toJSON());
			return this;
		}
	});
	
	// ここからCanvas版のObject
	/*
	var ScratchObjectCanvas = Backbone.View.extend({
		tagName:"i",
		initialize:function(config,option){
			this.canvas = option.canvas.stage;
			this.canvasEls = {};
			this.listenTo(this.model,"change",this.modelChange);
		},
		modelChange:function(e){
			
			if(e.changed.next == 1){
				this.canvasEls.cover.alpha = 0.5;
				this.canvasEls.cover.image = $('<img src="' + __.path.img("map_chip/fx/0.png") + '">')[0]
				if( this.model.get("event_type") != df.EVENT_ENEMY){
					this.addCanvas("obj", this.getObjImg(1), {alpha:0})
					createjs.Tween.get(this.canvasEls.obj).to({alpha:1},500)
				}
			}
			
			if(e.changed.open == 1){
				this.canvasEls.cover.alpha = 0;
				this.addOpenFx();
				this.canvasEls.obj.image = this.getObjImg(2);
			}
			
			if(e.changed.show == 1){
				this.canvasEls.cover.alpha = 0;
			}
			
		},
		render:function(){
			var _this = this;
			this.canvasEls.obj   = new createjs.Bitmap();
			this.canvasEls.open  = new createjs.Bitmap();
			
			//カバー画像
			var img = $('<img>')[0];
			var alpha = 0;
			if( !this.model.get("open") ){
				img = $('<img src="' + __.path.img("map_chip/fx/3.png") + '">')[0];
				alpha = 1;
			}
			if( this.model.get("next") ){
				img = $('<img src="' + __.path.img("map_chip/fx/0.png") + '">')[0];
				alpha = 0.5;
			}
			if( this.model.get("open") ){
				img = $('<img>')[0];
				alpha = 0.5;
			}
				// createjs_memo srcのないimgを渡すと警告が出る
				//img = $('<img src="' + __.path.img("map_chip/fx/3.png") + '">')[0];
			this.addCanvas("cover",img,{alpha:alpha})
			
			//アイテム画像
			if( this.model.get("event_type") != df.EVENT_ENEMY && (this.model.attributes.show || this.model.attributes.next) ){
				this.addCanvas("obj", this.getObjImg(2), {alpha:1})
			}
			
			return this;
		},
		
		
		baseLayout:function(img){
			return {
				regX      :60,
				regY      :60,
				x         :60 + this.model.attributes.x*120,
				y         :60 + this.model.attributes.y*120,
				scaleX    :1,
				scaleY    :1,
				alpha     :0.5,
				drawMargin:2,
			}
		},
		addCanvas:function(name,img,option){
			this.canvasEls[name] = new createjs.Bitmap(img);
			_.extend(this.canvasEls[name],this.baseLayout())
			if(option != undefined){ _.extend(this.canvasEls[name],option) }
			this.canvas.addChild(this.canvasEls[name]);
		},
		addOpenFx:function(){
			var img = $('<img src="' + __.path.img("map_chip/fx/1.png") + '">')[0];
			this.addCanvas("open",img,{alpha:1})
			
			createjs.Tween.get(this.canvasEls.open)
				.to({scaleX:1.7, scaleY:1.7, alpha:0 }, 600, createjs.Ease.quintOut)
		},
		getObjImg:function(type){
			var event_type = this.model.get("event_type");
			var img = $('<img>')[0];
				// createjs_memo srcのないimgを渡すと警告が出る
				//img = $('<img src="' + __.path.img("map_chip/icon/1.png") + '">')[0];
			     if(event_type == df.EVENT_KAIDAN      ){ img = $('<img src="' + __.path.img("map_chip/icon/1.png") + '">')[0]; }
			else if(event_type == df.EVENT_GAME_MONEY  ){ img = $('<img src="' + __.path.img("map_chip/icon/2_"+type+".png") + '">')[0]; }
			else if(event_type == df.EVENT_REAL_MONEY  ){ img = $('<img src="' + __.path.img("map_chip/icon/3_"+type+".png") + '">')[0]; }
			else if(event_type == df.EVENT_GACHA_POINT ){ img = $('<img src="' + __.path.img("map_chip/icon/3_"+type+".png") + '">')[0]; }
			else if(event_type == df.EVENT_ITEM        ){ img = $('<img src="' + __.path.img("map_chip/icon/3_"+type+".png") + '">')[0]; }
			else if(event_type == df.EVENT_ENEMY       ){ img = $('<img src="' + __.path.img("map_chip/icon/4.png") + '">')[0]; }
			return img;
		},
	});
	
	var CanvasView = Backbone.View.extend({
		tagName:"canvas",
		events:{
			//"ftap":"stopUpdate"
		},
		stopUpdate:function(){
			console.log("CanvasView#stopUpdate");
			createjs.Ticker.removeEventListener("tick", this.updateStage);
		},
		initialize:function(){
			this.caveMap = new CaveMapREC;
			var map = this.caveMap.get("make_data");
			var chip_size = 60;
			
			this.el.width  = map.x*chip_size*2;
			this.el.height = map.y*chip_size*2;
			this.$el.css({background:"rgba(125,125,125,0)",position:"absolute",top:"0px",left:"0px",height:(map.y*chip_size)+"px",width:(map.x*chip_size)+"px"})
			createjs.Ticker.setFPS(1);
			
			var use_webgl = true; // CreateJSのWebGL版の設定
			if(use_webgl){
				this.stage = new createjs.SpriteStage(this.el);
			}else{
				this.stage = new createjs.Stage(this.el);
			}
			
			this.updateStage = _.bind(function(e){
				this.stage.update(e);
			},this);
			createjs.Ticker.addEventListener("tick", this.stage);
		},
		render:function(){
			return this
		},
	});
	
	// ScratchesViewを上書き
	var ScratchesView = Backbone.View.extend({
		id:"scratch_view",
		tagName:"div",
		events:{
			"ftap":"tap",
		},
		initialize:function(options){
			this.cave      = new CaveREC;
			this.options = options;
		},
		tap:function(e,touchData){
			this.model.tap(this,e,touchData);
		},
		render:function(){
			
			var chips_class = this.options.chips_class;
			this.collection = new Scratches( _(this.cave.attributes.scratches).values().value() );
			if( this.cave.get("first_touch") == 0 ){
				this.$el.attr("class","first_touch");
			}
			this.$el.empty();
			
			__.preload(
				_.map([
					"map_chip/fx/0.png",
					"map_chip/fx/1.png",
					"map_chip/fx/2.png",
					"map_chip/fx/3.png",
					"map_chip/icon/1.png",
					"map_chip/icon/2_1.png",
					"map_chip/icon/3_1.png",
					"map_chip/icon/3_1.png",
					"map_chip/icon/3_1.png",
					"map_chip/icon/2_2.png",
					"map_chip/icon/3_2.png",
					"map_chip/icon/3_2.png",
					"map_chip/icon/3_2.png",
					"map_chip/icon/4.png",
				],
				function(file){ return __.path.img(file) }),
				_.bind(function(){
					this.canvasView = new CanvasView;
					console.log("ScratchesView#render.loaded [this.canvasView]",this.canvasView);
					this.collection.each(function(scratch){
						var scratchObjectCanvas = new ScratchObjectCanvas({model:scratch},{canvas:this.canvasView});
						scratchObjectCanvas.render();
						console.log("ScratchesView#render.loaded collection.each [scratchObjectCanvas]",scratchObjectCanvas);
					},this);
					this.$el.append(this.canvasView.el)
					this.canvasView.render();
				},this)
			)
			
			console.log("ScratchesView#render [collection]", this.collection.toJSON());
			return this;
		}
	});
	*/
	// ここまでCanvas版のObject
	
	return {
		ObjectView   :ScratchObjectView,
		ScratchesView:ScratchesView,
		Scratches    :Scratches
	};
})

