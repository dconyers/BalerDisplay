export function MachineSettingsCtrl($scope, $uibModal, LoadCellDataService) {
  this.getM = function() {
    return LoadCellDataService.calSlope;
  };
  
  this.getB = function() {
    return LoadCellDataService.calIntercept;
  };
  
  this.setCal = function() {
    let obj = this;
    this.currModalInstance= $uibModal.open({
      templateUrl: './MachineSettings/SetCalModal.html',
      controller: 'SetCalModalCtrl',
      controllerAs: "setCalModalCtrl",
    });
  };
  
  this.calibrate = function() {
    let obj = this;
    this.currModalInstance= $uibModal.open({
      templateUrl: './MachineSettings/CalibrationModal.html',
      controller: 'CalibrationModalCtrl',
      controllerAs: "calibrationModalCtrl",
      backdrop: 'static',
      keyboard: false,
      size: 'lg'
    });
  };
}
