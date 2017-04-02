define([
	"models/PcREC",
	"models/Mate",
	"controllers/CardPage",
""],function(PcREC,Mate,CardPage){
	
	/*
	* デッキ編成画面
	*/
	
	var cardPage = new CardPage();
	
	var SelectView = cardPage.SelectView.extend({
		// オーバーライド分
		events: function(){
			return _.extend( {"ftap #deck_detail_btn" :"deckDetailBtn"}, cardPage.SelectView.prototype.events.call(this) );
		},
		render:function(){
			this.$el.html( this.template({type:"deck"}) );
			return this
		},
		
		// デッキに含まれているものをinitメンバーにする処理
		setInitMembersStatus:function(cardList){
			var pc_deck = this.pc.get("deck");
			cardList.each(function(card){
				if(_.contains(pc_deck, card.id)){
					card.set("selected",1);
				}
			},this);
		},
		
		// デッキ保存
		setDeck:function(select_members){
			this.pc.setDeck(select_members).save();
			App.mission.checkProcess("CHANGE_DECK");
			return
		},
		
		tapCard:function(model){
			var before_members = _.map( this.members.models ,function(member,n){ var id = member.get("data").id; if( id != undefined ){ return id }else{ return 0 }; });
			
			//選択済みだったら解除
			var selected = this.members.find(function(member){ return member.get("data").id == model.get("id") });
			if(selected != undefined){
				var select_members = _.map( this.pc.get("deck") ,function(id,n){ if( n == selected.get("id") ){ return 0 }else{ return id }; });
				this.setDeck(select_members);
				this.setMembers(select_members,before_members);
				this.updateTarget();
				return
			}
			
			//targetがなかったら何もしない
			var target_index = _.find(this.members.models, function(member){ return member.get("target") == 1; });
			if(target_index == undefined){ return };
			target_index = target_index.get("index");
			
			//変更後のmember listを作成
			var select_members = _.map( this.pc.get("deck") ,function(id,n){
				if( n == target_index ){
					return model.id;
				}else if( id == model.id ){
					return 0;
				}else{
					return id;
				}
			});
			
			this.setDeck(select_members);
			this.setMembers(select_members,before_members); //before_membersにselect_membersをマージ
			this.updateTarget();
		},
		tapRemove:function(model){
			var select_members = _.map( this.pc.get("deck") ,function(id,n){ return (n == model.get("id"))? 0 : id ; });
			this.setDeck(select_members);
			model.set("isEmpty",1);
		},
		initMemberList:function(){
			//collectionに必要なデータを返す
			var deck = _.clone( this.pc.get("deck") );
			var member_list = _.map(deck,function(id,n){
				if(id==0){
					return {
						isEmpty:1,
						index  :n,
						id     :n,
					};
				}else{
					return {
						isEmpty:0,
						index  :n,
						id     :n,
						data   :this.pc.getMateData(id,false),
					};
				}
			},this);
			return member_list;
		},
		
		// 追加分
		deckDetailBtn: function(){
			var response = {
				members: _.map(this.members.toJSON(),function(data){
					if(data.data.id){
						return this.pc.getMateData(data.data.id)
					}
				},this),
			};
			var popup = App.popup.confirm({
				title:"デッキ詳細",
				message:__.template("card/deck_detail",response),
				yes:{label:"全てはずす"},
				no:{label:"閉じる"},
			}).done(_.bind(this.deckResetConfirm,this));
			
			App.mission.checkProcess("SHOW_DECK_DETAIL");
		},
		deckResetConfirm: function(){
			var popup = App.popup.confirm({message:"デッキから全てのモンスターをはずします。<br/>よろしいですか？"})
			popup.done(_.bind(function(){
				var $btns = this.membersView.$el.find(".remove_btn");
				$btns.trigger("ftap");
				this.updateTarget();
			},this));
			popup.fail(_.bind(this.deckDetailBtn,this));
		}
	});
	var CardPage = function(){
		return {
			SelectView  :SelectView,
		}
	};
	return CardPage;
})

