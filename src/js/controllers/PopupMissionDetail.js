define([
	"models/PcREC",
	"models/Twitter",
],function(PcREC,Twitter){
	var show = function(mission_id, _this){
		var mission_state = App.mission.get("mission_state")[mission_id];
		var mission_data  = _.find(App.mission.mission_list, function(data){ return data.id == mission_id });
		var process_type  = (App.mission.detailResponseList[mission_data.type_str])? mission_data.type_str : "DEFAULT_RESPONSE";
		var response      = _.bind(App.mission.detailResponseList[process_type], App.mission)(mission_data);
		
		var message_text  = mission_data.discription + '<hr/>' + '進行度：{{ progress }}/{{ progress_max }}';
		var dubug_clear_btn = '<hr/><a class="cmn_btn_2 debug_clear" style="width:100px; height: 38px;">debug_clear</a>';
		if(appenv.BULD_LEVEL == appenv.DEBUG_BULD && !mission_data.is_clear) message_text += dubug_clear_btn;
		if(mission_data.type_str == "FOLLOW_TWITTER" && !mission_data.is_clear) message_text += '<hr/><a class="cmn_btn_2 follow" style="width:100px; height: 38px;">フォローする</a>';
		if(mission_data.kind == "GUERRILLA" && !mission_data.is_clear){
			var remainTime = new __.RemainTime({ disp:{sec:false} , str:{day:"日",hour:"時間",min:"分"} });
			var end_text = remainTime.toText(mission_data.guerrilla_end);
			message_text += '<hr/><div>残り:' + end_text + '</div>';
		}
		
		var base_title    = __.mustache(mission_data.title)(response);
		var base_message  = __.mustache(message_text)(response);
		
		console.log("MypageView#missionDetail",mission_id,mission_state,mission_data);
		
		var donePopup = function(){
			if(!mission_data.is_clear){ return }
			App.mission.clear(mission_data.id);
			var reward_data = __.excelArrayToJSON(mission_data, ["reward_type","reward_id","reward_vol"])
			var template = __.mustache('\
				以下の報酬を付与しました<br/><br/>\
				{% _.each(reward_data,function(reward){ %}\
					{{ __.helper.itemName(reward.reward_type, reward.reward_id, reward.reward_vol) }}<br/>\
				{% }) %}\
			');
			var rewardPopup = App.popup.message({
				yes: {label: 'OK'},
				title  : 'ミッションクリア！',
				message: template({reward_data: reward_data})
			}).done(function(){
				_this.trigger("changedData");
			})
		}
		var extend_view_data = {
			events:{
				"ftap .debug_clear":"debugClear",
				"ftap .follow"     :"follow",
			},
			debugClear: function(){
				this.close();
				App.mission.testClear(mission_data.id);
				_this.trigger("changedData");
			},
			follow: function(){
				this.close();
				var twitter = new Twitter;
				twitter.tweetFinish = function(){
					App.mission.checkProcess("FOLLOW_TWITTER");
					App.popup.message({message:"フォローしました。"});
					App.views.indicator.hide()
					_this.trigger("changedData");
				};
				twitter.follow();
			}
		}
		
		var yes_btn = {label: (mission_data.is_clear)?'報酬GET':'OK'};
		var no_btn  = {show:false};
		var cancel_mission = {
			show:true,
			label:"ミッション辞退",
			action:function(){
				var mission_detail_popup = this;
				var confirm_popup = App.popup.confirm({message:"ミッションを辞退しますか？"}).done(function(){
					App.mission.cancel(mission_data.id);
					App.popup.message({message:"ミッションを辞退しました"});
					confirm_popup.view.close();
					mission_detail_popup.close();
					_this.trigger("changedData");
				})
			}
		}
		if( !mission_data.is_clear && (mission_data.kind == "CONVERSION" || mission_data.kind == "COUNT" || mission_data.kind == "WANTED") ){
			no_btn  = cancel_mission;
		}
		var popup = App.popup.message({ yes: yes_btn, no: no_btn, title: base_title, message: base_message },{},extend_view_data).done(donePopup)
	}
	return {
		show:show,
	};
})

