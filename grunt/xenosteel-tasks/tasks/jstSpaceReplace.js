module.exports = function (grunt) {
	
	grunt.registerMultiTask('jstSpaceReplace', 'sample task', function () {
		//_macro*ファイルをmacroごとに分割
		var files = grunt.file.expand("../src/js/templates/_macro*");
		for(i in files){
			if( grunt.file.isFile(files[i]) && /\.jst/.test(files[i]) ){
				var str = grunt.file.read( files[i] );
				str = str.replace(/\r/g,"").replace(/\n/g,"").replace(/\t/g,"");
				for(;;){
					if( (/<macro/).test(str) ){
						macro         = str.match(/(.+?)<\/macro>/);
						macro_name    = macro[0].match(/id="[^\"]*/)[0].replace(/id=\"/,"").replace(/$/,""); //"コメントをコメント
						macro_content = macro[0].replace(/[^>]*./,"").replace(/<\/macro>/,"");
						grunt.file.write("./temp/underscore_template_macro/" + macro_name +".jst" , macro_content);
						str = str.replace(/(.+?)<\/macro>/,"");
					}else{
						break
					}
				}
			}
		}
		
		var files = grunt.file.expand("./temp/underscore_template/*");
		for(i in files){
			grunt.file.delete(files[i],{force: true});
		}
		
		var folders = grunt.file.expand("../src/js/templates/*/");
		folders.push("../src/js/templates/")
		for(i in folders){
			var files  = grunt.file.expand(folders[i] + "*.jst");
			var foldername = folders[i].replace("../src/js/templates/","");
			
			for(i in files){
				var filename = files[i].replace("../src/js/templates/","");
				var str = grunt.file.read(files[i]);
				    str = str.replace(/\r/g,"").replace(/\n/g,"").replace(/\t/g,"");
				grunt.file.write( "./temp/underscore_template/" + filename.replace("/",".") , str );
			}
		}
	});
	
};