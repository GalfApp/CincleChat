//inspired from http://plnkr.co/edit/bntEsfngnJKuneg2raD1

angular.module('focus', []).directive('focus',function($parse,$timeout){
  return function(scope,element,attrs){
    var ngFocusGet = $parse(attrs.focus);
    var ngFocusSet = ngFocusGet.assign;
    if (!ngFocusSet) {
      throw Error("Non assignable expression");
    }

    var digesting = false;

    var abortFocusing = false;
    var unwatch = scope.$watch(attrs.focus,function(newVal){
      if(newVal){
        $timeout(function(){
          element[0].focus();  
        },0);
      }
      else {
        $timeout(function(){
          element[0].blur();
        },0);
      }
    });


    element.bind("blur",function(){

      if(abortFocusing) return;

      $timeout(function(){
        ngFocusSet(scope,false);
      },0);

    });


    var timerStarted = false;
    var focusCount = 0;

    function startTimer(){
      $timeout(function(){
        timerStarted = false;
        if(focusCount > 3){
          unwatch();
          abortFocusing = true;
          throw new Error("Aborting : focus cannot be assigned to the same variable with multiple elements");
        }
      },200);
    }

    element.bind("focus",function(){

      if(abortFocusing) return;

      if(!timerStarted){
        timerStarted = true;
        focusCount = 0;
        startTimer();
      }
      focusCount++;

      $timeout(function(){
        ngFocusSet(scope,true);
      },0);

    });
  };
});
