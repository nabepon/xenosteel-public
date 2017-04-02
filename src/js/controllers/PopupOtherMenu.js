define([
	"models/UserConfigREC",
],function(UserConfigREC){
	var show = function(){
		var userConfig = new UserConfigREC;
		var template = __.mustache('\
			<div class="other_menu_container">\
				<a class="cmn_btn_2 goto_title"><i>タイトルへ</i></a>\
				<a class="cmn_btn_2 goto_koryaku"><i>攻略情報</i></a>\
				<br/>\
				<a class="cmn_btn_2 invite_code"><i>招待コード</i></a>\
				<a class="cmn_btn_2 serial_code"><i>シリアルコード</i></a>\
				<br/>\
				<a class="cmn_btn_2 credit"><i>クレジット</i></a>\
				<a class="cmn_btn_2 rights"><i>権利表記</i></a>\
				<br/>\
				<a class="cmn_btn_2 twitter_login"><i>Twitterログイン</i></a>\
			</div>\
		')
		var html = template(userConfig.toJSON());
		
		var popup = App.popup.message({title:"その他メニュー", message:'<div class="other_menu_view">' + html + '</div>', yes:{label:"閉じる"} },{},{
			events:{
				"ftap .goto_title"    :"gotoTitle",
				"ftap .goto_koryaku"  :"gotoKoryaku",
				"ftap .invite_code"   :"inviteCode",
				"ftap .serial_code"   :"serialCode",
				"ftap .credit"        :"credit",
				"ftap .rights"        :"rights",
				"ftap .twitter_login" :"twitterLogin",
			},
			gotoTitle   :function(){ App.popup.confirm({message:"タイトルへ戻りますか？"}).done(function(){ location.href = location.href.replace(/#.*/,""); }) },
			gotoKoryaku :function(){},
			inviteCode  :function(){},
			serialCode  :function(){},
			credit      :function(){},
			rights      :function(){},
			twitterLogin:function(){},
		});
		App.mission.checkProcess("SHOW_MENU");
		console.log("menu_popup",popup.view);
	}
	return {
		show:show,
	};
})

