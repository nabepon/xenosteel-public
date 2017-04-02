define([
	"models/Quest",
	"models/CaveREC",
	"models/CaveMapREC",
	"models/CaveManager",
	"models/CaveMembers",
],function(Quest,CaveREC,CaveMapREC,CaveManager,CaveMembers){
	
	var Scratch = Backbone.Model.extend({
		initialize:function(){
			this.touch     = {y:0,x:0}
			this.touchData = {}
			this.cave      = new CaveREC;
			this.caveMgr   = new CaveManager;
			this.disable_tap = 0;
		},
		tap:_.throttle(function(scratchesView,e,touchData){
			if(this.cave.get("status").play == df.RESUME_BATTLE){ return }
			if(this.disable_tap || App.popups.length > 0){ return }
			
			var s = __.scroller.id.map_view;
			var x = (s.pointX/__.adjustView.zoom_value) - s.wrapperOffset.left + (-1 * s.x);
			var y = (s.pointY/__.adjustView.zoom_value) + s.wrapperOffset.top  + (-1 * s.y);
			var pos = {
				y:(y/this.get("chip_size")).floor(),
				x:(x/this.get("chip_size")).floor(),
			}
			
			//if(e.target.tagName != "A"){ return }
			this.touchData  = _.clone(touchData);
			this.collection = scratchesView.collection;
			//var scratch_id  = $(e.target).attr("id").replace("a","")
			var scratch_id  = pos.y +"-"+ pos.x;
			var scratch     = this.collection.get(scratch_id);
			if(_.isUndefined(scratch)){ return }
			var event_type  = scratch.get("event_type");
			//var event_id    = scratch.get("event_id");
			var event_data  = scratch.get("event_data");
			var event_num   = scratch.get("event_num"); // CaveMapREC#setScratchEventNum でタイプ別に計算
			var open_num    = 0;
			var close_num   = 0;
			var positive_open= 0;
			var negative_open= 0;
			var is_open     = 0;
			console.log("Scratch#tap [touchData,scratch.attributes]", [touchData,_.cloneDeep(scratch.attributes)] );
			
			//touch判定とset。ScratchのchangeイベントでScratchViewの変更。
			if( scratch.get("next") === 1 || this.cave.get("first_touch") === 0 ){
				scratch.set({open:1,next:0});
				is_open = 1;
			}
			
			//閉じマスはリターン.
			if( !scratch.get("open") ){ return }
			
			//first_touchの保存とfirst_touchクラスの削除
			if( this.cave.get("first_touch") == 0 ){
				scratchesView.$el.attr("class", scratchesView.$el.attr("class").replace("first_touch","") );
				this.cave.set("first_touch",1);
			}
			
			//scratchの保存
			//開き数のカウント
			this.cave.attributes.scratches = _( this.collection.toJSON() ).reduce(function(result,scratch){
				var t = scratch.event_type;
				if(scratch.open==1){
					open_num++
				}else{
					close_num++
					if(t==df.EVENT_EMPTY || t==df.EVENT_KAIDAN || t==df.EVENT_BOSS){}
					else if(t==df.EVENT_GAME_MONEY || t==df.EVENT_REAL_MONEY || t==df.EVENT_GACHA_POINT || t==df.EVENT_PHRASE || t==df.EVENT_ITEM){ positive_open++ }
					else if(t==df.EVENT_ENEMY || t==df.EVENT_MIMIC || t==df.EVENT_TRAP){ negative_open++ }
				}
				result[scratch.id] = scratch;
				return result;
			},{});
			this.cave.attributes.open_num      = open_num;
			this.cave.attributes.close_num     = close_num;
			this.cave.attributes.positive_open = positive_open;
			this.cave.attributes.negative_open = negative_open;
			
			// 開いたのが最後のイベントならmissionに送る
			if(close_num == 0 && is_open) App.mission.checkProcess("ALL_OPEN_CHIP");
			
			// 開いたときの各種イベント処理
			if( is_open ){
				
				App.sound.se(1);
				
				if(event_type == df.EVENT_KAIDAN){
					this.delayEvent(function(){
						this.cave.scratchLogger(scratch);
						this.caveMgr.kaidanEvent(event_data,event_num);
					})
				}
				if(event_type == df.EVENT_EMPTY){
					this.caveMgr.emptyEvent(event_data,event_num)
				}
				if(event_type == df.EVENT_GAME_MONEY){
					this.cave.scratchLogger(scratch);
					this.caveMgr.gameMoneyEvent(event_data,event_num)
				}
				if(event_type == df.EVENT_REAL_MONEY){
					this.cave.scratchLogger(scratch);
					this.caveMgr.realMoneyEvent(event_data,event_num)
				}
				if(event_type == df.EVENT_GACHA_POINT){
					this.cave.scratchLogger(scratch);
					this.caveMgr.gachaPointEvent(event_data,event_num)
				}
				if(event_type == df.EVENT_PHRASE){
					this.delayEvent(function(){
						this.cave.scratchLogger(scratch);
						this.caveMgr.phraseEvent(event_data,event_num)
						App.mission.checkProcess("FIND_PHRASE");
					})
				}
				if(event_type == df.EVENT_ITEM){
					this.delayEvent(function(){
						this.cave.scratchLogger(scratch);
						this.caveMgr.itemEvent(event_data,event_num)
					})
				}
				if(event_type == df.EVENT_ENEMY){
					this.delayEvent(function(){
						this.cave.scratchLogger(scratch);
						this.caveMgr.enemyEvent(event_data,"is_not_boss");
					})
				}
				if(event_type == df.EVENT_MIMIC){
					this.delayEvent(function(){
						this.cave.scratchLogger(scratch);
						this.caveMgr.enemyEventMimic(event_data,"is_not_boss");
					})
				}
				if(event_type == df.EVENT_TRAP){
					this.cave.scratchLogger(scratch);
					this.caveMgr.trapEvent(event_data,event_num)
				}
			}
			
			// 既に開いているマスをタッチしたときの処理
			if( !is_open ){
				
				if(appenv.BUILD_LEVEL > appenv.DEBUG_BUILD){
					if(event_type == df.EVENT_KAIDAN){
						this.cave.scratchLogger(scratch);
						this.caveMgr.kaidanEvent(event_data,event_num);
					}
				}
				
				if(appenv.BUILD_LEVEL == appenv.DEBUG_BUILD){
					if(event_type == df.EVENT_PHRASE){
						this.delayEvent(function(){
							this.cave.scratchLogger(scratch);
							this.caveMgr.phraseEvent(event_data,event_num);
						})
					}
					if(event_type == df.EVENT_ITEM){
						this.delayEvent(function(){
							this.cave.scratchLogger(scratch);
							this.caveMgr.itemEvent(event_data,event_num)
						})
					}
					if(event_type == df.EVENT_KAIDAN){
						this.delayEvent(function(){
							this.cave.scratchLogger(scratch);
							this.caveMgr.kaidanEvent(event_data,event_num);
						})
					}
					if(event_type == df.EVENT_ENEMY){
						this.delayEvent(function(){
							this.cave.scratchLogger(scratch);
							this.caveMgr.enemyEvent(event_data, "is_not_boss");
						})
					}
					if(event_type == df.EVENT_MIMIC){
						this.delayEvent(function(){
							this.cave.scratchLogger(scratch);
							this.caveMgr.enemyEventMimic(event_data, "is_not_boss");
						})
					}
				}
			}
			
			this.cave.save();
		},300,{trailing: false}),
		delayEvent : function(callback){
			this.disable_tap = 1;
			_.delay(_.bind(function(){
				try{
					_.bind(callback,this)();
					this.cave.save();
				}catch(e){
					console.error(e)
				}
				this.disable_tap = 0;
			},this),300)
		}
	});
	
	return Scratch;
})

