module.exports = function (grunt) {
	grunt.registerMultiTask('xeno_gzip', 'Compress files.', function () {
		var zlib = require('zlib');
		var fs = require('fs');
		var file_list = this.filesSrc;
		var toGzip = function(file){
			var gzip = zlib.createGzip();
			var inp = fs.createReadStream(file);
			var out = fs.createWriteStream(file + '.gz');
			inp.pipe(gzip).pipe(out);
			console.log("created " + file + ".gz");
		};
		for(var i in file_list) toGzip(file_list[i]);
	});
};