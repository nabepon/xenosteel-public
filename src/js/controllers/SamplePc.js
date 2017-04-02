define([
	"models/PcREC",
	"models/Mate",
""],function(PcREC,Mate){
	
	var PcView = Backbone.View.extend({
		tagName:"div",
		events:{
			"submit .time_edit"       : "setBaseTime",
			"ftap   .time_edit .reset": "resetBaseTime",
			"submit .pc_edit"         : "setPcData",
			"ftap   .pc_edit .reset"  : "resetPcData",
			"submit .mate_edit"       : "addMates",
		},
		model : new PcREC,
		initialize:function(){
			//this.model = new PcREC;
			this.listenTo(this.model,"sync",this.render);
			this.listenTo(this.model,"destroy",this.newPcRec);
			this.mate = new Mate;
		},
		setBaseTime:function(e){
			e.preventDefault();
			var query = __.formQuery(e,false);
			__.setBaseTime(query.time);
			this.render();
		},
		resetBaseTime:function(e){
			__.setBaseTime( (new Date()).getTime() );
			this.render();
		},
		setPcData:function(e){
			e.preventDefault();
			this.model.set( __.formQuery(e) );
			this.model.save();
			console.log("PcView#setPcData [this.model]", this.model);
		},
		resetPcData:function(){
			this.model.destroy();
			this.model.attributes = this.model.defaults();
			this.model.attributes.id = localStorage.device_id + "_" + localStorage.save_id;
			this.model.save();
			this.trigger("reset_data",this.model.get("id"));
		},
		deleteStorageAll:function(){
			for(var i in localStorage){
				localStorage.removeItem(i)
			}
			location.reload();
		},
		newPcRec:function(e){
			//this.stopListening();
			this.model = new PcREC;
			this.mate = new Mate;
			//this.initialize();
			this.model.attributes = this.model.defaultAttr();
			//this.model.addMates( this.mate.createMates(this.model,[10010000]) );
			this.model.save();
			console.log("PcView#newPcRec [this.model]", this.model);
		},
		addMates:function(e){
			e.preventDefault();
			var query = __.formQuery(e);
			var mate = new Mate;
			var new_mate_list = [];
			if(_.isArray(query.card_seed_id)){
				new_mate_list = mate.createMates(this.model,query.card_seed_id);
			}else{
				new_mate_list = mate.createMates(this.model,[query]);
			}
			this.model.addMates(new_mate_list).save();
		},
		render:function(){
			var res = {
				pc:this.model.attributes,
			};
			this.$el.html( __.template("sample_pc",res) );
			//this.$el.html( __.jsTemplate("sample_pc",res) );
			return this;
		},
		remove:function(){
			this.$el.remove();
			this.stopListening();
			//その他、removeする必要があるものをこここでおこなう
			return this;
		}
	});
	
	return PcView;
})

