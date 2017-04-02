module.exports = function (grunt) {
	grunt.registerMultiTask('xls2json', 'xls2json files.', function () {
		
		var _this = this;
		var done  = _this.async();
		var input_dir       = '../data/';
		var output_dir      = './temp/convert_json/';
		var output_temp_dir = './temp/convert_json_temp/';
		var complete_dir    = './temp/jsData/';
		var xlsjs = require('../../node_modules/xlsjs');
		var xlsx  = require('../../node_modules/xlsx');
		var RJSON = require('../../node_modules/rjson');
		var fs    = require('fs');
		var _     = grunt.util._;
		
		var xlsSheetToJSON = function(sheet_name,raw_data){
			
			// 列のアルファベットを数字に変換
			var alphabet = {A:1,B:2,C:3,D:4,E:5,F:6,G:7,H:8,I:9,J:10,K:11,L:12,M:13,N:14,O:15,P:16,Q:17,R:18,S:19,T:20,U:21,V:22,W:23,X:24,Y:25,Z:26};
			var colToNum = function(str){
				str = str.split("").reverse();
				var num = alphabet[str[0]];
				for(var i=1; i<str.length; i++){
					num += alphabet[str[i]] * 26;
				}
				return num
			}
			
			// 生データから行列番号を追加、整理したデータ作成
			var all_data = _.reduce(raw_data,function(result,data,key){
				var col_str = key.match(/[A-Z]*/)[0];
				var col = colToNum(col_str)
				var row = parseInt( key.replace(col_str,"") );
				data.cell = key;
				data.row = row;
				data.col = col;
				data.col_str = col_str;
				data = _.omit(data,"ixfe");
				if( !result[row] ) result[row] = {};
				result[row][col] = data;
				return result
			},{})
			
			// json作成
			var NAME_COL = 1;
			var KEY_COL  = 2;
			var TYPE_COL = 3;
			var json_data = _.reduce(all_data,function(result,row_data,key){
				if(row_data[1] == undefined || row_data[1].row <= 3) return result;
				var id = row_data[1].v.toString().replace(/\"/g,""); //";
				
				result[id] = _.reduce(row_data,function(result,col_data){
					// keyがない列は飛ばす
					if(all_data[TYPE_COL][col_data.col] == undefined || all_data[KEY_COL][col_data.col] == undefined) return result
					
					var key = all_data[KEY_COL][col_data.col].v.toString().replace(/\"/g,""); //"
					var type = all_data[TYPE_COL][col_data.col].v.toString().replace(/\"/g,""); //"
					var val = col_data.v.toString().replace(/\"/g,""); //";
					if(type == "int")    val = parseInt(val);
					if(type == "string") val = val.toString();
					
					// key[index] の形だったときに配列化
					var is_array = ( !!key.match(/\[/) )
					if(is_array){
						var index = parseInt( key.match(/\[.*/)[0].replace("[","").replace("]","") );
						key = key.replace(/\[.*/,"");
						if(!result[key]) result[key] = [];
						result[key][index] = val;
					}else{
						result[key] = val;
					}
					
					return result
				},{});
				return result
			},{})
			
			grunt.file.write(output_temp_dir + sheet_name + ".json", JSON.stringify(json_data) )
		}
		
		var xlsToJSON = function(file_name){
			
			// データ用意
			if(file_name.match(".xlsx")){
				ExcelData = xlsx.readFile(input_dir + file_name)
			}else{
				ExcelData = xlsjs.readFile(input_dir + file_name)
			}
			for(var i in ExcelData.SheetNames){
				if(typeof ExcelData.SheetNames[i] == "string" && !ExcelData.SheetNames[i].match(/[^0-9a-zA-Z\ \_\-\+\,\~\=\!\{\}\[\]]/) ){
					sheet_name = ExcelData.SheetNames[i];
					sheet = ExcelData.Sheets[sheet_name]
					range = sheet["!ref"]
					sheet = _.omit(sheet,"!range");
					sheet = _.omit(sheet,"!ref");
					xlsSheetToJSON(sheet_name,sheet)
				}
			}
		}
		
		var convertXlsToJSON = function(){
			var start_time = Date.now();
			grunt.file.recurse(input_dir, function(file_path, dir, nazo, file_name){
				if( !file_name.match(/\.xls/) ) return
				console.log("convert: " + file_name)
				xlsToJSON(file_name)
			})
			console.log( (Date.now() - start_time)/1000 + "秒" )
		}
		
		////////////////////////////////////////////////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////////////////////////////////////////////////
		// ここからjsonの各種加工
		////////////////////////////////////////////////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////////////////////////////////////////////////
		
		var makeDefine = function(main){
			// Define.jsonを加工する
			var define_data = grunt.file.readJSON(output_temp_dir + "Define.json");
			var define_json = {};
			for(var i in define_data){
				if(/^\/\//.test(define_data[i].id)){
					// 先頭が//で始まるものは除外
				}else if(define_data[i].type == "int"){
					define_json[i] = (define_data[i].value).toNumber();
				}else{
					define_json[i] = define_data[i].value;
				}
			}
			
			//json_temp_pathにあるjsonの中から、defineという名前がついているものを回収する
			var define_json_2 = {};
			grunt.file.recurse(output_temp_dir, function(file_path, dir, nazo, file_name){
				if( !file_name.match(/\.json/) ) return
				var data_obj = grunt.file.readJSON(file_path);
				data_obj = _.reduce(data_obj,function(result,data,id){
					if(_.has(data,"define")){
						if(!_.isNaN(id.toNumber())){
							if(data.define != "-" && data.define != "" && data.define != null && data.define != undefined ){
								result[data.define] = id.toNumber();
							}
						}
					}
					return result
				},{});
				_.extend(define_json_2,data_obj)
			})
			
			//合成して保存。Define.jsonは削除
			_.extend(define_json, define_json_2)
			var define_json_str = "var df=" + JSON.stringify(define_json) + ";\n";
			grunt.file.write(complete_dir + "Define.js", define_json_str );
			grunt.file.delete(output_dir + "Define.json", {force:true})
		}
		
		var processing = function(){
			
			//CaveScratchDataAll作成
				//既存のCaveScratchData_*を削除
				grunt.file.recurse(output_dir, function(file_path, dir, nazo, file_name){
					if( !file_name.match(/CaveScratchData_/) ) return
					grunt.file.delete(file_path, {force:true})
				})
				
				//CaveScratchData_*をマージ
				var scratch_all = {};
				grunt.file.recurse(output_temp_dir, function(file_path, dir, nazo, file_name){
					if( !file_name.match(/CaveScratchData_/) ) return
					var data = grunt.file.readJSON(file_path);
					    data = _.groupBy(data,function(n){ return n.group });
					_.extend(scratch_all,data);
				})
				
				//圧縮
				var scratch_min = {};
				for(var i in scratch_all){
					scratch_min[i] = [];
					for(j in scratch_all[i]){
						scratch_min[i][j] = [];
						scratch_min[i][j][0] = scratch_all[i][j].rate;
						scratch_min[i][j][1] = scratch_all[i][j].event_type;
						scratch_min[i][j][2] = scratch_all[i][j].event_data;
					}
				}
				
				grunt.file.write(output_dir + "CaveScratchDataMin.json", JSON.stringify(scratch_min) )
				
			//AdventureDataを加工
				var dataJson = grunt.file.readJSON(output_temp_dir + "AdventureData.json");
				dataJson = _.groupBy(dataJson,function(data){ return data.group });
				dataJson = _.reduce(dataJson,function(result,data,n){
					result[n] = {};
					for(i in data){
						result[n][data[i].sequence_id] = data[i];
					}
					return result
				},{})
				//圧縮
				_.each(dataJson,function(data1,n){
					_.each(data1,function(data2,n){
						data1[n] = [
							data2["id"         ],
							data2["group"      ],
							data2["sequence_id"],
							data2["next_id"    ],
							data2["spped"      ],
							data2["end_fnction"],
							data2["start_fx"   ],
							data2["end_fx"     ],
							data2["root_select"],
							data2["root_next"  ],
							data2["chara_id"   ],
							data2["chara_gra"  ],
							data2["activity"   ],
							data2["position"   ],
							data2["message"    ],
						];
					})
				})
				
				grunt.file.write(output_dir + "AdventureData.json", JSON.stringify(dataJson) )
				
			//RJSON作成
				var json_list = "CardSkillData.json,CardData.json,CardSeedData.json".split(",");
				_.each(json_list,function(file_name){
					var dataJson = grunt.file.readJSON(output_temp_dir + file_name);
					    dataJson = RJSON.pack(dataJson);
					var rjson_file_name = file_name.replace(".json","RJSON.json");
					grunt.file.write(output_dir + rjson_file_name, JSON.stringify(dataJson) )
					grunt.file.delete(output_dir + file_name, {force:true})
				})
		}
		
		var createAllJson = function(){
			var alljson = {};
			grunt.file.recurse(output_dir, function(file_path, dir, nazo, file_name){
				if( !file_name.match(/\.json/) ) return
				var data = grunt.file.readJSON(file_path);
				alljson[ file_name.replace(".json","") ] = data;
			})
			var all_json_str = "var st=" + JSON.stringify(alljson) + ";\n";
			grunt.file.write(complete_dir + "alljson.js", all_json_str );
		}
		
		
		////////////////////////////////////////////////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////////////////////////////////////////////////
		// とりあえずベタコピー
		////////////////////////////////////////////////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////////////////////////////////////////////////
		
		// 1 jsonフォルダーを一旦削除
		var deleteWithoutKeep = function(file_path){
			if(file_path.lastIndexOf(".gitkeep") > 0) return;
			grunt.file.delete(file_path, {force:true});
		}
		grunt.file.recurse(output_temp_dir, deleteWithoutKeep)
		grunt.file.recurse(output_dir     , deleteWithoutKeep)
		
		// excelコンバート実行
		convertXlsToJSON();
		
		// tempからコピー。CaveMapPeaceData.jsonもここでコピー。
		grunt.file.recurse(input_dir, function(file_path, dir, nazo, file_name){
			if( !file_name.match(/\.json/) ) return
			var json_data = eval( '('+ grunt.file.read(file_path) +')' );
			grunt.file.write(output_temp_dir + file_name, JSON.stringify(json_data) )
		})
		grunt.file.recurse(output_temp_dir, function(file_path, dir, nazo, file_name){
			if( !file_name.match(/\.json/) ) return
			grunt.file.copy(file_path, output_dir + file_name);
		})
		
		// 2 Define.jsを作成。Define.jsonを削除。
		makeDefine();
		
		// 3 tempから改造したものをjsonフォルダーへ
		processing();
		
		// 4 Jsonフォルダー内のファイルでAllJson作成
		createAllJson();
		
		// 5 最後に"../grunt & grunt concat:jsData"を行う
		done();
	});
};
