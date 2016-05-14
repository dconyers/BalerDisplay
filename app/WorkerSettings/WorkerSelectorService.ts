import {WorkersDataStore} from "./WorkersDataStore";
import {WorkersService} from "./WorkersService";
import {Worker} from "./Worker";
import * as q from "q";

export class WorkerSelectorService {

    static $inject: string[] = [
      "$log",
      "$uibModal",
      "WorkersDataStoreService",
      "WorkersService",
    ];

    constructor(
      private $log: ng.ILogService,
      private $uibModal,
      private workersDataStoreService: WorkersDataStore,
      private workersService: WorkersService) {
        $log.debug("top of WorkerSelector Modal Dialog");
    }

  animationsEnabled = true;

  open(): ng.ui.bootstrap.IModalServiceInstance {

    return this.$uibModal.open({
      animation: this.animationsEnabled,
      templateUrl:  "./Workers/WorkerSelector.html",
      controller:   "WorkerSelectorDlgCtrl",
      controllerAs: "workerSelectorDlgCtrl",
      resolve: {
        workers: () => {
          return this.workersDataStoreService.initializeDataStore();
        }
      }
    });
  }
}
