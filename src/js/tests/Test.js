define([
	"../../../webview/js/tests/TestSampleJasmine",
	"../../../webview/js/tests/TestQuest",
""],function(TestSampleJasmine,TestQuest){

Test = {
	
	index : function(){
		$("#device_display").remove();
		$("body").append( __.template("test_index") );
	},
	
	sampleJasmine : function(){
		var test = Object.create(TestSampleJasmine);
		var specHelper = new test.SpecHelper();
		var playerSpec = new test.PlayerSpec();
		Test.run();
	},
	modelQuest : function(){
		var test = new TestQuest();
		test.run();
		Test.run();
	},
	
	run : function(){
		
		var jasmineEnv = jasmine.getEnv();
		jasmineEnv.updateInterval = 1000;
		
		var htmlReporter = new jasmine.HtmlReporter();
		
		jasmineEnv.addReporter(htmlReporter);
		
		jasmineEnv.specFilter = function(spec) {
			return htmlReporter.specFilter(spec);
		};
		
		/*
		var currentWindowOnload = window.onload;
		
		window.onload = function() {
			if (currentWindowOnload) {
				currentWindowOnload();
			}
			execJasmine();
		};
		
		function execJasmine() {
			jasmineEnv.execute();
		}
		*/
		
		jasmineEnv.execute();
	},
	
	
	end:{}};
	
return Test;

})

