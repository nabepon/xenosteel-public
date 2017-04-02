define([
	"models/PcREC",
	"models/Quest",
""],function(PcREC,Quest){
	
	var PopupQuestConfirmView = Backbone.View.extend({
		tagName:"div",
		initialize:function(data){
			this.data = data;
		},
		render:function(){
			var _this = this;
			var quest = new Quest();
			var floor_max = this.data.quest_data.floor_max;
			var quest_id = this.data.quest_data.id;
			var quest_info = quest.getQuestInfo(quest_id);
			
			var pc = new PcREC;
			var res = {
				enemys     : quest_info.enemys,
				floor_max  : quest_info.floor_max,
				level      : quest_info.level,
				deck       :pc.get("deck"),
				members    :_.map(pc.get("deck"),function(id,n){ if(!id){ return } return pc.getMateData(id) }),
				packun_n   :pc.getItem( df.ITEM_PACKUN_NORMAL ),
				packun_s   :pc.getItem( df.ITEM_PACKUN_SUPER ),
				packun_d   :pc.getItem( df.ITEM_PACKUN_DRAGON ),
				packun_n_id:df.ITEM_PACKUN_NORMAL,
				packun_s_id:df.ITEM_PACKUN_SUPER ,
				packun_d_id:df.ITEM_PACKUN_DRAGON,
			}
			res.response = res;
			var dialog_res = {
				title : this.data.quest_data.dungeon_name ,
				message : __.template("quest/quest_confirm",res) ,
			}
			this.$el.html( __.template("dialog/common",dialog_res) );
			return this
		},
	});
	
	return PopupQuestConfirmView;
	
})

