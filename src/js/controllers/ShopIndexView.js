define([
	"models/PcREC",
	"models/BillingREC",
	"models/Mate",
""],function(PcREC,BillingREC,Mate){
	
	var ShopIndexView = Backbone.View.extend({
		tagName:"div",
		events:{
			"ftap #arbeit a"   :"arbeit",
			"ftap #realMoney a":"realMoney",
			"ftap #packun a"   :"packun",
			"ftap #recover a"  :"recover",
		},
		initialize:function(){
			this.pc = new PcREC;
			this.mate = new Mate;
		},
		arbeit:function(){
			App.router.navigate("/html/Shop/arbeit"   ,{trigger:true})
		},
		realMoney:function(){
			App.views.indicator.show()
			App.sound.se(1);
			setTimeout(_.bind(function(){ //リペイントを発生させるためsetTimeout
				this.billingREC = new BillingREC({pc_id:this.pc.get("id"),pc:this.pc});
				this.listenTo(this.billingREC,"finishInit",this.billingFinishInit);
				this.listenTo(this.billingREC,"failBilling",this.billingFailInit);
				if(__.info.is_phonegap){
					this.billingREC.init()
				}else{
					setTimeout(this.billingFinishInit,2000)
				}
			},this),0)
		},
		billingFinishInit:function(){
			App.views.indicator.hide();
			App.router.navigate("/html/Shop/realMoney",{trigger:true});
		},
		billingFailInit:function(){
			App.views.indicator.hide();
		},
		packun:function(){
			App.router.navigate("/html/Shop/packun"   ,{trigger:true})
		},
		recover:function(){
			var is_exist_deck = _.find(this.pc.get("deck"),function(id){ return id>0 })
			if(!is_exist_deck){
				App.popup.message({message:"デッキが編成されていません<br/><br/>モンスターメニューから<br/>デッキを編成しましょう"})
				return this
			}
			
			// todo : 回復に必要な金額を計算する
			var _this = this;
			var mate_list = this.pc.get("mate_list");
			var members = _.map( _.compact(this.pc.get("deck")) ,function(id,n){ return this.pc.getMateData(id) },this);
			var need_game_money = _.reduce(members,function(sum,member){
				var exp_data = this.mate.getExpData(member)
				var hp_per = (1-member.hp_per);
				sum += exp_data.next_exp * hp_per / 10;
				return sum
			},0,this).ceil()
			
			console.log("ShopIndexView#recover [need_game_money,members]",[need_game_money,members]);
			if(need_game_money>0){
				App.popup.confirm({message:"現在のデッキのモンスターを<br/>回復させますか？<br/><br/>消費コイン："+need_game_money+" 枚<br/>所持コイン："+this.pc.getItem(df.ITEM_GAME_MONEY)+" 枚" }).done(function(){
					if(_this.pc.getItem(df.ITEM_GAME_MONEY) >= need_game_money){
						_.each(members,function(member){
							mate_list[member.id].hp_time = __.baseTime();
						})
						_this.pc.set("mate_list",mate_list)
						_this.pc.useItem(df.ITEM_GAME_MONEY, need_game_money)
						App.popup.message({message:"モンスターが全回復しました！",yes:{label:"OK"}})
						App.mission.checkProcess("RECOVER_CARD");
					}else{
						App.popup.message({message:"コインが不足しています"})
					}
				})
			}else{
				App.popup.message({message:"回復の必要はないみたいです<br/>全員元気です！<br/>",yes:{label:"OK"}})
			}
		},
		response : function(){
			var pc = new PcREC;
			var res = {
				mate_num   :_.size(pc.get("mate_list")),
				mate_max   :pc.get("mate_max"),
				gacha_point:pc.getItem( df.ITEM_GACHA_POINT ),
				game_money :pc.getItem( df.ITEM_GAME_MONEY ),
				real_money :pc.getItem( df.ITEM_REAL_MONEY ),
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
			return res;
		},
		render:function(){
			var response = this.response()
			this.$el.html( __.template("shop/index",response) );
			return this
		},
		setupView:function(){
			__.scroller.create("shop_index_list",{scrollbars:true});
		},
	});
	
	return ShopIndexView;
	
})

