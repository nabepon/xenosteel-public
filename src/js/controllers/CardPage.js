define([
	"models/PcREC",
	"models/UserConfigREC",
	"models/Mate",
	"models/PageManager",
	"controllers/PopupCardDetailView",
	"controllers/PageView",
""],function(PcREC,UserConfigREC,Mate,PageManager,PopupCardDetailView,PageView){
	
	/**
	 * 選択中のモンスターのModel。 index、isEmpty、target、dataを持つ。
	 * @memberof CardPage
	 * @attribute Member
	 */
	var Member = Backbone.Model.extend({
		defaults:function(){
			return {
				//id     :0,
				index  :0,
				isEmpty:1,
				target :0,
				data   :{},
			}
		},
	});
	
	/**
	 * 選択中のモンスターのCollection
	 */
	var Members = Backbone.Collection.extend();
	
	/**
	 * 選択中のモンスターのView。event系はcollection(members)に対してtriggerする。
	 * @memberof CardPage
	 * @class MemberView
	 * @fires tapMember
	 * @fires tapRemove
	 * @fires holdMember
	 * @fires changeMember
	 */
	var MemberView = Backbone.View.extend({
		tagName:"div",
		initialize:function(){
			this.listenTo(this.model,"change",this.change);
			var index = this.model.get("index") + 1;
			this.$el.attr("class","card_"+index);
		},
		events: function(){
			return{
				"ftap .member":"tapMember",
				"ftap .remove_btn":"tapRemove",
				"fhold":"holdMember",
			}
		},
		tapMember:function(){
			this.model.collection.trigger("tapMember",this.model);
		},
		tapRemove:function(){
			this.model.collection.trigger("tapMember",this.model);
			this.model.collection.trigger("tapRemove",this.model);
		},
		holdMember:function(){
			this.model.collection.trigger("holdMember",this.model.get("data"));
		},
		change:function(model){
			
			//データに変更があったとき発火
			var id = model.get("data").id;
			
			if( _.has(model.changed,"isEmpty") && model.changed.isEmpty == 1){
				model.attributes.data = {};
				model.collection.trigger("changeMember",model,id);
			}
			if( _.has(model.changed,"data") && !_.isEmpty(model.changed.data) ){
				model.attributes.isEmpty = 0;
				model.collection.trigger("changeMember",model,id);
			}
			
			//ターゲットに変更があったとき再レンダリング
			if( _.has(model.changed,"target") || _.has(model.changed,"isEmpty") ){
				this.render();
			}
		},
		addTargetClass:function(){
			if( this.model.get("target") ){
				return "target";
			}
		},
		render:function(){
			var hp_bar     = '<div class="hp_bar_container"><div class="hp_bar" style="width:' + this.model.get("data").hp_per * 100 + '%;"></div></div>'
			var remove_btn = '<a class="list_menu_btn remove_btn"><i>はずす</i></a>'
			if( this.model.get("isEmpty") ){
				this.$el.html( remove_btn + '<div class="member card_bg '+this.addTargetClass()+'"></div>');
			}else{
				this.$el.html( remove_btn + '<div class="member card_bg '+this.addTargetClass()+'"><img src="'+__.path.card("s",this.model.attributes.data.gra_id)+'">' + hp_bar + '</div>' );
			}
			return this
		},
	});
	
	/**
	 * 選択中のモンスターのコレクションのView
	 * @memberof CardPage
	 * @attribute MembersView
	 */
	var MembersView = Backbone.View.extend({
		el:"#members_view",
		initialize: function(options){
			this.options = options;
		},
		view_list: [],
		render:function(){
			this.$el.empty();
			_.each(this.view_list,function(view){ view.stopListening(); })
			this.view_list = [];
			this.collection.each(function(member){
				var memberView = new this.options.MemberView({model:member});
				this.$el.append( memberView.render().el );
				this.view_list.push(memberView);
			},this);
		},
	});
	
	/**
	 * リスト内モンスターのModel。 selectedのフラグをもつ。
	 * @memberof CardPage
	 * @attribute Card
	 */
	var Card = Backbone.Model.extend({
		defaults:function(){
			return {
				selected:0,
				select_index:0,
			}
		},
	});
	
	/**
	 * モンスター一覧のCollection
	 */
	var CardList = Backbone.Collection.extend();
	
	/**
	 * リスト内モンスターのView。 各イベントはCollectionに対してtriggerする。  
	 * modelのselectedのchangeイベントを受けて再レンダリング。
	 * @memberof CardPage
	 * @class CardView
	 * @fires tapCard
	 * @fires holdCard
	 */
	var CardView = Backbone.View.extend({
		tagName:"div",
		events: function(){
			return {
				"ftap":"tapCard",
				"fhold":"holdCard",
			}
		},
		initialize:function(){
			this.pc = new PcREC;
			this.listenTo(this.model,"change",this.change);
		},
		tapCard:function(){
			this.model.collection.trigger("tapCard",this.model);
		},
		holdCard:function(){
			this.model.collection.trigger("holdCard",this.model.attributes);
		},
		change:function(model){
			if(_.has(model.changed,"selected") || _.has(model.changed,"fav") ){
				this.render();
			}
		},
		response:function(data){
			var res = {
				fav  :0,
			}
			res = _.extend(res,data);
			return res;
		},
		render:function(){
			var data = this.model.attributes;
			this.$el.attr("state-contain_deck",!!data.contain_deck)
			        .attr("state-selected"    ,!!data.selected    )
			        .attr("state-fav"         ,!!data.fav         )
			        .attr("state-select_index",data.select_index  )
			        .html( __.template("card/card_container",this.response(data)) )
			        
			//this.$el.attr("class",select + contain_deck + selected + fav );
			//this.$el.html( __.template("card/card_container",this.response(data)) )
			return this;
		},
	});
	
	/**
	 * モンスター一覧のView
	 * @memberof CardPage
	 * @attribute CardListView
	 */
	var CardListView = Backbone.View.extend({
		el:"#card_list_view",
		initialize:function(options){
			this.options = options;
			this.pc = new PcREC;
		},
		addEmptyMessage: function(){
			this.$el.append('<div class="is_empty_list">選択できるモンスターがいません</div>');
		},
		view_list: [],
		render:function(){
			this.$el.empty();
			_.each(this.view_list,function(view){ view.stopListening(); });
			this.view_list = [];
			if(this.collection.size() === 0){ this.addEmptyMessage(); }
			if(!_.isEmpty(this.options.pageManager)){
				var min = this.options.pageManager.get("show_begin");
				var max = this.options.pageManager.get("show_end");
			}
			this.collection.each(function(card,index){
				if( !_.isEmpty(this.options.pageManager) &&  this.options.pageManager.get("is_show") && (index < min || max <= index) ){ return };
				var cardView = new this.options.CardView({model:card});
				this.$el.append( cardView.render().el );
				this.view_list.push(cardView);
			},this);
			__.scroller.refresh();
			return this;
		},
	});
	
	
	/**
	 * 合成や売却のリアルタイム情報表示
	 * @memberof CardPage
	 * @attribute InfoView
	 */
	var InfoView = Backbone.View.extend({
		el:"#info_view",
		initialize:function(options){
			this.options = options;
			this.pc   = new PcREC;
			this.mate = new Mate;
		},
		render:function(){
			var select_members = _.map( this.options.members.models ,function(member,n){ return member.get("data").id; });
			var mate_ids       = _.map( this.pc.get("mate_list"),function(mate,n){ return mate.id; });
			var sell_result = this.mate.sellResult(this.pc, _.intersection(select_members,mate_ids) );
			var base_member = select_members[0];
			
			if(base_member == undefined){
				var response = {
					mate_num          : _.size(this.pc.get("mate_list")),
					mate_max          : this.pc.get("mate_max"),
					need_powerup_money:0,
					need_limitup_money:0,
					need_mix_money    :0,
					get_mix_exp       :0,
					sell_price        :sell_result.get_game_money,
					have_game_money   :this.pc.getItem( df.ITEM_GAME_MONEY ),
				};
			}else{
				var mat_member  = _.compact(select_members.slice(1));
				var powerup_result = this.mate.powerupResult(this.pc,base_member,mat_member);
				var limitup_result = this.mate.limitupResult(this.pc,base_member,mat_member);
				var mix_result = this.mate.mixResult(this.pc,base_member,mat_member);
				var response = {
					mate_num          : _.size(this.pc.get("mate_list")),
					mate_max          : this.pc.get("mate_max"),
					need_powerup_money:powerup_result.need_game_money,
					need_limitup_money:limitup_result.need_game_money,
					need_mix_money    :mix_result.need_game_money,
					get_mix_exp       :mix_result.get_exp,
					sell_price        :sell_result.get_game_money,
					have_game_money   :this.pc.getItem( df.ITEM_GAME_MONEY ),
				};
			}
			
			this.$el.html( __.template("card/list_info_view",response) );
			return this;
		},
	});
	
	/**
	 * 選択中のメンバーやボタンをラップしているView。
	 * @memberof CardPage
	 * @class SelectView
	 */
	var SelectView = Backbone.View.extend({
		id:"select_view",
		
		Member      :Member      ,
		Members     :Members     ,
		MemberView  :MemberView  ,
		MembersView :MembersView ,
		Card        :Card        ,
		CardList    :CardList    ,
		CardView    :CardView    ,
		CardListView:CardListView,
		InfoView    :InfoView    ,
		
		initialize:function(options,config){
			this.options = options;
			this.request = config.request;
			this.pc   = new PcREC;
			this.userConfig = new UserConfigREC;
			this.mate = new Mate;
			this.pageManager = 1;
		},
		events: function(){
			return {
				"ftap #sort_btn"         :"sortBtn",
				"ftap #toggle_status_btn":"toggleStatusBtn",
			}
		},
		getInitSortData : function(){
			var key = this.userConfig.get("card_sort_key");
			if(!key){ key = "power"; }
			var all_data = this.getSortData();
			var sort_data = _.find(all_data,function(data){ return data.key == key });
			return sort_data;
		},
		getSortData : function(){
			return [
				{ label: "戦闘力順" , key: "power"  , asc: -1 , select_btn: 1 },
				{ label: "入手順"   , key: "id"     , asc: -1 , select_btn: 1 },
				{ label: "レア度順" , key: "rarity" , asc: -1 , select_btn: 1 },
				{ label: "レベル順" , key: "lvl"    , asc: -1 , select_btn: 1 },
				{ label: "HP順"     , key: "hp"     , asc: -1 , select_btn: 1 },
				{ label: "攻撃力順" , key: "atk"    , asc: -1 , select_btn: 1 },
				{ label: "防御力順" , key: "def"    , asc: -1 , select_btn: 1 },
				{ label: "魔力順"   , key: "mag"    , asc: -1 , select_btn: 1 },
				{ label: "図鑑順"   , key: "card_id", asc: -1 , select_btn: 1 },
			];
		},
		sortCardList: function(sort_data){
			//this.cardList.comparator = function(model){ return model.get(sort_data.key) * sort_data.asc; };
			//this.cardList.sort();
			var all_data = this.getSortData();
			var sort_card_id = _.find(all_data,function(data){ return data.key == "card_id" });
			var sort_id      = _.find(all_data,function(data){ return data.key == "id" });
			
			this.cardList.models.sort(function(a,b){
				if(a.get(sort_data.key) != b.get(sort_data.key)){
					return (a.get(sort_data.key) - b.get(sort_data.key) ) * sort_data.asc
				}else if(a.get(sort_card_id.key) != b.get(sort_card_id.key)){
					return a.get(sort_card_id.key) - b.get(sort_card_id.key)
				}else{
					return a.get(sort_id.key) - b.get(sort_id.key)
				}
			});
			this.userConfig.set("card_sort_key",sort_data.key).save();
			
			$("#sort_btn i").html(sort_data.label);
		},
		sortBtn:function(){
			var items  = this.getSortData();
			var config = {
				title: "並び順",
				view_class: "card_sort_select",
				select_btn_class: "cmn_btn_1 select_btn"
			};
			App.popup.select(items, config).done( _.bind(this.selectSortBtn, this) );
		},
		selectSortBtn:function(data,btn){
			console.log("SelectView#selectSortBtn [data,btn]",[data,btn]);
			if(!btn.select_btn) return;
			
			this.sortCardList(btn);
			this.updateCardList();
			this.cardListView.render();
			App.mission.checkProcess("SORT_CARD");
		},
		toggleStatusBtn:function(){
			this.$el.toggleClass("disp_status_2");
		},
		
		
		/**
		 * changeMemberイベントが発火したときに実行。memberのほうは自身でupdateするので、こちらではcardListとinfoViewをupdateする。
		 * @memberof CardPage.SelectView
		 * @function changeMember
		 */
		changeMember:function(model,id){
			this.addChangeCheckList([model.get("data").id]);
			this.addChangeCheckList([model._previousAttributes.data.id]);
			this.updateCardList();
			this.infoView.render();
		},
		/**
		 * 最初に画面を呼ぶときに処理する。
		 * @memberof CardPage.SelectView
		 * @function setupView
		 */
		setupView:function(){
			// cardListView
			var mate_data = _.map( this.pc.get("mate_list"),function(mate,n){ return this.pc.getMateData(mate.id,false) },this);
			this.cardList = new this.CardList( mate_data , { model:this.Card });
			this.sortCardList( this.getInitSortData() );
			this.cardListView = new this.CardListView({ CardView:this.CardView, collection:this.cardList });
			this.filterCollection();
			this.listenTo(this.cardListView.collection,"tapCard"  ,function(){ App.sound.se(1) } );
			this.listenTo(this.cardListView.collection,"tapCard"  ,this.tapCard );
			this.listenTo(this.cardListView.collection,"holdCard" ,this.holdCard);
			
			// pageView
			this.pageManager = new PageManager({ collection:this.cardList , elem_num: this.userConfig.get("page_elem_num") });
			this.pageView    = new PageView({model:this.pageManager});
			this.cardListView.options.pageManager = this.pageManager;
			this.listenTo(this.pageView.model,"pageChange", function(){ this.cardListView.render(); __.scroller.refresh({toTop:true}); });
			
			// membersView
			this.members     = new this.Members(this.initMemberList(), {model:this.Member} );
			this.membersView = new this.MembersView({ MemberView:this.MemberView, collection:this.members });
			this.listenTo(this.membersView.collection,"tapMember"    ,this.tapMember   );
			this.listenTo(this.membersView.collection,"tapRemove"    ,this.tapRemove   );
			this.listenTo(this.membersView.collection,"holdMember"   ,this.holdMember  );
			this.listenTo(this.membersView.collection,"changeMember" ,this.changeMember);
			this.setInitMembersStatus(this.cardListView.collection);
			this.updateTarget();
			
			// infoView
			this.infoView = new this.InfoView({ members:this.members });
			
			// 上記をrender
			this.membersView.render();
			this.addChangeCheckList( _.map(this.members.toJSON(),function(data){ return data.data.id }) );
			this.updateCardList();
			this.cardListView.render();
			this.pageView.render();
			this.infoView.render();
			
			__.scroller.create("card_list");
		},
		filter:function(mate){
			return true
		},
		filterCollection:function(){
			var _this = this;
			var mate_data = _.reduce( this.pc.get("mate_list"),function(result,mate,n){
				if(_this.filter(mate)){
					result.push( _this.pc.getMateData(mate.id,false) )
				}
				return result
			},[]);
			this.cardList.reset(mate_data);
		},
		/**
		 * メンバーの入れ替え対象(ターゲット)を更新
		 * @memberof CardPage.SelectView
		 * @function updateTarget
		 */
		updateTarget:function(){
			var target = this.members.find(function(member){ return member.get("isEmpty") == 1 });
			this.members.each(function(member,index){
				member.set("target", (target != undefined && target.get("index") == member.get("index")) ? 1 : 0 );
			},this);
		},
		changeCheckList:[],
		/**
		 * 更新の必要があるメンバーを配列にして保存しておく。処理したら順次消す。
		 * @memberof CardPage.SelectView
		 * @function addChangeCheckList
		 * @param change_list {array}
		 */
		addChangeCheckList:function(change_list){
			this.changeCheckList = _.union(this.changeCheckList,change_list);
		},
		/**
		 * cardList内でupdateが必要なModelを更新する。modelのchangeイベントで再レンダリングされる。
		 * @memberof CardPage.SelectView
		 * @function updateCardList
		 */
		updateCardList:function(is_all_update){
			//mate_listに無いものをremoveし、selectedを設定する
			var remove_list = _.map(this.cardList.models,function(card){
				if( !_.has(this.pc.get("mate_list"),card.id) ){ return card.id }
			},this);
			remove_list = _.compact(remove_list);
			_.each(remove_list,function(id){ this.cardList.remove({id:id}); },this)
			
			
			var mate_list = this.pc.get("mate_list");
			var select_members = _.map( this.members.models ,function(member,n){ return member.get("data").id; });
			this.cardList.each(function(card){
				if( !_.contains(this.changeCheckList,card.id) && is_all_update != true){ return }; // changeCheckListに含まれてなかったら無駄なので終了
				//_.extend(card.attributes, this.pc.getMateData(card.id,false) )
				card.set( this.pc.getMateData(card.id,false) )
				
				var is_contain = 0;
				var select_index = 0;
				for(var i=0;i<select_members.length;i++){
					if(select_members[i] == card.id){
						is_contain   = 1;
						select_index = i+1;
						continue;
					}
				}
				card.set({select_index:select_index, selected:is_contain});
			},this);
			this.changeCheckList=[];
		},
		/**
		 * 選択をリセットする。isEmptyを変更し、changeイベントを発火させて再レンダリング。。
		 * @memberof CardPage.SelectView
		 * @function resetMembers
		 */
		resetMembers:function(){
			var member = new Member();
			var reset_data = _.map(this.members.toJSON(),function(data){
				return _.extend( member.defaults(), {id:data.id, index:data.index} );
			},this)
			this.members.reset(reset_data)
			
			//何故かイベントが複数回発火するようになる
			//this.members.each(function(member,index){ member.set("isEmpty",1) },this);
		},
		/**
		 * membersに対してまとめてsetする。
		 * @memberof CardPage.SelectView
		 * @function setMembers
		 */
		setMembers:function(members_list,before_members){
			this.members.each(function(member,index){
				if( members_list[index] != before_members[index] ){
					if( members_list[index] == 0){
						member.set("isEmpty",1);
					}else{
						member.set("data", this.pc.getMateData(members_list[index],false) );
					}
				}
			},this);
		},
		/**
		 * tapしたときtargetのchangeイベントを発火させてレンダリング。
		 * @memberof CardPage.SelectView
		 * @function tapMember
		 */
		tapMember:function(model){
			// デッキ内の枠を選択したら、その枠が入れ替えターゲットになるようにする
			this.members.each(function(member,index){
				member.set("target", ( model.get("index") == member.get("index") ) ?1:0 );
			},this);
		},
		holdMember:function(model_data){
			// holdCardと同じだが、一応分けておく
			this.holdCard(model_data);
		},
		holdCard:function(model_data){
			// カード詳細表示
			var cardDetail = new PopupCardDetailView({card_id:model_data.id});
			App.popup.add(cardDetail);
		},
		makeEmptyMemberList : function(num){
			// デッキ部分の数分のデータを作成する
			var member_list = _.map(new Array(num),function(id,n){
				return {
					isEmpty:1,
					index  :n,
					id     :n,
				};
			},this);
			return member_list;
		},
		
		
		//ここから差分
		template: __.getTemplate("card/select_list"),
		render:function(){
			this.$el.html( this.template({type:"deck"}) );
			return this
		},
		tapRemove : function(model){ model.set("isEmpty",1) },
		
		//初期に表示されるメンバーがいればこの関数をオーバーライドする
		setInitMembersStatus:function(cardList){ /* cardListのselectedプロパティを変更 */ },
		
		//tapCard内にて、タップに反応しないカード条件を設定する
		rejectTapCard:function(model){ return false },
		/**
		 * selectのtoggleを処理。
		 * @memberof CardPage.SelectView
		 * @function tapCard
		 */
		tapCard : function(model){
			if(this.rejectTapCard(model)){ return }
			
			var before_members = _.map( this.members.models ,function(member,n){ var id = member.get("data").id; return (id != undefined)? id : 0 ; });
			
			//選択済みだったら解除
			var selected = this.members.find(function(member){ return member.get("data").id == model.get("id") });
			if(selected != undefined){
				this.members.get(selected.get("id")).set("isEmpty",1);
				this.updateTarget();
				return
			}
			
			//targetがなかったら何もしない
			var target_index = _.find(this.members.models, function(member){ return member.get("target") == 1; });
			if(target_index == undefined){ return };
			target_index = target_index.get("index");
			
			//変更後のmember listを作成
			var select_members = _.map( this.members.models ,function(member,n){
				if( n == target_index ){
					// 現在のターゲットに一致していれば、無条件でセットする
					return model.id;
				}else if( member.get("data").id == model.id || member.get("isEmpty") == 1 ){
					return 0;
				}else{
					return member.get("data").id;
				}
			});
			this.setMembers(select_members,before_members); //before_membersにselect_membersをマージ
			this.updateTarget();
		},
		initMemberList : function(){ return this.makeEmptyMemberList(6) },
	});
	 
	/**
	 * モンスター一覧系のクラス
	 * @class CardPage
	 */
	var CardPage = function(){
		return {
			Member      :Member,
			MemberView  :MemberView,
			Members     :Members,
			MembersView :MembersView,
			Card        :Card,
			CardView    :CardView,
			CardList    :CardList,
			CardListView:CardListView,
			SelectView  :SelectView,
		}
	};
	return CardPage;
})

