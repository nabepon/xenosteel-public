define(["models/PcREC","models/TwitterREC"],function(PcREC,TwitterREC){
	
	var Twitter = Backbone.Model.extend({
		initialize:function(option){
			console.log("Twitter#initialize");
			this.rec = new TwitterREC;
			this.api = {
				requestToken  : "https://api.twitter.com/oauth/request_token",
				authorize     : "https://api.twitter.com/oauth/authorize",
				accessToken   : "https://api.twitter.com/oauth/access_token",
				postTweet     : "https://api.twitter.com/1.1/statuses/update.json",
				getTweet      : "https://api.twitter.com/1.1/statuses/show.json?id=", // user_idではなく、tweetのid
				verify        : "https://api.twitter.com/1.1/account/verify_credentials.json?skip_status=true",
				follow        : "https://api.twitter.com/1.1/friendships/create.json?user_id=xxxxxxxxx",
				officialTL    : "https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=nabepon_dev&count=10&callback=callbackGetOfficialTL",
			};
			this.messages = {
				finish:"ツイートしました",
				failed:"ツイートできませんでした",
				cancel:"ツイートキャンセルしました",
				exit  :"キャンセルしました",
			},
			
			this.initializeOauth();
		},
		initializeOauth:function(){
			this.oauth_options = {
				//enablePrivilege: false,
				consumerKey     : '',
				consumerSecret  : '',
				callbackUrl     : "https://twitter.com/",
			};
			this.oauth = OAuth(this.oauth_options);
		},
		getOfficialTL:function(){
			var _this = this;
			this.oauth.setAccessToken(this.rec.get("token_set"))
			this.oauth.get(
				_this.api.officialTL,
				// todo: エラー処理をちゃんとやる（成功時、失敗時の両方）
				function(data){
					var callbackGetOfficialTL = function(data){
						console.log("TwitterREC#callbackGetOfficialTL.Success",data);
						_this.trigger("getOfficialTL",data);
					};
					eval(data.text);
				},
				function(data){
					console.log("TwitterREC#callbackGetOfficialTL.Fail",data);
				}
			);
		},
		getTweet:function(id_str,success,fail){
			if(typeof id_str != "string"){ throw "twitter_id is not string"; }
			this.oauth.get(
				this.api.getTweet + id_str,
				function(data){
					if(typeof success == "function"){
						success( JSON.parse(data.text) )
					}
				},
				function(data){
					if(typeof fail == "function"){
						fail( JSON.parse(data.text) )
					}
				}
			);
		},
		testGet:function(api){
			this.oauth.setAccessToken(this.rec.get("token_set"))
			console.log("TwitterREC#testGet",api);
			this.oauth.get(
				api,
				function(data){ console.log("TwitterREC#testApi.Success",data); },
				function(data){ console.log("TwitterREC#testApi.Fail",data); }
			);
		},
		testPost:function(api){
			this.oauth.setAccessToken(this.rec.get("token_set"))
			console.log("TwitterREC#testPost",api);
			this.oauth.post(
				api,
				function(data){ console.log("TwitterREC#testPost.Success",data); },
				function(data){ console.log("TwitterREC#testPost.Fail",data); }
			);
		},
		postLogger: function(data){
			var post_log = this.rec.get("post_log");
			post_log[data.id_str] = { id: data.id_str, date: __.baseTime() };
			var new_logs = _.omit(post_log,function(log){ return log.date < (__.baseTime() - 1*24*60*60*1000) });
			console.log("TwitterREC#postLogger",new_logs);
			this.rec.set("post_log",new_logs);
		},
		oauthAndPost: function(api_type,text){
			this.post(text, this.api[api_type]);
		},
		//post:function(tweet_text,ret_data,retry){
		post:function(tweet_text,api){
			console.log("TwitterREC#post")
			var _this = this;
			var do_api = (api)? api: _this.api.postTweet;
			this.initializeOauth();
			this.oauth.setAccessToken(this.rec.get("token_set"))
			
			//投稿開始
			_this.oauth.post( do_api, {status: tweet_text + __.baseTime() },
				
				//成功
				function(data) {
					var data_json = JSON.parse(data.text);
					console.log("TwitterREC#post oauth.post success", data_json);
					if(do_api == _this.api.postTweet) _this.postLogger(data_json);
					_this.rec.set("is_connected",true).save();
					_this.tweetFinish(data_json);
				},
				
				//失敗
				function(data) {
					var data_json = JSON.parse(data.text);
					console.log("TwitterREC#post oauth.post failed", data_json);
					var error_code = data_json.errors[0].code;
					
					//アカウントが有効かチェック
					_this.oauth.get( _this.api.verify,
						
						//アカウントが有効で投稿できないのは原因が絞れないのでエラーを返して終了
						function(data) {
							console.log("TwitterREC#post oauth.post failed but verify success");
							alert(_this.getErrorText(error_code).msg)
							_this.tweetFailed(data_json);
						},
						
						//アカウントが有効でないならOAuth認証を開始
						function(data) {
							console.log("TwitterREC#post oauth.post failed and verify fail because oauth start");
							var $dfd = $.Deferred();
							_this.oauthStart($dfd)
							
							//認証成功したらもう一度postを試す
							$dfd.done(function(){
								console.log("TwitterREC#oauth.get verify success done")
								_this.oauth.post(
									do_api,
									{status: tweet_text + __.baseTime() },
									
									//成功
									function(data) {
										var data_json = JSON.parse(data.text);
										console.log("TwitterREC#post retry success", data_json);
										if(do_api == _this.api.postTweet) _this.postLogger(data_json);
										_this.rec.set("is_connected",true).save();
										_this.tweetFinish(data_json);
									},
									
									//それでも失敗したら原因が絞れないのでエラーを返して終了
									function(data){
										var data_json = JSON.parse(data.text);
										console.log("TwitterREC#post retry failed but verify success", data_json);
										var error_code = data_json.errors[0].code;
										alert(_this.getErrorText(error_code).msg)
										_this.tweetFailed(data_json);
									}
								)
							})
							
							//認証に失敗したらエラーを返して終了
							$dfd.fail(function(code){
								console.debug("TwitterREC#oauth.get verify fail", code);
								_this.tweetFailed(code);
							})
						}
					)
				}
			)
		},
		oauthStart:function($dfd){
			console.log("TwitterREC#oauthStart");
			
			if($dfd == undefined){ $dfd = $.Deferred(); }
			var _this = this;
			var paramToJson = this.paramToJson;
			var to = {}; //TwitterOAuth
			to.$childWindowDfd = { resolve:function(){}, reject:function(){} }
			
			//requestTokenが成功したとき実行する関数
			to.requestTokenSuccess = function(data) {
				console.log("TwitterREC#oauthStart.requestTokenSuccess",paramToJson(data.text));
				to.requestTokenResponse = data.text;
				
				//子windowを開いてLocationの監視を開始
				to.twitterWindow = window.open(_this.api.authorize +"?"+ to.requestTokenResponse ,'_blank','location=no');
				__.childWindowEvent({
					type   :"loadstart", // loadstop,loaderror
					window :to.twitterWindow,
					handler:to.windowLocationChange,
					done   :function(){},
					fail   :function(){},
					exit   :function(){ console.log("TwitterREC#tweetExit"); _this.tweetExit(); },
				})
			}
			
			// locationのcheck
			// oauth_verifierがある画面に遷移したらaccessTokenを取りにいく
			to.oauth_verifier_requested = false;
			to.windowLocationChange = function(loc,$childWindowDfd){
				to.$childWindowDfd = $childWindowDfd;
				console.log("TwitterREC#oauthStart.windowLocationChange",loc.url);
				if(!/twitter\.com\//.test(loc.url)){
					to.$childWindowDfd.reject();
					return
				}
				if(/oauth_verifier/.test(loc.url) && !to.oauth_verifier_requested){
					to.oauth_verifier_requested = true;
					var token_url = _this.api.accessToken + "?oauth_verifier=" + paramToJson(loc.url).oauth_verifier + '&' + to.requestTokenResponse
					_this.oauth.get(
						token_url,
						//function(data){ to.accessTokenSuccess(data,$winDfd) },
						//function(data){ to.accessTokenFail(data,$winDfd); }
						to.accessTokenSuccess,
						to.oauthFail
					);
				}
			}
			
			//accessTokenが成功したとき実行する関数
			//to.accessTokenSuccess = function(data,$winDfd) {
			to.accessTokenSuccess = function(data) {
				var token_data = paramToJson(data.text);
				_this.rec.set("token_data", token_data );
				_this.rec.set("token_set", [token_data.oauth_token,token_data.oauth_token_secret] );
				_this.oauth.setAccessToken( _this.rec.get("token_set") );
				
				// ユーザーの有効性チェックと情報とる
				// setするとgetできるようになる
				_this.oauth.get(
					_this.api.verify,
					function(data) {
						var data_json = JSON.parse(data.text)
						console.log("TwitterREC#accessTokenSuccess",data_json);
						_this.rec.set("screen_name",data_json.screen_name)
						_this.rec.save();
						to.$childWindowDfd.resolve();
						$dfd.resolve();
					},
					to.oauthFail
				);
			};
			
			//accessTokenが失敗したとき実行する関数
			to.oauthFail = function(data) { 
				console.log("TwitterREC#oauthFail",data);
				to.$childWindowDfd.reject(data);
				$dfd.reject(data);
			};
			
			//requestToken開始
			this.initializeOauth();
			this.oauth.get(_this.api.requestToken, to.requestTokenSuccess, to.oauthFail );
		},
		paramToJson:function(url){
			url = _.unescape(url);
			var param_json = {};
			var param_str  = url.substr(url.indexOf('?') + 1);
			var params     = param_str.split('&');
			for (var i=0;i<params.length;i++) {
				var data = params[i].split('=');
				param_json[data[0]] = data[1];
			}
			return param_json;
		},
		getErrorText:function(code){
			var msg = "";
			var go_oauth = 0;
			switch (code){
				case  32: go_oauth = 1; msg = "認証に失敗しました"; break;
				case  34: go_oauth = 0; msg = "指定されたAPIは存在しません"; break;
				case  67: go_oauth = 0; msg = "Twitterのバックエンドシステムが落ちています"; break;
				case  68: go_oauth = 0; msg = "廃止されたTwitter API 1.0を呼んでいます"; break;
				case  88: go_oauth = 0; msg = "API の利用回数制限に達しました"; break;
				case  89: go_oauth = 1; msg = "token が正しくありません"; break;
				case  93: go_oauth = 0; msg = "許可されていないダイレクトメッセージアクセスしようとしています"; break;
				case  99: go_oauth = 1; msg = "Token の認証に失敗しています"; break;
				case 130: go_oauth = 0; msg = "Twitter のシステムが限界に達しています"; break;
				case 131: go_oauth = 0; msg = "Twitter のシステムの原因不明の内部エラーが発生しました"; break;
				case 135: go_oauth = 1; msg = "認証に失敗しています"; break;
				case 150: go_oauth = 0; msg = "メッセージ指定のツイートができません。 ツイートの頭の文を変えましょう。"; break;
				case 185: go_oauth = 0; msg = "1日のツイート数制限に達しました"; break;
				case 186: go_oauth = 0; msg = "ツイートが 140 文字を超えています"; break;
				case 187: go_oauth = 0; msg = "重複ツイートしようとしています"; break;
				case 188: go_oauth = 0; msg = "ツイートに含まれるリンク先が不正サイトと判定されています"; break;
				case 189: go_oauth = 1; msg = "原因不明のエラーが発生しました"; break;
				case 190: go_oauth = 0; msg = "url付きツイートが長すぎます。"; break;
				case 191: go_oauth = 0; msg = "画像アップロード数の制限に達しました"; break;
				case 215: go_oauth = 1; msg = "認証に失敗しました"; break;
				case 220: go_oauth = 0; msg = "許可されていないAPIが呼ばれました"; break;
				default:  go_oauth = 1; msg = "原因不明のエラーが発生しました" ; break;
			}
			return {
				msg:msg,
				go_oauth:go_oauth,
			}
		},
		
		
		tweetFinish: function(){
			App.views.indicator.hide()
			App.popup.message({message: this.messages.finish })
		},
		tweetFailed: function(){
			App.views.indicator.hide()
			App.popup.message({message: this.messages.failed })
		},
		tweetCancel: function(){
			App.views.indicator.hide()
			App.popup.message({message: this.messages.cancel })
		},
		tweetExit: function(){
			App.views.indicator.hide()
			App.popup.message({message: this.messages.exit })
			this.rec.set("is_connected",false).save();
		},
		checkConnection: function(){
			if(!__.info.is_phonegap){ return false }
			if( navigator.connection.type == Connection.UNKNOWN || navigator.connection.type == Connection.NONE){
				App.popup.message({message:"通信できませんでした<br/>通信環境のいい場所でご利用ください"})
				return true
			}
			return false
		},
		tweet: function(tweet_msg){
			if(this.checkConnection()) return
			App.views.indicator.show();
			this.post(tweet_msg);
		},
		follow: function(){
			if(this.checkConnection()) return
			App.views.indicator.show();
			this.oauthAndPost("follow");
		},
		
		
		
	});
	
return Twitter;

});
