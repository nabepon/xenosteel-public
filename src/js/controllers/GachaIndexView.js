define([
	"models/GachaDraw",
	"models/GachaListData",
	"models/PcREC",
	"models/Mate",
""],function(GachaDraw,GachaListData,PcREC,Mate){
	
	var GachaIndexView = Backbone.View.extend({
		tagName:"div",
		events:{
			"ftap .gacha_btn":"gachaConfirm",
		},
		initialize:function(){
			this.pc = new PcREC;
			this.gachaListData = new GachaListData();
			var pc_prev = _.cloneDeep( this.pc.get("gacha_status") );
			this.gachas = this.gachaListData.updateGachas(this.pc);
			// pcのsaveは重いので、isEqualで暫定対応。できればGachaRECを作って対応したい。
			if( !_.isEqual(pc_prev, this.pc.get("gacha_status") ) ){ this.pc.save(); }
			this.gacha = {};
		},
		gachaResponse : function(gacha_id){
			var gacha          = this.gachas.get(gacha_id).toJSON();
			var remainTime     = new __.RemainTime({ disp:{sec:false} , str:{day:"日",hour:"時間",min:"分"} });
			var revival_time   = gacha.last_check_time + gacha.reset_hour*60*60*1000;
			var alive_time     = gacha.last_check_time + gacha.alive_time*60*1000;
			var gacha_end      = st.GachaListData[gacha_id].end;
			var remain_time    = (st.GachaListData[gacha_id].alive_time)? remainTime.toText(alive_time): "";
			var remain_term    = (gacha_end)? __.moment(gacha_end).format("M/D HH:mm (ddd)"): "";
			var gacha_end_time = (gacha_end)?__.moment(gacha_end).valueOf():"";
			if(gacha_end && gacha_end_time - __.baseTime() < 24*60*60*1000){
				remain_time = remainTime.toText(gacha_end_time);
				remain_term = ""
			}
			var response = {
				gacha           : gacha,
				item            : st.ItemData[gacha.need_item_id],
				have_item       : this.pc.getItem(gacha.need_item_id),
				revival_text    : __.moment(revival_time).format("YYYY/MM/DD HH:mm (ddd)"),
				revival_remain  : remainTime.toText(revival_time),
				revival_per     : gacha.reset_rate,
				alive_time      : alive_time,
				alive_remain    : remainTime.toText(alive_time),
				remain_time     : remain_time,
				remain_term     : remain_term,
			}
			return response;
		},
		gachaConfirm: function(e){
			var gacha_id = $(e.currentTarget).data("gacha_id");
			var gacha = this.gachas.get(gacha_id).toJSON();
			console.log("GachaIndexView#gachaConfirm [e,gacha]",[e,gacha]);
			
			var response = this.gachaResponse(gacha_id);
			var html = __.template("gacha/draw_confirm_dialog",response);
			
			App.popup.confirm({view_class: "gacha_confirm_view", title: gacha.name, message:html}).done(_.bind(function(){
				var result = this.drawGacha(gacha);
				if(!result) return;
				
				this.render();
				var anim = new App.anim.Gacha();
				var popup = App.popup.add(anim,{view_class:"gacha_anim"});
				App.mission.checkProcess("DRAW_GACHA");
			},this));
		},
		drawGacha:function(gacha){
			//draw
			var gachaDraw = new GachaDraw;
			var error = gachaDraw.checkError(this.pc,gacha);
			if(error){
				App.popup.message({message:error});
				return false;
			}
			var result = gachaDraw.draw(this.pc,gacha);
			
			//pc set
			var gacha_status = this.pc.attributes.gacha_status[gacha.id];
			if(gacha_status === undefined){ throw "gacha_status:" + gacha.id + " is undefined" };
			if(gacha.limit_num > 0 ){ gacha_status.draw_cnt += 1; };
			gacha_status.total_draw_cnt += 1;
			gacha_status.last_draw_time= __.baseTime();
			
			this.gachas = this.gachaListData.updateGachas(this.pc);
			this.pc.attributes.result.gacha_result = result.new_list;
			this.pc.addMates(result.get_list);
			this.pc.useItem( gacha.need_item_id , gacha.price);
			this.pc.save();
			
			console.log("GachaIndexView#drawGacha [result]",result)
			return result
		},
		response:function(){
			var gacha_list = _.map(_.cloneDeep(this.gachas.toJSON()), function(model){
				_.extend(model, this.gachaResponse(model.id));
				var status = this.pc.attributes.gacha_status[model.id] ;
				if(model.limit_num > 0){ model.rest_num = model.limit_num - status.draw_cnt };
				return model;
			},this);
			var table_id = gacha_list[0].table_id;
			var table_data = _.reduce(st.GachaTableData,function(result,data){ result.push(data.card_seed_id[table_id]); return result; },[]);
			table_data = _.reduce(_.compact(table_data),function(result,seed_id){ result.push( st.CardData[ st.CardSeedData[seed_id].card_id ] ); return result; },[]);
			var top_rarity = _.max(table_data, function(data){ return data.rarity }).rarity;
			table_data = _.filter(table_data, function(data){ return data.rarity == top_rarity });
			table_data = _.shuffle(table_data).slice(0,5).sort(function(a,b){ return b.id - a.id });
			return {
				info_gacha_table_data: table_data,
				info_gacha_data: gacha_list[0],
				gacha_list: gacha_list,
				pc: this.pc.toJSON(),
				gacha_point: this.pc.getItem( df.ITEM_GACHA_POINT ),
				game_money : this.pc.getItem( df.ITEM_GAME_MONEY ),
				real_money : this.pc.getItem( df.ITEM_REAL_MONEY ),
			};
		},
		render:function(){
			this.$el.html( __.template("gacha/index",this.response()) );
			__.scroller.create("gacha_index_list",{scrollbars:true});
			return this;
		},
		remove:function(){
			this.$el.remove();
			this.stopListening();
			//その他、removeする必要があるものをこここでおこなう
			return this;
		}
	});
	
	var ret = {
		page : GachaIndexView,
		draw : function(){alert()},
	};
	
	return ret;
	
})

