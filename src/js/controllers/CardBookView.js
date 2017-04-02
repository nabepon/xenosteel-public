define([
	"models/PcREC",
	"models/Mate",
	"controllers/PopupCardDetailView"
],function(PcREC,Mate,PopupCardDetailView){
	
	var BookView = Backbone.View.extend({
		initialize: function(){
			this.pc = new PcREC;
		},
		events: {
			"ftap .book_el": "showDetail",
		},
		showDetail: function(e){
			var card_id = $(e.currentTarget).data("id");
			if(card_id){
				var cardDetail = new PopupCardDetailView({card_id:card_id, type_book:true});
				App.popup.add(cardDetail);
			}
		},
		render: function(){
			var zukan_list = _.reduce(_.cloneDeep(st.CardData),function(result,card){
				if(!result[card.zukan_no]) result[card.zukan_no] = card;
				return result
			},{})
			var discover_list = _.map(this.pc.get("zukan_flag"),function(flag,zukan_no){
				if(zukan_list[zukan_no]){
					zukan_list[zukan_no].has_flag = flag;
					return zukan_list[zukan_no];
				}
			})
			var response = {
				discover_list:_.compact(discover_list)
			}
			this.$el.html( __.template("card/book",response) );
			return this
		},
		setupView: function(){
			__.scroller.create("card_list");
		},
	})
	
	return BookView
})

