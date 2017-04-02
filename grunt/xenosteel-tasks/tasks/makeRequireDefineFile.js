module.exports = function (grunt) {
	
	grunt.registerMultiTask('makeRequireDefineFile', 'sample task', function () {
		
		var defines = "";
		var folders = ["collections","controllers","models","views"];
		
		for(j in folders){
			var files  = grunt.file.expand("../src/js/" + folders[j] + "/*.js");
			for(i in files){
				var pieces = files[i].split("/");
				var filename = pieces[pieces.length - 1].replace(/\.js$/ , '');
				defines += "'" + folders[j] + "/" + filename + "',\n";
			}
		}
		defines = "require([\n" + defines + "],function(){});";
		console.log(defines)
		
		grunt.file.write( "./temp/require.define/require.define.js",defines);
		
	});
	
};