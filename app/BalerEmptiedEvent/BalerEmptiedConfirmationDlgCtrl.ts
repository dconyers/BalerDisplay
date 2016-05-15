import {BalerEmptiedEvent} from "./BalerEmptiedEvent";
import {BaleType} from "../BaleTypes/BaleType";
import {BaleTypeSelectorService} from "../BaleTypes/BaleTypeSelectorService";
import {PictureSrvc} from "../services/PictureSrvc";
import {WorkersDataStore} from "../WorkerSettings/WorkersDataStore";
import {BalerWorker} from "../WorkerSettings/BalerWorker";
import * as q from "q";

export class BalerEmptiedConfirmationDlgCtrl {

  static $inject: string[] = [
    "$scope",
    "$uibModalInstance",
    "$log",
    "$q",
    "BaleTypeSelectorService",
    "PictureSrvc",
    "WorkersDataStoreService",
    "balerEmptiedEvent"
  ];

  workers: Array<Worker> = [];

  constructor(private $scope: ng.IScope,
    private $uibModalInstance,
    private $log,
    private $q,
    private baleTypeSelectorService: BaleTypeSelectorService,
    private pictureSrvc: PictureSrvc,
    private workersDataStore: WorkersDataStore,
    private balerEmptiedEvent: BalerEmptiedEvent) {
      $log.debug("BalerEmptiedConfirmationDlgCtrl constructor: " + balerEmptiedEvent);
    }

  cancel() {
    this.$log.debug("BalerEmptiedConfirmationDlgCtrl::cancel() pressed");
    this.$uibModalInstance.dismiss("cancel");
  };

  confirm() {
    this.$log.debug("BalerEmptiedConfirmationDlgCtrl::confirm() pressed");
    this.$uibModalInstance.close(angular.copy(this.balerEmptiedEvent));
  }

  userChangeBalePictureRequest(): void {
    this.$log.debug("User Requested updated to Bale Picture");
    this.pictureSrvc.takePicturePromise()
    .then((newFilename: string) => {
      this.balerEmptiedEvent.photoPath = newFilename;
    })
    .catch((exception) => {
      this.$log.debug("Received exception taking updated picture: " + exception);
    });
  }

  reloadWorkers(): void {
      this.$log.debug("top of reloadWorkers");
      this.workersDataStore.initializeDataStore()
          .then((return_val: Array<Worker>): void => {
              return this.$q((resolve): void => {
                  this.workers = return_val;
                  this.$log.debug("workers updated");
                  resolve();
                  this.$scope.$apply();
              });
          }).catch(function(error) {
              this.$log.error("Got error from find_synch: " + error);
          }).done();
  }



  userChangeBaleTypeRequest(): void {
    this.$log.debug("Current baleType is: " + this.balerEmptiedEvent.baleType.gui);
    this.baleTypeSelectorService.open().result.then((selectedItem: BaleType) => {
      this.$log.debug("user selected new value: " + selectedItem);
      this.balerEmptiedEvent.baleType = selectedItem;
    })
    .catch((exception) => {
      this.$log.debug("Received exception changing bale type: " + exception);
    });
  }

  public currentWorkerChangeRequest(requestedWorker: BalerWorker): q.Promise<any> {
      this.$log.debug("top of currentWorkerChangeRequest: " + requestedWorker);
      this.$log.debug(requestedWorker);
      this.balerEmptiedEvent.worker = requestedWorker;

      return null;
  }

};
