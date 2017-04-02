define([
],function(){
	
	var BattleEnemyAi = Backbone.Model.extend({
		constructor:function(){
			if(!BattleEnemyAi.instance){
				BattleEnemyAi.instance = this;
				Backbone.Model.apply(BattleEnemyAi.instance,arguments);
			}
			return BattleEnemyAi.instance;
		},
		initialize:function(prop,option){
			this.enemys  = option.enemys;
			this.members = option.members;
		},
		decideCommand : function(turn,chara,data){
			this.turn  = turn;
			this.chara = chara;
			this.battle_data  = data;
			
			var ai_id = chara.get("ai_id");
			    ai_id = (ai_id)? ai_id : 0 ;
			var command = ["atk","guard","skill1","skill2"];
			var command_index = _.bind(this.aiData[ai_id],this)();
			var result = {
				list  : command,
				type  : command[command_index],
				index : command_index,
			}
			console.log("BattleEnemyAi#decideCommand [result,chara]",[result,chara]);
			return result
		},
		checkSkillRemain : function(command_rate){
			// スキル回数が0だったら確率を0にする。その分通常攻撃の確率に足す。
			if(this.chara.get("skill_data")[0].use_remain == 0){
				command_rate[0] += command_rate[2];
				command_rate[2] = 0;
			}
			if(this.chara.get("skill_data")[1].use_remain == 0){
				command_rate[0] += command_rate[3];
				command_rate[3] = 0;
			}
			return command_rate;
		},
		randomCommand : function(command_rate){
			// 単純なランダムでコマンドを決定する。
			command_rate = this.checkSkillRemain(command_rate);
			//console.debug("BattleEnemyAi#randomCommand [command_rate]",command_rate);
			var rot_sum = _.reduce( command_rate , function(memo, num){ return memo + num; }, 0);
			var rot = _.random(1,rot_sum);
			var command_index = 0;
			for(var i in command_rate){
				if(command_rate[i]-rot>=0){
					command_index = i.toNumber();
					break
				}else{
					rot -= command_rate[i];
				}
			}
			return command_index
		},
		aiData : {
			0 : function(){
				return this.randomCommand([10,10,10,10]);
				return this.randomCommand([60,10,15,15]);
			}
		}
	});
	
	return BattleEnemyAi;
})

