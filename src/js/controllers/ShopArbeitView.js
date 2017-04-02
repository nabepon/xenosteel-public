define([
	"models/PcREC",
	"models/ShopREC",
	"models/Twitter",
	"models/PresentREC",
	"controllers/ShopIndexView",
""],function(PcREC,ShopREC,Twitter,PresentREC,ShopIndexView){
	
	var ShopArbeitView = Backbone.View.extend({
		tagName:"div",
		events:{
			"ftap #bug_reports a" :"bugReports",
			"ftap #store_review a":"storeReview",
			"ftap #twitter a"     :"tweetBtn",
		},
		initialize:function(){
			this.pc = new PcREC;
			this.shop = new ShopREC;
			this.present = new PresentREC;
		},
		resetReward: function(){
			//debug用
			this.shop.set("is_reviewed",0);
			this.shop.set("last_review_time",0);
			this.shop.set("last_report_time",0);
			this.shop.set("last_tweet_time",0);
			this.shop.set("last_phrase_time",0);
			this.shop.save();
		},
		alertConnection:function(){
			App.popup.message({message: "通信できませんでした<br/>通信環境のいい場所でご利用ください"})
		},
		checkConnection:function(){
			if(!__.info.is_phonegap){ return false }
			if( navigator.connection.type == Connection.UNKNOWN || navigator.connection.type == Connection.NONE){
				return true
			}
			return false
		},
		getNextReportTime: function(){ return this.shop.get("last_report_time") + 10000000; },
		getNextTweetTime : function(){ return this.shop.get("last_tweet_time") + 10000000; },
		getNextPhraseTime: function(){ return this.shop.get("last_phrase_time") + 10000000; },
		
		//バグ報告ボタン
		bugReports:function(){
			var _this = this;
			if(this.checkConnection()){ this.alertConnection(); return }
			var childView = window.open("index_sub.html#html/Shop/bugReports",'_blank','location=no');
			console.log("ShopArbeitView#bugReports [childView]",childView);
			var changeWindowEvent = function(e,$check){
				if(/bug_report_complete/.test(e.url)){ $check.resolve("complete") }
				if(/bug_report_cancel/.test(e.url)  ){ $check.resolve("cancel") }
				if(/bug_report_failed/.test(e.url)  ){ $check.reject() }
				if(_this.checkConnection()){ $check.reject() }
			}
			__.childWindowEvent({
				type   :"loadstart",
				window :childView,
				handler:changeWindowEvent,
				done   :_.bind(_this.successBugReports,this),
				fail   :function(){ alert("送信に失敗しました\n通信環境のいいところでご利用ください。") },
			})
		},
		successBugReports:function(arg){
			var type = arg[0];
			if(type=="cancel"){
				App.popup.message({message:"キャンセルしました"});
			}
			if(type=="complete"){
				var time = __.baseTime();
				if(time < this.getNextReportTime()){
					App.popup.message({message:"送信しました。<br/>ご協力ありがとうございました。"});
				}else{
					this.present.addSetItem({message:"バグ報告のお礼です", time:time}, df.ITEM_SET_ARBEIT_BUG_REPORT).save();
					this.shop.set("last_report_time",time).save();
					App.popup.message({message:"送信しました。<br/>報酬をプレゼントに送りました。<br/><br/>ご協力ありがとうございました。"});
					this.render().setupView();
				}
			}
		},
		
		//レビューボタン
		storeReview:function(){
			if(this.shop.get("is_reviewed")){ return }
			if(this.checkConnection()){ this.alertConnection(); return }
			//if(this.shop.get("is_reviewed")){ alert("既に報酬を受け取っています"); return }
			if(__.info.is_android) window.open(df.URL_GOOGLEPLAY_APP,'_system');
			if(__.info.is_ios) location.href = df.URL_APPSTORE_APP;
			
			var time = __.baseTime();
			this.present.addSetItem({message:"アプリレビューのお礼です", time:time}, df.ITEM_SET_ARBEIT_REVIEW).save();
			this.shop.set("last_review_time",time).set("is_reviewed",1).save();
			_.delay(_.bind(function(){
				this.render().setupView();
				App.popup.message({message:"アプリレビュー報酬を<br/>プレゼントに送りました。"});
			},this),1000)
		},
		
		//ツイッター関連
		tweetBtn:function(){
			if(__.baseTime() < this.getNextTweetTime()){ return }
			if(this.checkConnection()){ this.alertConnection(); return }
			
			var _this       = this;
			var tweet_msg   = '"深イイ" 探検RPG登場！？\nアイテムでモンスターを捕まえ、\n無限のダンジョンを攻略しよう！\n ' + appenv.twitter_hash_tag + ' code' + __.baseTime().toString().substr(5,5);
			var twitter     = this.createTwitter();
			
			if( twitter.rec.get("is_connected") ){
				var popup = App.popup.confirm({
					title:'ツイート確認',
					yes:{label:"ツイート報酬GET"},
					no:{label:"閉じる"},
					message:'以下の内容でツイートします。<br/><hr/>' + tweet_msg.replace(/\n/g,'<br />') + '<hr/>',
				}).done(function(){ twitter.tweet(tweet_msg) });
			}else{
				var popup = App.popup.confirm({
					title:'ツイート確認',
					yes:{label:"次へ"},
					no:{label:"閉じる"},
					message:'以下の内容でツイートします。<br/><hr/>' + tweet_msg.replace(/\n/g,'<br />') + '<hr/>',
				}).done(function(){
					App.popup.message({
						title:'ツイート確認',
						message:'報酬付与のため連携アプリ認証を行います<br/>報酬付与以外の目的には使用しません'
					}).done(function(){ twitter.tweet(tweet_msg) })
				});
			}
		},
		createTwitter: function(){
			var _this = this;
			var twitter = new Twitter;
			twitter.tweetFinish = function(){
				App.views.indicator.hide()
				var time = __.baseTime();
				_this.present.addSetItem({message:"ツイート報酬です", time:time}, df.ITEM_SET_ARBEIT_TWEET).save();
				_this.shop.set("last_tweet_time",time).save();
				App.popup.message({message:"ツイートしました。<br />報酬をプレゼントに送りました。"});
				_this.render().setupView();
				App.mission.checkProcess("POST_TWITTER_ARBEIT");
			}
			return twitter
		},
		
		response:function(){
			var shopIndexView = new ShopIndexView();
			var base_response = shopIndexView.response()
			var pc = new PcREC;
			var next_report_time    = this.getNextReportTime();
			var next_tweet_time     = this.getNextTweetTime();
			var next_phrase_time    = this.getNextPhraseTime();
			var res = {
				is_reviewed : this.shop.get("is_reviewed"),
				next_report_time    : next_report_time,
				next_tweet_time     : next_tweet_time,
				next_phrase_time    : next_phrase_time,
				is_next_report_time : (__.baseTime() < next_report_time) ? true : false,
				is_next_tweet_time  : (__.baseTime() < next_tweet_time) ? true : false,
				is_next_phrase_time : (__.baseTime() < next_phrase_time) ? true : false,
				tweet_reward_num : 10,
				review_reward_num : 1000,
			}
			return _.extend(base_response,res)
		},
		render:function(){
			this.$el.html( __.template("shop/arbeit",this.response()) );
			return this
		},
		setupView:function(){
			__.scroller.create("shop_index_list",{scrollbars:true});
		},
	});
	
	return ShopArbeitView;
	
})

