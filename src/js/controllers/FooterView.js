define([
	'models/PcREC',
	'models/PresentREC',
	'models/DebugConsole',
],function(PcREC, PresentREC, DebugConsole){
	
	// model
	var Footer = Backbone.Model.extend({
		constructor:function(){
			// シングルトン
			if(!Footer.instance){
				Footer.instance = this;
				Backbone.Model.apply(Footer.instance,arguments);
			}
			return Footer.instance;
		},
		initialize:function(){
			this.pc = new PcREC;
			this.present = new PresentREC;
			this.changePc();
			this.changePresent();
			this.listenTo(this.pc     ,"on_save", this.changePc);
			this.listenTo(this.present,"on_save", this.changePresent);
		},
		changePc: function(){
			var gacha_pt  = this.pc.getItem(df.ITEM_GACHA_POINT);
			var price     = st.GachaListData[10100].price;
			var gacha_num = (gacha_pt/price).floor().cap(99);
			this.set("gacha_num", gacha_num);
		},
		changePresent: function(){
			this.set("present_num", this.present.get("present_list").length );
		},
		defaults:function(){
			return {
				active : 0,
				disp   : 1,
				gacha_num   : 0,
				present_num : 0,
			}
		},
	});
	
	// view
	var FooterView = Backbone.View.extend({
		events:{
			"ftap .mypage " :"mypage",
			"ftap .dungeon" :"dungeon",
			"ftap .gacha  " :"gacha",
			"ftap .card   " :"card",
			"ftap .shop   " :"shop",
			"ftap .debug  " :"debug",
		},
		initialize:function(){
			this.listenTo(this.model,"change", this.change);
		},
		change:function(model){
			if(_.has(model.changed,"active")){
				this.$el.find("a").removeClass("active");
				switch (model.changed.active){
					case df.FOOTER_MYPAGE  : this.$el.find(".mypage" ).addClass("active"); break;
					case df.FOOTER_DUNGEON : this.$el.find(".dungeon").addClass("active"); break;
					case df.FOOTER_GACHA   : this.$el.find(".gacha"  ).addClass("active"); break;
					case df.FOOTER_CARD    : this.$el.find(".card"   ).addClass("active"); break;
					case df.FOOTER_SHOP    : this.$el.find(".shop"   ).addClass("active"); break;
				}
			}
			if(_.has(model.changed,"disp")){
				if(model.changed.disp == 0){ this.$el.addClass("hide"); }
				if(model.changed.disp == 1){ this.$el.removeClass("hide"); }
			}
			if(_.has(model.changed,"gacha_num")){
				if( model.get("gacha_num") ){
					this.$el.find(".gacha .gacha_num.batch").show().find("i").html( model.get("gacha_num") );
				}else{
					this.$el.find(".gacha .gacha_num.batch").hide();
				}
			}
			if(_.has(model.changed,"present_num")){
				if( model.get("present_num") ){
					this.$el.find(".mypage .present_num.batch").show().find("i").html( model.get("present_num") );
				}else{
					this.$el.find(".mypage .present_num.batch").hide();
				}
			}
		},
		mypage :function(){ /*App.router.checkLogin();*/ this.model.set("active",df.FOOTER_MYPAGE ); App.router.navigate("html/Top/mypage"      , {trigger: true}); },
		dungeon:function(){ App.router.checkLogin();     this.model.set("active",df.FOOTER_DUNGEON); App.router.navigate("html/Quest/selectArea", {trigger: true}); },
		gacha  :function(){ App.router.checkLogin();     this.model.set("active",df.FOOTER_GACHA  ); App.router.navigate("html/Gacha/index"     , {trigger: true}); },
		card   :function(){ App.router.checkLogin();     this.model.set("active",df.FOOTER_CARD   ); App.router.navigate("html/Card/index"      , {trigger: true}); },
		shop   :function(){ App.router.checkLogin();     this.model.set("active",df.FOOTER_SHOP   ); App.router.navigate("html/Shop/index"      , {trigger: true}); },
		template: __.mustache('\
			<div id="footer_container">\
				<a class="mypage" ><i class="text"></i><span class="present_num batch" style="{{ (present_num)?"" :"display:none;" }}"><i>{{ present_num }}<i></span></a>\
				<a class="dungeon"><i class="text"></i></a>\
				<a class="gacha"  ><i class="text"></i><span class="gacha_num batch" style="{{ (gacha_num)?"" :"display:none;" }}"><i>{{ gacha_num }}<i></span></a>\
				<a class="card"   ><i class="text"></i></a>\
				<a class="shop"   ><i class="text"></i></a>\
				<span class="debug" style="position: absolute; top: -421px; left: 4px; font-size: 12px; color: #9CB4B4;" ><i>デバッグ</i></span>\
			</div>\
		'),
		render:function(){
			this.$el.html( this.template( this.model.toJSON() ) );
			return this;
		},
		debug:function(){
			//this.model.set("active",6);
			var debugConsole = new DebugConsole;
			debugConsole.showSystemDebugView();
		},
	});
	
	return {
		View : FooterView,
		Model: Footer,
	};
})

