define([],function(){

/**
 * ガチャ一覧のBackbone.Model
 * @memberof GachaListData
 */
var Gacha = Backbone.Model.extend({
	defaults:function(){
		return {
			id          :0,
			btn_name    :"gachaBtn",
			gacha_name  :"！ガチャデータがありません",
		};
	}
});

/**
 * ガチャ一覧のBackbone.Collection
 * @memberof GachaListData
 */
var Gachas = Backbone.Collection.extend({model:Gacha});

/**
 * ガチャ一覧の初期状態を取得しておく
 * @memberof GachaListData
 */
var defaultGachas = new Gachas( _(st.GachaListData).values().value() );

/**
 * ガチャ一覧を更新。日付やガチャ可能回数などをチェックする。
 * @memberof GachaListData
 * @function updateGachas
 * @param pc {object} PcRECのインスタンス
 * @return {object} Backbone.Collectionのオブジェクト
 * @todo 中の処理をメソッドに分割
 */
var updateGachas = function(pc){
	
	// todo updateGachasをPcRECに作る
	// todo ガチャを引くときのバリデーションを別途作る
	// todo 時刻修正
	__.adjust();
	var current_time = __.baseTime();
	var moment = __.moment();
	
	var gacha_list = _.cloneDeep(st.GachaListData);
	var lose_gacha_list = [];
	var revival_checked_list = [];
	
	//pcのgacha情報を追加
	_.each(st.GachaListData,function(gacha){
		if(!pc.attributes.gacha_status[gacha.id]){
			pc.attributes.gacha_status[gacha.id] = pc.defaultGacha(gacha.id);
		}
	},this)
	
	//自動n連処理
	gacha_list = _.reduce(gacha_list, function(result, gacha, key){
		var have_pt = pc.getItem( gacha.need_item_id );
		var enable_num = 0;
		if(gacha.draw_num < 0){
			gacha.draw_num = (gacha.draw_num).abs();
			enable_num = (have_pt/gacha.price).floor();
			if( enable_num === 0){
				gacha.draw_num = 1;
			}else if( enable_num < gacha.draw_num ){
				gacha.draw_num = enable_num;
			}
			gacha.price *= gacha.draw_num;
		};
		result.push(gacha);
		return result;
	},[]);
	
	// パラメーターをコピー
	gacha_list = _.each(gacha_list,function(gacha){
		var status = pc.attributes.gacha_status[gacha.id];
		gacha.draw_cnt          = status.draw_cnt;
		gacha.last_check_time   = status.last_check_time;
		gacha.last_revival_time = status.last_revival_time;
		// 以下の条件のとき、復活時間を経過しても、復活前のガチャが残っているため、ガチャを引く→復活判定にまたかかる
		// というのを防ぐため対応。gacha.alive_timeをgacha.reset_hourと同じ時間にする。
		gacha.alive_time = (gacha.alive_time==0 && gacha.reset_hour > 0) ? gacha.reset_hour*60 : gacha.alive_time ;
	});
	
	// 期間、曜日、アイテム不足時に表示を消すもの、をフィルター
	gacha_list = _.filter(gacha_list,function(gacha){ return !gacha.begin || ( moment.isAfter(gacha.begin) && moment.isBefore(gacha.end) ) });
	gacha_list = _.filter(gacha_list,function(gacha){ return gacha.week_flag[moment.day()] == 1 });
	gacha_list = _.filter(gacha_list,function(gacha){ return !(gacha.hide_has_not_item == 1 && pc.getItem(gacha.need_item_id) < gacha.price) });
	
	// コピーを保存
	var gacha_list_need_data = _.cloneDeep(gacha_list);
	var before_gacha_ids = _.map(gacha_list,function(gacha){ return gacha.id });
	
	// 制限回数、有効時間でフィルター
	gacha_list = _.filter(gacha_list,function(gacha){ return  gacha.limit_num == 0 || gacha.draw_cnt < gacha.limit_num });
	gacha_list = _.filter(gacha_list,function(gacha){ return  gacha.alive_time == 0 || gacha.last_revival_time + gacha.alive_time*60*1000 > current_time });
	
	// 制限回数の復活判定
	// 復活判定方法
	// 最後に復活判定を行った時刻から、復活時間が経過していたら、復活判定をする
	// 復活判定を行ったら、その判定結果に関わらず、復活判定時刻を保存する
	var after_gacha_ids = _.map(gacha_list,function(gacha){ return gacha.id });
	var revival_chance_ids = _.difference(before_gacha_ids,after_gacha_ids);
	var revival_chance_gahca_list = _.map(revival_chance_ids,function(id){ return _.find(gacha_list_need_data,function(gacha){ return gacha.id == id }) })
	var revival_checked_list = _.map(revival_chance_gahca_list,function(gacha){
		if(gacha.last_check_time + gacha.reset_hour*60*60*1000 < current_time){
			gacha.last_check_time = current_time;
			if(gacha.reset_rate  > _.random(0,99) ){
				gacha.draw_cnt = 0;
				gacha.last_revival_time = current_time;
			}else{
				gacha.draw_cnt = gacha.limit_num;
			}
			return gacha
		}
	});
	revival_checked_list = _.compact(revival_checked_list);
	
	// 元が[0,1,0,1,0]のようなリストを、復活失敗リスト[0,0,0]と、有効リスト[1,1]に分けたのち、
	// priorityでソートすることで[0,1,0,1,0]の並び順を復元し、最初の1より前のみデータ（例だと[0,1]まで）を取得し、更新を行う
	var update_gacha_list = _.cloneDeep( gacha_list.concat(revival_checked_list) );
	update_gacha_list = _.groupBy(update_gacha_list,function(gacha){ return gacha.group; })
	update_gacha_list = _.map(update_gacha_list,function(group){ return group.sort(function(a,b){ return b.priority - a.priority }) })
	update_gacha_list = _.reduce(update_gacha_list,function(result,group){
		for(var i in group){
			result.push(group[i])
			if( !_.find(revival_checked_list, function(rev){ return rev.id == group[i].id }) ) break
		}
		return result
	},[])
	
	// アップデート状態を保存
	_.each(update_gacha_list,function(gacha){
		pc.attributes.gacha_status[gacha.id].draw_cnt = gacha.draw_cnt ;
		pc.attributes.gacha_status[gacha.id].last_check_time = gacha.last_check_time ;
		pc.attributes.gacha_status[gacha.id].last_revival_time = gacha.last_revival_time ;
	})
	
	// draw_cntをlimit_numにすることで復活を防いでいるので、制限回数で再びフィルターを行う
	gacha_list = _.filter(update_gacha_list,function(gacha){ return  gacha.limit_num == 0 || gacha.draw_cnt < gacha.limit_num });
	
	// グループ分けし、プライオリティでソート、各グループの1番目のみ取り出した配列を用意する
	gacha_list = _.groupBy(gacha_list,function(gacha){ return gacha.group; })
	gacha_list = _.map(gacha_list,function(group){ return group.sort(function(a,b){ return b.priority - a.priority }) })
	gacha_list = _.compact(gacha_list);
	gacha_list = _.reduce(gacha_list,function(result,group){ result.push(group[0]); return result; },[])
	
	//配列を整理して返す
	gacha_list.sort(function(a,b){ return b.position - a.position });
	var gachas = new Gachas( _.compact(gacha_list) );
	return gachas
};

/**
 * ガチャ一覧に必要なデータ
 * @class GachaListData
 */
var GachaListData = function(){
	return {
		Gacha:Gacha,
		Gachas:Gachas,
		defaultGachas:defaultGachas,
		updateGachas:updateGachas,
	};
};

return GachaListData;

});
