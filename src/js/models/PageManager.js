define([
],function(){
	
	/**
	 * PageViewのModel。状態、ページ数、1ページあたりのitem数などを管理
	 * @class PageManager
	 */
	var PageManager = Backbone.Model.extend({
		defaults:function(){
			return {
				collection :[],
				list_length:0,
				elem_num   :30,
				elem_max   :0,
				elem_min   :0,
				current    :1,
				page_max   :0,
				is_first   :1,
				is_end     :1,
				is_show    :0,
				show_begin :0,
				show_end   :0,
			}
		},
		initialize:function(option,config){
			var page_max = ( this.get("collection").length / this.get("elem_num") ).ceil();
			this.set("page_max",page_max);
			this.set("elem_max",this.get("collection").length);
			if(this.get("collection").length>0){
				this.set("elem_min",1);
			}else{
				this.set("elem_min",0);
			}
			
			if(this.get("page_max")>=2){
				this.set("is_end",0);
				this.set("is_show",1);
			}else{
				this.set("is_end",1);
				this.set("is_show",0);
			}
			
			if( this.get("current") <= 1 ){
				this.set("is_first",1);
			}else{
				this.set("is_first",0);
			}
			
			if( this.get("current") >= this.get("page_max") ){
				this.set("is_end",1);
			}else{
				this.set("is_end",0);
			}
			
			if(this.get("current")>this.get("page_max")){
				this.set("current",this.get("page_max"));
			}
			
			this.set("show_begin",(this.get("current")-1)*this.get("elem_num"));
			this.set("show_end"  ,(this.get("current")  )*this.get("elem_num"));
			
			console.info("Page#initialize [attributes]",this.attributes);
		},
		updateCollection:function(collection){
			this.set("collection",collection);
			this.set("current",1);
			this.initialize();
			this.trigger("updateCollection",this);
		},
		/**
		 * 1ページ戻り。pageChangeイベントを発火する。
		 * @memberof PageManager
		 * @function prev
		 * @fires pageChange
		 */
		prev:function(){
			if(this.get("is_first")){ return }
			this.set("current",this.get("current")-1);
			this.initialize();
			this.trigger("pageChange",this);
		},
		/**
		 * 1ページ送り。pageChangeイベントを発火する。
		 * @memberof PageManager
		 * @function next
		 * @fires pageChange
		 */
		next:function(){
			if(this.get("is_end")){ return }
			this.set("current",this.get("current")+1);
			this.initialize();
			this.trigger("pageChange",this);
		},
	});
	
	return PageManager;
});





