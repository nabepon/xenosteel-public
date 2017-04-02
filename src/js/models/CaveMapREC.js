define([
	"models/PcREC",
	"models/CaveMapMake",
],function(PcREC,CaveMapMake){
	
	/**
	 * Mapの生成と、生成したMapの保存をするクラス。
	 * @class CaveMapREC
	 */
	var CaveMapREC = Backbone.Model.extend({
		constructor:function(){
			// シングルトン
			if(!CaveMapREC.instance){
				CaveMapREC.instance = this;
				Backbone.Model.apply(CaveMapREC.instance,arguments);
			}
			return CaveMapREC.instance;
		},
		defaults    : function(){ return this.defaultAttr() },
		defaultAttr : function(){
			this.pc = new PcREC;
			return{
				id               :this.pc.get("id"),
				x                : 1,
				y                : 1,
				num              : 1,
				positive_num     : 0,
				negative_num     : 0,
				make_data        :{},
				scratch_data     :{},
				chip_size        : 60,
				floor_gra_id     : 1,
				floor_sub_gra_id : 0,
				wall_gra_id      : 2,
				bg_color         : "000",
				i_id_namespace   :"i",
				a_id_namespace   :"a",
				map      : [],
				scratches: {},
				boss_data_str   : "",
				is_exist_boss   : 0,
				is_boss_defeated: 0,
			}
		},
		validate : function(attrs,opt){
			if( this.get("id") != this.pc.get("id") ){
				return "id compere is not pc id :" + this.get("id") + "-"  + this.pc.get("id");
			}
		},
		error:function(model,e){
			console.error("CaveMapREC#error [model,e]",[model,e])
		},
		localStorage : new Backbone.LocalStorage("CaveMapREC"),
		/**
		 * CaveMapRECのinitialize処理。fetchでMapをロードしてくる。
		 * @memberof CaveMapREC
		 * @function initialize
		 */
		initialize : function(){
			console.log("CaveMapREC#initialize");
			this.pc = new PcREC;
			this.fetch();
			
			this.extendProp();
			this.listenTo(this,"invalid",this.error);
			this.listenTo(this.pc,"reset_data",this.resetData);
			this.listenTo(this.pc,"fetch_user_id",this.fetchUserId);
			this.listenTo(this.pc,"change_user_id",this.changeUserId);
			this.save();
		},
		fetchUserId  : function(id){ console.log("CaveMapREC#fetchUserId",arguments); this.set("id",id).fetch() },
		changeUserId : function(id){ console.log("CaveMapREC#changeUserId",arguments); this.set("id",id).save() },
		resetData : function(pc_id,is_data_delete){
			this.destroy();
			this.attributes = (is_data_delete) ? {} : this.defaults();
			this.set("id",pc_id);
			this.save();
		},
		/**
		 * いくつかのメンバを、attributes下ではなく、modelに直接追加する。(x,y,num,scratches)
		 * @memberof CaveMapREC
		 * @function extendProp
		 */
		extendProp:function(){
			this.x   = this.attributes.x   = this.attributes.make_data.x  ;
			this.y   = this.attributes.y   = this.attributes.make_data.y  ;
			this.num = this.attributes.num = this.attributes.make_data.num;
			this.scratches = _.cloneDeep(this.attributes.scratches);
		},
		/**
		 * defaultAttrでreset
		 * @memberof CaveMapREC
		 * @function reset
		 */
		reset :function(){
			this.attributes = {};
			this.attributes = this.defaultAttr();
			return this;
		},
		/**
		 * 新しくMapを生成する
		 * @memberof CaveMapREC
		 * @function newMap
		 * @param list_id {int} CaveRECに保存したQuestListData.xlsのid。
		 * @param floor {int} 今いるフロア+1を渡す。
		 */
		newMap : function(list_id,floor,floor_data){
			var questListData = _.clone(st.QuestListData[list_id]);
			var caveMapData = st.CaveMapData[floor_data.cave_map_id];
			caveMapData.peaces = _(caveMapData.peace_data.split("-")).reduce(function(result,id,n){
				result[n] = st.CaveMapPeaceData[id];
				return result;
			},[]);
			
			var caveMapMake = new CaveMapMake;
			var make_data = caveMapMake.make(caveMapData)
			_.extend(this.attributes,caveMapData);
			this.set("id", this.pc.get("id") );
			this.set("caveMapData", st.CaveMapData[floor_data.cave_map_id] );
			this.set("questListData", questListData );
			this.set("make_data", make_data );
			this.set("map", make_data.map );
			console.log("CaveMapREC#newMap [make_data]",make_data);
			
			// BOSS関連
			var scratch_table = st.CaveScratchDataMin[ floor_data.scratch_id ];
			var boss_data     = _.find(scratch_table,function(data){ return data[1]==df.EVENT_BOSS });
			var is_knot_floor = ( floor == questListData.floor_max || floor == floor_data.floor ); 
			var is_exist_boss = ( is_knot_floor && boss_data != undefined) ? 1 : 0; 
			this.set("boss_data_str", (is_exist_boss) ? boss_data[2] : "" );
			this.set("is_exist_boss", is_exist_boss );
			
			return this;
		},
		/**
		 * scratchesを作成してsetする。
		 * @memberof CaveMapREC
		 * @function makeScratches
		 * @param list_id {int} CaveRECに保存したquest_id(QuestListData.xlsのid)
		 * @param scratch_id {int} 。QuestListDataのscratch_id[]
		 */
		makeScratches : function(list_id,scratch_id){
			
			//drawする
			var scratch_num   = this.attributes.make_data.num
			var empty_per     = _.random( 60, 75 ) / 100;
			var draw_max      = ( (1-empty_per) * ( scratch_num - 1 ) ).ceil();
			var draw_result   = this.drawScratches(scratch_num,draw_max,scratch_id);
			console.log("CaveMapREC#makeScratches [draw_result]",draw_result);
			
			//作ったdraw_resultに座標idを振る
			var map_data = this.get("make_data").data;
			var scratches = {};
			var cnt = 0;
			// todo 有効要素数とdraw_resultの数があってるかチェック入れる
			for(var i=0; i<map_data.length; i++){
				for(var j=0; j<map_data[i].length; j++){
					if(map_data[i][j].type == df.MAP_TYPE_FLOOR){
						scratches[i+"-"+j] = {
							id        :i+"-"+j,
							event_type:draw_result[cnt].event_type,
							//event_id  :draw_result[cnt].event_id,
							event_data:draw_result[cnt].event_data,
							y         :i,
							x         :j,
						}
						cnt += 1;
					}
				}
			}
			console.log("CaveMapREC#makeScratches [scratches]",scratches);
			
			this.set("scratches",scratches);
			return this
			
		},
		
		/**
		 * makeScratchesで使う。Scratchのdataをdrawして決定する。。
		 * @memberof CaveMapREC
		 * @function drawScratches
		 * @param scratch_num {int} mapの床数
		 * @param draw_max {int} 。scratch_numに空白率を掛けたもの
		 * @param scratch_id {int} 。QuestListDataのscratch_id[]
		 */
		drawScratches:function(scratch_num,draw_max,scratch_id){
			//draw todo drawScratchesのdefault値を作る
			console.log("CaveMapREC#drawScratches [scratch_id]",scratch_id);
			//var scratch_table = st.CaveScratchDataAll[ scratch_id ];
			var scratch_table = st.CaveScratchDataMin[ scratch_id ];
			scratch_table = this.scratchTableToObject(scratch_id,scratch_table)
			console.log("CaveMapREC#drawScratches [scratch_table]",scratch_table);
			
			//変数準備
			var scratch_data = {}
			scratch_data.lot_max = _.reduce(scratch_table,function(sum,data,n){ return sum + data.rate  },0)
			scratch_data.lot_num = [];
			scratch_data.lot_sum = [];
			scratch_data.elect_indexs = []
			
			//draw処理。scratch_dataにdraw結果を保存していく
			for(var j=0; j<draw_max; j++){
				scratch_data.lot_num[j] = _.random(0,scratch_data.lot_max);
				scratch_data.lot_sum[j] = 0;
				for(var i=0;i<scratch_table.length;i++){
					scratch_data.lot_sum[j] += scratch_table[i].rate;
					scratch_data.elect_indexs[j] = i;
					if(scratch_data.lot_num[j] < scratch_data.lot_sum[j] ){ break }
				}
			}
			
			//drawしたindexから、実際のscratchデータを作成
			var draw_result = _(scratch_data.elect_indexs).reduce(function(result,elect_index){
				var res = {
					event_type:scratch_table[elect_index].event_type,
					//event_id  :scratch_table[elect_index].event_id,
					event_data:scratch_table[elect_index].event_data,
				}
				result.push(res);
				return result
			},[])
			
			//超過分を削除
			//draw_result = draw_result.slice(0,draw_max);
			
			//残りマス分空白マスデータを追加
			for(var i=0; i< scratch_num - 1 - draw_max ; i++){
				//draw_result.push({event_type:df.EVENT_EMPTY,event_id:0})
				draw_result.push({event_type:df.EVENT_EMPTY,event_data:""})
			}
			
			//階段データを追加
			//draw_result.push({event_type:df.EVENT_KAIDAN,event_id:0})
			draw_result.push({event_type:df.EVENT_KAIDAN,event_data:""})
			
			//shuffleして完成
			draw_result = _.shuffle(draw_result);
			
			return draw_result
		},
		scratchTableToObject:function(id,scratch_table_list){
			//var scratch_table = {};
			var scratch_table = [];
			for(var i in scratch_table_list){
				//scratch_table[id] = [];
				for(var j in scratch_table_list[i]){
					//scratch_table[id][j] = {
					scratch_table[i] = {
						group     :id,
						rate      :scratch_table_list[i][0],
						event_type:scratch_table_list[i][1],
						event_data:scratch_table_list[i][2],
					}
				}
			}
			console.log("CaveMapREC#scratchTableToObject [id, scratch_table_list, scratch_table]",[id, scratch_table_list, scratch_table]);
			return scratch_table
		},
		makeCaveScratchDataAll:function(){
			var all_obj = {}
			for(var i in st.CaveScratchDataMin){
				all_obj[i] = this.scratchTableToObject( i, st.CaveScratchDataMin[i] );
			}
			return all_obj
		},
		/**
		 * Mapのイベントに数値パラメータ付与。(入手するお金やトラップのダメージなど)
		 * @memberof CaveMapREC
		 * @function setScratchEventNum
		 * @param difficulty {int} 難易度。QuestListData.xlsのlevel[]
		 */
		setScratchEventNum : function( difficulty ){
			
			var neutral_num = 0;
			var positive_num= 0;
			var negative_num= 0;
			
			var scratches = _( this.get("scratches") ).map(function(scratch,key){
				if(scratch.event_type == df.EVENT_KAIDAN){
					neutral_num += 1;
					scratch.event_num = 0;
				}
				if(scratch.event_type == df.EVENT_EMPTY){
					neutral_num += 1;
					scratch.event_num = 0;
				}
				if(scratch.event_type == df.EVENT_GAME_MONEY){
					positive_num += 1;
					var get_num = (scratch.event_data).toNumber() * difficulty * 10 * _.random(90,110) / 100;
					scratch.event_num = get_num.floor();
				}
				if(scratch.event_type == df.EVENT_REAL_MONEY){
					positive_num += 1;
					var get_num = (scratch.event_data).toNumber() ;
					scratch.event_num = get_num.floor();
				}
				if(scratch.event_type == df.EVENT_GACHA_POINT){
					positive_num += 1;
					var get_num = (scratch.event_data).toNumber() * difficulty * 10 * _.random(90,110) / 100;
					scratch.event_num= get_num.floor();
				}
				if(scratch.event_type == df.EVENT_PHRASE){
					positive_num += 1;
					scratch.event_num = 0;
				}
				if(scratch.event_type == df.EVENT_ITEM){
					positive_num += 1;
					scratch.event_num = 1;
				}
				if(scratch.event_type == df.EVENT_ENEMY || scratch.event_type == df.EVENT_MIMIC){
					negative_num += 1;
					var enemy_lvl = 100 * difficulty * _.random(90,110) / 100;
					scratch.event_num = enemy_lvl.floor();
				}
				if(scratch.event_type == df.EVENT_TRAP){
					negative_num += 1;
					//var damage = scratch.event_id * difficulty * 10 * _.random(90,110) / 100;
					var damage = 100 * difficulty * _.random(90,110) / 100;
					scratch.event_num = damage.floor();
				}
				return scratch
			});
			
			this.set("positive_num",positive_num);
			this.set("negative_num",negative_num);
			this.set("scratches",scratches.value());
			console.log("CaveMapREC#setScratchEventNum [scratches]",scratches);
			return this
		},
	});
	
	return CaveMapREC;
});





