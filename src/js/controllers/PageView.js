define([
""],function(){
	
	var PageView = Backbone.View.extend({
		el:"#page_view",
		tagName:"div",
		events:{
			"ftap .next_page_btn":"next",
			"ftap .prev_page_btn":"prev"
		},
		next:function(){
			this.model.next();
		},
		prev:function(){
			this.model.prev();
		},
		initialize:function(){
			this.listenTo(this.model,"pageChange",this.render);
			this.listenTo(this.model,"updateCollection",this.render);
		},
		update:function(){
			this.model.initialize();
			this.render();
		},
		render:function(){
			var response = this.model.attributes;
			this.$el.html( __.template("common/page",response) );
			return this
		},
	});
	
	return PageView;
})

