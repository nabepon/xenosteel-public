define(['models/Quest'],function(Quest){

var quest = new Quest();
window.test_code = (window.test_code)?window.test_code:{};
window.test_code.quest = quest;

console.debug("#test models/Quest",quest)

var run = function(){
	
}

return function(){
	return {
		Quest:Quest,
		run  :run,
	}
};;

})
