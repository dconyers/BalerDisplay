export function SetCalModalCtrl($scope, LoadCellDataService, LoadCellMonitorService) {
  this.m = LoadCellDataService.calSlope;
  this.b = LoadCellDataService.calIntercept;
  LoadCellMonitorService.stopMonitor();

  $scope.$on("$destroy", () => {
    LoadCellMonitorService.clearBaleWeightRecordDataStore();
    LoadCellMonitorService.startMonitor();
  });

  this.update = function(m, b) {
    LoadCellDataService.setCalibration(m, b);
    $scope.$close();
  };
}
