define([
	"models/PcREC",
	"models/Quest",
	"controllers/PopupQuestConfirmView",
	"controllers/CardIndexView",
],function(PcREC,Quest,PopupQuestConfirmView,CardIndexView){
	
	var SelectAreaView = Backbone.View.extend({
		id:"select_area_view",
		tagName:"div",
		events:{
			"ftap .E_select_quest" : "questPlayConfirm",
		},
		initialize:function(){
			this.pc = new PcREC;
			this.quest = new Quest;
		},
		response:function(request){
			__.checkType("undefined",[request.query.id]);
			
			console.log("SelectAreaView#response [request.query.id]", request.query.id);
			this.pc.updateQuest(); // QuestSelectAreaViewでsaveするのをやめる代わりに、ここでもupdateする
			var area = st.QuestListData[request.query.id]
			var quest_data = this.quest.createQuestList(area.world_id, area.area_id, this.pc.get("quest_status")[area.world_id] );
			quest_data = this.quest.appendPlayStatus(this.pc.get("quest_play"),quest_data)
			console.log("SelectAreaView#response [quest_data]", quest_data);
			
			this.map_icon_data = st.QuestMapIconData[(request.query.id/1000000).floor()];
			console.log("SelectAreaView#response [this.map_icon_data]", this.map_icon_data);
			
			return {
				area          : area,
				quest_list    : _.values(quest_data.quest_list).sort(function(a,b){return b.id - a.id}),
				map_icon_data : this.map_icon_data,
			}
		},
		render:function(request){
			var res = this.response(request);
			this.request = request;
			this.quest_data = _.find(res.quest_list,function(quest){ return quest.id == request.query.id })
			this.$el.html( __.template("quest/select_cave_view",res) )
			return this;
		},
		setupView:function(){
			__.scroller.create("cave_list",{scrollbars:true});
			__.scroller.create("area_map_img",{ freeScroll: true, scrollX: true,scrollY: true });
			__.scroller.id.area_map_img.scrollTo(-1*this.map_icon_data.map_pos_x,-1*this.map_icon_data.map_pos_y,0);
			
		},
		questPlayConfirm:function(e,f){
			var is_exist_deck = _.find(this.pc.get("deck"),function(id){ return id>0 })
			if(!is_exist_deck){
				App.popup.confirm({
					yes:{label:"デッキ編成へ"},
					no:{label:"閉じる"},
					message:"デッキが編成されていません<br/><br/>モンスターメニューから<br/>デッキを編成しよう！"
				}).done(function(){
					App.router.navigate("/html/Card/deckMemberSelect" ,{trigger:true})
				})
				return this
			}
			var quest_id = $(f.fstartTarget).data("quest_id");
			var res = this.response(this.request);
			var quest_data = _.find(res.quest_list,function(quest){ return quest.id == quest_id })
			var popupQuestConfirmView = new PopupQuestConfirmView({quest_data:quest_data});
			
			var popup = App.popup.add(popupQuestConfirmView,{close:{show:false}}).done(function(){
				App.router.navigate("/html/Cave/start?id="+quest_id ,{trigger:true});
			});
			popup.view.$el.on("ftap",".deck_contaner",function(){
				var cardIndexView = new CardIndexView();
				cardIndexView.showDeckDetail();
			})
		},
	});
	
	
	return SelectAreaView;
})

