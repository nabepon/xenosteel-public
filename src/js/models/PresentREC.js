define([
	"models/PcREC",
	"models/Mate",
],function(PcREC,Mate){
	
	var PresentREC = Backbone.Model.extend({
		constructor:function(){
			if(!PresentREC.instance){
				PresentREC.instance = this;
				Backbone.Model.apply(PresentREC.instance,arguments);
			}
			return PresentREC.instance;
		},
		localStorage : new Backbone.LocalStorage("PresentREC"),
		itemDefault : function(){
			return {
				id       : 1,
				data_type: df.DATA_TYPE_ITEM,
				item_id  : 1,
				num      : 1,
				message  : "プレゼントメッセージです",
				item_data: {},
				time     : __.baseTime(),
			}
		},
		defaults    :function(){
			this.pc = new PcREC;
			return{
				id :this.pc.get("id"),
				present_list: [], // this.itemDefault()
			}
		},
		initialize : function(){
			console.log("PresentREC#initialize");
			this.pc = new PcREC;
			this.mate = new Mate;
			this.listenTo(this.pc,"reset_data",this.resetData);
			this.fetch();
		},
		save : function(){
			PresentREC.__super__.save.apply(this, arguments);
			this.trigger("on_save",this);
		},
		resetData : function(pc_id,is_data_delete){
			this.destroy();
			this.attributes = (is_data_delete) ? {} : this.defaults();
			this.set("id",pc_id);
			this.save();
		},
		add: function(data){
			__.checkType({undefined:[ data.data_type, data.item_id, data.num ]});
			if(!data.limit    ) data.limit     = 0;
			if(!data.message  ) data.message   = "";
			if(!data.item_data) data.item_data = {};
			if(!data.time     ) data.time      = __.baseTime();
			
			var list = this.attributes.present_list;
			data.id = (!list.length) ? 1 : _.max(list, function(d){ return d.id }).id + 1;
			list.push( data );
			return this
		},
		addSetItem:function(_base_data,set_data_id){
			var base_data = _.cloneDeep(_base_data);
			if(!base_data.limit    ) base_data.limit   = 0;
			if(!base_data.message  ) base_data.message = "";
			if(!base_data.time     ) base_data.time    = __.baseTime();
			var set_data_all = _.cloneDeep(st.ItemSetData[set_data_id]);
			var set_data = _.zip(set_data_all.data_type, set_data_all.item_id, set_data_all.item_num);
			_.each(set_data,function(set){
				if(set[0] && set[1] && set[2]){
					var data = _.extend(base_data,{ data_type: set[0], item_id: set[1], num: set[2] })
					this.add(data);
				}
			},this)
			return this
		},
		receive: function(id){
			var data = _.find(this.attributes.present_list, function(p){ return p.id == id });
			
			this.attributes.present_list = _.filter(this.attributes.present_list, function(p){ return p.id != id });
			
			// 期限切れチェック
			if(data.limit > 0 && data.limit - __.baseTime() < 0){
				return false;
			}
			// item追加
			else if(data.data_type == df.DATA_TYPE_ITEM){
				this.pc.addItem(data.item_id, data.num);
			}
			// モンスター追加
			else if(data.data_type == df.DATA_TYPE_CARD_SEED){
				data.item_data.card_seed_id = data.item_id;
				var new_mate_list = this.mate.createMates(this.pc, data.item_data);
				this.pc.addMates(new_mate_list);
			}
			// DATA_TYPEエラー
			else{
				alert("DATA_TYPEが正しくありません type:"+data.data_type );
				throw __.exception("ERR_DATA_TYPE_INVALID");
			}
			
			return true
		},
		
	});
	
return PresentREC;

});
