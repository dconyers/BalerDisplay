import * as q from "q";
import {LoadCellDataService} from "../loadCell/LoadCellDataService";
import {GeneralConfigurationDataStore} from "../MachineSettings/GeneralConfigurationDataStore";
import * as GeneralConfiguration from  "../MachineSettings/GeneralConfigurationRecord";

// export function MachineSettingsCtrl($scope, $uibModal, LoadCellDataService) {
export class MachineSettingsCtrl {

  static $inject: string[] = [
    "$scope",
    "$uibModal",
    "$log",
    "LoadCellDataService",
    "GeneralConfigurationDataStoreService",
  ];

  public minBaleDecrease: number = 0;

  constructor(private $scope: ng.IScope,
    private $uibModal,
    private $log,
    private loadCellDataService: LoadCellDataService,
    private generalConfigurationDataStoreService: GeneralConfigurationDataStore) {
      this.generalConfigurationDataStoreService.initializeDataStore()
      .then((config: Array<GeneralConfiguration.GeneralConfigurationRecord>) => {
        this.minBaleDecrease = Number(config.find(x => x.key === GeneralConfiguration.MIN_BALE_DECREASE).value);
        this.$log.debug("Just loaded minBaleDecrease with: " + this.minBaleDecrease);
      }).done();
    }

  getM() {
    return this.loadCellDataService.calSlope;
  }

  getB() {
    return this.loadCellDataService.calIntercept;
  }

  setCal() {
    let obj = this;
    this.$uibModal.open({
      templateUrl: "./MachineSettings/SetCalModal.html",
      controller: "SetCalModalCtrl",
      controllerAs: "setCalModalCtrl",
    });
  }

  calibrate() {
    let obj = this;
    this.$uibModal.open({
      templateUrl: "./MachineSettings/CalibrationModal.html",
      controller: "CalibrationModalCtrl",
      controllerAs: "calibrationModalCtrl",
      backdrop: "static",
      keyboard: false,
    });
  }

  testCam() {
    this.$uibModal.open({
      templateUrl: "./MachineSettings/CameraTestModal.html",
      controller: "CameraTestModalCtrl",
      controllerAs: "cameraTestModalCtrl",
    });
  }

  isLoadCellInit() {
    return this.loadCellDataService.isInit();
  }

  saveMinBaleDecrease(newMin: number): q.Promise<any> {
    this.$log.debug("saveMinBaleDecrease called with parameter: " + newMin);
    return this.generalConfigurationDataStoreService.updateGeneralConfiguration({ key: GeneralConfiguration.MIN_BALE_DECREASE, value: newMin.toString() });
  }
}
