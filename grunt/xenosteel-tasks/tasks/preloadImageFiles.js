module.exports = function (grunt) {
	
	grunt.registerMultiTask('preloadImageFiles', 'sample task', function () {
		
		var img_path = "../src/img/ui/"
		var str = "var preloadImageFiles =[\n"
		var files  = grunt.file.expand( img_path + "btn/*");
		for(i in files){
			var pieces = files[i].split("/");
			var filename = pieces[pieces.length - 1];
			str += "'btn/" + filename + "',\n";
		}
		
		var images = [
			"card_ui/card_detail_bg.png",
			"card_ui/card_detail_status.png",
			"card_ui/card_container_bg_1.png",
			"card_ui/card_container_bg_2.png",
			"card_ui/card_container_bg_3.png",
			"common/cmn_win_010.png",
			"common/cmn_win_010_content.png",
			"common/cmn_win_010_title.png",
			"common/generic_bg_1.png",
			"common/indicator.png",
			"common/list_bg_1.jpg",
			"common/map.jpg",
			"mypage/mypage_bg.png",
		]
		for(i in images){
			str += "'" + images[i] +"',\n";
		}
		str += "]";
		
		grunt.file.write( "./temp/preloadImageFiles/preloadImageFiles.js",str);
		//grunt.file.write( "../src/data/preloadImageFiles.js",str);
		
	});
	
};