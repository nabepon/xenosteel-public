define([
	"models/PcREC",
""],function(PcREC){
	
	var ShopArbeitView = Backbone.View.extend({
		tagName:"div",
		initialize:function(){
		},
		events:{
			"ftap .submit":"submit",
			"ftap .cancel":"cancel",
		},
		cancel:function(){
			location.href = "index_sub.html#bug_report_cancel";
		},
		submit:function(e){
			e.preventDefault();
			App.views.indicator.show();
			this.post(true);
		},
		post :function(retry,self){
			$.post(appenv.bug_report_php, {
				device_id : localStorage.device_id ,
				save_id   : localStorage.save_id ,
				storage   : JSON.stringify(localStorage),
				name      : document.form.name.value,
				mail      : document.form.mail.value,
				content   : document.form.content.value,
			}).done(function( data ) {
				location.href = "index_sub.html#bug_report_complete";
			}).fail(_.bind(function() {
				//if(retry){
				//	this.post(false);
				//}else{
					alert(JSON.stringify(arguments))
					location.href = "index_sub.html#bug_report_failed";
				//}
			},this));
		},
		render:function(){
			this.$el.html( __.template("shop/arbeit_bug_reports") );
			return this
		},
		setupView:function(){
		},
	});
	
	return ShopArbeitView;
	
})

