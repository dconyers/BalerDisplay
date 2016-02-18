'use strict'

angular
.module('balerApp', [])

// controller here
.controller('BalerCtrl', function($scope) {
    $scope.weight = 1234;
    $scope.getWeight = function() {
      return $scope.weight;
    }

});
