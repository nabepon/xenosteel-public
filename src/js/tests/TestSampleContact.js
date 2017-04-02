define([],function(){

var Contact = Backbone.Model.extend({
	index: function(){
		// 名前で並び替える。大文字と小文字を区別しない
		// comment : これ並び替えてんの？なんでindexなの？
		return this.get('name').toUpperCase();
	},
	toEscapedJSON: function(){
		var data = this.toJSON();
		_.each(data, function (value, name) {
			data[name] = _.escape(value);
		});
		return data;
		
		//以下本どおりなのにさっぱり不明。ふざけんあ！
		
		// HTMLエスケープされた属性オブジェクトを返す
		// http://localhost/project/xenosteel/assets/doc/Underscore-master/docs/Arrays.md#13
		// http://localhost/project/xenosteel/assets/doc/Underscore-master/docs/Collection.md#2
		// this.map(function(value,attr){ return [attr, _.escape(value)]; }
		// -> this.map( attr , _escape(value) ) -> attrに対してescapeする
		return _.object(this.map(function(value,attr){ // comment : ここの引数がどこから来てるの不明
			return [attr, _.escape(value)];
		}))
	}
});

var ContactList = Backbone.Collection.extend({
	localStorage : new Backbone.LocalStorage('contact'),
	model : Contact ,
	comparator: function(contact){ //modelを引数に渡す
		// Contact#index で並び替える
		return contact.index(); //そのmodelのindexを実行 toUpperCaseのやつ
	},
});

var ItemView = Backbone.View.extend({
	render : function(){
		this.$el.html(__.jsTemplate("contact",{source:this.presenter()}));
		
		return this;
	}
});

var AppView = Backbone.View.extend({
	mainview : null,
	initialize : function(){
		// optionでrouterのインスタンスを渡す
		this.listenTo(this.options.router, 'route', this.dispatch);
	},
	dispatch : function(name, args){
		// nameに以下のものが含まれていなければ何もせず返す
		if(!_.instclude(['index', 'new', 'show', 'edit'],name)) return;
		
		// mainviewがあれば削除する
		if(this.mainview) this.mainview.remove();
		
		//routreイベントに応じてmainviewを切り替える
	}
});

describe("Contact",function(){
	describe("#toEscapeJSON",function(){
		it("は属性をエスケープして返す",function(){
			var contact = new Contact({name:"<script>"});
			expect(contact.toEscapedJSON().name).toBe("&lt;script&gt;");    // x===y
			/* その他
			expect(x).toBe(y);            // x===y
			expect(x).toEqual(y);         // xとyの構成が同じ
			expect(x).toMatch(/y/);       // RegExp(patter).test(x)
			expect(x).toBeLessThan(y);    // x < y
			expect(x).toBeGreaterThan(y); // x > y
			expect(x).toBeDefined();      // x !== undefined
			expect(x).toBeUndefined();    // x === undefined
			expect(x).toBeNull();         // x === y
			expect(x).toBeTruthy();       // !!x
			expect(x).toBeFalsy();        // !y
			expect(fn).toThrow(e);        // 関数fnを実行したら例外eが発生する
			*/
		});
	});
});


describe("ContactList",function(){
	it('は名前で並び替える', function () {
		var contactlist = new ContactList();
		contactlist.reset([
			{name: 'abc'},{name: 'bcd'},{name: 'ACD'}
		]);
		expect(contactlist.pluck('name')).toEqual(['abc', 'ACD', 'bcd']);
	});
});





return Contact;
});
