import * as q from "q";
import {WorkersDataStore} from "./WorkersDataStore";
import {WorkersService} from "./WorkersService";
import {BalerWorker} from "./BalerWorker";


// Please note that $uibModalInstance represents a modal window (instance) dependency.
// It is not the same as the $uibModal service used above.

export class WorkerSelectorDlgCtrl {

  static $inject: string[] = [
    "$scope",
    "$uibModalInstance",
    "$log",
    "WorkersDataStoreService",
    "WorkersService",
    "baleTypes",
  ];

  constructor(private $scope: ng.IScope,
    private $uibModalInstance,
    private $log,
    private baleTypesDataStoreService: WorkersDataStore,
    private baleTypesService: WorkersService,
    private baleTypes: Array<BalerWorker> ) {
      $log.debug("WorkerSelectorDlgCtrl constructor");
    }

  baleSelected(selected: BalerWorker) {
    this.$log.debug("baleSelected clicked with bale: " + selected.username);
    this.$log.debug(selected);
    // angular.copy used here to remove the $$hashKey value that breaks nedb
    this.$uibModalInstance.close(angular.copy(selected));
  }

  cancel() {
    this.$log.debug("cancel pressed");
    this.$uibModalInstance.dismiss("cancel");
  };
};
