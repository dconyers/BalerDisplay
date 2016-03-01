"use strict";

setInterval(function() {
  let scope: any = angular.element(document.querySelector("#balerWeight")).scope();
  scope.$apply(function(){
      scope.weight += randomIntFromInterval(-1, 1);
  });
}, 500);


function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
