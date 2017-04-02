define([
	"models/PcREC",
],function(PcREC){
	var HowtoListView = Backbone.View.extend({
		id : "howto_list_view",
		events: {
			"ftap .help_sub_title": "showHelpDetail"
		},
		showHelpDetail: function(e){
			var help_id = $(e.currentTarget).data("help_id");
			var data =st.HelpData[help_id];
			App.popup.message({title:data.sub_title,message:data.text})
		},
		render : function(define){
			var help_data = _.groupBy(st.HelpData,function(data){ return data.group });
			_.map(help_data,function(data){ return data.sort(function(a,b){return a.id - b.id}) })
			help_data = _.reduce(help_data,function(result,data){
				result.push( _.extend(_.cloneDeep(data[0]),{data:data}) )
				return result
			},[])
			
			help_data = help_data.sort(function(a,b){
				if(a.id == define){
					return -1
				}else if(b.id == define){
					return 1
				}else{
					a.id - b.id
				}
			})
			
			var html = "<div>";
			for(var i in help_data){
				html += '<div class="help_title">■ '+help_data[i].title+' ■</div>'
				for(var j in help_data[i].data){
					var data = help_data[i].data[j];
					html += '<div class="help_sub_title" data-help_id="'+data.id+'">'+data.sub_title+'</div>'
				}
			}
			html += "</div>";
			this.$el.append(html)
			
			return this;
		},
	})
	var show = function(define){
		var howtoListView = new HowtoListView()
		var popup = App.popup.message({ title:"遊び方", view_class:"howto_list", yes:{label:"閉じる"} });
		popup.view.$el.find(".message").append(howtoListView.render(define).$el)
		__.scroller.create("howto_list_view");
	}
	return {
		HowtoListView:HowtoListView,
		show:show,
	};
})

