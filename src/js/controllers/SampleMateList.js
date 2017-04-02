define([
	"models/PcREC",
	"models/Mate",
""],function(PcREC,Mate){
	
	var MateSellView = Backbone.View.extend({
		tagName:"div",
		events:{
			"click [type=submit]" : "submit",
			"ftap  .sell_submit" : "sell",
			"ftap  .deck_submit" : "setDeck",
			"ftap  .mix_submit" : "mix",
			"ftap  .reset_render" : "render",
		},
		initialize:function(){
			this.pc = new PcREC;
			this.mate = new Mate;
			this.listenTo(this.pc,"sync",this.render);
		},
		submit:function(e){
			e.preventDefault();
		},
		sell:function(e){
			e.preventDefault();
			var query = __.formQuery(e);
			this.mate.sell(this.pc,query.mate).save();
		},
		setDeck : function(e){
			e.preventDefault();
			var select_mate = __.formQuery(e).mate;
			if(select_mate.length > 5){ alert("deckは5つまでしか選択できません"); return }
			_(5 - select_mate.length).times(function(){ select_mate.push(0) });
			this.pc.set("deck",select_mate).save();
		},
		mix : function(e){
			e.preventDefault();
			var query = __.formQuery(e);
			console.log("MateSellView#mix [query]",query);
			var base = query.base;
			var mat_list = query.mat;
			this.mate.mix(this.pc,base,mat_list).save();
		},
		response:function(){
			var mate_list = _.cloneDeep(this.pc.get("mate_list") );
			_(mate_list).each(function(mate){
				if(_.contains( this.pc.get("deck"), mate.id ) ){ mate.is_deck = 1; }else{ mate.is_deck = 0; }
			},this);
			
			var deck = [];
			_( this.pc.get("deck") ).each(function(id,n){
				if( this.pc.get("deck")[n] !== 0){
					deck.push( this.pc.get("mate_list")[ this.pc.get("deck")[n] ].card_id );
				}
			},this);
			
			return {
				mate_list:mate_list,
				deck:deck,
			};
		},
		render:function(){
			this.$el.html( __.template("sample_mate_list",this.response()) );
			//this.$el.html( __.jsTemplate("sample_mate_list",this.response()) );
			return this;
		},
	});
	
	
	return MateSellView;
	
})

