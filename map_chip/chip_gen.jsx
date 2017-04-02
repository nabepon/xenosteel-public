

var is_wall    = 1;
var map_id     = 4;
var chip_size  = 120;
var base_dir   = "E:/hobby/xeno/tools/map_chip"
var input_dir  = base_dir + "/chip/" + map_id + "/";
var output_dir = base_dir + "/output/" + map_id + "/";

/*
* 重ねる順版 壁
* [ , , , ,1, , , , ];
* [ ,2, ,3, ,4, ,5, ];
* [6, ,7, , , ,8, ,9];
* 
* 重ねる順版 床
* [  ,  ,  ,  , 1,  ,  ,  ,  ];
* [ 2,  , 3,  ,  ,  , 4,  , 5];
* [  , 6,  , 7,  , 8,  , 9,  ];
* [10,  ,11,  ,  ,  ,12,  ,13];
*/

var map_data = (is_wall) ? getWallData() : getFloorSubData(); 
var file_list  = ["100000000","010000000","001000000","000100000","000010000","000001000","000000100","000000010","000000001"];
var file_list2 = ["200000000","020000000","002000000","000200000","000020000","000002000","000000200","000000020","000000002"];
var priority_data = (is_wall) ? [4,1,3,5,7,0,2,6,8] : [4,0,2,6,8,1,3,5,7,   0,2,6,8];

for(var i=0;i<map_data.length;i++){
	var docObj = app.documents.add(chip_size,chip_size);
	var map_list = map_data[i].split("");
	
	for(var k=0;k<priority_data.length;k++){
		var j = priority_data[k];
		if(map_list[j] > 0){
			if(map_list[j] == 1){ fileObj = new File( input_dir + file_list[j] + ".png" ); }
			if(map_list[j] == 2){ fileObj = new File( input_dir + file_list2[j] + ".png" ); }
			
			open(fileObj);
			activeDocument.selection.selectAll();
			activeDocument.activeLayer.copy();
			activeDocument.close(SaveOptions.DONOTSAVECHANGES);
			docObj.paste();
		}
	}
	//背景を透明にする
	docObj = activeDocument.artLayers;
	docObj[docObj.length-1].opacity = 0;
	
	if(is_wall){
		saveFile( map_data[i].replace(/2/g,"1") );
	}else{
		saveFile( map_data[i] );
	}
}

/*************************************************************************************/

function saveFile(file_name){
	folderObj = new Folder(output_dir);
	if (folderObj.exists == false){
		folderObj.create();
	}
	
	fileObj = new File(output_dir + file_name + ".png");
	pngOpt = new PNGSaveOptions();
	pngOpt.interlaced = false;
	activeDocument.saveAs(fileObj, pngOpt, true, Extension.LOWERCASE);
	activeDocument.close(SaveOptions.DONOTSAVECHANGES);
}

function getWallData(){
	return [
		'000010000',
		'200010000',
		'002010000',
		'000010200',
		'000010002',
		'202010000',
		'200010200',
		'200010002',
		'002010200',
		'002010002',
		'000010102',
		'202010200',
		'202010002',
		'200010202',
		'002010202',
		'202010202',
		'010010000',
		'010010200',
		'010010002',
		'010010202',
		'000011000',
		'200011000',
		'000011200',
		'200011200',
		'000010010',
		'200010010',
		'002010010',
		'202010010',
		'000110000',
		'002110000',
		'000110002',
		'002110002',
		'010010010',
		'000111000',
		'110110110',
		'011011011',
		'000111111',
		'111111000',
		'111111111',
		'110110000',
		'000110110',
		'110110002',
		'002110110',
		'011011000',
		'000011011',
		'011011100',
		'200011011',
	];
}

function getFloorSubData(){
	return [
		'000000000',
		'100000000',
		'001000000',
		'000000100',
		'000000001',
		'101000000',
		'100000100',
		'100000001',
		'001000100',
		'001000001',
		'000000101',
		'101000100',
		'101000001',
		'100000101',
		'001000101',
		'101000101',
		'010000000',
		'010000100',
		'010000001',
		'010000101',
		'000001000',
		'100001000',
		'000001100',
		'100001100',
		'000000010',
		'100000010',
		'001000010',
		'101000010',
		'000100000',
		'001100000',
		'000100001',
		'001100001',
		'010000010',
		'000101000',
		'210100210',
		'012001012',
		'000101212',
		'212101000',
		'212101212',
		'210100000',
		'000100210',
		'210100001',
		'001100210',
		'012001000',
		'000001012',
		'012001100',
		'100001012',
	];
}

/*
チップパターンメモ

□□□ 000010000
□□□ 000000000
□□□ 

■□□ □□■ □□□ □□□ 200010000 002010000 000010200 000010002 
□□□ □□□ □□□ □□□ 100000000 001000000 000000100 000000001
□□□ □□□ ■□□ □□■ 

■□■ ■□□ ■□□ 202010000 200010200 200010002
□□□ □□□ □□□ 101000000 100000100 100000001
□□□ ■□□ □□■ 

□□■ □□■ 002010200 002010002
□□□ □□□ 001000100 001000001
■□□ □□■ 

□□□ 000010102
□□□ 000000101
■□■ 

■□■ ■□■ ■□□ □□■ 202010200 202010002 200010202 002010202
□□□ □□□ □□□ □□□ 101000100 101000001 100000101 001000101
■□□ □□■ ■□■ ■□■ 

■□■ 202010202
□□□ 101000101
■□■ 

■■■ ■■■ ■■■ ■■■ 010010000 010010200 010010002 010010202
□□□ □□□ □□□ □□□ 010000000 010000100 010000001 010000101
□□□ ■□□ □□■ ■□■ 

□□■ ■□■ □□■ ■□■ 000011000 200011000 000011200 200011200
□□■ □□■ □□■ □□■ 000001000 100001000 000001100 100001100
□□■ □□■ ■□■ ■□■ 

□□□ ■□□ □□■ ■□■ 000010010 200010010 002010010 202010010
□□□ □□□ □□□ □□□ 000000010 100000010 001000010 101000010
■■■ ■■■ ■■■ ■■■ 

■□□ ■□■ ■□□ ■□■ 000110000 002110000 000110002 002110002
■□□ ■□□ ■□□ ■□□ 000100000 001100000 000100001 001100001
■□□ ■□□ ■□■ ■□■ 

■■■ ■□■ ■■■ ■■■ ■□■ ■■■ ■■■ 010010010 000111000 110110110 011011011 000111111 111111000 111111111
□□□ ■□■ ■□□ □□■ ■□■ ■□■ ■□■ 010000010 000101000 210100210 012001012 000101212 212101000 212101212
■■■ ■□■ ■■■ ■■■ ■■■ ■□■ ■■■ 

■■■ ■□□ ■■■ ■□■ 110110000 000110110 110110002 002110110
■□□ ■□□ ■□□ ■□□ 210100000 000100210 210100001 001100210
■□□ ■■■ ■□■ ■■■ 

■■■ □□■ ■■■ ■□■ 011011000 000011011 011011100 200011011
□□■ □□■ □□■ □□■ 012001000 000001012 012001100 100001012
□□■ ■■■ ■□■ ■■■ 

*/

