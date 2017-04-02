
//-- module.exports -----------------------------------------------------------------------------------------

module.exports = function (grunt) {

var os = require("os");
var _ = grunt.util._;
var interfaces = _.values(os.networkInterfaces())[0];
var host_ip = _.find(interfaces,function(data){ return data.family == 'IPv4'; }).address;

grunt.initConfig({

// package.jsonの情報を読み込み
// ----------------------------------
	pkg : grunt.file.readJSON('package.json'), 
	
// CSS
// ----------------------------------
	
	compass:{
		options: {
			sassDir   : '../src/css',
			cssDir    : '../src/css/stylesheets',
			imagesDir : '../app/img',
			force     : true,
			httpPath  : './',
			time      : true,
		},
		dev:{
			options: {
				debugInfo : true,
				outpuStyle: 'expanded',
			}
		},
		dist:{
			options: {
				outpuStyle: 'compressed',
			}
		}
	},
	
// javascript関連
// ----------------------------------
	
	requirejs:{
		options:{
			baseUrl: '../src/js',
			paths: {
				//testsの下はrequire.jsで非同期読み込みするため不要
				require_define : '../../grunt/temp/require.define/require.define',
				AppUtil        : '../../src/js/AppUtil',
				Debug          : '../../src/js/Debug',
				AppWakeup      : '../../src/js/AppWakeup',
			},
			out:'../app/src/App.js',
			include: ['require_define','AppWakeup'],
			useStrict: true,
		},
		dev:{
			options:{
				optimize: 'none',
				done:function(done,output){
					var str = grunt.file.read("../app/src/App.js");
					str = "(function(window){ \n \n var undefined = void 0; \n" + str + "})(window);"
					//str = "(function(window){ \n\n var undefined = void 0; \n" + str + "})(window);"
					grunt.file.write("../app/src/App.js", str );
					done();
				},
			}
		},
		dist:{
			options:{
				done:function(done,output){
					var str = grunt.file.read("../app/src/App.js");
					// リリース時はvar console = window.console;を足す
					str = "(function(window){ \n \n var console = window.console; var undefined = void 0; \n" + str + "})(window);"
					//str = "(function(window){ \n\n var console = window.console; var undefined = void 0; \n" + str + "})(window);"
					grunt.file.write("../app/src/App.js", str );
					done();
				},
			}
		}
	},
	
	uglify: {
		dev: {
			files: {
			}
		},
		dist: {
			files: {
			'../app/src/Data.js': ['../app/src/Data.js'],
			'../app/src/Main.js': ['../app/src/Main.js'],
			'../app/src/App.js' : ['../app/src/App.js' ],
			'../app/src/Libs.js': ['../app/src/Libs.js'],
			}
		}
	},
	
// その他
// ----------------------------------
	
	concat :{
		css:{
			src: ['../src/css/stylesheets/*.css'],
			dest: '../app/src/Style.css'
		},
		jsLibs:{ //スタンドアローン構成
			src: [
				"../src/lib/jquery-2.1.3.min.js",
				"../src/lib/jquery.easing.1.3.js",
				"../src/lib/nabepon/jquery.fasttap.js",
				"../src/lib/nabepon/jChrono.js",
				
				"../src/lib/json2.js",
				"../src/lib/moment.min.js",
				"../src/lib/sugar-1.4.1-custom.min.js", //ArrayとDateを除いたもの
				"../src/lib/lodash.min.js",
				"../src/lib/backbone-min.js",
				"../src/lib/backbone.localStorage.js",
				"../src/lib/iscroll.js",
				"../src/lib/require.min.js",
				
				"../src/lib/easeljs-NEXT.min.js",   //CreateJS
				"../src/lib/SpriteContainer.js",   //CreateJS
				"../src/lib/SpriteStage.js",   //CreateJS
				
				"../src/lib/preloadjs-0.4.0.min.js", //CreateJS
				"../src/lib/tweenjs-0.5.0.min.js",   //CreateJS
				"../src/lib/jsOAuth-1.3.6.js",
				"../src/lib/nabepon/DeviceInfo.js",
				"../src/lib/rjson.js",
			],
			dest: '../app/src/Libs.js'
		},
		jsDebug:{
			src: [
				"../app/src/Libs.js",
				"../src/lib/beautify.js",
				"../src/lib/HTML-Beautify.js",
			],
			dest: '../app/src/Libs.js'
		},
		jsData:{
			src: [
				"./temp/jsData/Define.js",
				"./temp/jsData/alljson.js",
				"./temp/jsData/env.js",
				"./temp/preloadImageFiles/preloadImageFiles.js",
			],
			dest: '../app/src/Data.js'
		},
		jsMain:{
			src: ['../src/js/Main.js'],
			dest: '../app/src/Main.js'
		},
		jsAppDev:{
			src: [
				'../src/js/AppUtil.js',
				'../src/js/Debug.js',
				'../app/src/App.js',
				'./temp/jst/jst.js',
			],
			dest: '../app/src/App.js'
		},
		jsApp:{
			src: [
				'../src/js/AppUtil.js',
				'../app/src/App.js',
				'./temp/jst/jst.js',
			],
			dest: '../app/src/App.js'
		},
	},
	
	
	jst:{
		create:{
			options:{
				processName:function(filename){
					filename = filename.replace("./temp/underscore_template/","");
					filename = filename.replace("./temp/underscore_template_macro/","_macro/");
					filename = filename.replace(".jst","").replace(".","/");
					return filename
				},
				templateSettings: {
					evaluate    : /<%([\s\S]+?)%>/g,
					interpolate : /<%=([\s\S]+?)%>/g,
					escape      : /<%-([\s\S]+?)%>/g,
					
					evaluate    : /{\%([\s\S]+?)\%}/g,
					interpolate : /\{\{ ([\s\S]+?) \}\}/g,
					escape      : /\{\{\{([\s\S]+?)\}\}\}/g,
				},
				//namespace:"underscore_template"
			},
			files:{
				'./temp/jst/jst.js':[
					'./temp/underscore_template/*.jst',
					'./temp/underscore_template_macro/*.jst',
				],
			},
		},
	},
	
	connect: {
		'localip': {
			options: {
				port: 9000,
				base: '../',
				hostname: host_ip,
				keepalive:true,
				debug:true,
			}
		},
		'localhost': {
			options: {
				port: 9000,
				base: '../',
				hostname: "localhost",
				keepalive:true,
				debug:true,
			}
		},
	},
	
	compress: {
		'all': {
			options: {
				mode: 'gzip',
			},
			files: [{
				expand: true,
				src: ['../app/src/*.js'],
				src: [],
				dest: './',
				ext: '.js'
			},
			{
				expand: true,
				src: ['../app/src/*.css'],
				src: [],
				dest: './',
				ext: '.css'
			}]
		},
	},
	
	watch: {
		compass: {
			files: ['../src/css/*.scss'],
			tasks: ['compass:dev','concat:css','xeno_gzip:all']
		},
		js: {
			files: [
				'../src/js/*.js',
				'../src/js/controllers/*.js',
				'../src/js/models/*.js',
				'../src/js/tests/*.js',
			],
			tasks: ['concat:jsMain','makeRequireDefineFile:dev','requirejs:dev' ,'concat:jsAppDev','lapApp:dev','xeno_gzip:all']
		},
		jst: {
			files: '../src/js/templates/**/*',
			tasks: ['common_task','requirejs:dev' ,'concat:jsAppDev','lapApp:dev','xeno_gzip:all']
		},
		preloadBtn: {
			files: ['../app/img/ui/btn/*'],
			tasks: ['common_task']
		},
		wiki: {
			files: ['../doc/wiki/**/*','!../doc/wiki/Home.md'],
			tasks: ['wikiIndex']
		},
	},

// originalタスク
// ----------------------------------
	xeno_gzip:{
		all:{
			src: [
				'../app/src/*.js',
				'../app/src/*.css'
			],
		}
	},
	xls2json:{dev:{}},
	wikiIndex:{dev:{}},
	jstSpaceReplace:{dev:{}},
	makeRequireDefineFile:{dev: {}}, //"./temp/require.define/require.define.js"を作成する
	preloadImageFiles:{dev: {}}, //"../src/data/preloadImageFiles.js"を作成する
	lapApp:{dev: {}},  //"production/App.js"と"temp/jst/jst.js"をつけてfunctionでwrappingする
});


[
'../xenosteel-tasks',
'grunt-contrib',
'grunt-contrib-jasmine',
'grunt-contrib-jst',
'grunt-contrib-sass',
'grunt-contrib-requirejs',
'grunt-ftpush',
'grunt-contrib-connect',
'grunt-contrib-compress',
].forEach(function (name) {
	grunt.loadNpmTasks(name);
});


//grunt.registerTask('default',['XXXXX']);  //"grunt"コマンドで実行するタスクの登録
grunt.registerTask('common_task'  , ['xls2json', 'preloadImageFiles:dev','jstSpaceReplace','jst:create','concat:jsData','concat:jsMain','makeRequireDefineFile:dev']);
grunt.registerTask('build'        , ['common_task','requirejs:dist','concat:jsApp'    ,"lapApp:dev","concat:jsLibs", 'uglify:dist'   ,'compass:dist', "concat:css"]);
grunt.registerTask('default'      , ['common_task','requirejs:dev' ,'concat:jsAppDev' ,"lapApp:dev","concat:jsLibs", 'concat:jsDebug','compass:dev' , "concat:css"]); 

}; //end module.exports();