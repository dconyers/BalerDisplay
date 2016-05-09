import * as q from "q";
import {BaleTypesDataStore} from "./BaleTypesDataStore";
import {BaleTypesService} from "./BaleTypesService";
import {BaleType} from "./BaleType";


// Please note that $uibModalInstance represents a modal window (instance) dependency.
// It is not the same as the $uibModal service used above.

export class BaleTypeSelectorDlgCtrl {

  static $inject: string[] = [
    "$scope",
    "$uibModalInstance",
    "$log",
    "BaleTypesDataStoreService",
    "BaleTypesService",
    "baleTypes",
  ];

  constructor(private $scope: ng.IScope,
    private $uibModalInstance,
    private $log,
    private baleTypesDataStoreService: BaleTypesDataStore,
    private baleTypesService: BaleTypesService,
    private baleTypes: Array<BaleType> ) {
      $log.debug("BaleTypeSelectorDlgCtrl constructor");
    }

  baleSelected(selected: BaleType) {
    this.$log.debug("baleSelected clicked with bale: " + selected.gui);
    this.$log.debug(selected);
    // angular.copy used here to remove the $$hashKey value that breaks nedb
    this.$uibModalInstance.close(angular.copy(selected));
  }

  cancel() {
    this.$log.debug("cancel pressed");
    this.$uibModalInstance.dismiss("cancel");
  };


};
