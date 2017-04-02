define([
	"models/PcREC",
	"models/Quest",
],function(PcREC,Quest){
	
	var SelectAreaView = Backbone.View.extend({
		id:"select_area_view",
		tagName:"div",
		events:{
		},
		initialize:function(){
			this.pc = new PcREC;
			this.quest = new Quest;
		},
		response:function(){
			// saveを行うと重い。updateを他で行うと処理場所がバラけて微妙。
			// ただ重すぎなのでQuestSelectCaveViewでもupdateするよう対応。
			// ゲリラクエストをやると、Gachaと同じくsaveする必要がでてくるので注意。
			this.pc.updateQuest()//.save()
			var current_world = this.pc.get("current_world");
			
			var quest_status_all = this.pc.get("quest_status");
			var area_list_all = _.reduce(quest_status_all, function(result,quest_status){
				if(quest_status.is_available_world){
					var quest_data = this.quest.createQuestList(quest_status.available_world, quest_status.available_area, quest_status);
					    quest_data = this.quest.appendPlayStatus(this.pc.get("quest_play"),quest_data);
					var area_list = _.values(quest_data.area_list).sort(function(a,b){ return b.area_id - a.area_id });
					result.push(area_list);
				}
				return result;
			},[],this);
			area_list_all.sort(function(a,b){ return b[0].world_id - a[0].world_id })
			
			// 時間判定
			var remainTime   = new __.RemainTime({ disp:{sec:false} , str:{day:"日",hour:"時間",min:"分"} });
			var current_time = __.baseTime();
			var area_list = _.reduce(area_list_all,function(result,area_data){
				var area_list = _.reduce(area_data,function(result,area){
					if(!area.week_flag[__.moment().day()]){
						return result
					}
					if(area.begin){
						var begin = __.moment(area.begin).valueOf();
						if(begin > current_time) return result;
					}
					if(area.end){
						var end = __.moment(area.end).valueOf();
						if(end < current_time) return result;
						
						area.remain_term = __.moment(end).format("M/D HH:mm (ddd)");
						area.remain_time = (end - current_time < 24*60*60*1000)?remainTime.toText(end):"";
					}
					result.push(area_data);
					return result
				},[],this)
				
				if(area_list.length > 0){
					result.push(area_data);
				}
				return result
			},[],this)
			
			return { area_list : area_list }
		},
		render:function(){
			this.$el.html( __.template("quest/select_area_view",this.response()) )
			return this;
		},
		setupView:function(){
			__.scroller.create("area_list",{scrollbars:true});
		},
	});
	
	
	return SelectAreaView;
})

