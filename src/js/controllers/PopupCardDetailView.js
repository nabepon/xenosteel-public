define([
	"models/PcREC",
],function(PcREC){
	var PopupCardDetailView = Backbone.View.extend({
		tagName:"div",
		events:{
			"ftap .close_btn":"closeBtn",
			"ftap .prev_btn" :"prevBtn",
			"ftap .next_btn" :"nextBtn",
		},
		initialize:function(options){
			this.pc = new PcREC;
			this.options = options;
		},
		closeBtn:function(){
			this.remove();
			this.trigger("tapClose"); //このイベントをpopupsViewが受け取って閉じる
		},
		getPrevIndex: function(){
			var zukan_no = st.CardData[this.options.card_id].zukan_no;
			var index = _.findLastIndex(this.pc.get("zukan_flag"),function(flag,n){ return n<zukan_no && flag });
			return index
		},
		getNextIndex: function(){
			var zukan_no = st.CardData[this.options.card_id].zukan_no;
			var index = _.findIndex(this.pc.get("zukan_flag"),function(flag,n){ return n>zukan_no && flag });
			return index
		},
		prevBtn: function(){
			this.closeBtn();
			var zukan_no   = this.getPrevIndex();
			var card_id    = _.find(st.CardData,function(data){ return data.zukan_no == zukan_no }).id;
			var cardDetail = new PopupCardDetailView({card_id:card_id, type_book:true});
			App.popup.add(cardDetail);
		},
		nextBtn: function(){
			this.closeBtn();
			var zukan_no   = this.getNextIndex();
			var card_id    = _.find(st.CardData,function(data){ return data.zukan_no == zukan_no }).id;
			var cardDetail = new PopupCardDetailView({card_id:card_id, type_book:true});
			App.popup.add(cardDetail);
		},
		
		render:function(){
			if(this.options.type_book){
				var response = _.cloneDeep(st.CardData[this.options.card_id]);
				response.next_index = this.getNextIndex();
				response.prev_index = this.getPrevIndex();
			}else if(this.options.type_dungeon || this.options.type_battle){
				var response = _.cloneDeep(this.options.card_data);
				response.hp_text = "";
				response.skill_remain_text_1 = "(残り回数 " + response.skill_data[0].use_remain + "/" + response.skill_data[0].use_max + ")";
				response.skill_remain_text_2 = "(残り回数 " + response.skill_data[1].use_remain + "/" + response.skill_data[1].use_max + ")";
				response.hp_per = response.hp / response.hp_full ;
				if(this.options.type_dungeon) App.mission.checkProcess("SHOW_CARD_DETAIL_DUNGEON");
				if(this.options.type_battle ) App.mission.checkProcess("SHOW_CARD_DETAIL_BATTLE");
			}else{
				var response = this.pc.getMateData(this.options.card_id);
				var remainTime = new __.RemainTime({ disp:{hour:false,sec:false} , str:{min:"分"} });
				var hp_text  = "(全快まであと" + remainTime.toText( response.hp_time ) + ")";
				if(response.hp_per == 1){ hp_text = "(全快)" };
				response.hp_text = hp_text;
				response.skill_remain_text_1 = "(" + response.skill_data[0].use_remain + "回使用可)";
				response.skill_remain_text_2 = "(" + response.skill_data[1].use_remain + "回使用可)";
				App.mission.checkProcess("SHOW_CARD_DETAIL_LIST");
			}
			response.type_book = (!!this.options.type_book);
			
			this.$el.html( __.template("card/detail", response ) );
			return this;
		},
	});
	return PopupCardDetailView;
})

