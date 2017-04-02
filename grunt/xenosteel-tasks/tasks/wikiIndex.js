module.exports = function (grunt) {
	grunt.registerMultiTask('wikiIndex', 'sample task', function () {
		var file_list = [];
		grunt.file.recurse("../doc/wiki/",function(absPath,rootPath,filePath,fileName){
			console.log(filePath)
			if(!/\.hg/.test(absPath)){
				console.log(absPath)
				var linkpath = filePath + "/" + fileName;
				if(filePath == undefined){ linkpath = fileName; }
				file_list.push([linkpath,fileName])
			}
		})
		var file_str = "File Index\n==================  \n";
		for(i in file_list){
			file_str += "["+ file_list[i][0].replace(".md","") +"]("+file_list[i][0] + ")  \n";
		}
		grunt.file.write("../doc/wiki/" + "Home.md", file_str );
		
	});
};