define([
	"models/PcREC",
	"models/Mate",
	"controllers/CardPage",
""],function(PcREC,Mate,CardPage){
	
	/*
	* お気に入り登録画面
	*/
	
	var cardPage = new CardPage();
	
	// メンバー部分を一人にし、強化ボタンに変更
	var MemberView   = cardPage.MemberView.extend({
		response:function(data){
			var res = {
				selected:0,
				fav:0,
			}
			res = _.extend(res,data);
			return res;
		},
		render:function(){
			
			var data = this.model.attributes.data;
			this.$el.attr("state-contain_deck",!!data.contain_deck)
			        .attr("state-selected"    ,!!data.selected    )
			        .attr("state-fav"         ,!!data.fav         )
			
			if( this.model.get("isEmpty") ){
				this.$el.html( '<div class="card_container"></div>' );
				var btn = $('<a id="fav_btn"        class="fav_btn        cmn_btn_1     "><i>お気に入り<br/>登録</i></a>')
				this.$el.append( btn )
			}else{
				this.$el.html( __.template("card/card_container",this.response(data)) )
				if(data.fav){
					var btn = $('<a id="fav_remove_btn" class="fav_remove_btn cmn_btn_4 "><i>お気に入り<br/>解除</i></a>')
				}else{
					var btn = $('<a id="fav_btn"        class="fav_btn        cmn_btn_1 "><i>お気に入り<br/>登録</i></a>')
				}
				
				this.$el.append( btn )
			}
			return this;
			
		},
	});
	
	// 表示するテンプレートを変更
	// お気に入りの処理追加
	// membersのtargetが必ずあるように変更。
	var SelectView = cardPage.SelectView.extend({
		MemberView:MemberView,
		events: function(){
			return _.extend({
				"ftap #fav_btn"        :"favBtn",
				"ftap #fav_remove_btn" :"favRemoveBtn",
			},cardPage.SelectView.prototype.events.call(this) );
		},
		render:function(){
			this.$el.html( this.template({type:"fav_select"}) );
			return this
		},
		initMemberList : function(){ return this.makeEmptyMemberList(1) },
		updateTarget:function(){
			//イベントを起こさせて無理やりupdateするのでなんとか修正したい。
			this.members.first().set("target",0);
			this.members.first().set("target",1);
		},
		favBtn:function(){
			this.updateFav(1);
			App.mission.checkProcess("FAV_CARD");
		},
		favRemoveBtn:function(){ this.updateFav(0) },
		updateFav:function(fav){
			var data = this.members.models[0].get("data");
			data.fav = fav;
			this.pc.get("mate_list")[data.id].fav = fav;
			this.pc.save();
			
			//this.resetMembers();
			this.membersView.render();
			this.addChangeCheckList([data.id]);
			this.updateCardList();
		},
	});
	var CardPage = function(){
		return {
			MemberView  :MemberView,
			SelectView  :SelectView,
		}
	};
	return CardPage;
})

