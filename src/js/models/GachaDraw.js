define([
	"models/Mate"
],function(Mate){

/**
 * ガチャを実行する
 * @class GachaDraw
 */
var GachaDraw = Backbone.Model.extend({
	defaults:function(){
		return {
			result:[]
		};
	},
	gachaTable : _(st.GachaTableData).values().sortBy( function(m){return m.id} ).value(),
	/**
	 * 1回ガチャを引く処理
	 * @memberof GachaDraw
	 * @function once
	 * @param table_id {int} 実行に使うガチャテーブルのID
	 * @param rate_column {int} ガチャテーブル内の更に確率違いの列を選択
	 */
	once : function(table_id,rate_column){
		var lotMax      = 0;
		var lotNo       = 0;
		var electId     = 0;
		var lotSum      = 0;
		// 抽選
			lotMax = _(this.gachaTable).reduce( function(s,m){ return s + m[rate_column][table_id] },0);
			lotNo  = _.random(0, lotMax);
			for(var i in this.gachaTable){
				lotSum += this.gachaTable[i][rate_column][table_id];
				electId = this.gachaTable[i].card_seed_id[table_id];
				if(lotSum >= lotNo){ break };
			};
		// log
			var result = {
				lotMax :lotMax,
				lotNo  :lotNo,
				lotSum :lotSum,
				electId:electId,
			};
			console.log("GachaDraw#once [result]", result);
		return result;
	},
	/**
	 * ガチャを引いてリザルトを返す。1回だけひくガチャもこれを使用する。
	 * @memberof GachaDraw
	 * @function draw
	 * @param pc {object} PcRECのインスタンス
	 * @param gacha {int} GachaListData.updateGachasで取得した中のどれか一つ
	 * @return {object} get_list、new_list、sp_cnt(確変列で引いた回数。test code用)
	 */
	draw : function(pc,gacha){
		// 回数分ガチャる
		var gacha_result  = [];
		var sp_cnt  = 0;
		_(gacha.draw_num).times( function(n){
			if( n < gacha.sp_num ){
				gacha_result.push( this.once( gacha.table_id , "rate_sp" ).electId );
				sp_cnt += 1;
			}else{
				gacha_result.push( this.once( gacha.table_id , "rate" ).electId );
			}
		},this);
		
		//mate set
		var mate = new Mate;
		var get_list = mate.createMates(pc,gacha_result);
		var new_list = mate.mapNewFlag(pc,get_list);
		
		return {
			get_list:get_list,
			new_list:new_list,
			sp_cnt:sp_cnt,
		};
	},
	/**
	 * ガチャ実行前のエラーチェック。所持アイテム不足チェック、所持上限チェック、曜日チェック、期間チェック、回数チェック、ゲリラチェック。
	 * @memberof GachaDraw
	 * @function checkError
	 * @param pc {object} PcRECのインスタンス
	 * @param gacha {int} GachaListData.updateGachasで取得した中のどれか一つ
	 */
	checkError:function(pc,gacha){
		// todo エラーをちゃんと作る
		var have_pt = pc.getItem( gacha.need_item_id );
		var status = pc.attributes.gacha_status[ gacha.id ];
		
		//所持アイテム不足チェック
		if( have_pt < gacha.price ){ return st.ItemData[gacha.need_item_id].name + "が足りません" };
		//所持上限チェック
		if( pc.get("mate_max") <= _(pc.get("mate_list")).size() ){ return "cardが上限値を超えています" };
		//曜日チェック
		if( gacha["week_flag["+ __.moment().day() +"]"] == 0 ){ return "期間が過ぎています" };
		//期間チェック
		if( gacha.begin !== "" && (__.moment().isBefore(gacha.begin) || __.moment().isAfter(gacha.end))  ){ return "期間が過ぎています" };
		//回数チェック
		if( gacha.limit_num > 0 && status.draw_cnt >= gacha.limit_num ){ return "このガチャが引けるのは"+gacha.limit_num+"回までです" };
		//ゲリラチェック
		if( gacha.alive_time > 0 ){
			if( __.baseTime() > status.last_check_time + gacha.reset_hour*60*60*1000 ){ return "期間が過ぎています" } // next_check_timeを過ぎてる
			else if( __.baseTime() < status.last_check_time + gacha.alive_time*60*1000 ){} // ゲリラ中 かつ まだ引ける
			else{ return "期間が過ぎています" }
		}
	},
});


return GachaDraw;

});