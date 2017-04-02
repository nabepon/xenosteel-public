define([
	"models/UserConfigREC",
],function(UserConfigREC){
	var show = function(){
		var userConfig = new UserConfigREC;
		var template = __.mustache('\
			<div class="user_config_container">\
				■ 戦闘スピード<br/>\
					{% if(battle_speed==1){ %}\
						<a class="battle_speed_1 cmn_btn_1"><i>等倍</i></a>\
						<a class="battle_speed_2 cmn_btn_2"><i>2倍速</i></a>\
					{% }else{ %}\
						<a class="battle_speed_1 cmn_btn_2"><i>等倍</i></a>\
						<a class="battle_speed_2 cmn_btn_1"><i>{{ battle_speed }}倍速</i></a>\
					{% } %}\
					<br/><br/>\
				■ 1ページに表示するモンスター数<br/>\
					{% if(page_elem_num==50){ %}\
						<a class="page_elem_num_50  cmn_btn_1"><i>50体</i></a>\
						<a class="page_elem_num_100 cmn_btn_2"><i>100体</i></a>\
					{% }else{ %}\
						<a class="page_elem_num_50  cmn_btn_2"><i>50体</i></a>\
						<a class="page_elem_num_100 cmn_btn_1"><i>{{ page_elem_num }}体</i></a>\
					{% } %}\
					<br/><br/>\
				■ 音楽<br/>\
					{% if(sound){ %}\
						<a class="sound_on  cmn_btn_1"><i>ON</i></a>\
						<a class="sound_off cmn_btn_2"><i>OFF</i></a>\
					{% }else{ %}\
						<a class="sound_on  cmn_btn_2"><i>ON</i></a>\
						<a class="sound_off cmn_btn_1"><i>OFF</i></a>\
					{% } %}\
					<br/><br/>\
			</div>\
		')
		var html = template(userConfig.toJSON());
		
		var popup = App.popup.message({title:"設定", message:'<div class="user_config_view">' + html + '</div>', yes:{label:"閉じる"} },{},{
			events:{
				"ftap .battle_speed_1"   :"setBattleSpeed1",
				"ftap .battle_speed_2"   :"setBattleSpeed2",
				"ftap .page_elem_num_50" :"setPageElemNum50",
				"ftap .page_elem_num_100":"setPageElemNum100",
				"ftap .sound_on"         :"setSoundOn",
				"ftap .sound_off"        :"setSoundOff",
			},
			setBattleSpeed1  :function(){ this.setBattleSpeed(1) },
			setBattleSpeed2  :function(){ this.setBattleSpeed(2) },
			setPageElemNum50 :function(){ this.setPageElemNum(50) },
			setPageElemNum100:function(){ this.setPageElemNum(100) },
			setSoundOn       :function(){ this.setSound(1) },
			setSoundOff      :function(){ this.setSound(0) },
			setBattleSpeed   :function(battle_speed){
				userConfig.set("battle_speed",battle_speed).save();
				popup.view.$el.find(".user_config_view").html( template(userConfig.toJSON()) );
			},
			setPageElemNum:function(page_elem_num){
				userConfig.set("page_elem_num",page_elem_num).save();
				popup.view.$el.find(".user_config_view").html( template(userConfig.toJSON()) );
			},
			setSound:function(sound){
				userConfig.set("sound",sound).save();
				popup.view.$el.find(".user_config_view").html( template(userConfig.toJSON()) );
				if(sound){
					App.sound.bgm(1);
					App.sound.resumeBgm();
				}else{
					App.sound.pauseBgm();
				}
			},
		});
		App.mission.checkProcess("SHOW_CONFIG");
		console.log("config_popup",popup.view);
	}
	return {
		show:show,
	};
})

