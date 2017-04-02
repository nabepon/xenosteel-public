module.exports = function (grunt) {
	grunt.registerMultiTask('lapApp', 'sample task', function () {
		var str = grunt.file.read("../app/src/App.js");
		str = "(function(window){\n var undefined = void 0; \n" + str + "})(window);"
		grunt.file.write("../app/src/App.js", str );
	});
};