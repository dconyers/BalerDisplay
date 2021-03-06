import {BalerEmptiedEvent} from "./BalerEmptiedEvent";
import {BaleType} from "../BaleTypes/BaleType";
import {BaleTypeSelectorService} from "../BaleTypes/BaleTypeSelectorService";
import {PictureSrvc} from "../services/PictureSrvc";
import {WorkersDataStore} from "../Settings/WorkerSettings/WorkersDataStore";
import {WorkersService} from "../Settings/WorkerSettings/WorkersService";
import {BalerWorker} from "../Settings/WorkerSettings/BalerWorker";
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
    "balerEmptiedEvent",
    "WorkersService"
  ];

  constructor(private $scope: ng.IScope,
    private $uibModalInstance,
    private $log,
    private $q,
    private baleTypeSelectorService: BaleTypeSelectorService,
    private pictureSrvc: PictureSrvc,
    private workersDataStore: WorkersDataStore,
    private balerEmptiedEvent: BalerEmptiedEvent,
    private workersService: WorkersService) {
      $log.debug("BalerEmptiedConfirmationDlgCtrl constructor.");
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

  public currentWorkerChangeRequest(newCurrentID: string): q.Promise<any> {
      // this.$log.debug("top of currentWorkerChangeRequest: " + requestedWorker);
      // this.$log.debug(requestedWorker);
      // this.balerEmptiedEvent.worker = requestedWorker;
      //
      // return null;
      this.$log.debug("top of currentWorkerChangeRequest: " + newCurrentID);
      this.$log.debug(newCurrentID);
      return this.workersService.changeCurrentWorker(newCurrentID).then((currentWorker: BalerWorker) => {
        this.$log.debug("Got back current Worker of: " + currentWorker.username);
        this.balerEmptiedEvent.worker = currentWorker;
      }).catch((exception: any) => {
        this.$log.error("balerCtrl::currentWorkerChangeRequest Got exception" + exception);
        return exception;
      });
  }

};
