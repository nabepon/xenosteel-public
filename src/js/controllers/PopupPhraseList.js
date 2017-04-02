define([
	"models/PcREC",
],function(PcREC){
	
	var RECENTLY_NUM = 50;
	var STATE_RECENTLY = 1;
	var STATE_ALL = 2;
	var STATE_FAV = 3;
	var DATA_ID   = 0;
	var DATA_FLAG = 1;
	var DATA_NUM  = 2;
	var DATA_DATE = 3;
	var DATA_FAV  = 4;
	
	var Phrase = Backbone.Model.extend({
		defaults:function(){
			return { fav : 0 }
		},
		initialize: function(){
			
		},
	})
	var PhraseList = Backbone.Collection.extend({model:Phrase})
	var PhraseView = Backbone.View.extend({
		className : "phrase_view",
		tagName: "div",
		events:{
			"ftap .fav_star":"fav",
		},
		initialize: function(){
			this.listenTo(this.model, "change", this.render);
			this.pc = new PcREC();
		},
		fav: function(){
			console.log("PhraseView#fav");
			if( this.model.get("fav") ){
				this.model.set("fav",0);
				this.model.attributes.data[DATA_FAV] = 0;
			}else{
				this.model.set("fav",1);
				this.model.attributes.data[DATA_FAV] = 1;
				App.mission.checkProcess("FAV_PHRASE");
			}
		},
		render : function(){
			var star   = ( this.model.get("fav") ) ? "★" : "☆";
			var _class = ( this.model.get("fav") ) ? "fav" : "";
			var id     = this.model.get("id");
			var phrase = st.PhraseData[id];
			
			var html = ''
					+'<table class="phrase_container">'
					+'	<tr>'
					+'		<td class="td1">'
					+'			<div class="no">No.' + phrase.id     + '</div>'
					+'			<div class="text">'  + phrase.text   + '</div>'
					+'			<div class="author">'+ phrase.author + '</div>'
					+'		</td>'
					+'		<td class="td2"><i class="fav_star ' + _class + '">' + star + '</i></td>'
					+'	</tr>'
					+'</table>'
					
			this.$el.html(html);
			return this;
		},
	})
	var PhraseListView = Backbone.View.extend({
		id : "phrase_list_view",
		render : function(type){
			this.$el.empty();
			this.$el.append('<div style="height:5px;"></div>')
			if(type==undefined) type = STATE_RECENTLY;
			// ソート方法変更
			// [id, flag, num, date, fav_state]
			if(type == STATE_RECENTLY){
				this.collection.comparator = function (model) { return model.get("data")[DATA_DATE] * -1 };
			}else{
				this.collection.comparator = function (model) { return model.get("data")[DATA_ID] };
			}
			this.collection.sort();
			
			// ソート表示内容
			var is_list_zero = 1;
			if(type == STATE_FAV){
				this.collection.each(function(model){
					if(model.get("data")[DATA_FLAG] && model.get("data")[DATA_FAV]){
						is_list_zero = 0;
						var phraseView = new PhraseView({model:model});
						this.$el.append( phraseView.render().$el );
					}
				},this)
			}else if(type == STATE_RECENTLY){
				var disp_cnt = 0;
				this.collection.each(function(model,n){
					if(disp_cnt < RECENTLY_NUM && model.get("data")[DATA_FLAG]){
						is_list_zero = 0;
						disp_cnt += 1;
						var phraseView = new PhraseView({model:model});
						this.$el.append( phraseView.render().$el );
					}
				},this)
			}else{
				this.collection.each(function(model){
					if(model.get("data")[DATA_FLAG]){
						is_list_zero = 0;
						var phraseView = new PhraseView({model:model});
						this.$el.append( phraseView.render().$el );
					}
				},this)
			}
			
			if(is_list_zero){
				this.$el.append('<div class="list_zero_text"><i>フレーズはありません</i></div>');
			}
			
			this.$el.append('<div style="height:5px;"></div>')
			
			__.scroller.create("phrase_list_view");
			App.mission.checkProcess("SHOW_PHRASE_DICT");
			return this;
		},
	})
	var PhraseBtn = Backbone.Model.extend({
		defaults:function(){
			return {
				select : 0,
				type: "",
				label:"",
			}
		},
	})
	var PhraseBtnView = Backbone.View.extend({
		className : "phrase_btn_view",
		tagName : "a",
		events: {
			"ftap": "tap",
		},
		initialize: function(){
			this.listenTo(this.model, "change", this.render);
		},
		tap: function(event){
			this.model.set("select",1);
		},
		render : function(){
			this.$el.html( "<i>" + this.model.get("label") + "</i>" );
			if( this.model.get("select") ){
				this.$el.addClass("cmn_btn_1").removeClass("cmn_btn_2");
			}else{
				this.$el.addClass("cmn_btn_2").removeClass("cmn_btn_1");
			}
			return this;
		},
	})
	var PhraseBtnsView = Backbone.View.extend({
		className : "phrase_btns_view",
		tagName : "div",
		initialize: function(option){
			this.phraseListView = option.phraseListView;
			this.btnModel1 = new PhraseBtn({id:STATE_RECENTLY ,label:"最近入手"  ,type:"new", select:1});
			this.btnModel2 = new PhraseBtn({id:STATE_ALL      ,label:"全て"      ,type:"all"});
			this.btnModel3 = new PhraseBtn({id:STATE_FAV      ,label:"お気に入り",type:"fav"});
			this.btnView1  = new PhraseBtnView({model:this.btnModel1});
			this.btnView2  = new PhraseBtnView({model:this.btnModel2});
			this.btnView3  = new PhraseBtnView({model:this.btnModel3});
			this.models    = [this.btnModel1, this.btnModel2, this.btnModel3];
			this.listenTo(this.btnModel1,"change",this.updateBtn)
			this.listenTo(this.btnModel2,"change",this.updateBtn)
			this.listenTo(this.btnModel3,"change",this.updateBtn)
		},
		updateBtn: function(model){
			if(model.changed.select == 1){
				_.each(this.models,function(data){
					if( model.get("id") != data.get("id") ) data.set("select",0);
				})
				this.phraseListView.render( model.get("id") );
			}
		},
		render : function(){
			this.$el.append( this.btnView1.render().$el )
			        .append( this.btnView2.render().$el )
			        .append( this.btnView3.render().$el )
			return this;
		},
	})
	var show = function(){
		var pc              = new PcREC();
		var phrase_list     = _.map(pc.get("phrase_list"),function(data,n){ return {id: n, data: data, fav:data[DATA_FAV] } });
		var phraseList      = new PhraseList(phrase_list);
		var phraseListView  = new PhraseListView({collection:phraseList})
		var phraseBtnsView  = new PhraseBtnsView({phraseListView:phraseListView})
		var popup = App.popup.message({ title:"フレーズ一覧", view_class:"phrase_list", yes:{label:"閉じる"} });
		popup.done(function(){
			console.log("PopupPhraseList#show popup.done");
			var phrase_list = _.map(phraseList.models, function(model){ return model.get("data") });
			phrase_list = phrase_list.sort(function(a,b){ return a[DATA_ID] - b[DATA_ID] });
			pc.set("phrase_list", phrase_list).save();
		})
		popup.view.$el.find(".message").append( phraseBtnsView.render().$el ).append( phraseListView.$el )
		phraseListView.render();
	}
	return {
		Phrase        :Phrase,
		PhraseList    :PhraseList,
		PhraseView    :PhraseView,
		PhraseListView:PhraseListView,
		PhraseBtn     :PhraseBtn,
		PhraseBtnView :PhraseBtnView,
		PhraseBtnsView:PhraseBtnsView,
		show          :show,
	};
})

