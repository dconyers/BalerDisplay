import * as q from "q";
import {LoadCellDataService} from "../../loadCell/LoadCellDataService";
import {GeneralConfigurationDataStore} from "../../GeneralConfiguration/GeneralConfigurationDataStore";
import * as GeneralConfiguration from  "../../GeneralConfiguration/GeneralConfigurationRecord";

// export function MachineSettingsCtrl($scope, $uibModal, LoadCellDataService) {
export class CustomerSettingsCtrl {

  private customerID: string;
  private balerID: string;

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
        this.customerID = config.find(x => x.key === GeneralConfiguration.CUSTOMER_ID).value;
        this.balerID = config.find(x => x.key === GeneralConfiguration.BALER_ID).value;
      }).done();
    }

  saveCustomerID(newValue: string): q.Promise<any> {
    return this.generalConfigurationDataStoreService.updateGeneralConfiguration({ key: GeneralConfiguration.CUSTOMER_ID, value: newValue });
  }

  saveBalerID(newValue: string): q.Promise<any> {
    return this.generalConfigurationDataStoreService.updateGeneralConfiguration({ key: GeneralConfiguration.BALER_ID, value: newValue });
  }
}
