enum ModalState {
  WAITING_START,
  START_ZERO,
  WAITING_KNOWN_WEIGHT,
  START_KNOWN_SAMPLE
}
  
export function CalibrationModalCtrl($scope, LoadCellDataService, LoadCellMonitorService) {
  this.modalState = ModalState.WAITING_START;
  LoadCellMonitorService.stopMonitor();
  
  $scope.$on("$destroy", () => {
    LoadCellMonitorService.clearBaleWeightRecordDataStore();
    LoadCellMonitorService.startMonitor();
  });

  this.calWeight = (knownWeight) => {
    let obj = this;
    this.modalState = ModalState.START_KNOWN_SAMPLE;
    LoadCellDataService.calibrateWeight(knownWeight, obj.weightDone)
  };
  
  this.weightDone = () => {
    $scope.$close();
    this.modalState = ModalState.WAITING_START;
    $scope.$apply();
  };
  
  this.zeroDone = () => {
    this.modalState = ModalState.WAITING_KNOWN_WEIGHT;
    $scope.$apply();
  };
  
  this.sampleZero = () => {
    this.modalState = ModalState.START_ZERO;
    let obj = this;
    LoadCellDataService.calibrate(obj.zeroDone);
  };
  
  this.showWaiting = () => {
    return this.modalState === ModalState.START_ZERO ||
           this.modalState === ModalState.START_KNOWN_SAMPLE;
  };
  
  this.showZero = () => {
    return this.modalState === ModalState.WAITING_START;
  };
  
  this.showKnown = () => {
    return this.modalState === ModalState.WAITING_KNOWN_WEIGHT;
  };
  
  this.checkLoadCell = () => {
    if(!LoadCellDataService.isInit()) {
      $scope.$close();
    }
  };
  
  let obj = this;
  this.interval = setInterval(obj.checkLoadCell, 200);
  
}
