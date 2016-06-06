import * as q from "q";
import {LoadCellDataService} from "../../loadCell/LoadCellDataService";
import {GeneralConfigurationDataStore} from "../MachineSettings/GeneralConfigurationDataStore";
import * as GeneralConfiguration from  "../MachineSettings/GeneralConfigurationRecord";

// export function MachineSettingsCtrl($scope, $uibModal, LoadCellDataService) {
export class CustomerSettingsCtrl {

  static $inject: string[] = [
    "$scope",
    "$log",
    "GeneralConfigurationDataStoreService",
  ];

  constructor(private $scope: ng.IScope,
    private $log,
    private generalConfigurationDataStoreService: GeneralConfigurationDataStore) {
      this.generalConfigurationDataStoreService.initializeDataStore()
      .then((config: Array<GeneralConfiguration.GeneralConfigurationRecord>) => {
        this.minBaleDecrease = Number(config.find(x => x.key === GeneralConfiguration.MIN_BALE_DECREASE).value);
        this.$log.debug("Just loaded minBaleDecrease with: " + this.minBaleDecrease);
      }).done();
    }


  saveMinBaleDecrease(newMin: number): q.Promise<any> {
    this.$log.debug("saveMinBaleDecrease called with parameter: " + newMin);
    return this.generalConfigurationDataStoreService.updateGeneralConfiguration({ key: GeneralConfiguration.MIN_BALE_DECREASE, value: newMin.toString() });
  }
}
