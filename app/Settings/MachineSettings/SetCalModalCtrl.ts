export function SetCalModalCtrl($scope, LoadCellDataService) {
  this.m = LoadCellDataService.calSlope;
  this.b = LoadCellDataService.calIntercept;

  this.update = function(m, b) {
    LoadCellDataService.setCalibration(m, b);
    $scope.$close();
  };
}
