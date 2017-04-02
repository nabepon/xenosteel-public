define([],function(){
	
	/**
	 * 仲間モンスター関連のクラス
	 * @class Mate
	 */
	var Mate = Backbone.Model.extend({
		defaults    : function(){ return this.defaultAttr() },
		defaultAttr : function(){
			return {
				id  : 1,
				atk : 1,
				def : 1,
				mag : 1,
				exp : 0,
				fav : 0,
				hp  : 0,
				lvl : 1,
				hp_full : 0,
				hp_per  : 0,
				hp_time : 1375300160213,
				lim_lvl     : 0,  // 上げたlimの数
				lim_lvl_max : 20, // 上げられるlimの最大
				total_exp   : 0,
				card_id     : 1,
				individual  : [0,0,0,0],
				skill : [ this.defaultSkillAttr() ],
				date  : 0,
			}
		},
		getHosei: function(){
			return [0,1,2,3,4];
		},
		// 現在レベル取得。限界突破分も含む。
		getLevel: function(mate_data){
			return mate_data.lvl;
		},
		// 最大レベル取得。限界突破分も含む。
		getMaxLevel: function(mate_data){
			return st.CardData[mate_data.card_id].lvl_max + mate_data.lim_lvl;
		},
		// 最大レベルに到達しているか判定。限界突破を含む。
		isMaxLevel: function(mate_data){
			return ( this.getLevel(mate_data) >= this.getMaxLevel(mate_data) );
		},
		// 限界突破の限界かどうか判定。
		isMaxLimit: function(mate_data){
			return ( mate_data.lvl >= st.CardData[mate_data.card_id].lvl_max + mate_data.lim_lvl_max );
		},
		// レベル限界に達しているか判定。
		isLimitLevel: function(mate_data){
			return ( this.isMaxLevel(mate_data) && this.isMaxLimit(mate_data) );
		},
		
		/**
		 * 仲間モンスターデータの生成。createMatesから呼び出される。
		 * @memberof Mate
		 * @function createMate
		 * @param card_id {int}
		 * @param [config] {object} 生成に必要な初期値オプション。初期レベル設定など。
		 */
		createMate : function(card_seed_id,config){
			if(!_(st.CardSeedData).has(card_seed_id)){ throw "card_seed_id " + card_seed_id + " is not defined" }
			var ret =  this.defaultAttr();
			var seed = st.CardSeedData[card_seed_id];
			var data_attr = {
				lim_lvl_max  :st.CardData[seed.card_id].lim_lvl_max,
				card_seed_id :card_seed_id,
				card_id      :seed.card_id,
				individual   :[0,0,0,0],
				skill        :[10101011,10101011],
				date         :__.baseTime(),
			};
			
			// 固体値
			for(var i in seed.individual){
				data_attr.individual[i] = (seed.individual[i] >= 0) ? seed.individual[i] : _.random(0,100) ;
			}
			
			// スキル
			var skill_ids          = _.compact(seed.skill);
			var skill_index        = _.random(0,skill_ids.length-1);
			data_attr.skill[0]     = skill_ids[skill_index];
			skill_ids[skill_index] = 0;
			var skill_ids          = _.compact(skill_ids);
			var skill_index        = _.random(0,skill_ids.length-1);
			data_attr.skill[1]     = skill_ids[skill_index];
			data_attr.skill.sort(function(a,b){ return a-b });
			
			// data_attr、configを順に上書き
			_.extend(ret,data_attr,config);
			ret.date = __.baseTime() + ret.id;
			
			ret = this.getStatusFromLvl(ret,ret.lvl);
			
			return ret;
		},
		/**
		 * 仲間モンスターデータの生成
		 * @memberof Mate
		 * @function createMates
		 * @param card_id {int}
		 * @param [config] {object} 生成に必要な初期値オプション。初期レベル設定など。
		 */
		createMates : function(pc,card_seed){
			// card_idは101、[101,102]、{card_id:101,...}、[{card_id:101,...},{card_id:102,...}]の4つの形で受け付ける
			// [{mate},{mate},{mate},...]の形で返す
			// この時点ではPcRECに追加されないが、idは振られる
			// new_flagを持ったものを得たい場合は、mapNewFlag()を使う
			
			//error
			__.checkType({undefined:[pc,card_seed]})
			if( !_.isArray(card_seed) ){ card_seed = [card_seed]; }
			
			//createMate()でlist作成
			var new_mate_list = {};
			for(var i in card_seed){
				if(_.isObject(card_seed[i])){
					var card_data = card_seed[i];
					card_data.id = i.toNumber() + 1;
					new_mate_list[ card_data.id ] = this.createMate(card_data.card_seed_id,card_data);
				}else{
					var card_seed_id = card_seed[i];
					new_mate_list[ i.toNumber() + 1 ] = this.createMate(card_seed_id, {id:i.toNumber() + 1} );
				}
			}
			
			
			//id振り
			var largest_mate_id = 0;
			var desc_id_list = _(pc.attributes.mate_list).sortBy(function(a) { return a.id*-1 ; }).value();
			if(!_.isEmpty(desc_id_list)){ largest_mate_id = desc_id_list[0].id; };
			new_mate_list = _(new_mate_list).reduce(function(result,new_mate,n){
				new_mate.id = largest_mate_id + n.toNumber();
				result[new_mate.id] = new_mate;
				return result;
			},{});
			
			console.log("Mate#createMates [new_mate_list]",new_mate_list);
			return new_mate_list;
		},
		/**
		 * 仲間モンスターデータ（表示用）の生成
		 * @memberof Mate
		 * @function addMateStatus
		 */
		makeMateStatus:function(mate_data){
			var add_data = {
				hp                 : 0,
				hp_per             : 0,
				hp_text            : "全快",
				power              : 0,
				lvl                : this.getLevel(mate_data),
				lvl_without_lim    : mate_data.lvl,
				max_lvl            : this.getMaxLevel(mate_data),
				max_lvl_without_lim: st.CardData[mate_data.card_id].lvl_max,
				is_max_level       : this.isMaxLevel(mate_data),
				is_max_limit       : this.isMaxLimit(mate_data),
				is_limit_level     : this.isLimitLevel(mate_data),
				next_need_exp      : 0,
				next_exp           : 0,
				exp_per            : 0,
				contain_deck       : 0,
				skill_data         :[{},{}],
			};
			
			for(var i=0;i<2;i++){
				add_data.skill_data[i] = _.cloneDeep(st.CardSkillData[mate_data.skill[i]]);
				add_data.skill_data[i].use_max    = (mate_data.mag/add_data.skill_data[i].need_mag).ceil();
				add_data.skill_data[i].use_remain = add_data.skill_data[i].use_max;
			}
			
			var recover_full_time = df.RECOVER_TIME; // 仮に一律で1時間とする
			var recover_time      = mate_data.hp_time - __.baseTime();
			var hp_per            = 1;
			var hp                = mate_data.hp_full;
			if( recover_time > 0 ){
				hp_per            = 1 - (recover_time / recover_full_time);
				hp                = mate_data.hp_full * hp_per
			}
			
			add_data.hp         = hp.ceil();
			add_data.hp_per     = (hp_per*100).floor()/100;
			add_data.power      = (mate_data.atk + mate_data.def + add_data.hp/4 + mate_data.mag*4).floor();
			if(add_data.hp_per < 1){
				var remainTime = new __.RemainTime({ disp:{hour:false,sec:false} , str:{min:"分"} });
				add_data.hp_text = remainTime.toText( mate_data.hp_time );
			};
			
			if(mate_data.is_max_level){
				add_data.next_need_exp = 0;
				add_data.next_exp      = 0;
				add_data.exp_per       = 1;
			}else{
				var exp_data = this.getExpData(mate_data);
				add_data.next_need_exp = exp_data.next_need_exp;
				add_data.next_exp      = exp_data.next_exp;
				add_data.exp_per       = exp_data.exp_per;
			}
			
			return add_data
		},
		extendHpTime : function(mate){
			var damage_per = 1 - ( mate.hp / mate.hp_full );
			var recover_time = df.RECOVER_TIME * damage_per ;
			mate.hp_time = __.baseTime() + recover_time;
			return mate
		},
		/**
		 * 仲間モンスターデータ(表示用)の生成
		 * @memberof Mate
		 * @function createMates
		 * @param card_id {int}
		 * @param [config] {object} 生成に必要な初期値オプション。初期レベル設定など。
		 */
		defaultSkillAttr : function(){
			return {
				id:1,
				lvl:1
			};
		},
		defaultSkill : function(card_id,config){
			var stCard = st.CardData[card_id];
			var ret =  this.defaultSkillAttr();
			var data_attr = {
				id:stCard.skill,
			};
			
			// data_attr、configを順に上書き
			for(var i in data_attr   ){ ret[i] = data_attr[i];    };
			for(var i in config      ){ ret[i] = config[i];       };
			
			return ret;
		},
		/**
		 * 次のレベルに必要な経験値を返す。
		 * 現在レベルの始まりとの差分で1レベルに必要な経験値に、total_expとの差分でそのレベルまでに必要な経験値になる。
		 * @memberof Mate
		 * @function getExpData
		 * @param mate {object}
		 * @param lvl {int}
		 */
		getExpData:function(mate){
			// Todo : max_level時のエラーを返す
			var lvl    = mate.lvl;
			var rarity = st.CardData[mate.card_id].rarity;
			var data   = st.CardExpData[rarity].exp;
			var ret = {
				current      :data[lvl],
				next         :data[lvl+1],
				next_exp     :data[lvl+1] - data[lvl],
				next_need_exp:data[lvl+1] - mate.total_exp,
				current_exp  :mate.total_exp - data[lvl],
			};
			ret.exp_per = (ret.current_exp/ret.next_exp*100 ).floor()/100;
			return ret;
		},
		/**
		 * 指定の仲間が指定のレベルになったときのパラメータを返す
		 * @memberof Mate
		 * @function getStatusFromLvl
		 * @param before_mate {object}
		 * @param after_lvl {int}
		 */
		getStatusFromLvl:function(before_mate,after_lvl){
			// levelからカードデータを計算して返す。
			var rarity = st.CardData[before_mate.card_id].rarity;
			var exp = st.CardExpData[rarity].exp[after_lvl];
			return this.getStatusFromTotalExp( before_mate, exp);
		},
		/**
		 * 指定の仲間が指定の経験値に到達したときのパラメータを返す
		 * @memberof Mate
		 * @function getStatusFromTotalExp
		 * @param before_mate {object}
		 * @param after_total_exp {object}
		 */
		getStatusFromTotalExp:function(before_mate,after_total_exp){
			// total_expからカードデータを計算して返す。
			var st_card    = st.CardData[before_mate.card_id];
			var after_mate = _.cloneDeep(before_mate);
			var after_lvl  = 1;
			var exp_list   = st.CardExpData[st_card.rarity].exp;
			for(var i=1;i<exp_list.length;i++){
				if(after_total_exp >= exp_list[i]){ after_lvl = i }
			}
			after_mate.lvl       = after_lvl;
			after_mate.total_exp = after_total_exp;
			after_mate.exp       = after_total_exp - exp_list[after_lvl];
			
			// ステータスの上がり方：LevelMaxが4だとして、1,2,3,4、ステータスが上がる回数は lvl_max-1回、レベルアップ後のステータスは after_mate.lvl-1回 になる。
			// 固体値の補正：レベル × 固体値/100。最大（レベル100で固体値100の場合）で100になる。
			after_mate.atk       = ( st_card.atk_min + ((st_card.atk_max-st_card.atk_min)/(st_card.lvl_max-1)) * (after_mate.lvl-1) + ((before_mate.individual[0]/100)*after_mate.lvl) ).floor();
			after_mate.def       = ( st_card.def_min + ((st_card.def_max-st_card.def_min)/(st_card.lvl_max-1)) * (after_mate.lvl-1) + ((before_mate.individual[1]/100)*after_mate.lvl) ).floor();
			after_mate.mag       = ( st_card.mag_min + ((st_card.mag_max-st_card.mag_min)/(st_card.lvl_max-1)) * (after_mate.lvl-1) + ((before_mate.individual[2]/100)*after_mate.lvl) ).floor();
			after_mate.hp_full   = ( st_card.hp_min  + ((st_card.hp_max -st_card.hp_min )/(st_card.lvl_max-1)) * (after_mate.lvl-1) + ((before_mate.individual[3]/100)*after_mate.lvl) ).floor();
			
			// スキルレベル判定
			for(var i=0;i<2;i++){
				for(var j=0;j<3;j++){
					var skill_data = st.CardSkillData[after_mate.skill[i]];
					if(skill_data.up_level>0 && skill_data.up_level <= after_mate.lvl){
						after_mate.skill[i] += 1;
					}
				}
			}
			
			return after_mate;
		},
		/**
		 * 獲得モンスターに新規獲得かどうかを付加して返す
		 * @memberof Mate
		 * @function mapNewFlag
		 * @param pc {object} PcRECのインスタンス
		 * @param new_mate_list {object} Mate#createMatesで作成したlist
		 */
		mapNewFlag:function(pc,new_mate_list){
			//new_flagを追加したcloneを返す
			var clone_mate_list = _.cloneDeep(new_mate_list);
			
			_( clone_mate_list ).each(function(m){
				if( !_.has(m,"card_id") ){ throw "PcREC#mapNewZukanFlag don't have a card_id" };
				if( pc.attributes.zukan_flag[ st.CardData[ m.card_id ].zukan_no ] == 1 ){
					m.new_flag = 0;
				}else{
					m.new_flag = 1;
				};
			});
			
			return clone_mate_list;
		},
		/**
		 * 売却時の結果を返す。データを返すだけでsaveやsetは行わない。
		 * @memberof Mate
		 * @function sellResult
		 * @param pc {object} PcRECのインスタンス
		 * @param sell_list {array} mateのid一覧
		 * @example
		 * 	戻り値オブジェクト
		 * 	sell_materials {array} 売却したmateデータ
		 * 	get_game_money {int} 獲得金額
		 * 	new_mate_list {object} 売却後の所持モンスター一覧
		 * 	contain_deck {bool} 売却対象にデッキに含まれているものがあるかどうか
		 */
		sellResult:function(pc,sell_list){
			sell_list = _.compact(sell_list);
			//sell_price
			var contain_deck      = false;
			var contain_fav       = false;
			var contain_limit     = false;
			var contain_rare_data = {};
			var get_game_money    = 0;
			var sell_materials    = [];
			var new_mate_list     = _.cloneDeep(pc.attributes.mate_list);
			
			// todo mate_listにいないときのエラーを作る
			_(sell_list).each(function(sell_id,n){
				var mate_data = pc.getMateData(sell_id);
				get_game_money += this.getSellPrice(mate_data);
				new_mate_list = _(new_mate_list).omit(function(mate){ return mate.id == sell_id }).value();
				sell_materials.push( pc.get("mate_list")[sell_id] );
				if( _.contains(pc.attributes.deck, sell_id) ){ contain_deck  = true };
				if( mate_data.fav                           ){ contain_fav   = true };
				if( mate_data.lim_lvl                       ){ contain_limit = true };
				contain_rare_data[mate_data.rarity] = (contain_rare_data[mate_data.rarity])? contain_rare_data[mate_data.rarity]+1 : 1;
			},this);
			
			return {
				sell_materials    :sell_materials,
				get_game_money    :get_game_money,
				new_mate_list     :new_mate_list,
				contain_deck      :contain_deck,
				contain_fav       :contain_fav,
				contain_limit     :contain_limit,
				contain_rare_data :contain_rare_data,
				contain_rare_max  :_.chain(contain_rare_data).keys().map(function(k){ return k.toNumber() }).max().value(),
				is_have_not_all   :(_.size(pc.get("mate_list")) <= sell_list.length),
			}
		},
		getSellPrice: function(mate_data){
			var hosei = this.getHosei();
			var price = mate_data.sell_price + (100 * hosei[mate_data.rarity] + mate_data.total_exp * hosei[mate_data.rarity] * 0.05).floor();
			return price;
		},
		/**
		 * 売却結果をPcRECにsetする。saveは行わない。pc.attributes.result.sell、pc.set("mate_list")、pc.setItem( df.ITEM_ID_GAME_MONEY )をsetする。
		 * @memberof Mate
		 * @function sell
		 * @param pc {object} PcRECのインスタンス
		 * @param sell_list {array} mateのid一覧
		 * @return {object} PcRECのインスタンス
		 */
		sell:function(pc,sell_list){
			
			var result = this.sellResult(pc,sell_list);
			if( result.is_have_not_all ){ throw "所持モンスターが1体もいなくなるため、実行できません。" }
			if( result.contain_fav     ){ throw "お気に入りに設定しているモンスターが含まれているため、実行できません。" }
			if( result.contain_deck    ){ throw "デッキ編成されているモンスターが含まれているため、実行できません。" }
			
			pc.attributes.result.sell = {};
			pc.attributes.result.sell.materials = result.sell_materials;
			pc.attributes.result.sell.get_game_money = result.get_game_money;
			pc.set("mate_list",result.new_mate_list);
			pc.setItem( df.ITEM_GAME_MONEY , pc.getItem( df.ITEM_GAME_MONEY ) + result.get_game_money );
			
			return result;
		},
		/**
		 * 合成時の結果を返す。データを返すだけでsaveやsetは行わない。
		 * @memberof Mate
		 * @function mixResult
		 * @param pc {object} PcRECのインスタンス
		 * @param base {int} 強化するモンスターのid
		 * @param mat_list {array} 素材にするモンスターのid一覧
		 * @example
		 * 	戻り値オブジェクト
		 * 	contain_deck   :contain_deck,
		 * 	need_game_money:need_game_money,
		 * 	new_mate_list  :new_mate_list,
		 * 	mix_materials  :mix_materials, 
		 * 	materials      :mix_materials,
		 * 	get_exp        :get_exp,
		 * 	before         :before,
		 * 	after          :after,
		 */
		mixResult:function(pc,base,mat_list){
			// todo 合成のエラーを作る
			var contain_limit     = false;
			var contain_deck      = false;
			var contain_fav       = false;
			var contain_rare_data = {};
			var need_game_money   = 0;
			var get_exp           = 0;
			var mix_materials     = [];
			var new_mate_list     = _.cloneDeep(pc.attributes.mate_list);
			var hosei             = this.getHosei();
			
			// todo baseまたは素材がmate_listにいないときのエラーを作る
			_(mat_list).each(function(mat_id,n){
				var mate_data = pc.getMateData(mat_id);
				need_game_money += (100 * hosei[mate_data.rarity] + mate_data.total_exp * hosei[mate_data.rarity] * 0.1).floor();
				get_exp         += (100 * hosei[mate_data.rarity] + mate_data.total_exp * hosei[mate_data.rarity] * 0.2).floor();
				new_mate_list = _(new_mate_list).omit(function(mate){ return mate.id == mat_id }).value();
				mix_materials.push( pc.get("mate_list")[mat_id] );
				if( _.contains(pc.attributes.deck, mat_id) ){ contain_deck = true };
				if( mate_data.fav     ){ contain_fav   = true };
				if( mate_data.lim_lvl ){ contain_limit = true };
				contain_rare_data[mate_data.rarity] = (contain_rare_data[mate_data.rarity])? contain_rare_data[mate_data.rarity]+1 : 1;
			});
			
			var before          = _.cloneDeep( pc.get("mate_list")[base] );
			new_mate_list[base] = this.getStatusFromTotalExp( before, before.total_exp + get_exp ); //レベルアップ処理
			var after           = _.cloneDeep( new_mate_list[base] );
			return {
				contain_limit     :contain_limit,
				contain_deck      :contain_deck,
				contain_fav       :contain_fav,
				contain_rare_data :contain_rare_data,
				contain_rare_max  :_.chain(contain_rare_data).keys().map(function(k){ return k.toNumber() }).max().value(),
				contain_base      :_.contains(mat_list,base),
				is_max_level      :this.isMaxLevel(before),
				is_max_limit      :this.isMaxLimit(before),
				is_limit_level    :this.isLimitLevel(before),
				money_not_enough  :( pc.getItem( df.ITEM_GAME_MONEY ) < need_game_money ),
				need_game_money   :need_game_money,
				new_mate_list     :new_mate_list,
				mix_materials     :mix_materials, 
				get_exp           :get_exp,
				before            :before,
				after             :after,
			}
		},
		/**
		 * 合成結果をPcRECにsetする。saveは行わない。pc.attributes.result.mix、pc.set("mate_list")、pc.setItem( df.ITEM_GAME_MONEY )をsetする。
		 * @memberof Mate
		 * @function mix
		 * @param pc {object} PcRECのインスタンス
		 * @param base {int} 強化するモンスターのid
		 * @param mat_list {array} 素材にするモンスターのid一覧
		 * @return {object} PcRECのインスタンス
		 */
		mix:function(pc,base,mat_list){
			
			var result = this.mixResult(pc,base,mat_list);
			if( result.is_max_level     ){ throw "最大レベルに到達しているため、実行できません。" }
			if( result.money_not_enough ){ throw "コインが不足しているため、実行できません" }
			if( result.contain_base     ){ throw "ベースに設定しているモンスターが含まれているため、実行できません。" }
			if( result.contain_fav      ){ throw "お気に入りに設定しているモンスターが含まれているため、実行できません。" }
			if( result.contain_deck     ){ throw "デッキ編成されているモンスターが含まれているため、実行できません。" }
			
			pc.set("mate_list",result.new_mate_list);
			pc.setItem( df.ITEM_GAME_MONEY , pc.getItem( df.ITEM_GAME_MONEY ) - result.need_game_money );
			
			pc.attributes.result.mix = {}; //一回消す
			pc.attributes.result.mix.before          = result.before;
			pc.attributes.result.mix.after           = result.after;
			pc.attributes.result.mix.materials       = result.mix_materials;
			pc.attributes.result.mix.need_game_money = result.need_game_money;
			pc.attributes.result.mix.get_exp         = result.get_exp;
			return result;
		},
		/**
		 * 限界突破合成時の結果を返す。データを返すだけでsaveやsetは行わない。
		 * @memberof Mate
		 * @function mixResult
		 * @param pc {object} PcRECのインスタンス
		 * @param base {int} 強化するモンスターのid
		 * @param mat_list {array} 素材にするモンスターのid一覧
		 * @example
		 * 	戻り値オブジェクト
		 * 	contain_deck   :contain_deck,
		 * 	need_game_money:need_game_money,
		 * 	new_mate_list  :new_mate_list,
		 * 	mix_materials  :mix_materials, 
		 * 	materials      :mix_materials,
		 * 	get_exp        :get_exp,
		 * 	before         :before,
		 * 	after          :after,
		 */
		limitupResult:function(pc,base,mat_list){
			// todo 合成のエラーを作る
			var contain_limit     = false;
			var contain_deck      = false;
			var contain_fav       = false;
			var contain_rare_data = {};
			var need_game_money   = 0;
			var get_exp           = 0;
			var mix_materials     = [];
			var new_mate_list     = _.cloneDeep(pc.attributes.mate_list);
			
			// todo baseまたは素材がmate_listにいないときのエラーを作る
			_(mat_list).each(function(mat_id,n){
				var mate_data = pc.getMateData(mat_id);
				new_mate_list = _(new_mate_list).omit(function(mate){ return mate.id == mat_id }).value();
				mix_materials.push( pc.get("mate_list")[mat_id] );
				if( _.contains(pc.attributes.deck, mat_id) ){ contain_deck = true };
				if( mate_data.fav     ){ contain_fav   = true };
				if( mate_data.lim_lvl ){ contain_limit = true };
				contain_rare_data[mate_data.rarity] = (contain_rare_data[mate_data.rarity])? contain_rare_data[mate_data.rarity]+1 : 1;
			});
			
			var before          = _.cloneDeep( pc.get("mate_list")[base] );
			new_mate_list[base] = this.getStatusFromTotalExp( before, before.total_exp + get_exp ); //レベルアップ処理
			new_mate_list[base].lim_lvl += 1;
			var after           = _.cloneDeep( new_mate_list[base] );
			return {
				contain_limit     :contain_limit,
				contain_deck      :contain_deck,
				contain_fav       :contain_fav,
				contain_rare_data :contain_rare_data,
				contain_rare_max  :_.chain(contain_rare_data).keys().map(function(k){ return k.toNumber() }).max().value(),
				contain_base      :_.contains(mat_list,base),
				is_max_level      :this.isMaxLevel(before),
				is_max_limit      :this.isMaxLimit(before),
				is_limit_level    :this.isLimitLevel(before),
				money_not_enough  :( pc.getItem( df.ITEM_GAME_MONEY ) < need_game_money ),
				need_game_money   :need_game_money,
				new_mate_list     :new_mate_list,
				mix_materials     :mix_materials, 
				get_exp           :0,
				before            :before,
				after             :after,
			}
		},
		/**
		 * 限界突破合成結果をPcRECにsetする。saveは行わない。pc.attributes.result.mix、pc.set("mate_list")、pc.setItem( df.ITEM_GAME_MONEY )をsetする。
		 * @memberof Mate
		 * @function mix
		 * @param pc {object} PcRECのインスタンス
		 * @param base {int} 強化するモンスターのid
		 * @param mat_list {array} 素材にするモンスターのid一覧
		 * @return {object} PcRECのインスタンス
		 */
		limitup:function(pc,base,mat_list){
			
			var result = this.limitupResult(pc,base,mat_list);
			if( result.is_max_limit     ){ throw "限界突破の上限のため、実行できません。" }
			if( result.contain_base     ){ throw "ベースに設定しているモンスターが含まれているため、実行できません。" }
			if( result.contain_fav      ){ throw "お気に入りに設定しているモンスターが含まれているため、実行できません。" }
			if( result.contain_deck     ){ throw "デッキ編成されているモンスターが含まれているため、実行できません。" }
			if( result.money_not_enough ){ throw "コインが不足しているため、実行できません" }
			
			pc.set("mate_list",result.new_mate_list);
			pc.setItem( df.ITEM_GAME_MONEY , pc.getItem( df.ITEM_GAME_MONEY ) - result.need_game_money );
			
			pc.attributes.result.limitup = {}; //一回消す
			pc.attributes.result.limitup.before          = result.before;
			pc.attributes.result.limitup.after           = result.after;
			pc.attributes.result.limitup.materials       = result.mix_materials;
			pc.attributes.result.limitup.need_game_money = result.need_game_money;
			pc.attributes.result.limitup.get_exp         = result.get_exp;
			return result;
		},
		/**
		 * 強化時の結果を返す。データを返すだけでsaveやsetは行わない。
		 */
		powerupResult:function(pc,base){
			// todo 合成のエラーを作る
			var is_max_level    = false;
			var is_limit_level  = false;
			var new_mate_list   = _.cloneDeep(pc.attributes.mate_list);
			var base_data       = pc.get("mate_list")[base];
			var exp_data        = this.getExpData(base_data);
			var need_game_money = (exp_data.next_need_exp).floor();
			var before          = _.cloneDeep( base_data );
			
			new_mate_list[base] = this.getStatusFromLvl(before,before.lvl + 1); //レベルアップ処理
			var after = _.cloneDeep( new_mate_list[base] );
			
			return {
				is_max_level    :this.isMaxLevel(before),
				is_max_limit    :this.isMaxLimit(before),
				is_limit_level  :this.isLimitLevel(before),
				money_not_enough:( pc.getItem( df.ITEM_GAME_MONEY ) < need_game_money ),
				need_game_money :need_game_money,
				new_mate_list   :new_mate_list,
				before          :before,
				after           :after,
			}
		},
		/**
		 * レベルアップ強化結果をPcRECにsetする。saveは行わない。pc.set("mate_list")、pc.setItem( df.ITEM_GAME_MONEY )をsetする。
		 * @memberof Mate
		 * @function mix
		 * @param pc {object} PcRECのインスタンス
		 * @param base {int} 強化するモンスターのid
		 * @return {object} PcRECのインスタンス
		 */
		powerup:function(pc,base){
			
			var result = this.powerupResult(pc,base);
			if( result.is_max_level     ){ throw "レベルが最大のため、実行できません" }
			if( result.money_not_enough ){ throw "コインが不足しているため、実行できません" }
			
			pc.set("mate_list",result.new_mate_list);
			pc.setItem( df.ITEM_GAME_MONEY , pc.getItem( df.ITEM_GAME_MONEY ) - result.need_game_money );
			
			pc.attributes.result.powerup = {}; //一回消す
			pc.attributes.result.powerup.before          = result.before;
			pc.attributes.result.powerup.after           = result.after;
			pc.attributes.result.powerup.need_game_money = result.need_game_money;
			pc.attributes.result.powerup.get_exp         = result.get_exp;
			return result;
		},
	});
	
return Mate;

});
