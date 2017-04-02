this["JST"] = this["JST"] || {};

this["JST"]["_macro"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<macro id="card_list_menu"><div class="text_hold_info"><i>※長押しで詳細が見れます</i></div><a id="toggle_status_btn" class="toggle_status_btn list_menu_btn"><i>ステータス切替</i></a><a id="sort_btn" class="sort_btn list_menu_btn"><i>攻撃力順</i></a></macro><macro id="card_list_content"><div id="card_list" class="scroll_wrapper"><div class="up_spacer"></div><div id="card_list_view" class="card_list_container"></div><div class="bottom_spacer"></div></div><div id="info_view"></div><div class="kei_1"></div><div class="kei_2"></div><div id="page_view"></div></macro><macro id="shop_info"><div class="info_container"><div class="menu_info_bg"></div><div class="status_bg"><div class="status"><div class="status_1">所持コイン:' +
((__t = (game_money)) == null ? '' : __t) +
'</div><div class="status_2">所持魔石:' +
((__t = (real_money)) == null ? '' : __t) +
'</div><div class="status_3">所持パックン:&nbsp;&nbsp;<span class="packun_' +
((__t = (packun_n_id)) == null ? '' : __t) +
'"></span>x' +
((__t = (packun_n)) == null ? '' : __t) +
'&nbsp;&nbsp;<span class="packun_' +
((__t = (packun_s_id)) == null ? '' : __t) +
'"></span>x' +
((__t = (packun_s)) == null ? '' : __t) +
'&nbsp;&nbsp;<span class="packun_' +
((__t = (packun_d_id)) == null ? '' : __t) +
'"></span>x' +
((__t = (packun_d)) == null ? '' : __t) +
'</div></div></div></div></macro><macro id="quest_base_info"><div class="quest_base_info"><div class="quest_data_info_contaner">最大難易度：' +
((__t = (level)) == null ? '' : __t) +
'　最大フロア：' +
((__t = (floor_max)) == null ? '' : __t) +
'</div><div class="quest_enemy_info_contaner"><div class="enemy_info_text">出現モンスター</div><div class="enemys">';
 _.each(enemys,function(enemy,n){ ;
__p += '<div class="card_bg_s"><img src="' +
((__t = (__.path.card('s',enemy.card_data.gra_id))) == null ? '' : __t) +
'"></div>' +
((__t = (( (n+1)%6 == 0 ) ? "<br/>" : "")) == null ? '' : __t);
 }) ;
__p += '</div></div></div></macro><macro id="dev_menu"><hr/><a class="hoge" data-href="/html/Sample/index"       ><span>sample>index          </span></a><br/><a class="hoge" data-href="/html/Sample/pc"          ><span>sample>pc             </span></a><br/><a class="hoge" data-href="/html/Sample/questdata"   ><span>sample>questdata      </span></a><br/><a class="hoge" data-href="/html/Top/index"          ><span>top>index             </span></a><br/><hr/><a class="hoge" data-href="/html/Sample/gacha"       ><span>sample>gacha          </span></a><br/><a class="hoge" data-href="/html/Test/index"         ><span>test>index            </span></a><br/><a class="hoge" data-href="/html/Sample/localstorage"><span>sample>localstorage   </span></a><br/><hr/></macro>';

}
return __p
};

this["JST"]["anim/floor-change"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div id="FC-an-anim"><ol><li id="FC-S-floor-change" ><div class="FC-an-stage"><div id="FC-an-obj-1"><div id="FC-an-obj-2"><div id="FC-an-obj-3"></div><div id="FC-an-obj-4"><div id="FC-an-obj-5"><div id="FC-an-obj-6" class="before-floor"><div>' +
((__t = (before_num_html)) == null ? '' : __t) +
'</div></div></div></div><div id="FC-an-obj-7"><div id="FC-an-obj-8"><div id="FC-an-obj-9" class="after-floor"><div>' +
((__t = (after_num_html)) == null ? '' : __t) +
'</div></div></div></div></div></div><div id="FC-an-obj-10" class="controller"></div></div></li></ol></div>';

}
return __p
};

this["JST"]["battle/battle"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div id="battle_container"><!-- 戦闘背景 --><div id="battle_bg_view"><div class="battle_stage_contaner"><div class="battle_canvas_bg"></div><div class="battle_stage_bg"></div><div class="battle_log_bg"></div><div class="battle_deck_bg"></div><div class="keisen_1"></div><div class="keisen_2"></div></div></div><!-- 味方一覧 --><div id="battle_members_view" class="member charas_view"><!-- 画像 --><div class="chara_list_container member"></div><script data-class="chara_view" type="text/template" id="chara_view_template"><div class="chara_img_container"><img src="<%= __.path.card(img_type, gra_id) %>"></div><div class="chara_turn_mark"></div><div class="chara_frame"></div></script><!-- HP --><div class="hp_list_container"></div><script data-class="hp_view" type="text/template" id="hp_view_template"><div class="chara_hp_num_bg"></div><div class="chara_hp_num"><%= hp %>/<%= hp_full %></div><div class="chara_hp_container"><i class="chara_hp_diff" style="width:100%; -webkit-transform: scale( <%= hp/hp_full %> , 1);"></i><i class="chara_hp_bar"  style="width:<%= hp*100/hp_full %>%;"></i></div><img class="attr_icon" src="<%= __.path.img_ui(\'attr_icon/attr_\'+ attribute +\'.png\') %>"></script><!-- ターン数 --><div class="turn_list_container"></div><script data-class="turn_view" type="text/template" id="turn_view_template"><% if(disp_turn >= 0){ %><div class="chara_turn_num"><%= __.helper.toNumClass(disp_turn) %></div><% } %></script><!-- エフェクト表示用 --><div class="chara_effect_list_container member"></div><script data-class="chara_effect_view" type="text/template" id="chara_effect_view_template"><div class="icon_contaner"></div></script></div><!-- 敵一覧 基本構造は味方と同じ --><div id="battle_enemys_view" class="enemy charas_view"><div class="chara_list_container enemy"></div><div class="hp_list_container enemy"></div><div class="turn_list_container enemy"></div><div class="chara_effect_list_container enemy"></div></div><!-- ターン切り替え演出表示用コンテナ --><div id="battle_turn_change_view"></div><script type="text/template" id="battle_turn_change_view_template"></script><!-- 戦闘ログ --><div id="battle_log_view"></div><script type="text/template" id="battle_log_view_template"><div class="battle_log_container"><div class="text_1"><%= messages[0] %></div><div class="text_2"><%= messages[1] %></div></div></script><!-- コマンド画面 --><div id="battle_command_view"></div><script type="text/template" id="battle_command_view_template"><div class="battle_command_container"><div class="target_select_view enemy"><% _.each(enemys,function(enemy,n){ %><span class="target_mark_contaner command_enemy_select command_attack enemy_<%= n+1 %> size_<%= enemys.length %>" data-enemy_id="<%= enemy.id %>" ><span class="target_mark <%= (enemy.hp <= 0)?\'is_death\':\'is_alive\' %> <%= (enemy.captured)?\'is_captured\':\'\' %>" data-enemy_id="<%= enemy.id %>"><i data-enemy_id="<%= enemy.id %>"></i></span></span><% }) %></div><div class="target_select_view show_detail"><% _.each(members,function(member,n){ %><div class="target_mark_contaner command_member_detail member_<%= n+1 %>" data-member_id="<%= member.id %>" ></div><% }) %></div><div class="target_select_view member"><% _.each(members,function(member,n){ %><span class="target_mark_contaner command_member_select member_<%= n+1 %>" data-member_id="<%= member.id %>" ><span class="target_mark <%= (member.hp <= 0)?\'is_death\':\'is_alive\' %> <%= (member.captured)?\'is_captured\':\'\' %>" data-member_id="<%= member.id %>"><i data-member_id="<%= member.id %>"></i></span></span><% }) %></div><div class="command_attack_info">攻撃は目標をタップしてください</div><div class="player_command_bg"></div><div class="player_command_container"><% if(appenv.BUILD_LEVEL==appenv.DEBUG_BUILD){ %><a class="command_debug" style="position:absolute; top:-350px; left:0px;">【デバッグ】</a><% } %><a class="command_btn command_howto"></a><a class="command_btn command_capture"><i>つかまえる</i></a><a class="command_btn command_guard"><i>ぼうぎょ</i></a><a class="command_btn command_skill skill_1" data-skill-slot="0" state-remain="<%= (!!member.skill_data[0].use_remain) %>"><i><%= member.skill_data[0].name %></i><i class="remain_bg"><i class="remain_text">残り</i><i class="remain_num"><%= member.skill_data[0].use_remain %>/<%= member.skill_data[0].use_max %></i></i></a><a class="command_btn command_skill skill_2" data-skill-slot="1" state-remain="<%= (!!member.skill_data[1].use_remain) %>"><i><%= member.skill_data[1].name %></i><i class="remain_bg"><i class="remain_text">残り</i><i class="remain_num"><%= member.skill_data[1].use_remain %>/<%= member.skill_data[1].use_max %></i></i></a></div></div></script><!-- 全画面演出用 --><div id="full_screen_effect_view"></div></div>';

}
return __p
};

this["JST"]["battle/capture_confirm_inner"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class="capture_confirm_inner menu_info_list_contaner"><div class="text">使用するアイテムを選択してください</div><div class="packun_info menu_info_contaner"><div class="title_text">所持パックン</div><div class="packun_list_contaner"><div class="packun_contaner packun_1 item normal" data-item_id="' +
((__t = (df.ITEM_PACKUN_NORMAL)) == null ? '' : __t) +
'"><div class="packun_icon"></div><div class="packun_num"><i>' +
((__t = (item[df.ITEM_PACKUN_NORMAL])) == null ? '' : __t) +
'</i></div></div><div class="packun_contaner packun_2 item super " data-item_id="' +
((__t = (df.ITEM_PACKUN_SUPER )) == null ? '' : __t) +
'"><div class="packun_icon"></div><div class="packun_num"><i>' +
((__t = (item[df.ITEM_PACKUN_SUPER ])) == null ? '' : __t) +
'</i></div></div><div class="packun_contaner packun_3 item dragon" data-item_id="' +
((__t = (df.ITEM_PACKUN_DRAGON)) == null ? '' : __t) +
'"><div class="packun_icon"></div><div class="packun_num"><i>' +
((__t = (item[df.ITEM_PACKUN_DRAGON])) == null ? '' : __t) +
'</i></div></div></div></div></div>';

}
return __p
};

this["JST"]["card/book"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p +=
((__t = (__.helper.startPage("card-book","card_list_page"))) == null ? '' : __t) +
'<div class="list_bg"></div><div class="page_title"><i>図鑑</i></div><div class="page_content"><div class="list_container"><div id="card_list" class="scroll_wrapper"><div class="up_spacer"></div><div id="card_list_view" class="card_list_container">';
 _.each(discover_list,function(data){ ;

 if(data.has_flag){ ;
__p += '<div class="book_el" data-id="' +
((__t = (data.id)) == null ? '' : __t) +
'"><img class="face_img" src="' +
((__t = (__.path.card('list',data.gra_id))) == null ? '' : __t) +
'"><div class="status_1">No.' +
((__t = (data.zukan_no)) == null ? '' : __t) +
'<br/>' +
((__t = (data.name)) == null ? '' : __t) +
'<br/></div><div class="status_2">' +
((__t = (__.helper.rarityText(data.rarity))) == null ? '' : __t) +
' [' +
((__t = (__.helper.attrText(data.attribute))) == null ? '' : __t) +
']<br/>HP' +
((__t = (data.hp_max )) == null ? '' : __t) +
' 攻' +
((__t = (data.atk_max)) == null ? '' : __t) +
' 防' +
((__t = (data.def_max)) == null ? '' : __t) +
' 魔' +
((__t = (data.mag_max)) == null ? '' : __t) +
'<br/></div></div>';
 }else{ ;
__p += '<div class="book_el"><div class="status_1 has_not">No.' +
((__t = (data.zukan_no)) == null ? '' : __t) +
'<br/>??????<br/></div><div class="status_2 has_not">??????<br/>HP??? 攻??? 防??? 魔???<br/></div></div>';
 } ;

 }) ;
__p += '</div><div class="bottom_spacer"></div></div><div class="kei_1"></div><div class="kei_2"></div></div></div>' +
((__t = (__.helper.endPage())) == null ? '' : __t);

}
return __p
};

this["JST"]["card/card_container"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class="card_container"><img class="card_img" src="' +
((__t = (__.path.card('list',gra_id))) == null ? '' : __t) +
'" /><div class="status_container_1"><div class="card_status_bg_1"></div><div class="lvl">' +
((__t = ((is_max_limit)?"限界":(is_max_level)?"最大":lvl)) == null ? '' : __t) +
'</div><div class="fav_mark">★</div><div class="use_deck_mark">使用中</div><div class="attr attr_' +
((__t = (attribute)) == null ? '' : __t) +
'">[' +
((__t = (__.helper.attrText(attribute))) == null ? '' : __t) +
']</div><div class="atk">' +
((__t = (atk)) == null ? '' : __t) +
'</div><div class="def">' +
((__t = (def)) == null ? '' : __t) +
'</div><div class="mag">' +
((__t = (mag)) == null ? '' : __t) +
'</div><div class="hp" >' +
((__t = (hp )) == null ? '' : __t) +
' / ' +
((__t = (hp_full)) == null ? '' : __t) +
'</div><div class="hp_time">' +
((__t = (hp_text)) == null ? '' : __t) +
'</div><div class="hp_bar_container"><div class="hp_bar" style="width:' +
((__t = (hp_per * 100)) == null ? '' : __t) +
'%;"></div></div></div><div class="status_container_2"><div class="fav_mark">★</div><div class="use_deck_mark">使用中</div><div class="title  ">スキル</div><div class="skill_1">' +
((__t = (skill_data[0].name)) == null ? '' : __t) +
'</div><div class="skill_2">' +
((__t = (skill_data[1].name)) == null ? '' : __t) +
'</div></div><div class="rarity rarity_icon_' +
((__t = (rarity)) == null ? '' : __t) +
'"></div></div>';

}
return __p
};

this["JST"]["card/deck_detail"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<div class="deck_detail_container"><div class="members_container"><div class="members">';
 _.each(members,function(member){ ;

 if(member){ ;
__p +=
((__t = (__.template("card/card_container",member))) == null ? '' : __t);
 }else{ ;
__p += '<div class="card_container"></div>';
 } ;

 }) ;
__p += '</div></div><div class="status_info_container"><div class="status_info"><div class="title">戦闘力情報</div><div class="status_1"> 火 : ' +
((__t = (_.reduce(members,function(sum,member){ if(member && member.attribute==1){ sum += member.power }; return sum; },0))) == null ? '' : __t) +
'</div><div class="status_2"> 水 : ' +
((__t = (_.reduce(members,function(sum,member){ if(member && member.attribute==2){ sum += member.power }; return sum; },0))) == null ? '' : __t) +
'</div><div class="status_3"> 雷 : ' +
((__t = (_.reduce(members,function(sum,member){ if(member && member.attribute==3){ sum += member.power }; return sum; },0))) == null ? '' : __t) +
'</div><div class="status_4"> 闇 : ' +
((__t = (_.reduce(members,function(sum,member){ if(member && member.attribute==4){ sum += member.power }; return sum; },0))) == null ? '' : __t) +
'</div><div class="status_5"> 光 : ' +
((__t = (_.reduce(members,function(sum,member){ if(member && member.attribute==5){ sum += member.power }; return sum; },0))) == null ? '' : __t) +
'</div><div class="status_6">総戦闘力: ' +
((__t = (_.reduce(members,function(sum,member){  if(member){ sum += member.power }; return sum; },0))) == null ? '' : __t) +
'</div><div class="line_1"></div><div class="line_2"></div></div></div></div>';

}
return __p
};

this["JST"]["card/detail"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p +=
((__t = (__.helper.startPage("card-detail","card_detail_page"))) == null ? '' : __t) +
'<div class="card_detail_bg"></div><div class="page_title"><i>モンスター詳細</i></div><div class="page_content"><div class="card_name_container"><div class="name">' +
((__t = (name)) == null ? '' : __t) +
'</div><div class="rarity rarity_icon_' +
((__t = (rarity)) == null ? '' : __t) +
'"></div><div class="attr attr_icon_' +
((__t = (attribute)) == null ? '' : __t) +
'"></div></div><div id="cd_img" class="card_img_container"><div class="card_earth_img"><img src="' +
((__t = (__.path.card('earth',1))) == null ? '' : __t) +
'" width="320" height="250"></div><div class="card_l_img    "><img src="' +
((__t = (__.path.card('l',gra_id)    )) == null ? '' : __t) +
'" width="320" height="250"></div></div>';
 if(type_book){ ;
__p += '<div class="card_status_container book"><div class="el_1 lvl    ">最大Lv.' +
((__t = (lvl_max)) == null ? '' : __t) +
'</div><div class="el_2 lim_lvl">限界Lv.' +
((__t = (lvl_max + lim_lvl_max)) == null ? '' : __t) +
'</div><div class="el_3 hp     ">最大HP' +
((__t = (hp_max)) == null ? '' : __t) +
'</div><div class="el_4 atk    ">最大攻撃力' +
((__t = (atk_max)) == null ? '' : __t) +
'</div><div class="el_5 def    ">最大防御力' +
((__t = (def_max)) == null ? '' : __t) +
'</div><div class="el_6 mag    ">最大魔力' +
((__t = (mag_max)) == null ? '' : __t) +
'</div></div>' +
((__t = ((prev_index>0)? '<a class="prev_btn arrow_btn_1"><i>前へ</i></a>' : "")) == null ? '' : __t) +
'' +
((__t = ((next_index>0)? '<a class="next_btn arrow_btn_2"><i>次へ</i></a>' : "")) == null ? '' : __t);
 }else{ ;
__p += '<div class="card_status_container"><div class="lvl">';
 if(is_max_limit){ ;
__p += 'Lv.' +
((__t = (lvl)) == null ? '' : __t) +
'/(' +
((__t = (lvl_max)) == null ? '' : __t) +
'+' +
((__t = (lim_lvl)) == null ? '' : __t) +
') 限界レベル ';
 }else if(is_max_level){ ;
__p += 'Lv.' +
((__t = (lvl)) == null ? '' : __t) +
'/(' +
((__t = (lvl_max)) == null ? '' : __t) +
'+' +
((__t = (lim_lvl)) == null ? '' : __t) +
') 最大レベル ';
 }else if(lim_lvl){ ;
__p += 'Lv.' +
((__t = (lvl)) == null ? '' : __t) +
'/(' +
((__t = (lvl_max)) == null ? '' : __t) +
'+' +
((__t = (lim_lvl)) == null ? '' : __t) +
') ';
 }else{ ;
__p += 'Lv.' +
((__t = (lvl)) == null ? '' : __t) +
'/' +
((__t = (lvl_max)) == null ? '' : __t) +
' ';
 } ;
__p += '</div><!--<div class="exp_bar_container"><div class="exp_bar" style="width:' +
((__t = (exp_per * 100)) == null ? '' : __t) +
'%;"></div></div>--><!-- <div class="lvl_text">';
 if(is_max_level){ ;
__p += '(最大レベル)';
 }else{ ;
__p += '(次レベルまで' +
((__t = (next_need_exp)) == null ? '' : __t) +
')';
 } ;
__p += '</div> --><div class="hp">HP:' +
((__t = (hp)) == null ? '' : __t) +
'/' +
((__t = (hp_full)) == null ? '' : __t) +
'</div><div class="hp_bar_container"><div class="hp_bar" style="width:' +
((__t = (hp_per * 100)) == null ? '' : __t) +
'%;"></div></div><div class="hp_text">' +
((__t = (hp_text)) == null ? '' : __t) +
'</div><div class="atk">攻撃力:' +
((__t = (atk)) == null ? '' : __t) +
'</div><div class="def">防御力:' +
((__t = (def)) == null ? '' : __t) +
'</div><div class="mag">魔力:' +
((__t = (mag)) == null ? '' : __t) +
'</div><div class="skill_1">スキル：' +
((__t = (skill_data[0].name)) == null ? '' : __t) +
' ' +
((__t = (skill_remain_text_1)) == null ? '' : __t) +
'<br/>' +
((__t = (skill_data[0].discription)) == null ? '' : __t) +
'<br/></div><div class="skill_2">スキル：' +
((__t = (skill_data[1].name)) == null ? '' : __t) +
' ' +
((__t = (skill_remain_text_2)) == null ? '' : __t) +
'<br/>' +
((__t = (skill_data[1].discription)) == null ? '' : __t) +
'<br/></div></div>';
 } ;
__p += '<a class="close_btn cmn_btn_1"><i>閉じる</i></a></div>' +
((__t = (__.helper.endPage())) == null ? '' : __t);

}
return __p
};

this["JST"]["card/index"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p +=
((__t = (__.helper.startPage("card-index"))) == null ? '' : __t) +
'<div class="list_bg"></div><div class="page_title"><i>モンスターメニュー</i></div><div class="page_content"><div class="info_container"><div class="menu_info_bg"></div><div class="status_bg"><div class="status"><div class="status_1">所持モンスター:' +
((__t = (mate_num)) == null ? '' : __t) +
'/' +
((__t = (mate_max)) == null ? '' : __t) +
'</div><div class="status_2">所持ガチャP:' +
((__t = (gacha_point)) == null ? '' : __t) +
'</div><div class="status_3">所持コイン:' +
((__t = (game_money)) == null ? '' : __t) +
'</div><div class="status_4">所持魔石:' +
((__t = (real_money)) == null ? '' : __t) +
'</div></div></div><div class="deck">';
 _.each(members,function(member,n){ ;
__p += '<div class="card_bg_s card_' +
((__t = (n + 1)) == null ? '' : __t) +
'">';
 if (member != undefined){ ;
__p += '<img src="' +
((__t = (__.path.card('s',member.gra_id))) == null ? '' : __t) +
'"><div class="hp_bar_container"><div class="hp_bar" style="width:' +
((__t = (member.hp_per * 100)) == null ? '' : __t) +
'%;"></div></div>';
 } ;
__p += '</div>';
 }) ;
__p += '</div></div><div class="list_container"><div id="card_index_list" class="scroll_wrapper"><div class="up_spacer"></div><a class="list_btn_1" data-after_se="1" data-href="/html/Card/deckMemberSelect"><i>デッキ編成</i></a><a class="list_btn_1" data-after_se="1" data-href="/html/Card/powerupSelect"   ><i>強化</i></a><a class="list_btn_1" data-after_se="1" data-href="/html/Card/sellSelect"      ><i>売却</i></a><a class="list_btn_1" data-after_se="1" data-href="/html/Card/favSelect"       ><i>お気に入り登録</i></a><a class="list_btn_1" data-after_se="1" data-href="/html/Card/book"            ><i>図鑑</i></a><a class="list_btn_1" data-after_se="1" data-href="/html/Card/mixSelect"       style="display:none;"><i>合成</i></a><div class="bottom_spacer"></div></div><div class="kei_1"></div><div class="kei_2"></div></div></div>' +
((__t = (__.helper.endPage())) == null ? '' : __t);

}
return __p
};

this["JST"]["card/list_info_view"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class="card_info_container"><div class="have_mate_num     ">モンスター:' +
((__t = (mate_num)) == null ? '' : __t) +
'/' +
((__t = (mate_max)) == null ? '' : __t) +
'</div><div class="have_game_money   ">所持コイン:' +
((__t = (have_game_money   )) == null ? '' : __t) +
'</div><div class="need_powerup_money">必要コイン:' +
((__t = (need_powerup_money)) == null ? '' : __t) +
'</div><div class="need_limitup_money">必要コイン:' +
((__t = (need_limitup_money)) == null ? '' : __t) +
'</div><div class="need_mix_money    ">必要コイン:' +
((__t = (need_mix_money    )) == null ? '' : __t) +
'</div><div class="get_mix_exp       ">入手経験値:' +
((__t = (get_mix_exp       )) == null ? '' : __t) +
'</div><div class="sell_price        ">入手コイン:' +
((__t = (sell_price        )) == null ? '' : __t) +
'</div></div>';

}
return __p
};

this["JST"]["card/select_list"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p +=
((__t = (__.helper.startPage("card-" + type,"card_list_page"))) == null ? '' : __t) +
'<div class="list_bg"></div><div class="card_list_bg"></div><div class="page_title"><i>' +
((__t = ((type=="mix_select")    ? '合成'           : '')) == null ? '' : __t) +
'' +
((__t = ((type=="fav_select")    ? 'お気に入り登録' : '')) == null ? '' : __t) +
'' +
((__t = ((type=="deck")          ? 'デッキ編成'     : '')) == null ? '' : __t) +
'' +
((__t = ((type=="sell_select")   ? '売却'           : '')) == null ? '' : __t) +
'' +
((__t = ((type=="limitup_select")? '限界突破合成  ' : '')) == null ? '' : __t) +
'' +
((__t = ((type=="powerup_select")? 'モンスター強化' : '')) == null ? '' : __t) +
'</i></div><div class="page_content"><div class="members_bg"></div><div id="members_view" class="member_container"></div>' +
((__t = ((type=="mix_select")    ? '<div class="left_arrow"></div>' : '')) == null ? '' : __t) +
'' +
((__t = ((type=="limitup_select")? '<div class="left_arrow"></div>' : '')) == null ? '' : __t) +
'' +
((__t = ((type=="mix_select")    ? '<a id="mix_btn"         class="cmn_btn_1 mix_btn        "><i>合成</i></a>           ' : '')) == null ? '' : __t) +
'' +
((__t = ((type=="fav_select")    ? '                                                                                    ' : '')) == null ? '' : __t) +
'' +
((__t = ((type=="deck")          ? '<a id="deck_detail_btn" class="cmn_btn_1 deck_detail_btn"><i>デッキ<br/>詳細</i></a>' : '')) == null ? '' : __t) +
'' +
((__t = ((type=="sell_select")   ? '<a id="sell_btn"        class="cmn_btn_1 sell_btn       "><i>売却</i></a>           ' : '')) == null ? '' : __t) +
'' +
((__t = ((type=="limitup_select")? '<a id="limitup_btn"     class="cmn_btn_1 limitup_btn    "><i>限界突破</i></a>       ' : '')) == null ? '' : __t) +
'' +
((__t = ((type=="powerup_select")? '                                                                                    ' : '')) == null ? '' : __t) +
'<div class="text_hold_info"><i>※長押しで詳細が見れます</i></div><a id="toggle_status_btn" class="toggle_status_btn list_menu_btn"><i>ステータス切替</i></a><a id="sort_btn" class="sort_btn list_menu_btn"><i>攻撃力順</i></a><div class="list_container"><div id="card_list" class="scroll_wrapper"><div class="up_spacer"></div><div id="card_list_view" class="card_list_container"></div><div class="bottom_spacer"></div></div><div id="info_view"></div><div class="kei_1"></div><div class="kei_2"></div><div id="page_view"></div></div></div>' +
((__t = (__.helper.endPage())) == null ? '' : __t);

}
return __p
};

this["JST"]["cave/bg_view_style"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<style>#stage_view *,#stage_view,.scroller *,.scroller{ -webkit-transform-style: preserve-3d; }#map_view {width: ' +
((__t = (map.x*chip_size)) == null ? '' : __t) +
'px;height:' +
((__t = (map.y*chip_size)) == null ? '' : __t) +
'px;position:relative;width :320px;height:300px;overflow:hidden;background:#' +
((__t = (bg_color)) == null ? '' : __t) +
';}#map_view .scroller{width: ' +
((__t = (map.x*chip_size)) == null ? '' : __t) +
'px;height:' +
((__t = (map.y*chip_size)) == null ? '' : __t) +
'px;}#scratch_view {width: ' +
((__t = (map.x*chip_size)) == null ? '' : __t) +
'px;height:' +
((__t = (map.y*chip_size)) == null ? '' : __t) +
'px;position:relative;top:0px;left:0px;}#bg_view {width: ' +
((__t = (map.x*chip_size-1)) == null ? '' : __t) +
'px;height:' +
((__t = (map.y*chip_size-1)) == null ? '' : __t) +
'px;position:absolute;top:0px;left:0px;}.' +
((__t = (chips_class.floor      )) == null ? '' : __t) +
',.' +
((__t = (chips_class.block      )) == null ? '' : __t) +
',.' +
((__t = (chips_class.wall       )) == null ? '' : __t) +
'{width: ' +
((__t = (chip_size+0.8)) == null ? '' : __t) +
'px;height:' +
((__t = (chip_size+0.8)) == null ? '' : __t) +
'px;position:absolute;display:block;}.' +
((__t = (chips_class.scratch_obj)) == null ? '' : __t) +
',.' +
((__t = (chips_class.anchor     )) == null ? '' : __t) +
'{width: ' +
((__t = (chip_size+0.4)) == null ? '' : __t) +
'px;height:' +
((__t = (chip_size+0.4)) == null ? '' : __t) +
'px;position:absolute;display:block;}.' +
((__t = (chips_class.block      )) == null ? '' : __t) +
'{background-color:#' +
((__t = (bg_color)) == null ? '' : __t) +
';}/* マップチップポジション */';
 for(var i=0; i<map.y; i++) { ;
__p += '.' +
((__t = (chips_class.column + i)) == null ? '' : __t) +
'{ top:' +
((__t = (i * chip_size -0.4)) == null ? '' : __t) +
'px; }';
 } ;

 for(var i=0; i<map.x; i++) { ;
__p += '.' +
((__t = (chips_class.row + i)) == null ? '' : __t) +
'   { left:' +
((__t = (i * chip_size -0.4)) == null ? '' : __t) +
'px; }';
 } ;
__p += '/* 壁・床グラフィック絵の指定 */';
 for(var i in chipsf) { ;
__p += '.' +
((__t = (chips_class.floor + chipsf[i])) == null ? '' : __t) +
'{background:url(' +
((__t = (__.path.img())) == null ? '' : __t) +
'map_chip/floor_sub/' +
((__t = (floor_sub_gra_id)) == null ? '' : __t) +
'/' +
((__t = (chipsf[i])) == null ? '' : __t) +
'.png);-webkit-background-size: ' +
((__t = (chip_size+0.8)) == null ? '' : __t) +
'px ' +
((__t = (chip_size+0.8)) == null ? '' : __t) +
'px;background-position:-0.4px -0.4px;}';
 } ;

 for(var i in chipsw) { ;
__p += '.' +
((__t = (chips_class.wall + chipsw[i])) == null ? '' : __t) +
'{background:url(' +
((__t = (__.path.img())) == null ? '' : __t) +
'map_chip/wall/' +
((__t = (wall_gra_id)) == null ? '' : __t) +
'/' +
((__t = (chipsw[i])) == null ? '' : __t) +
'.png);-webkit-background-size: ' +
((__t = (chip_size+0.8)) == null ? '' : __t) +
'px ' +
((__t = (chip_size+0.8)) == null ? '' : __t) +
'px;background-position:-0.4px -0.4px;}';
 } ;
__p += '/* jChrono対応 */.' +
((__t = (chips_class.scratch_obj)) == null ? '' : __t) +
' .close_el,.' +
((__t = (chips_class.scratch_obj)) == null ? '' : __t) +
' .first_touch_el,.' +
((__t = (chips_class.scratch_obj)) == null ? '' : __t) +
' .next_el,.' +
((__t = (chips_class.scratch_obj)) == null ? '' : __t) +
' .open_el,.' +
((__t = (chips_class.scratch_obj)) == null ? '' : __t) +
' .object_el,.' +
((__t = (chips_class.scratch_obj)) == null ? '' : __t) +
' .object_el *,.' +
((__t = (chips_class.scratch_obj)) == null ? '' : __t) +
' .object_el .show_obj,.' +
((__t = (chips_class.scratch_obj)) == null ? '' : __t) +
' .object_el .close_obj{width: ' +
((__t = (chip_size+0.4)) == null ? '' : __t) +
'px;height:' +
((__t = (chip_size+0.4)) == null ? '' : __t) +
'px;position:absolute;display:block;background-size    : 100% 100%;background-repeat  : no-repeat;background-position: center center;top:0px;left:0px;}.' +
((__t = (chips_class.scratch_obj)) == null ? '' : __t) +
' .close_el{opacity:0;-webkit-border-radius: 5px;background:-webkit-gradient(linear, left top, left bottom, from(rgba(30,30,30,0.5)), to(rgba(0,0,0,0.5)));}.' +
((__t = (chips_class.scratch_obj)) == null ? '' : __t) +
' .next_el{opacity:0;background-image:url(' +
((__t = (__.path.img('map_chip/fx/2.png'))) == null ? '' : __t) +
');}.first_touch .' +
((__t = (chips_class.scratch_obj)) == null ? '' : __t) +
' .close_el{opacity:0;background-image:url(' +
((__t = (__.path.img('map_chip/fx/2.png'))) == null ? '' : __t) +
');}.' +
((__t = (chips_class.scratch_obj)) == null ? '' : __t) +
' .open_el{opacity:0;background-image:url(' +
((__t = (__.path.img('map_chip/fx/1.png'))) == null ? '' : __t) +
');}</style>';

}
return __p
};

this["JST"]["cave/cave_result_view"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p +=
((__t = (__.helper.startPage("cave-result","cave_result_page"))) == null ? '' : __t) +
'<div class="list_bg"></div><div class="page_title"><i>クエスト結果</i></div><div class="page_content ' +
((__t = ( (exist_reward)? 'exist_reward' : '')) == null ? '' : __t) +
'"><div class="result_bg"></div><div class="kei_1"></div><div class="kei_2"></div><div class="quest_title">- ' +
((__t = (dungeon_name)) == null ? '' : __t) +
' -</div><div class="result_img ' +
((__t = (play_result)) == null ? '' : __t) +
'"></div><div class="result_content"><div class="result"><i class="name">獲得コイン            </i><i class="num">' +
((__t = (coin       )) == null ? '' : __t) +
'</i></div><div class="result"><i class="name">獲得ガチャポイント    </i><i class="num">' +
((__t = (real_money )) == null ? '' : __t) +
'</i></div><div class="result"><i class="name">獲得魔石              </i><i class="num">' +
((__t = (gacha_pt   )) == null ? '' : __t) +
'</i></div><div class="result"><i class="name">獲得フレーズ数        </i><i class="num">' +
((__t = (phrase     )) == null ? '' : __t) +
'</i></div><div class="result"><i class="name">獲得モンスター捕獲数  </i><i class="num">' +
((__t = (capture_num)) == null ? '' : __t) +
'</i></div><div class="result"><i class="name">獲得モンスター討伐回数</i><i class="num">' +
((__t = (battle_cnt )) == null ? '' : __t) +
'</i></div></div>';
 if(result.clear_first_reward.length>0){  ;
__p += '<div class="result_content_clear_reward first"><div class="clear_reward_container"><div class="clear_reward_text"><i>初クリアボーナス！</i></div>';
 _.each(result.clear_first_reward,function(reward){ ;
__p += '<div class="clear_reward_item"><i>' +
((__t = (__.helper.itemName(reward.first_reward_type, reward.first_reward_id, reward.first_reward_vol))) == null ? '' : __t) +
'</i></div>';
 }) ;
__p += '</div></div>';
 } ;

 if(result.clear_reward.length>0){  ;
__p += '<div class="result_content_clear_reward"><div class="clear_reward_container"><div class="clear_reward_text"><i>クリアボーナス！</i></div>';
 _.each(result.clear_reward,function(reward){ ;
__p += '<div class="clear_reward_item"><i>' +
((__t = (__.helper.itemName(reward.reward_type, reward.reward_id, reward.reward_vol))) == null ? '' : __t) +
'</i></div>';
 }) ;
__p += '</div></div>';
 } ;
__p += '<a class="result_btn"><i>OK</i></a></div><div class="result_black_screen"></div>' +
((__t = (__.helper.endPage())) == null ? '' : __t);

}
return __p
};

this["JST"]["cave/event_info_view"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class="bottom_info"><div class="item_event_info">' +
((__t = (cave.positive_open)) == null ? '' : __t) +
'/' +
((__t = (cave.positive_num)) == null ? '' : __t) +
'</div><div class="enemy_event_info">' +
((__t = (cave.negative_open)) == null ? '' : __t) +
'/' +
((__t = (cave.negative_num)) == null ? '' : __t) +
'</div></div>';

}
return __p
};

this["JST"]["cave/info_view"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class="top_info"><div class="floor_info">' +
((__t = (cave.floor_now)) == null ? '' : __t) +
'/' +
((__t = (quest_data.floor_max)) == null ? '' : __t) +
'</div><div class="level_info">' +
((__t = (cave.difficulty)) == null ? '' : __t) +
'</div><div class="enemy_info">' +
((__t = (cave.result.enemy_win_count)) == null ? '' : __t) +
'</div></div><div class="command_btn"><a class="dungeon_main_btn menu_btn "><i>メニュー</i></a><a class="dungeon_main_btn info_btn "><i>ダンジョン<br/>詳細</i></a><a class="dungeon_main_btn howto_btn"><i>遊び方</i></a></div><div class="top_keisen"></div><div class="bottom_keisen"></div>';

}
return __p
};

this["JST"]["cave/member_view"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<!--' +
((__t = (member.id)) == null ? '' : __t) +
': ' +
((__t = (member.name)) == null ? '' : __t) +
'<br/>Lv:' +
((__t = (member.lvl)) == null ? '' : __t) +
' 属性:' +
((__t = (member.attribute)) == null ? '' : __t) +
'<br/>HP:' +
((__t = (member.hp)) == null ? '' : __t) +
'/' +
((__t = (member.hp_full)) == null ? '' : __t) +
'<br/>--><div class="chara_view member"><div class="chara_img_container"><img src="' +
((__t = (__.path.card("s",member.gra_id))) == null ? '' : __t) +
'"></div><div class="chara_frame"></div></div><div class="hp_view member"><div class="chara_hp_num_bg"></div><div class="chara_hp_num">' +
((__t = (member.hp)) == null ? '' : __t) +
'/' +
((__t = (member.hp_full)) == null ? '' : __t) +
'</div><div class="chara_hp_container"><i class="chara_hp_bar" style="width:' +
((__t = ((member.hp / member.hp_full * 100).floor())) == null ? '' : __t) +
'%;"></i></div><img class="attr_icon" src="' +
((__t = (__.path.img_ui('attr_icon/attr_' + member.attribute + '.png'))) == null ? '' : __t) +
'"></div>';

}
return __p
};

this["JST"]["cave/menu_more_card"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<div id="more_get_card_list"><div style="height:10px;"></div><div class="get_card_list_contaner">';
 _.each(member_list,function(member){ ;
__p += '<div class="get_card_contaner"><div class="card_bg_s"><img src="' +
((__t = (__.path.card('s', st.CardData[ st.CardSeedData[member.card_seed_id].card_id ].gra_id ))) == null ? '' : __t) +
'"></div></div>';
 }) ;
__p += '</div><div style="height:10px;"></div></div>';

}
return __p
};

this["JST"]["cave/menu_more_phrase"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<div id="more_get_phrase_list"><div style="height:10px;"></div>';
 _.each(phrase_list,function(id){ ;
__p += '<div class="phrase_contaner"><div class="phrase_text">' +
((__t = (st.PhraseData[id].text)) == null ? '' : __t) +
'</div><div class="phrase_info">' +
((__t = (st.PhraseData[id].author)) == null ? '' : __t) +
'</div></div>';
 }) ;
__p += '<div style="height:10px;"></div></div>';

}
return __p
};

this["JST"]["cave/menu_view"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<div class="menu_info_list_contaner"><div class="packun_info menu_info_contaner"><div class="title_text">所持パックン</div><div class="packun_list_contaner"><div class="packun_contaner packun_1"><div class="packun_icon"></div><div class="packun_num"><i>' +
((__t = (item_data[df.ITEM_PACKUN_NORMAL])) == null ? '' : __t) +
'</i></div></div><div class="packun_contaner packun_2"><div class="packun_icon"></div><div class="packun_num"><i>' +
((__t = (item_data[df.ITEM_PACKUN_SUPER])) == null ? '' : __t) +
'</i></div></div><div class="packun_contaner packun_3"><div class="packun_icon"></div><div class="packun_num"><i>' +
((__t = (item_data[df.ITEM_PACKUN_DRAGON])) == null ? '' : __t) +
'</i></div></div></div></div><div class="get_item_info menu_info_contaner"><div class="title_text">入手物</div><div class="get_item_list_contaner"><div class="get_item_contaner coin"><div class="text">コイン：</div><div class="item_num"><i>' +
((__t = (result.got_item_data[df.ITEM_GAME_MONEY].point)) == null ? '' : __t) +
'</i></div></div><div class="get_item_contaner gacha_pt"><div class="text">ガチャpt：</div><div class="item_num"><i>' +
((__t = (result.got_item_data[df.ITEM_GACHA_POINT].point)) == null ? '' : __t) +
'</i></div></div><div class="get_item_contaner money"><div class="text">魔石：</div><div class="item_num"><i>' +
((__t = (result.got_item_data[df.ITEM_REAL_MONEY_FREE].point)) == null ? '' : __t) +
'</i></div></div></div></div><div class="get_phrase_info menu_info_contaner"><div class="title_text">入手フレーズ</div><a class="more_phrase more_btn"></a><div class="get_phrase_list_contaner">';
 _.times(3,function(n){ ;
__p += '<div class="get_phrase_contaner">';
 if(phrase_list[n]){ ;
__p += '<div class="phrase_text"><i>' +
((__t = (st.PhraseData[phrase_list[n]].text)) == null ? '' : __t) +
'</i></div>';
 }else{ ;
__p += '<div class="phrase_text"><i>　</i></div>';
 } ;
__p += '</div>';
 }) ;
__p += '</div></div><div class="get_card_info menu_info_contaner"><div class="title_text">入手モンスター</div><a class="more_card more_btn"></a><div class="get_card_list_contaner">';
 _.times(5,function(n){ ;
__p += '<div class="card_bg_s card_' +
((__t = (n + 1)) == null ? '' : __t) +
'">';
 if(member_list[n]){ ;
__p += '<img src="' +
((__t = (__.path.card('s', st.CardData[ st.CardSeedData[member_list[n].card_seed_id].card_id ].gra_id ))) == null ? '' : __t) +
'">';
 } ;
__p += '</div>';
 }) ;
__p += '</div></div></div>';

}
return __p
};

this["JST"]["cave/start"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<style>#map_container{position:relative;width:' +
((__t = (map.chip_size * map.x)) == null ? '' : __t) +
'px;height:' +
((__t = (map.chip_size * map.y)) == null ? '' : __t) +
'px;-webkit-transform: rotate(0deg);}.menu{position:relative;}textarea{min-width:316px;height: 30px;}input[type="text"]{min-width:318px;}</style><hr/><div class="menu"><input type="button" id="start_btn"   value="開始"><input type="button" id="end_btn"     value="終了"><input type="button" id="next_btn"    value="次へ"><br/><input type="button" id="retire_btn"  value="リタイア"><input type="button" id="death_btn"   value="全滅"><input type="button" id="clear_btn"   value="クリア"><br/><input type="button" id="console_btn" value="コンソール"><input type="button" id="zoom_btn"    value="ズーム"><br/>';
 /* ;
__p += '<hr/><form class="cave_form"><table><tr><td>CaveREC</td></tr>';
 _.each(cave,function(attr,key){ ;
__p += '<tr><td>' +
((__t = (key)) == null ? '' : __t) +
'</td>';
 if(key=='result' || key=='status' || key=='members' || key=='members_start' || key=='scratches'){ ;
__p += '<td><textarea name="' +
((__t = (key)) == null ? '' : __t) +
'" >' +
((__t = (__.toJSON(attr))) == null ? '' : __t) +
'</textarea></td>';
 }else{ ;
__p += '<td><input type="text" name="' +
((__t = (key)) == null ? '' : __t) +
'" value="' +
__e( __.toJSON(attr) ) +
'" /></td>';
 } ;
__p += '</tr>';
 }) ;
__p += '<tr><td>CaveMapREC</td></tr>';
 _.each(map,function(attr,key){ ;
__p += '<tr><td>' +
((__t = (key)) == null ? '' : __t) +
'</td>';
 if(key=='map' || key=='scratches' || key=='caveMapData' || key=='questListData' || key=='make_data'){ ;
__p += '<td><textarea name="' +
((__t = (key)) == null ? '' : __t) +
'" >' +
((__t = (__.toJSON(attr))) == null ? '' : __t) +
'</textarea></td>';
 }else{ ;
__p += '<td><input type="text" name="' +
((__t = (key)) == null ? '' : __t) +
'" value="' +
__e( __.toJSON(attr) ) +
'" /></td>';
 } ;
__p += '</tr>';
 }) ;
__p += '</table></form>';
 */ ;
__p +=
((__t = (__.macro("dev_menu"))) == null ? '' : __t) +
'<div style="height:500px;"></div></div>';

}
return __p
};

this["JST"]["common/page"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {

 if(is_show){ ;
__p += '<div class="paee_num"><i>' +
((__t = (current)) == null ? '' : __t) +
' / ' +
((__t = (page_max)) == null ? '' : __t) +
'</i></div><a class="prev_page_btn arrow_btn_1 ' +
((__t = (is_first ? "is_first" : "")) == null ? '' : __t) +
'"><i>前へ</i></a><a class="next_page_btn arrow_btn_2 ' +
((__t = (is_end   ? "is_end"   : "")) == null ? '' : __t) +
'"><i>次へ</i></a>';
 } ;


}
return __p
};

this["JST"]["dialog/common"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<table class="cmn_win_root_table"><tr><td class="cmn_win_root_td"><div class="cmn_win_container"><div class="cmn_win_bg"></div><div class="cmn_win_min_size"   comment="ウィンドウサイズを縦横両方を指定"><div class="cmn_win_margin" comment="マージンを指定"><div class="cmn_win_pos"    comment="中コンテンツの縦位置調整。横は自動。"><table class="dialog_message_container"><tr><td>';
 if(title != ""){ ;
__p += '<div class="dialog_message_title"><i class="title">' +
((__t = (title)) == null ? '' : __t) +
'</i></div>';
 } ;
__p += '<div class="dialog_message_text center"><div class="dialog_message_text_bg"></div><table class="common_dialog_message center"><tr><td><i class="message">' +
((__t = (message)) == null ? '' : __t) +
'</i></td></tr></table></div></td></tr></table><div class="clear"></div><section class="append_btn_container"></section><section class="append_close_btn_container"></section></div></div></div></div></td></tr></table>';

}
return __p
};

this["JST"]["dialog/select"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<table class="cmn_win_root_table"><tr><td class="cmn_win_root_td"><div class="cmn_win_container"><div class="cmn_win_bg"></div><div class="cmn_win_min_size"   comment="ウィンドウサイズを縦横両方を指定"><div class="cmn_win_margin" comment="マージンを指定"><div class="cmn_win_pos"    comment="中コンテンツの縦位置調整。横は自動。"><table class="dialog_message_container"><tr><td>';
 if(title != ""){ ;
__p += '<div class="dialog_message_title"><i class="title">' +
((__t = (title)) == null ? '' : __t) +
'</i></div>';
 } ;
__p += '<div class="dialog_message_text center"><div class="dialog_message_text_bg"></div><table class="common_dialog_message center"><tr><td><div class="select_content append_select_btn_container"></div></td></tr></table></div></td></tr></table><div class="clear"></div><section class="append_btn_container"></section><section class="append_close_btn_container"></section></div></div></div></div></td></tr></table>';

}
return __p
};

this["JST"]["gacha/draw_confirm_dialog"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<div class="gacha_confirm_inner"><div class="description_container"><div class="confirm_text">';
 if(st.GachaListData[gacha.id].draw_num<0){ ;
__p +=
((__t = (gacha.name)) == null ? '' : __t) +
'を ' +
((__t = (gacha.draw_num)) == null ? '' : __t) +
'回引きますか？';
 }else{ ;
__p +=
((__t = (gacha.name)) == null ? '' : __t) +
'を引きますか？';
 } ;
__p += '</div><div class="description">' +
((__t = (gacha.description)) == null ? '' : __t) +
'</div></div>';
 if(gacha.limit_num>0){ ;
__p += '<div class="remain_info">このガチャは <i class="limit_num">' +
((__t = (gacha.limit_num)) == null ? '' : __t) +
'回</i> まで引けます<br/>残りあと <i class="remain_num">' +
((__t = (gacha.limit_num-gacha.draw_cnt)) == null ? '' : __t) +
'回</i> 引けます<br/></div>';
 } ;
__p += '<hr/><div class="need_item_info"><div class="text">所持' +
((__t = (item.name)) == null ? '' : __t) +
'：' +
((__t = (have_item)) == null ? '' : __t) +
'' +
((__t = (item.count_name)) == null ? '' : __t) +
'<br/>消費' +
((__t = (item.name)) == null ? '' : __t) +
'：' +
((__t = (gacha.price)) == null ? '' : __t) +
'' +
((__t = (item.count_name)) == null ? '' : __t) +
'<br/></div></div><hr/><div class="debug_info" style="display:' +
((__t = ((appenv.BUILD_LEVEL == appenv.DEBUG_BUILD)?'block':'none')) == null ? '' : __t) +
';"><br/>終了日： ' +
((__t = (st.GachaListData[gacha.id].end)) == null ? '' : __t) +
'<br/>復活日： ' +
((__t = (revival_text)) == null ? '' : __t) +
'<br/>復活まであと： ' +
((__t = (revival_remain)) == null ? '' : __t) +
'<br/>復活確率： ' +
((__t = (revival_per)) == null ? '' : __t) +
'％<br/>あと ' +
((__t = (alive_remain)) == null ? '' : __t) +
' で消えます</div></div>';

}
return __p
};

this["JST"]["gacha/index"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p +=
((__t = (__.helper.startPage("gacha-index"))) == null ? '' : __t) +
'<div class="list_bg"></div><div class="page_title"><i>ガチャ一覧</i></div><div class="page_content"><div class="info_container"><div class="menu_info_bg"></div><div class="status_bg"><div class="status"><div class="status_1">所持魔石:<i data-name="pc_real_money">' +
((__t = (real_money)) == null ? '' : __t) +
'</i></div><div class="status_2">所持ガチャP:<i data-name="pc_gacha_point">' +
((__t = (gacha_point)) == null ? '' : __t) +
'</i></div></div></div><div class="gacha_data_text">' +
((__t = (info_gacha_data.name)) == null ? '' : __t) +
' 出現モンスター</div><div class="deck">';
 _.each(info_gacha_table_data,function(card,n){ ;
__p += '<div class="card_bg_s card_' +
((__t = (n + 1)) == null ? '' : __t) +
'">';
 if (card != undefined){ ;
__p += '<img src="' +
((__t = (__.path.card('s',card.gra_id))) == null ? '' : __t) +
'">';
 } ;
__p += '</div>';
 }) ;
__p += '</div></div><div class="list_container"><div id="gacha_index_list" class="scroll_wrapper"><div class="up_spacer"></div>';
 _.each(gacha_list,function(gacha){ ;
__p += '<a class="gacha_btn list_btn_1 ' +
((__t = (gacha.design_class)) == null ? '' : __t) +
'" data-after_se="1" data-gacha_id="' +
((__t = (gacha.id)) == null ? '' : __t) +
'" ><i>' +
((__t = (gacha.name)) == null ? '' : __t) +
'<!-- ';
 if(gacha.limit_num){ ;
__p += ' (' +
((__t = (gacha.rest_num)) == null ? '' : __t) +
'/' +
((__t = (gacha.limit_num)) == null ? '' : __t) +
') ';
 } ;
__p += ' --></i></a>';
 if(gacha.remain_term){ ;
__p += '<div class="gacha_info">└ ' +
((__t = (gacha.remain_term)) == null ? '' : __t) +
' まで! ┘</div>';
 }else if(gacha.remain_time){ ;
__p += '<div class="gacha_info">└ あと ' +
((__t = (gacha.remain_time)) == null ? '' : __t) +
'! ┘</div>';
 } ;

 }) ;
__p += '<div class="bottom_spacer"></div></div><div class="kei_1"></div><div class="kei_2"></div></div></div>' +
((__t = (__.helper.endPage())) == null ? '' : __t);

}
return __p
};

this["JST"]["quest/quest_confirm"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p +=
((__t = (__.helper.startPage("quest-quest_confirm"))) == null ? '' : __t) +
'<div class="info_container"><div class="packun_info_container">所持パックン:&nbsp;&nbsp;<span class="packun_' +
((__t = (packun_n_id)) == null ? '' : __t) +
'"></span>x' +
((__t = (packun_n)) == null ? '' : __t) +
'&nbsp;&nbsp;<span class="packun_' +
((__t = (packun_s_id)) == null ? '' : __t) +
'"></span>x' +
((__t = (packun_s)) == null ? '' : __t) +
'&nbsp;&nbsp;<span class="packun_' +
((__t = (packun_d_id)) == null ? '' : __t) +
'"></span>x' +
((__t = (packun_d)) == null ? '' : __t) +
'</div><div class="deck_contaner"><div class="deck">';
 _.each(members,function(member,n){ ;
__p += '<div class="card_bg_s card_' +
((__t = (n + 1)) == null ? '' : __t) +
'">';
 if (member != undefined){ ;
__p += '<img src="' +
((__t = (__.path.card('s',member.gra_id))) == null ? '' : __t) +
'"><div class="hp_bar_container"><div class="hp_bar" style="width:' +
((__t = (member.hp_per * 100)) == null ? '' : __t) +
'%;"></div></div>';
 } ;
__p += '</div>';
 }) ;
__p += '</div><div class="quest_confirm_text">このメンバーで冒険しますか？<br/>※モンスターはショップで回復できます</div></div>' +
((__t = (__.macro("quest_base_info",response))) == null ? '' : __t) +
'</div>' +
((__t = (__.helper.endPage())) == null ? '' : __t);

}
return __p
};

this["JST"]["quest/select_area_view"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p +=
((__t = (__.helper.startPage("quest-select_area_view"))) == null ? '' : __t) +
'<div class="list_bg"></div><div class="page_title"><i>シナリオ一覧</i></div><div class="page_content"><div class="word_map_container"><div id="world_map_img" class="map_img_wrapper"><div class="world_map_img"></div></div><div class="kei_1"></div><div class="kei_2"></div></div><div class="list_container"><div id="area_list"       class="scroll_wrapper"><div class="up_spacer"></div>';
 _.each(area_list,function(quest_list,n){ ;

 _.each(quest_list,function(area,n){ ;
__p += '<a class="area_list_btn list_btn_' +
((__t = ((area.world_id<100)? 1 : (area.world_id<500)? 3 : 5)) == null ? '' : __t) +
'" data-after_se="1" data-href="/html/Quest/selectCave?id=' +
((__t = (area.id)) == null ? '' : __t) +
'" ><i>' +
((__t = (area.area_name)) == null ? '' : __t) +
'</i>';
 if( area.clear_flag >= 1 ){ ;
__p += '<div class="quest_clear_icon"></div>';
 }else if( area.play_flag == 0 ){ ;
__p += '<div class="quest_new_icon"></div>';
 } ;
__p += '</a>';
 if(area.remain_time){ ;
__p += '<div class="quest_info">└ あと ' +
((__t = (area.remain_time)) == null ? '' : __t) +
'! ┘</div>';
 }else if(area.remain_term){ ;
__p += '<div class="quest_info">└ ' +
((__t = (area.remain_term)) == null ? '' : __t) +
' まで! ┘</div>';
 } ;

 }) ;

 }) ;
__p += '<div class="bottom_spacer"></div></div><div class="please_select"><i>クエストを選択してください</i></div><div class="kei_1"></div><div class="kei_2"></div></div></div>' +
((__t = (__.helper.endPage())) == null ? '' : __t);

}
return __p
};

this["JST"]["quest/select_cave_view"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p +=
((__t = (__.helper.startPage("quest-select_cave_view"))) == null ? '' : __t) +
'<div class="list_bg"></div><div class="page_title"><i>ダンジョン一覧</i></div><div class="page_content"><div class="word_map_container"><div  id="area_map_img" class="map_img_wrapper"><div class="world_map_img"></div><div class="world_map_icon_container" style=" position:absolute; left:' +
((__t = (map_icon_data.map_pos_x)) == null ? '' : __t) +
'px; top :' +
((__t = (map_icon_data.map_pos_y)) == null ? '' : __t) +
'px;">';
 _.each(map_icon_data.icon_id,function(id,n,data){ ;

 if(map_icon_data.icon_id[n] != 0){ ;
__p += '<img class="world_map_icons"src="' +
((__t = (__.path.world_map_icon(map_icon_data.icon_id[n]))) == null ? '' : __t) +
'"style="height:30px;width:30px;position:absolute;left:' +
((__t = (map_icon_data.icon_x[n])) == null ? '' : __t) +
'px;top :' +
((__t = (map_icon_data.icon_y[n])) == null ? '' : __t) +
'px;">';
 } ;

 }) ;
__p += '</div></div><div class="kei_1"></div><div class="kei_2"></div><div class="area_name"><i>' +
((__t = (area.area_name)) == null ? '' : __t) +
'</i></div></div><div class="list_container"><div id="cave_list" class="scroll_wrapper"><div class="up_spacer"></div>';
 _.each(quest_list,function(quest,n){ ;
__p += '<a class="area_list_btn list_btn_' +
((__t = ((quest.world_id<100)? 1 : (quest.world_id<500)? 3 : 5)) == null ? '' : __t) +
' E_select_quest" data-after_se="1" data-quest_id="' +
((__t = (quest.id)) == null ? '' : __t) +
'" ><i>' +
((__t = (quest.dungeon_name)) == null ? '' : __t) +
'</i>';
 if( quest.clear_flag >= 1 ){ ;
__p += '<div class="quest_clear_icon"></div>';
 }else if( quest.play_flag == 0 ){ ;
__p += '<div class="quest_new_icon"></div>';
 } ;
__p += '</a>';
 }) ;
__p += '<div class="bottom_spacer"></div></div><div class="please_select_2"><i>ダンジョンを選択してください</i></div><div class="kei_1"></div><div class="kei_2"></div><a class="trigger_back_key back_to_area_select arrow_btn_1" data-back-default="/html/Quest/selectArea"><i>戻る</i></a></div></div>' +
((__t = (__.helper.endPage())) == null ? '' : __t);

}
return __p
};

this["JST"]["sample/index"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += 'top<br/>' +
((__t = (__.macro("dev_menu"))) == null ? '' : __t);

}
return __p
};

this["JST"]["sample/localStorage"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<script type="text/javascript">/* ①Web Storageの実装確認*/if (typeof localStorage === \'undefined\') {window.alert("このブラウザはWeb Storage機能が実装されていません");} else {/* window.alert("このブラウザはWeb Storage機能を実装しています"); */var storage = localStorage;/* ③localStorageへの格納 */function setlocalStorage() {var key = document.getElementById("textkey").value;var value = document.getElementById("textdata").value;/* 値の入力チェック */if (key && value) {storage.setItem(key, value);}/* 変数の初期化 */key = "";value = "";viewStorage();}/* ③localStorageからのデータの取得と表示 */function viewStorage() {var list = document.getElementById("list");while (list.firstChild) list.removeChild(list.firstChild);/* localStorageすべての情報の取得 */for (var i=0; i < storage.length; i++) {var _key = storage.key(i);/* localStorageのキーと値を表示 */var tr = document.createElement("tr");var td1 = document.createElement("td");var td2 = document.createElement("td");list.appendChild(tr);tr.appendChild(td1);tr.appendChild(td2);td1.innerHTML = _key;td2.innerHTML = "<textarea>" + storage.getItem(_key) + "</textarea>";}}/* ④localStorageから削除 */function removeStorage() {var key = document.getElementById("textkey").value;storage.removeItem(key);/* 変数の初期化 */key = "";viewStorage();}/* ⑤localStorageからすべて削除 */function removeallStorage() {storage.clear();viewStorage();}}</script><style>table{ margin-left:10px; }textarea{width:600px; height:100px; position:relative; top:1px;}*{margin:0px; padding:0px; border-spacing:0px;}td                   { background:#ddd; }tr:nth-child(odd) td { background:#ccc; }td:nth-child(1){padding:0px 5px 0px 10px; min-width:160px;}</style><h2 style="margin:5px;">　localStorage</h2><table>    <tr></tr>    <tr>        <td>        保存するKey、値：<br/>        <input id="textkey" type="text" /><br/><br/><button id="button" onclick="setlocalStorage()">保存</button><button id="button" onclick="removeStorage()">削除</button><button id="button" onclick="removeallStorage()">全て削除</button>        </td>        <td><textarea id="textdata" ></textarea>        </td>    </tr></table><table><tbody id="list"></tbody></table><script>viewStorage();</script>';

}
return __p
};

this["JST"]["sample/quest_data"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += 'sample quest_data<br/><hr/><style>.root_table *{vertical-align:top;}.quest_world,.quest_area,.quest_group,.quest_name{text-align:center;}table.root_table > tbody > tr > td{border-bottom: 2px solid #aaa;}.floor_data{border-bottom: 2px solid #aaa;}</style><table class="root_table">';
 _.each(questDispData,function(quest_data,id){ ;
__p += '<tr><td class="quest_world">world_' +
((__t = (quest_data.world)) == null ? '' : __t) +
'&nbsp;</td><td class="quest_area ">area_' +
((__t = (quest_data.area)) == null ? '' : __t) +
'&nbsp;</td><td class="quest_group">group_' +
((__t = (quest_data.group)) == null ? '' : __t) +
'&nbsp;</td><td class="quest_name ">' +
((__t = (quest_data.name)) == null ? '' : __t) +
'&nbsp;</td><td style="padding-left:10px;">';
 _.each(quest_data.floor_data,function(floor_data,n){ ;
__p += '<table class="floor_data"><tr><td>' +
((__t = (floor_data.start_floor)) == null ? '' : __t) +
'～' +
((__t = (floor_data.end_floor)) == null ? '' : __t) +
'&nbsp;/' +
((__t = (floor_data.floor_max)) == null ? '' : __t) +
'階　レベル:' +
((__t = (floor_data.level)) == null ? '' : __t) +
'　</td><td>|| アイテム ' +
((__t = (floor_data.rates.drop_item)) == null ? '' : __t) +
'% || 敵       ' +
((__t = (floor_data.rates.enemy    )) == null ? '' : __t) +
'% || ガチャpt ' +
((__t = (floor_data.rates.gacha_pt )) == null ? '' : __t) +
'% || 魔石     ' +
((__t = (floor_data.rates.kiseki   )) == null ? '' : __t) +
'% || お金     ' +
((__t = (floor_data.rates.money    )) == null ? '' : __t) +
'% || 罠       ' +
((__t = (floor_data.rates.trap     )) == null ? '' : __t) +
'% ||</td></tr><tr><td><table><tr><td><table><tr><td>アイテム</td></tr>';
 _.each(floor_data.events.drop_item,function(item,n){ ;
__p += '<tr><td>　id:' +
((__t = (item.id)) == null ? '' : __t) +
'</td><td>　' +
((__t = (item.rate / floor_data.rate_max * 100)) == null ? '' : __t) +
'%</td></tr>';
 }) ;
__p += '</table></td><td><table><tr><td>敵</td></tr>';
 _.each(floor_data.events.enemy,function(enemy,n){ ;
__p += '<tr><td>　id:' +
((__t = (enemy.id)) == null ? '' : __t) +
'</td><td>　' +
((__t = (enemy.rate / floor_data.rate_max * 100)) == null ? '' : __t) +
'%</td></tr>';
 }) ;
__p += '</table></td></tr></table></td></tr></table>';
 }) ;
__p += '</td></tr>';
 }) ;
__p += '</table>';

}
return __p
};

this["JST"]["sample/sample_index"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += 'sample_index<br/>' +
((__t = (__.macro("dev_menu"))) == null ? '' : __t);

}
return __p
};

this["JST"]["sample_mate_list"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<style></style><hr/><div>-- 売却 --</div><form id="mate_sell_list"><table><tr>';
 _.each(mate_list,function(mate,index){ ;
__p += '<td><input name="mate[]" value="' +
((__t = (mate.id)) == null ? '' : __t) +
'" type="checkbox" />' +
((__t = (st.CardData[mate.card_id].name)) == null ? '' : __t) +
'</td>';
 if (index % 6 == 0){ ;
__p += '</tr><tr>';
 } ;

 }) ;
__p += '</tr></table><input class="sell_submit" type="submit" value="　売却　"><input class="reset_render" type="submit" value="リセット"></form><hr/><div>-- デッキ編成 --  | ';
 _.each(deck,function(id,index){ ;
__p +=
((__t = (st.CardData[id].name)) == null ? '' : __t) +
' | ';
 }) ;
__p += '</div><form id="deck_select"><table><tr>';
 _.each(mate_list,function(mate,index){ ;
__p += '<td><input name="mate[]" value="' +
((__t = (mate.id)) == null ? '' : __t) +
'" type="checkbox" ';
 if(mate.is_deck){ ;
__p += ' checked="checked" ';
 } ;
__p += ' />' +
((__t = (st.CardData[mate.card_id].name)) == null ? '' : __t) +
'</td>';
 if (index % 6 == 0){ ;
__p += '</tr><tr>';
 } ;

 }) ;
__p += '</tr></table><input class="deck_submit" type="submit" value="デッキ編成"><input class="reset_render" type="submit" value="リセット"></form><hr/><div>-- 合成 -- </div><form id="mix_list"><table><tr>';
 _.each(mate_list,function(mate,index){ ;
__p += '<td><input name="base" value="' +
((__t = (mate.id)) == null ? '' : __t) +
'" type="radio" />' +
((__t = (st.CardData[mate.card_id].name)) == null ? '' : __t) +
'</td>';
 if (index % 6 == 0){ ;
__p += '</tr><tr>';
 } ;

 }) ;
__p += '</tr></table>---------- 素材選択 ---------<br/><table><tr>';
 _.each(mate_list,function(mate,index){ ;
__p += '<td><input name="mat[]" value="' +
((__t = (mate.id)) == null ? '' : __t) +
'" type="checkbox" />' +
((__t = (st.CardData[mate.card_id].name)) == null ? '' : __t) +
'</td>';
 if (index % 6 == 0){ ;
__p += '</tr><tr>';
 } ;

 }) ;
__p += '</tr></table><input class="mix_submit" type="submit" value="　合成　"><input class="reset_render" type="submit" value="リセット"></form>' +
((__t = (__.macro("dev_menu"))) == null ? '' : __t);

}
return __p
};

this["JST"]["sample_pc"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<style>textarea{min-width:316px;height: 30px;}input[type="text"]{min-width:318px;}#sample-tools{height:430px;width:320px;}.sample-tools{height:2000px;width:500px;position:relative;display:block;text-align:left;}</style>' +
((__t = (__.helper.startPage("sample-tools"))) == null ? '' : __t) +
'<hr/><form class="time_edit">時刻設定:<input name="time" type="text" value="' +
((__t = (__.moment().format('YYYY/MM/DD HH:mm:ss'))) == null ? '' : __t) +
'" /><input class="submit" type="submit" value="決定" /><input class="reset" type="button" value="初期化" /></form><hr/><span>■PcREC</span><form class="pc_edit"><br/><table>';
 for(key in pc) { ;
__p += '<tr><td>' +
((__t = (key)) == null ? '' : __t) +
'</td><td><textarea name=\'' +
((__t = (key)) == null ? '' : __t) +
'\' >' +
((__t = (__.toJSON(pc[key]))) == null ? '' : __t) +
'</textarea></td>';
 /*if ( key=='deck' || key=='item_list' || key=='zukan_flag' || key=='mate_list' || key=='result' || key=='gacha_status' ){ ;
__p += '<td><textarea name=\'' +
((__t = (key)) == null ? '' : __t) +
'\' >' +
((__t = (__.toJSON(pc[key]))) == null ? '' : __t) +
'</textarea></td>';
 }else{ ;
__p += '<td><input type="text" name=\'' +
((__t = (key)) == null ? '' : __t) +
'\' value=\'' +
((__t = (__.toJSON(pc[key]))) == null ? '' : __t) +
'\' /></td>';
 }*/ ;
__p += '</tr>';
 } ;
__p += '</table><input class="submit" type="submit" value="決定" /><br/><input class="reset" type="button" value="初期化" /></form><hr/><span>■Mate</span><form class="mate_edit"><table><tr><td>card_seed_id</td><td><textarea name="card_seed_id" >' +
((__t = (JSON.stringify(_.keys(st.CardSeedData)))) == null ? '' : __t) +
'</textarea></td></tr><tr><td>lvl</td><td><textarea name="lvl" >1</textarea></td></tr></table><input class="add" type="submit" value="追加" /><br/></form><hr/><span>■Set Mate</span><form class="mate_get">get_mate_id<input type="text" name="id" value="1001" /><input class="submit" type="submit" value="取得" /></form><form class="mate_set">set_mate<input type="text" value="1" /><input class="submit" type="submit" value="取得" /></form>' +
((__t = (__.macro("dev_menu"))) == null ? '' : __t) +
'' +
((__t = (__.helper.endPage())) == null ? '' : __t);

}
return __p
};

this["JST"]["shop/arbeit"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p +=
((__t = (__.helper.startPage("shop-arbeit","shop_page"))) == null ? '' : __t) +
'<div class="list_bg"></div><div class="page_title"><i>アルバイト一覧</i></div><div class="page_content"><div class="info_container"><div class="menu_info_bg"></div><div class="status_bg"><div class="status arbeit_info_message">アプリの開発、宣伝にご協力いただくことで<br/> 魔石やコインをゲットすることができます。</div></div></div><div class="list_container"><div id="shop_index_list" class="scroll_wrapper"><div class="up_spacer"></div>';
 var remain = new __.RemainTime( { disp:{sec:false} , str:{hour:"時間",min:"分"} } ); ;
__p += '<div id="bug_reports">    <div class="description"><i>    バグ報告してコインゲット！<br/>    ' +
((__t = ((is_next_report_time) ? '次の報酬復活まであと <span class="time" style="color:#FFFF4E;">' + remain.toText(next_report_time) + '</span>' : '')) == null ? '' : __t) +
'    </i></div>    <a class="' +
((__t = ((is_next_report_time) ? 'list_btn_2' : 'list_btn_1')) == null ? '' : __t) +
'"><i>バグ報告</i></a></div><div id="twitter">    <div class="description"><i>    <span style="color:#fff;"></span>ツイートで報酬 <span style="color:#FF8B2A;">' +
((__t = (tweet_reward_num)) == null ? '' : __t) +
'魔石！</span><br/>    ' +
((__t = ((is_next_tweet_time) ? '次の報酬復活まであと <span class="time" style="color:#FFFF4E;">' + remain.toText(next_tweet_time) + '</span>' : '')) == null ? '' : __t) +
'    </i></div>    <a class="' +
((__t = ((is_next_tweet_time) ? 'list_btn_2' : 'list_btn_1')) == null ? '' : __t) +
'"><i>ツイッター投稿</i></a></div><!--<div id="phrase">    <div class="description"><i>    フレーズを投稿してコインゲット！<br/>    ' +
((__t = ((is_next_phrase_time) ? '次の報酬復活まであと <span class="time">' + remain.toText(next_phrase_time) + '</span>' : '')) == null ? '' : __t) +
'    </i></div>    <a class="list_btn_1"><i>フレーズライター</i></a></div>--><div id="store_review">    <div class="description"><i>    ';
 if(is_reviewed){ ;
__p += '    報酬は獲得済みです    ';
 }else{ ;
__p += '    <span style="color:#fff;">★5評価</span>すると報酬 <span style="color:#FF8B2A;">' +
((__t = (review_reward_num)) == null ? '' : __t) +
'魔石！</span>    ';
 } ;
__p += '    </i></div>    <a class="' +
((__t = ((is_reviewed) ? 'list_btn_2' : 'list_btn_1')) == null ? '' : __t) +
'"><i>アプリレビュー(初回限定)</i></a></div><div class="bottom_spacer"></div></div><div class="arbeit_thanks_message">ご協力ありがとうございます<br/>これからもアプリを良くしていきますので<br/>今後ともよろしくお願い致します<br/></div><div class="kei_1"></div><div class="kei_2"></div><a class="trigger_back_key back_btn arrow_btn_1" data-back-default="/html/Shop/index"><i>戻る</i></a></div></div>' +
((__t = (__.helper.endPage())) == null ? '' : __t);

}
return __p
};

this["JST"]["shop/arbeit_bug_reports"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p +=
((__t = (__.helper.startPage("shop-arbelt_bug_reports"))) == null ? '' : __t) +
'<div class="list_bg"></div><div class="page_title"><i>バグ報告</i></div><div class="page_content"><div class="form_container"><form name="form"><div class="name_container"><div class="text_name">お名前</div><input class="form_name" name="name" type="text" placeholder="名前を入力してください" /></div><div class="mail_container"><div class="text_mail">メールアドレス(任意)</div><input class="form_mail" name="mail" type="text" placeholder="メールアドレスを入力してください" /></div><div class="content_container"><div class="text_content">バグ内容、再現方法</div><textarea class="form_content" name="content" placeholder="バグ内容と再現方法を入力してください"></textarea></div><div class="btn_container"><a class="cmn_btn_1 cancel" ><i>キャンセル</i></a><a class="cmn_btn_1 submit" ><i>送信する</i></a></div></form></div></div>' +
((__t = (__.helper.endPage())) == null ? '' : __t);

}
return __p
};

this["JST"]["shop/game_money"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p +=
((__t = (__.helper.startPage("shop-game_money","shop_page"))) == null ? '' : __t) +
'<div class="list_bg"></div><div class="page_title"><i>魔石ショップ</i></div><div class="page_content">' +
((__t = (__.macro("shop_info",response))) == null ? '' : __t) +
'<div class="list_container"><div id="shop_index_list" class="scroll_wrapper"><div class="up_spacer"></div><div class="description"><i>現在の販売魔石<br/></i></div>';
 _.each(product_list,function(product){ ;
__p += '<a class="list_btn_1 item_btn" data-se="0" data-id="' +
((__t = (product.productId)) == null ? '' : __t) +
'"><i>' +
((__t = (product.price)) == null ? '' : __t) +
'/' +
((__t = (product.productId)) == null ? '' : __t) +
'</i></a>';
 }) ;

 /* ;
__p += '<a class="list_btn_1" data-after_se="0" data-num="500"   ><i>500魔石 500円</i></a><a class="list_btn_1" data-after_se="0" data-num="1500"  ><i>1500魔石 1500円</i></a><a class="list_btn_1" data-after_se="0" data-num="5000"  ><i>5000魔石 5000円</i></a><a class="list_btn_1" data-after_se="0" data-num="10000" ><i>10000魔石 10000円</i></a><div class="description"><i>billing methods</i></div><a class="list_btn_1 init                 " data-after_se="0"><i>init</i></a><a class="list_btn_1 getAvailableProducts " data-after_se="0"><i>getAvailableProducts</i></a><a class="list_btn_1 getPurchases         " data-after_se="0"><i>getPurchases</i></a><a class="list_btn_1 buy                  " data-after_se="0"><i>buy</i></a><a class="list_btn_1 consumePurchase      " data-after_se="0"><i>consumePurchase</i></a>';
 */ ;
__p += '<div class="spacer" style="height:15px;"></div><div class="bottom_spacer"></div></div><div class="kei_1"></div><div class="kei_2"></div><a class="trigger_back_key back_btn arrow_btn_1" data-back-default="/html/Shop/index"><i>戻る</i></a></div></div>' +
((__t = (__.helper.endPage())) == null ? '' : __t);

}
return __p
};

this["JST"]["shop/index"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p +=
((__t = (__.helper.startPage("shop-index","shop_page"))) == null ? '' : __t) +
'<div class="list_bg"></div><div class="page_title"><i>ショップ一覧</i></div><div class="page_content">' +
((__t = (__.macro("shop_info",response))) == null ? '' : __t) +
'<div class="list_container"><div id="shop_index_list" class="scroll_wrapper"><div class="up_spacer"></div>';
 var linkMacro = function(se,text,id,label){return ""       +'<div id="' +id+ '">'       +'    <div class="description"><i>' +text+ '</i></div>'       +'    <a class="list_btn_1" data-se="' + se + '"><i>' +label+ '</i></a>'       +'</div>'} ;
__p +=
((__t = (linkMacro(1,"魔石やコインをゲットしよう！"      ,"arbeit"   ,"アルバイト一覧"   ))) == null ? '' : __t) +
'' +
((__t = (linkMacro(0,"魔石を買うならこちらから！"        ,"realMoney","魔石ショップ"     ))) == null ? '' : __t) +
'' +
((__t = (linkMacro(1,"モンスターを捕まえる準備をしよう！","packun"   ,"パックンショップ" ))) == null ? '' : __t) +
'' +
((__t = (linkMacro(1,"モンスターを回復させよう！"        ,"recover"  ,"モンスター回復"   ))) == null ? '' : __t) +
'<div class="bottom_spacer"></div></div><div class="kei_1"></div><div class="kei_2"></div></div></div>' +
((__t = (__.helper.endPage())) == null ? '' : __t);

}
return __p
};

this["JST"]["shop/packun"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p +=
((__t = (__.helper.startPage("shop-packun","shop_page"))) == null ? '' : __t) +
'<div class="list_bg"></div><div class="page_title"><i>パックンショップ</i></div><div class="page_content">' +
((__t = (__.macro("shop_info",response))) == null ? '' : __t) +
'<div class="list_container"><div id="shop_index_list" class="scroll_wrapper"><div class="up_spacer"></div>';
 _.each(packun_keys,function(key,n){ ;
__p += '<div class="description"><i><span class="packun_' +
((__t = (key)) == null ? '' : __t) +
'"></span>' +
((__t = (st.ItemData[key].name)) == null ? '' : __t) +
'<br/>' +
((__t = (packun_data[key][0].text)) == null ? '' : __t) +
'</i></div>';
 _.each(packun_data[key],function(packun){ ;
__p += '<a class="list_btn_1 buy_packun" data-after_se="1" data-id="' +
((__t = (packun.id)) == null ? '' : __t) +
'"><i>' +
((__t = (packun.num)) == null ? '' : __t) +
'個購入 ' +
((__t = (packun.price)) == null ? '' : __t) +
'' +
((__t = (st.ItemData[packun.need_item].name)) == null ? '' : __t) +
'</i></a>';
 }) ;
__p += '<div class="spacer" style="height:5px;"></div>';
 }) ;
__p += '<div class="bottom_spacer"></div></div><div class="kei_1"></div><div class="kei_2"></div><a class="trigger_back_key back_btn arrow_btn_1" data-back-default="/html/Shop/index"><i>戻る</i></a></div></div>' +
((__t = (__.helper.endPage())) == null ? '' : __t);

}
return __p
};

this["JST"]["shop/real_money"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p +=
((__t = (__.helper.startPage("shop-real_money","shop_page"))) == null ? '' : __t) +
'<div class="list_bg"></div><div class="page_title"><i>魔石ショップ</i></div><div class="page_content">' +
((__t = (__.macro("shop_info",response))) == null ? '' : __t) +
'<div class="list_container"><div id="shop_index_list" class="scroll_wrapper"><div class="up_spacer"></div><div class="description"><i>現在の販売魔石<br/></i></div>';
 _.each(product_list,function(product){ ;
__p += '<a class="list_btn_1 item_btn" data-se="0" data-id="' +
((__t = (product.productId)) == null ? '' : __t) +
'"><i>' +
((__t = (product.price)) == null ? '' : __t) +
'/' +
((__t = (product.productId)) == null ? '' : __t) +
'</i></a>';
 }) ;

 /* ;
__p += '<a class="list_btn_1" data-after_se="0" data-num="500"   ><i>500魔石 500円</i></a><a class="list_btn_1" data-after_se="0" data-num="1500"  ><i>1500魔石 1500円</i></a><a class="list_btn_1" data-after_se="0" data-num="5000"  ><i>5000魔石 5000円</i></a><a class="list_btn_1" data-after_se="0" data-num="10000" ><i>10000魔石 10000円</i></a><div class="description"><i>billing methods</i></div><a class="list_btn_1 init                 " data-after_se="0"><i>init</i></a><a class="list_btn_1 getAvailableProducts " data-after_se="0"><i>getAvailableProducts</i></a><a class="list_btn_1 getPurchases         " data-after_se="0"><i>getPurchases</i></a><a class="list_btn_1 buy                  " data-after_se="0"><i>buy</i></a><a class="list_btn_1 consumePurchase      " data-after_se="0"><i>consumePurchase</i></a>';
 */ ;
__p += '<div class="spacer" style="height:15px;"></div><div class="bottom_spacer"></div></div><div class="info_message">※通信環境のいい所でご利用ください。また、通信には時間がかかることがあります。<br/>※購入処理中に通信が切れると、正しく購入処理が行われない場合があります。もし正しく処理が終了しなかった場合、端末の電源を一度落とし、通信環境のいい所で再度魔石ショップへアクセスするようお願いします。</div><div class="kei_1"></div><div class="kei_2"></div><a class="trigger_back_key back_btn arrow_btn_1" data-back-default="/html/Shop/index"><i>戻る</i></a></div></div>' +
((__t = (__.helper.endPage())) == null ? '' : __t);

}
return __p
};

this["JST"]["shop/recover"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p +=
((__t = (__.helper.startPage("shop-recover","shop_page"))) == null ? '' : __t) +
'<div class="list_bg"></div><div class="page_title"><i>モンスタースパ</i></div><div class="page_content">' +
((__t = (__.macro("shop_info",response))) == null ? '' : __t) +
'<div class="list_container"><div id="shop_index_list" class="scroll_wrapper"><div class="up_spacer"></div><div class="description"><i>魔石やコインをゲットしよう！</i></div><a class="list_btn_1" data-after_se="1" data-href="/html/Shop/arbeit"   ><i>アルバイト</i></a><div class="description"><i>魔石を買うならこちらから！</i></div><a class="list_btn_1" data-after_se="1" data-href="/html/Shop/realMoney"><i>魔石ショップ</i></a><div class="description"><i>モンスターを捕まえる準備をしよう！</i></div><a class="list_btn_1" data-after_se="1" data-href="/html/Shop/packun"   ><i>パックンショップ</i></a><div class="description"><i>モンスターを回復させよう！</i></div><a class="list_btn_1" data-after_se="1" data-href="/html/Shop/recover"  ><i>モンスタースパ</i></a><div class="bottom_spacer"></div></div><div class="kei_1"></div><div class="kei_2"></div><a class="trigger_back_key back_btn arrow_btn_1" data-back-default="/html/Shop/index"><i>戻る</i></a></div></div>' +
((__t = (__.helper.endPage())) == null ? '' : __t);

}
return __p
};

this["JST"]["test_index"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<h1>Test Index</h1><br/><a data-href="/html/Test/sampleJasmine">sampleJasmine</a><br/><a data-href="/html/Test/modelQuest">modelQuest</a>';

}
return __p
};

this["JST"]["top/index"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += 'top<br/>' +
((__t = (__.macro("dev_menu"))) == null ? '' : __t);

}
return __p
};

this["JST"]["top/mypage"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p +=
((__t = (__.helper.startPage("top-mypage"))) == null ? '' : __t) +
'<div class="page_title"><i>マイページ</i></div><div id="map_view" class="page_content"><div id="mypage_map" class="map_img_wrapper"><div class="world_map_img"></div></div><a class="on_back_key back_to_mypage arrow_btn_1 hide"><i>戻る</i></a><div class="kei_1"></div><div class="kei_2"></div></div><div id="info_view" class="page_content"><div class="chara_bg"></div><div class="chara chara_' +
((__t = (chara_type)) == null ? '' : __t) +
'" data-chara_type="' +
((__t = (chara_type)) == null ? '' : __t) +
'"></div><div class="status" style="display:none;"><div class="status_0">名前:' +
((__t = (pc.name)) == null ? '' : __t) +
'</div><div class="status_1">最大到達深度:test</div><div class="status_2">所持モンスター:' +
((__t = (mate_num)) == null ? '' : __t) +
'/' +
((__t = (mate_max)) == null ? '' : __t) +
'</div><div class="status_3">発見モンスター:' +
((__t = (zukan_num)) == null ? '' : __t) +
'</div><div class="status_4">ログイン日数:' +
((__t = (login_count)) == null ? '' : __t) +
'</div><div class="status_5">クリアダンジョン数:test</div><div class="status_6">所持ガチャpt:' +
((__t = (gacha_point)) == null ? '' : __t) +
'</div><div class="status_7">所持コイン:' +
((__t = (game_money)) == null ? '' : __t) +
'</div><div class="status_8">所持魔石:' +
((__t = (real_money)) == null ? '' : __t) +
'</div></div><div class="mission_contaner"><div class="mission_title">ミッション(タップで詳細)</div><div id="mission_item_container"><div style="height:6px;"></div>';
 _.times(2,function(times){ _.each(mission_list,function(mission){ ;

 if(times==0 && !mission.is_clear){ return } ;

 if(times==1 &&  mission.is_clear){ return } ;
__p += '<a class="mission mission_item_bg ' +
((__t = (mission.kind)) == null ? '' : __t) +
'" data-mission_id="' +
((__t = (mission.id)) == null ? '' : __t) +
'"><div class="mission_item_text">' +
((__t = (mission.kind)) == null ? '' : __t) +
' ' +
((__t = (mission.title)) == null ? '' : __t) +
'</div>' +
((__t = ((mission.is_clear)?'<div class="mission_clear_icon"></div> ':'')) == null ? '' : __t) +
'</a>';
 if(mission.guerrilla_end_text){ ;
__p += '<div class="mission_time_text">└残り ' +
((__t = (mission.guerrilla_end_text)) == null ? '' : __t) +
'┘</div>';
 }else if(mission.end_text){ ;
__p += '<div class="mission_time_text">└' +
((__t = (mission.end_text)) == null ? '' : __t) +
' まで┘</div>';
 } ;

 }) }) ;
__p += '</div></div><div class="menu_btns"><a class="menu_0 mypage_menu_btn information"><i>お知らせ</i></a><a class="menu_1 mypage_menu_btn present    "><i>プレゼント</i><span class="batch" style="' +
((__t = ((present_num)?'' :'display:none;')) == null ? '' : __t) +
'"><i>' +
((__t = (present_num)) == null ? '' : __t) +
'</i></span></a><a class="menu_2 mypage_menu_btn how_to     "><i>遊び方</i></a><a class="menu_3 mypage_menu_btn phrase_dict"><i>フレーズ辞典</i></a><a class="menu_4 mypage_menu_btn config     "><i>設定</i></a><a class="menu_5 mypage_menu_btn other_menu "><i>メニュー</i></a></div><a class="chara_change arrow_btn_1"><i>変更</i></a><a class="goto_map arrow_btn_2"><i>地図</i></a></div>' +
((__t = (__.helper.endPage())) == null ? '' : __t);

}
return __p
};

this["JST"]["top_index"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += 'top<br/>' +
((__t = (__.macro("dev_menu"))) == null ? '' : __t);

}
return __p
};

this["JST"]["_macro/card_list_content"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div id="card_list" class="scroll_wrapper"><div class="up_spacer"></div><div id="card_list_view" class="card_list_container"></div><div class="bottom_spacer"></div></div><div id="info_view"></div><div class="kei_1"></div><div class="kei_2"></div><div id="page_view"></div>';

}
return __p
};

this["JST"]["_macro/card_list_menu"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class="text_hold_info"><i>※長押しで詳細が見れます</i></div><a id="toggle_status_btn" class="toggle_status_btn list_menu_btn"><i>ステータス切替</i></a><a id="sort_btn" class="sort_btn list_menu_btn"><i>攻撃力順</i></a>';

}
return __p
};

this["JST"]["_macro/dev_menu"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<hr/><a class="hoge" data-href="/html/Sample/index"       ><span>sample>index          </span></a><br/><a class="hoge" data-href="/html/Sample/pc"          ><span>sample>pc             </span></a><br/><a class="hoge" data-href="/html/Sample/questdata"   ><span>sample>questdata      </span></a><br/><a class="hoge" data-href="/html/Top/index"          ><span>top>index             </span></a><br/><hr/><a class="hoge" data-href="/html/Sample/gacha"       ><span>sample>gacha          </span></a><br/><a class="hoge" data-href="/html/Test/index"         ><span>test>index            </span></a><br/><a class="hoge" data-href="/html/Sample/localstorage"><span>sample>localstorage   </span></a><br/><hr/>';

}
return __p
};

this["JST"]["_macro/quest_base_info"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<div class="quest_base_info"><div class="quest_data_info_contaner">最大難易度：' +
((__t = (level)) == null ? '' : __t) +
'　最大フロア：' +
((__t = (floor_max)) == null ? '' : __t) +
'</div><div class="quest_enemy_info_contaner"><div class="enemy_info_text">出現モンスター</div><div class="enemys">';
 _.each(enemys,function(enemy,n){ ;
__p += '<div class="card_bg_s"><img src="' +
((__t = (__.path.card('s',enemy.card_data.gra_id))) == null ? '' : __t) +
'"></div>' +
((__t = (( (n+1)%6 == 0 ) ? "<br/>" : "")) == null ? '' : __t);
 }) ;
__p += '</div></div></div>';

}
return __p
};

this["JST"]["_macro/shop_info"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class="info_container"><div class="menu_info_bg"></div><div class="status_bg"><div class="status"><div class="status_1">所持コイン:' +
((__t = (game_money)) == null ? '' : __t) +
'</div><div class="status_2">所持魔石:' +
((__t = (real_money)) == null ? '' : __t) +
'</div><div class="status_3">所持パックン:&nbsp;&nbsp;<span class="packun_' +
((__t = (packun_n_id)) == null ? '' : __t) +
'"></span>x' +
((__t = (packun_n)) == null ? '' : __t) +
'&nbsp;&nbsp;<span class="packun_' +
((__t = (packun_s_id)) == null ? '' : __t) +
'"></span>x' +
((__t = (packun_s)) == null ? '' : __t) +
'&nbsp;&nbsp;<span class="packun_' +
((__t = (packun_d_id)) == null ? '' : __t) +
'"></span>x' +
((__t = (packun_d)) == null ? '' : __t) +
'</div></div></div></div>';

}
return __p
};