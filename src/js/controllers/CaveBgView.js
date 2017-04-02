define([
	"models/CaveMapREC",
],function(CaveMapREC){
	
	// マップグラフィックの固定部分全体
	var BgView = Backbone.View.extend({
		id:"bg_view",
		tagName:"div",
		initialize:function(options){
			this.options = options;
			var canvas = $('<canvas></canvas>')[0];
			this.canvas = canvas;
			this.cacheBgImg = canvas;
			this.caveMap = new CaveMapREC;
			this.cacheBgFlag = 0;
			this.listenTo(this,"createdBg",this.cacheBg);
		},
		cacheBg:function(){
			
			if(this.cacheBgFlag == 1){ return }
			this.cacheBgFlag = 1;
			
			//準備
			var map      = this.caveMap.get("make_data");
			var startPos = this.caveMap.attributes.scratches[0];
			var canvas   = $('<canvas height="300" width="320"></canvas>')[0];
			var ctx      = canvas.getContext('2d');
			
			//切抜き場所を算出
			var width  = map.x * this.options.chip_size;
			var height = map.y * this.options.chip_size;
			var x = startPos.x * this.options.chip_size;
			var y = startPos.y * this.options.chip_size;
			
			//切抜き場所がはみ出していたらその分位置をずらす
			var drawX = x + ctx.canvas.width;
			var drawY = y + ctx.canvas.height ;
			if( width < drawX ){ x -= drawX - width; }
			if( height < drawY ){ y -= drawY - height; }
			
			//描画
			ctx.drawImage(this.canvas,-1*x,-1*y,width,height);
			this.cacheBgImg = canvas;
			//window.open( canvas.toDataURL() )
		},
		render:function(){
			var map              = this.caveMap.get("make_data");
			var floor_sub_gra_id = this.caveMap.get("floor_sub_gra_id");
			var floor_gra_id     = this.caveMap.get("floor_gra_id");
			var wall_gra_id      = this.caveMap.get("wall_gra_id");
			var bg_color         = this.caveMap.get("bg_color");
			var chips_class      = this.options.chips_class;
			var chip_size        = this.options.chip_size;
			var bgofs_1          = 0.4;
			var bgofs_2          = 0.8;
			var chipsf           = []; // 床と壁の境のグラチップリスト
			var chipsw           = []; // 壁グラのチップリスト
			
			for(var i=0; i<map.y; i++){
				for(var j=0; j<map.x; j++){
					if(map.data[i][j].type == df.MAP_TYPE_WALL){
						chipsw.push(map.data[i][j].gra_id);
					}else if(map.data[i][j].type == df.MAP_TYPE_FLOOR){
						chipsf.push(map.data[i][j].gra_id);
					}
				}
			}
			chipsf = _.uniq(chipsf);
			chipsw = _.uniq(chipsw);
			
			// map chipに不足がないかチェック
			var checkMapChipData = function(){
				var wall_chip_data  = ['000010000', '100010000', '001010000', '000010100', '000010001', '101010000', '100010100', '100010001', '001010100', '001010001', '000010101', '101010100', '101010001', '100010101', '001010101', '101010101', '010010000', '010010100', '010010001', '010010101', '000011000', '100011000', '000011100', '100011100', '000010010', '100010010', '001010010', '101010010', '000110000', '001110000', '000110001', '001110001', '010010010', '000111000', '110110110', '011011011', '000111111', '111111000', '111111111', '110110000', '000110110', '110110001', '001110110', '011011000', '000011011', '011011100', '100011011', ];
				var floor_chip_data = ['000000000', '100000000', '001000000', '000000100', '000000001', '101000000', '100000100', '100000001', '001000100', '001000001', '000000101', '101000100', '101000001', '100000101', '001000101', '101000101', '010000000', '010000100', '010000001', '010000101', '000001000', '100001000', '000001100', '100001100', '000000010', '100000010', '001000010', '101000010', '000100000', '001100000', '000100001', '001100001', '010000010', '000101000', '210100210', '012001012', '000101212', '212101000', '212101212', '210100000', '000100210', '210100001', '001100210', '012001000', '000001012', '012001100', '100001012', ];
				console.log("BgView#render.checkMapChipData [chipsw,chipsf]",[chipsw,chipsf]);
				wall_chip_data = _.difference(chipsw, wall_chip_data);
				floor_chip_data = _.difference(chipsf, floor_chip_data);
				if(wall_chip_data.length>0) { console.error("err_wall_chip",wall_chip_data); alert("不明なmap chipを検出しました"); }
				if(floor_chip_data.length>0){ console.error("err_floor_chip",floor_chip_data); alert("不明なmap chipを検出しました"); }
			}
			
			var response = {
				map : map,
				chip_size : chip_size,
				floor_sub_gra_id : floor_sub_gra_id,
				floor_gra_id : floor_gra_id,
				wall_gra_id : wall_gra_id,
				bg_color : bg_color,
				chips_class : chips_class,
				chipsf : chipsf,
				chipsw : chipsw,
				bgofs_1 : bgofs_1,
				bgofs_2 : bgofs_2,
			}
			
			this.$el.html( __.template("cave/bg_view_style",response) );
			this.renderCanvas(response);
			return this;
		},
		renderCanvas:function(res){
			var _this = this;
			var map              = this.caveMap.get("make_data");
			var floor_sub_gra_id = this.caveMap.get("floor_sub_gra_id");
			var floor_gra_id     = this.caveMap.get("floor_gra_id");
			var wall_gra_id      = this.caveMap.get("wall_gra_id");
			var chip_size        = this.options.chip_size * 2;
			
			//画像一覧データ作成
			var chipsf = _.reduce(res.chipsf,function(result,chip){ result["f"+chip] = __.path.img("map_chip/floor_sub/" + floor_sub_gra_id + "/" + chip + ".png");  return result },{});
			var chipsw = _.reduce(res.chipsw,function(result,chip){ result["w"+chip] = __.path.img("map_chip/wall/" + wall_gra_id + "/" + chip + ".png");            return result },{});
			var floor_bg = {floor_bg:__.path.img("map_chip/floor/" + floor_gra_id + ".png")};
			var chips = _.extend(chipsf,chipsw);
			var chips = _.extend(floor_bg,chips);
			
			//canvasを作成して描画
			var draw = function(){
				var canvas = $('<canvas style="zoom:0.5"></canvas>')[0];
				var ctx    = canvas.getContext('2d');
				ctx.canvas.height = map.y * chip_size;
				ctx.canvas.width  = map.x * chip_size;
				console.log("BgView#renderCanvas.draw [ctx]",ctx)
				
				var images = _.reduce(chips,function(result,src,i){
					var img = new Image();
					img.src = src;// + "?" + __.baseTime();
					result[i] = img;
					return result;
				},{})
				
				for(var i=0; i<map.y; i++){
					for(var j=0; j<map.x; j++){
						//console.log("BgView#renderCanvas.draw [i,j,map.data[i][j]]",[i,j,map.data[i][j]]);
						if(map.data[i][j].type == df.MAP_TYPE_WALL){
							ctx.drawImage(images["w" + map.data[i][j].gra_id], j*chip_size, i*chip_size, chip_size, chip_size);
						}
						//ときどきmapが欠けるのを修正。なぜこうなっていたのか不明
						//else if(map.data[i][j].type == df.MAP_TYPE_FLOOR && map.data[i][j].gra_id != "000000000"){
						else if(map.data[i][j].type == df.MAP_TYPE_FLOOR){
							ctx.drawImage(images["floor_bg"], j*chip_size, i*chip_size, chip_size, chip_size);
							ctx.drawImage(images["f" + map.data[i][j].gra_id], j*chip_size, i*chip_size, chip_size, chip_size);
						}
					}
				}
				
				_this.$el.prepend(canvas);
				_this.canvas = canvas;
				_this.trigger("createdBg");
			}
			
			//画像読み込み
			var chip_list = _.values(chips);
			var loader = __.preload(chip_list,draw);
		},
	});
	
	return BgView;
})

