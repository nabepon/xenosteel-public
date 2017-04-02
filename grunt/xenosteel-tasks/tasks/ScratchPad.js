
module.exports = function (grunt) {
	grunt.registerMultiTask('ScratchPad', 'sample task', function () {
		var text = "(function(){ window.scratch_pad_data = " +Date.now()+ " })()"
		grunt.file.write("../src/sample/ScratchPad/ScratchPadData.js", text );
	});
};