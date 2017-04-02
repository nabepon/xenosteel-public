define([],function(){
	
	
	var Btn = Backbone.Model.extend({
		defaults:function(){
			return {
				se       :1,
				name     :"",
				btn_class:"btn_sample",
				label    :"label_sample",
				show     :1,
				action   :function(){},
				key      : "default_key",
				sort     : -1,
				asc      : -1,
			}
		},
	});
	
	var BtnView = Backbone.View.extend({
		tagName:"a",
		events:{
			"ftap":"tapBtn"
		},
		tapBtn:function(){
			this.trigger("tap",this.model.attributes);
		},
		render:function(){
			this.$el.addClass( this.model.get("btn_class") );
			this.$el.attr("data-se", this.model.get("se"));
			this.$el.html("<i>"+this.model.get("label")+"</i>");
			return this
		},
	});
	
	var Popup       = Backbone.Model.extend({
		defaults:function(){
			var deferred = $.Deferred();
			return {
				deferred  :deferred,
				open_se  : 1,
				open_fx  : 1,
				close_se : 1,
				close_fx : 1,
				data_id   :"",
				view_class:"sample",
				select_btn_class:"",
				type      :1,
				close_btn :0,
				message   :"",
				title     :"",
				status    :0,
				auto_close:true,
				selected  :{},
			}
		}
	});
	
	var Items = Backbone.Collection.extend();
	
	var ItemsView = Backbone.View.extend({
		initialize: function(options){
			this.options = options;
		},
		render :function(dialog){
			this.$el.addClass("item_view")
			this.collection.each(function(model,n){
				var btnView = new BtnView({model:model});
				btnView.$el.addClass(model.get("select_btn_class"))
				this.options.popupView.listenTo(btnView,"tap",this.options.popupView.tapClose );
				this.$el.append( btnView.render(dialog).el );
			},this)
			return this
		},
	});
	
	
	var PopupView   = Backbone.View.extend({
		yes:function(e){
			this.model.attributes.deferred.resolve(this.model.attributes,e);
			this.model.destroy()
		},
		no :function(e){
			this.model.attributes.deferred.reject(this.model.attributes,e);
			this.model.destroy()
		},
		close:function(e){
			this.model.attributes.deferred.reject(this.model.attributes,e);
			this.model.destroy()
		},
		tapClose:function(e){
			this.model.attributes.deferred.resolve(this.model.attributes,e);
			this.model.destroy()
		},
		initialize:function(config,view_option){
			//this.listenTo(this.model,"destroy",this.remove);
			this.options = config;
			this.listenTo(this.model,"destroy",this.animClose);
			this.$el.attr("id",this.cid)
			this.$el.addClass(" popup_view ").addClass(this.model.get("view_class"));
			for(var i in view_option){
				this[i] = view_option[i]
			}
			
		},
		animClose: function(){
			var _this = this;
			this.$el.addClass("close");
			setTimeout(function(){
				_this.remove();
			},250)
		},
		render:function(){
			var option = this.model.attributes;
			if( _.isFunction(option.response) ){ var response = option.response()   }
			if( _.isObject(option.response)   ){ var response = option.response     }
			if( !_.has(option,"response")     ){ var response = this.model.toJSON() }
			this.$el.html( option.template(response) );
			this.appendBtn();
			return this
		},
		appendBtn:function(){
			//はい、いいえ、閉じるボタンの作成と挿入
			var option = this.model.attributes;
			this.btn = {
				yes  :{se:1, btn_class :"yes_btn"  , label:"　はい　", show:true, action: this.yes },
				no   :{se:1, btn_class :"no_btn"   , label:" いいえ ", show:true, action: this.no },
				close:{se:1, btn_class :"close_btn", label:"×"      , show:true, action: this.close },
			};
			if( _.has(option,"yes")   ){ _.extend( this.btn.yes  , option.yes   ) };
			if( _.has(option,"no")    ){ _.extend( this.btn.no   , option.no    ) };
			if( _.has(option,"close") ){ _.extend( this.btn.close, option.close ) };
			
			//html作成後、ボタンのviewをappend
			if( this.btn.no.show    ){
				this.noBtn        = new this.options.Btn( this.btn.no );
				this.noBtnView    = new this.options.BtnView({ model:this.noBtn });
				this.listenTo( this.noBtnView ,"tap", this.btn.no.action );
				this.$el.find(".append_btn_container").append( this.noBtnView.render().el  );
			}
			if( this.btn.yes.show   ){
				this.yesBtn       = new this.options.Btn(this.btn.yes );
				this.yesBtnView   = new this.options.BtnView({ model:this.yesBtn });
				this.listenTo( this.yesBtnView ,"tap", this.btn.yes.action );
				this.$el.find(".append_btn_container").append( this.yesBtnView.render().el );
			}
			if( this.btn.close.show ){
				this.closeBtn     = new this.options.Btn(this.btn.close);
				this.closeBtnView = new this.options.BtnView({ model:this.closeBtn });
				this.listenTo( this.closeBtnView, "tap", this.btn.close.action );
				this.$el.find(".append_close_btn_container").append( this.closeBtnView.render().el )
			}
			return this
		},
	});
	
	var Popups      = Backbone.Collection.extend();
	
	/*
	使い方
		App.popup.confirm({title:"拡張title",message:"拡張メッセージ"}).done(_.bind(function(){
			this.caveMgr.gameNext();
		},this));
		App.popup.confirm( df.NEXT_FLOOR_CONFIRM ).done(_.bind(function(){
			this.caveMgr.gameNext();
		},this));
		App.popup.confirm( df.NEXT_FLOOR_CONFIRM ,{title:"拡張title",message:"拡張メッセージ"} ).done(_.bind(function(){
			this.caveMgr.gameNext();
		},this));
		returnのdeferredはvar dialog = App.popup.confirm(4).model.get("deferred").reject("aaa","ddd")という形で使える。
	*/
	var PopupsView = Backbone.View.extend({
		el:"#assign_popup_container_id",
		Btn        :Btn        ,
		BtnView    :BtnView    ,
		Items      :Items      ,
		ItemsView  :ItemsView  ,
		Popup      :Popup      ,
		PopupView  :PopupView  ,
		Popups     :Popups     ,
		//PopupsModel:PopupsModel,
		events:{},
		initialize:function(config){
			if(!_.has(config,"data")){ alert("メッセージデータが設定されていません") }
			console.log("PopupsView#initialize",arguments,this)
			this.options = config;
			this.data       = config.data;
			this.template   = config.template;
			this.collection = new this.Popups([],{ model:this.Popup });
			this.listenTo(this.collection,"add"   ,this.change);
			this.listenTo(this.collection,"remove",this.change);
		},
		getFrontView: function(){
			return this.collection.last().view;
		},
		doYesOrYes: function(){
			// 最前面のpopupを常にyesで実行する
			var view = this.collection.last().view;
			if( _.has(view, "yesBtnView") ){
				view.yesBtnView.tapBtn();
			}
		},
		doNoOrYes: function(){
			// 最前面のpopupを、noボタンがあればnoを、なければyesで実行する
			var view = this.collection.last().view;
			if( _.has(view, "noBtnView") ){
				view.noBtnView.tapBtn();
			}else if( _.has(view, "yesBtnView") ){
				view.yesBtnView.tapBtn();
			}
		},
		closeTimer: 0,
		change:function(model){
			clearTimeout(this.closeTimer);
			if(this.collection.length > 0){
				this.$el.css("display","block");
			}else{
				var _this = this;
				this.closeTimer = setTimeout(function(){
					_this.$el.css("display","none");
				},250)
				//this.$el.css("display","none");
			}
		},
		
		//基本的にoptionはつけないでシンプルに使う。YESのみダイアログ
		message:function(data_id,option,view_option){
			if(data_id==undefined){ alert("dialogのID指定がありません"); return };
			if(view_option==undefined){ view_option = {}; }
			
			var config = {
				template:this.options.messageTemplate,
				yes     :{show:true },
				no      :{show:false},
				close   :{show:false},
				title   :"",
				message :"",
				data    :{},
			}
			if( _.isNumber(data_id)){
				config.title   = this.data[data_id].title;
				config.message = this.data[data_id].message;
				config.data    = this.data[data_id];
			}
			if( _.isObject(data_id) ){ _.extend(config,data_id) }
			if( _.isObject(option)  ){ _.extend(config,option) }
			
			var popup     = new this.Popup(config);
			var popupView = new this.PopupView({model:popup, Btn:this.Btn, BtnView:this.BtnView},view_option);
			
			popup.view = popupView;
			this.collection.add(popup);
			this.$el.append( popupView.render().el );
			
			var deferred       = popup.get("deferred");
			    deferred.view  = popupView;
			    deferred.model = popup;
			
			return deferred;
		},
		
		//基本的にoptionはつけないでシンプルに使う。YES/NOダイアログ
		confirm:function(data_id,option,view_option){
			var config = {
				no   :{show:true },
				close:{show:false},
			}
			if( _.isObject(data_id) ){ _.extend(config,data_id) }
			if( _.isObject(option)  ){ _.extend(config,option) }
			return this.message(data_id,config,view_option);
		},
		
		//データで設定された値をもとに使う。設定でmessageかconfirmかを決められるようにし、
		//ある程度Y/N時のメソッドをデータで指定できるようにしたい。
		dialog:function(data_id,option,view_option){
			var config = {
				no   :{show:true },
				close:{show:false},
			}
			if( _.isObject(data_id) ){ _.extend(config,data_id) }
			if( _.isObject(option)  ){ _.extend(config,option) }
			return this.message(data_id,config,view_option);
		},
		
		//ソートなどのボタンが一覧のときに使う
		select:function(item_list,option,view_option){
			if(view_option==undefined){ view_option = {}; }
			var config = {
				yes  :{show:true ,label:"閉じる"},
				no   :{show:false},
				close:{show:false},
			}
			if( _.isObject(option)  ){ _.extend(config,option) }
			var popup     = new this.Popup(config);
			var popupView = new this.PopupView({model:popup, Btn:this.Btn, BtnView:this.BtnView},view_option);
			popupView.$el.html( this.options.selectTemplate(popup.toJSON()) );
			popupView.appendBtn();
			
			_.each(item_list,function(item){
				if(!item.btn_class){ item.btn_class = "select_btn" }
				if(!_.has(item,"select_btn_class") && _.has(option,"select_btn_class")){
					item.select_btn_class = option.select_btn_class;
				}
			});
			var items     = new this.Items(item_list,{model:this.Btn});
			var itemsView = new this.ItemsView({collection:items, popupView:popupView , el: popupView.$el.find(".append_select_btn_container") });
			itemsView.render();
			
			popup.view = popupView;
			this.collection.add(popup);
			this.$el.append( popupView.el );
			
			var deferred       = popup.get("deferred");
			    deferred.view  = popupView;
			    deferred.model = popup;
			
			return deferred;
		},
		
		//ページやアニメをオーバーレイ表示したいときに使う
		add:function(backboneView,config,view_option){
			if(view_option==undefined){ view_option = {}; }
			var popup     = new this.Popup(config);
			var popupView = new this.PopupView({model:popup, Btn:this.Btn, BtnView:this.BtnView},view_option);
			popupView.$el.html( backboneView.render().el );
			popupView.listenTo( backboneView,"tapClose close",popupView.tapClose );
			popupView.listenTo( backboneView,"allClose",popupView.tapClose );
			
			popup.addedview = backboneView;
			popup.view = popupView;
			this.collection.add(popup);
			this.$el.append( popupView.appendBtn().el );
			
			var deferred       = popup.get("deferred");
			    deferred.view  = popupView;
			    deferred.model = popup;
			    
			return deferred;
		},
	});
	
	var obj = function(){
		return {
			Btn        :Btn        ,
			BtnView    :BtnView    ,
			Items      :Items      ,
			ItemsView  :ItemsView  ,
			Popup      :Popup      ,
			PopupView  :PopupView  ,
			Popups     :Popups     ,
			PopupsView :PopupsView ,
		}
	}
	return obj;
})

