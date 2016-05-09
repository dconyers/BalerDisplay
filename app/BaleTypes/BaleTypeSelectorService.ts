import {BaleTypesDataStore} from "./BaleTypesDataStore";
import {BaleTypesService} from "./BaleTypesService";
import {BaleType} from "./BaleType";
import * as q from "q";

export class BaleTypeSelectorService {

    static $inject: string[] = [
      "$log",
      "$uibModal",
      "BaleTypesDataStoreService",
      "BaleTypesService",
    ];

    constructor(
      private $log: ng.ILogService,
      private $uibModal,
      private baleTypesDataStoreService: BaleTypesDataStore,
      private baleTypesService: BaleTypesService) {
        $log.debug("top of BaleTypeSelector Modal Dialog");
    }

  animationsEnabled = true;

  open(): ng.ui.bootstrap.IModalServiceInstance {

    return this.$uibModal.open({
      animation: this.animationsEnabled,
      templateUrl:  "./BaleTypes/BaleTypeSelector.html",
      controller:   "BaleTypeSelectorDlgCtrl",
      controllerAs: "baleTypeSelectorDlgCtrl",
      resolve: {
        baleTypes: () => {
          return this.baleTypesDataStoreService.initializeDataStore();
        }
      }
    });
  }
}
