define([
	"models/PcREC",
	"models/PresentREC",
],function(PcREC,PresentREC){
	var present = new PresentREC;
	var pc = new PcREC;
	
	var Present = Backbone.Model.extend({
		defaults:function(){
			return _.extend( {received : 0, unreceived : 0}, present.itemDefault() )
		},
		initialize: function(){
			
		},
	})
	var PresentList = Backbone.Collection.extend({model:Present})
	var PresentView = Backbone.View.extend({
		className : "present_view",
		tagName: "div",
		initialize: function(){
			this.listenTo(this.model,"change",this.render);
		},
		events:{
			"ftap .receive":"receive",
		},
		receive: function(){
			if( this.model.get("received") ){ return }
			console.log("PopupPresentList#PresentView#receive");
			var data = this.model.toJSON();
			var is_received = present.receive(data.id);
			present.save();
			if( is_received === true ){
				this.model.set("received",1);
				App.popup.message({title:"プレゼント受け取り" ,message: __.helper.itemName(data.data_type, data.item_id, data.num) + "<br/>を受け取りました！" })
			}else{
				this.model.set("received",1);
				this.model.set("unreceived",1);
				App.popup.message({title:"期限切れ" ,message: "期限がすぎているため、<br/>受け取れませんでした" })
			}
			present.trigger("change_present");
		},
		template: __.mustache('\
			<table class="present_container"><tr>\
				<td class="td1">\
					<div class="receive_time">{{ __.moment(time).format("L HH:mm") }}</div>\
					<div class="present_name">{{ __.helper.itemName(data_type, item_id, num) }}</div>\
					<div class="present_text">{{ message }}</div>\
					{% if(limit){ %}<div class="limit_time">{{ __.moment(limit).format("期日 L HH:mm") }}</div>{% } %}\
				</td>\
				<td class="td2">\
					<i class="receive">\
						{{ (unreceived)? "期限切れ" : (received) ? "受取済み" : "受取" }}\
					</i>\
				</td>\
			</tr></table>\
		'),
		render : function(){
			this.$el.attr("state-received", !!this.model.get("received") );
			this.$el.attr("state-unreceived", !!this.model.get("unreceived") );
			var html = this.template( this.model.toJSON() );
			this.$el.html(html);
			return this;
		},
	})
	var PresentListView = Backbone.View.extend({
		id : "present_list_view",
		render : function(){
			this.$el.append('<div style="height:5px;"></div>')
			
			if( !this.collection.size() ){
				this.$el.append('<div class="list_zero_text"><i>プレゼントはありません</i></div>');
			}else{
				this.collection.each(function(model){
					var presentView = new PresentView({model:model});
					this.$el.append( presentView.render().$el );
				},this)
			}
			
			this.$el.append('<div style="height:5px;"></div>');
			return this;
		},
	})
	window.test_present_add = function(){
		_.times(3,function(n){  present.add({ data_type: df.DATA_TYPE_CARD_SEED, num :  1, item_id : 10090000, message : "カメックスです" + n   })  });
		_.times(7,function(n){  present.add({ data_type: df.DATA_TYPE_ITEM,      num : 10, item_id :        1, message : "プレゼントテスト" + n })  });
		present.save();
	};
	var show = function(){
		console.log("PopupPresentList#show [present_list]", present.get("present_list"));
		var presentList = new PresentList( present.get("present_list") );
		var presentListView = new PresentListView({collection:presentList})
		var popup = App.popup.confirm({
			title:"プレゼント一覧",
			view_class:"present_list",
			no:{label:"閉じる"},
			yes:{label:"一括受取",action: function(){ popup.resolve() } }
		}).done(function(){
			console.log("PopupPresentList#show popup.done 一括受取");
			presentList.each(function(model){
				if( model.get("received") ){ return }
				var is_received = present.receive( model.get("id") );
				model.set("received",1);
				if(!is_received) model.set("unreceived",1);
			})
			present.save();
			pc.save();
			App.popup.message({title:"プレゼント受け取り" ,message: "受取可能なプレゼントを<br/>全て受け取りました！" });
			present.trigger("change_present");
		});
		
		popup.view.$el.find(".message").append(presentListView.render().$el)
		__.scroller.create("present_list_view");
	}
	return {
		Present        :Present,
		PresentList    :PresentList,
		PresentView    :PresentView,
		PresentListView:PresentListView,
		show           :show,
	};
})

