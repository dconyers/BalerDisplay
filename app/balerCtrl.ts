"use strict";
const load_cell_addon = require ("./load_cell_addon/load_cell_addon");

angular.module("balerApp", []).controller("BalerCtrl", function($scope) {
    $scope.weight = 1234;
    $scope.getWeight = function() {
      return $scope.weight;
    };

    $scope.getLowWeight = function() {
      return 100;
    };


    $scope.getHighWeight = function() {
      return 2000;
    };

    $scope.getAddonWeight = function() {
      return load_cell_addon.getLoadCellWeight();
    };


});
