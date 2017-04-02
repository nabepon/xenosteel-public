define([],function(){
	
	var CaveMapMake = Backbone.Model.extend({
		defaults   : function(){ return {} },
		initialize : function(){},
		make:function(caveMapData){
			var config = {x:8,y:8,margin:1,times:3,min:10};
			_.extend(config,caveMapData);
			var stage  = {};
			stage = this.generate(config);
			
			var result = {stage:stage,stage_config:config}
			var try_cnt =0;
			for(;;){
				try_cnt += 1;
				result = this.retry(result.stage,result.stage_config);
				if(result.retry == false){
					console.log("CaveMapMake#make [try_cnt]",try_cnt);
					stage = result.stage;
					break
				}
			}
			
			stage = this.trim(stage);
			stage = this.embedData(stage);
			
			//console.log("CaveMapMake#make [stage]","total:"+stage.x*stage.y,"num:"+stage.num,stage);
			return stage;
		},
		embedData:function(stage){
			
			// 別の座標を調べたとき、undefinedの条件になるのをふせぐため、marginを追加する
			stage = this.margin(stage,{top:2,bottom:2,left:2,right:2});
			
			// 012
			// 345
			// 678
			var cnt = 0;
			var map_data = [];
			var M = stage.mark;
			for(var i=0;i<stage.y;i++){
				map_data[i] = [];
				for(var j=0;j<stage.x;j++){
					map_data[i].push([]);
					map_data[i][j] = {
						type:df.MAP_TYPE_WALL,
						//wall:0,
						gra:[0,0,0,0,0,0,0,0,0],
					};
					if( i < 2 ||  j < 2 || i > stage.y-2 || j > stage.x-2 ){
					}else if(stage.map[i][j] == M ){
						map_data[i][j].type = df.MAP_TYPE_FLOOR;
						if( stage.map[i-1][j] != M ){ map_data[i][j].gra[1] = 1; }
						if( stage.map[i+1][j] != M ){ map_data[i][j].gra[7] = 1; }
						if( stage.map[i][j-1] != M ){ map_data[i][j].gra[3] = 1; }
						if( stage.map[i][j+1] != M ){ map_data[i][j].gra[5] = 1; }
						
						if( stage.map[i-1][j-1] != M && map_data[i][j].gra[1] != 1 && map_data[i][j].gra[3] != 1 ){ map_data[i][j].gra[0] = 1; }
						if( stage.map[i-1][j+1] != M && map_data[i][j].gra[1] != 1 && map_data[i][j].gra[5] != 1 ){ map_data[i][j].gra[2] = 1; }
						if( stage.map[i+1][j-1] != M && map_data[i][j].gra[7] != 1 && map_data[i][j].gra[3] != 1 ){ map_data[i][j].gra[6] = 1; }
						if( stage.map[i+1][j+1] != M && map_data[i][j].gra[7] != 1 && map_data[i][j].gra[5] != 1 ){ map_data[i][j].gra[8] = 1; }
						
						if( map_data[i][j].gra[1] == 1 && map_data[i][j].gra[3] == 1 ){ map_data[i][j].gra[0] = 2; }
						if( map_data[i][j].gra[1] == 1 && map_data[i][j].gra[5] == 1 ){ map_data[i][j].gra[2] = 2; }
						if( map_data[i][j].gra[7] == 1 && map_data[i][j].gra[3] == 1 ){ map_data[i][j].gra[6] = 2; }
						if( map_data[i][j].gra[7] == 1 && map_data[i][j].gra[5] == 1 ){ map_data[i][j].gra[8] = 2; }
						//console.log("CaveMapMake#embedData", cnt + "| " + i +":"+ j ,map_data[i][j].gra.join(""));
					}else{
						map_data[i][j].type = df.MAP_TYPE_WALL;
						map_data[i][j].gra[4]   = 1;
						if( stage.map[i-1][j  ] == M ){ map_data[i][j].gra[1] = 1; }
						if( stage.map[i+1][j  ] == M ){ map_data[i][j].gra[7] = 1; }
						if( stage.map[i  ][j-1] == M ){ map_data[i][j].gra[3] = 1; }
						if( stage.map[i  ][j+1] == M ){ map_data[i][j].gra[5] = 1; }
						
						if( stage.map[i-1][j-1] == M && stage.map[i-1][j] != M && stage.map[i][j-1] != M ){ map_data[i][j].gra[0] = 1; }
						if(                             stage.map[i-1][j] == M && stage.map[i][j-1] == M ){ map_data[i][j].gra[0] = 1; }
						if( stage.map[i-1][j+1] == M && stage.map[i-1][j] != M && stage.map[i][j+1] != M ){ map_data[i][j].gra[2] = 1; }
						if(                             stage.map[i-1][j] == M && stage.map[i][j+1] == M ){ map_data[i][j].gra[2] = 1; }
						if( stage.map[i+1][j-1] == M && stage.map[i+1][j] != M && stage.map[i][j-1] != M ){ map_data[i][j].gra[6] = 1; }
						if(                             stage.map[i+1][j] == M && stage.map[i][j-1] == M ){ map_data[i][j].gra[6] = 1; }
						if( stage.map[i+1][j+1] == M && stage.map[i+1][j] != M && stage.map[i][j+1] != M ){ map_data[i][j].gra[8] = 1; }
						if(                             stage.map[i+1][j] == M && stage.map[i][j+1] == M ){ map_data[i][j].gra[8] = 1; }
					}
				}
			}
			for(var i=0;i<stage.y;i++){
				for(var j=0;j<stage.x;j++){
					map_data[i][j].gra_id = map_data[i][j].gra.join("");
				}
			}
			
			stage.map = map_data;
			stage = this.margin(stage,{top:-2,bottom:-2,left:-2,right:-2});
			stage.data = stage.map;
			
			//console.log("CaveMapMake#embedData [map_data]",map_data);
			return stage;
		},
		trim:function(stage){
			//現在のマージンを取得
			var margin = {};
			
			var break_flag = false;
			for(var i=0; i<stage.y; i++){
				margin.top = i;
				for(var j=0; j<stage.x; j++){
					if(stage.map[i][j] == stage.mark ){ break_flag = true; break }
				};
				if(break_flag){ break }
			};
			
			var break_flag = false;
			for(var i=stage.y-1; i>0; i--){
				margin.bottom = stage.y - i - 1;
				for(var j=0; j<stage.x; j++){
					if(stage.map[i][j] == stage.mark ){ break_flag = true; break }
				};
				if(break_flag){ break }
			};
			
			var break_flag = false;
			for(var i=0; i<stage.x; i++){
				margin.left = i;
				for(var j=0; j<stage.y; j++){
					if(stage.map[j][i] == stage.mark ){ break_flag = true; break }
				};
				if(break_flag){ break }
			};
			
			var break_flag = false;
			for(var i=stage.x-1; i>0; i--){
				margin.right = stage.x - i - 1;
				for(var j=0; j<stage.y; j++){
					if(stage.map[j][i] == stage.mark ){ break_flag = true; break }
				};
				if(break_flag){ break }
			};
			
			//console.log("CaveMapMake#trim [margin]",margin);
			
			var trim = {
				top   :stage.margin - margin.top   ,
				bottom:stage.margin - margin.bottom,
				left  :stage.margin - margin.left  ,
				right :stage.margin - margin.right ,
				
			};
			
			return this.margin(stage,trim);
			
		},
		margin:function(stage,trim){
			//マージンを調整
			
			if(trim.top > 0){
				for(var i=0;i<trim.top;i++){
					stage.map.unshift( stage.row.slice(0) )
				}
			}else{
				for(var i=0;i<trim.top*-1;i++){
					stage.map.shift()
				}
			}
			if(trim.bottom > 0){
				for(var i=0;i<trim.bottom;i++){
					stage.map.push( stage.row.slice(0) )
				}
			}else{
				for(var i=0;i<trim.bottom*-1;i++){
					stage.map.pop()
				}
			}
			stage.y = stage.map.length;
			
			if(trim.left > 0){
				for(var i=0;i<trim.left;i++){
					for(var j=0;j<stage.y;j++){
						stage.map[j].unshift(0)
					}
				}
			}else{
				for(var i=0;i<trim.left*-1;i++){
					for(var j=0;j<stage.y;j++){
						stage.map[j].shift()
					}
				}
			}
			if(trim.right > 0){
				for(var i=0;i<trim.right;i++){
					for(var j=0;j<stage.y;j++){
						stage.map[j].push(0)
					}
				}
			}else{
				for(var i=0;i<trim.right*-1;i++){
					for(var j=0;j<stage.y;j++){
						stage.map[j].pop()
					}
				}
			}
			stage.x = stage.map[0].length;
			stage.row = [];
			for(var i=0; i<stage.x; i++){ stage.row.push(0) };
			
			return stage;
		},
		retry:function(stage,stage_config,pieces){
			//var thisFn = arguments.callee
			var result = {retry:false}
			if(stage.num < stage.min){
				if(stage.x>15){ stage_config.x += -5; }
				if(stage.y>15){ stage_config.x += -5; }
				if(stage.times<100){ stage_config.times += 10; }
				stage = this.generate(stage_config,pieces);
				if(stage.num < stage.min){
					result.retry = true;
					result.stage = stage;
					result.stage_config = stage_config;
					result.pieces = pieces;
					return result
				}else{
					result.retry = false;
					result.stage = stage;
					return result
				}
			}else{
				result.retry = false;
				result.stage = stage;
				return result
			}
		},
		generate:function(stage_config,pieces){
			
			var stage  = {
				x    : 30, // mapのxサイズ
				y    : 30, // mapのyサイズ
				row  : [], // 一行のデフォルト配列を入れておく
				maked: [], // 作成直後のmapを保存
				map  : [], // 作成後のmapを保存し、マーキングする
				peak : 0,  // 塗りつぶし時の最大値を保存
				mark : "M", // 塗りつぶしに使う数値
				num  : 0,  // markされた数
				times: 20, // pieceを置く回数
				data : [], // mapを元に加工した実データを入れる
				fillstart:[0,0],// 塗りつぶし基点の保存
				min  : 10,  // 条件を下回った場合のtry条件
				trylimit:10, // try回数の最大
			};
			
			//塗りつぶし用変数
			var navi = {
				map:[[0,0]],
				next:[[0,0]]
			};
			
			//stage_configをコピー
			if(_.isObject(stage_config)){
				_.extend(stage,stage_config);
			}
			
			//piecesのデフォルト値
			if(!_.isArray(pieces)){
				var pieces = [
					[
						[0,0,1,1,0],
						[0,1,-3,-3,1],
						[1,1,-3,0,1],
						[0,0,1,1,0],
						[0,0,1,0,0],
					],
				];
			}
			
			//errorチェック
			//大きさ確認
			for(var i=0; i<pieces.length; i++){
				if(stage.y < pieces[i].length){
					alert("stageサイズよりpieceの方が大きいです");
				}
				if(stage.x < pieces[i][0].length){
					alert("stageサイズよりpieceの方が大きいです");
				}
			}
			
			//全体の空map作成
			for(var i=0; i<stage.x; i++){ stage.row.push(0) };
			for(var i=0; i<stage.y; i++){ stage.maked.push( stage.row.slice(0) ) };
			
			//重ねてランダムmap作成
			var offset = {x:0,y:0};
			var patchwork = function(piece){
				offset.x = _.random(0,stage.x - piece[0].length);
				offset.y = _.random(0,stage.y - piece.length);
				for(var i=0; i<piece.length; i++){
					for(var j=0; j<piece[i].length; j++){
						stage.maked[i + offset.y][j + offset.x] += piece[i][j];
					};
				};
			}
			for(var i=0; i<stage.times; i++){
				patchwork(pieces[ _.random(0,pieces.length-1) ])
			};
			stage.map = _.cloneDeep(stage.maked);
			
			//開始基点の作成
			//mapの最大数を調べ、
			for(var i=0; i<stage.y; i++){
				for(var j=0; j<stage.x; j++){
					if(stage.peak < stage.map[i][j]){
						stage.peak = stage.map[i][j];
					}
				};
			};
			//そこを基点にする
			for(var i=0; i<stage.y; i++){
				for(var j=0; j<stage.x; j++){
					if(stage.peak == stage.map[i][j]){
						navi.map[0][1] = j;
						navi.map[0][0] = i;
						stage.fillstart[1]  = j;
						stage.fillstart[0]  = i;
						break
					}
				};
			};
			
			// 塗りつぶす
			for(var i=0; i<1000; i++){
				navi.next = [];
				for(var j=0; j<navi.map.length; j++){
					if( navi.map[j][0] != stage.mark  &&  navi.map[j][0] > 0            &&  typeof stage.map[navi.map[j][0]-1]                   !== "undefined"  &&  stage.map[navi.map[j][0]-1][navi.map[j][1]  ] !== stage.mark  &&  stage.map[navi.map[j][0]-1][navi.map[j][1  ]] > 0 ){ stage.map[navi.map[j][0]-1][navi.map[j][1]  ] = stage.mark; navi.next.push([navi.map[j][0]-1,navi.map[j][1]  ]); }
					if( navi.map[j][1] != stage.mark  &&  navi.map[j][1] < stage.x - 1  &&  typeof stage.map[navi.map[j][0]  ][navi.map[j][1]+1] !== "undefined"  &&  stage.map[navi.map[j][0]  ][navi.map[j][1]+1] !== stage.mark  &&  stage.map[navi.map[j][0]  ][navi.map[j][1]+1] > 0 ){ stage.map[navi.map[j][0]  ][navi.map[j][1]+1] = stage.mark; navi.next.push([navi.map[j][0]  ,navi.map[j][1]+1]); }
					if( navi.map[j][0] != stage.mark  &&  navi.map[j][0] < stage.y - 1  &&  typeof stage.map[navi.map[j][0]+1]                   !== "undefined"  &&  stage.map[navi.map[j][0]+1][navi.map[j][1]  ] !== stage.mark  &&  stage.map[navi.map[j][0]+1][navi.map[j][1]  ] > 0 ){ stage.map[navi.map[j][0]+1][navi.map[j][1]  ] = stage.mark; navi.next.push([navi.map[j][0]+1,navi.map[j][1]  ]); }
					if( navi.map[j][1] != stage.mark  &&  navi.map[j][1] > 0            &&  typeof stage.map[navi.map[j][0]  ][navi.map[j][1]-1] !== "undefined"  &&  stage.map[navi.map[j][0]  ][navi.map[j][1]-1] !== stage.mark  &&  stage.map[navi.map[j][0]  ][navi.map[j][1]-1] > 0 ){ stage.map[navi.map[j][0]  ][navi.map[j][1]-1] = stage.mark; navi.next.push([navi.map[j][0]  ,navi.map[j][1]-1]); }
				}
				navi.map = navi.next.slice(0);
				if(navi.next.length == 0){
					//console.log("CaveMapMake#generate --end--:" + i);
					break
				}
			}
			
			// 有効map数をカウント
			for(var i=0; i<stage.y; i++){
				for(var j=0; j<stage.x; j++){
					if(stage.map[i][j] == stage.mark ){
						stage.num += 1;
					}
				};
			};
			return stage
		},
	});
	
	return CaveMapMake;
});





