import {BalerEmptiedEvent} from "./BalerEmptiedEvent";
import {BaleType} from "../BaleTypes/BaleType";
import {BaleTypeSelectorService} from "../BaleTypes/BaleTypeSelectorService";
import {PictureSrvc} from "../services/PictureSrvc";

import * as q from "q";

export class BalerEmptiedConfirmationDlgCtrl {

  static $inject: string[] = [
    "$scope",
    "$uibModalInstance",
    "$log",
    "BaleTypeSelectorService",
    "PictureSrvc",
    "balerEmptiedEvent"
  ];

  constructor(private $scope: ng.IScope,
    private $uibModalInstance,
    private $log,
    private baleTypeSelectorService: BaleTypeSelectorService,
    private pictureSrvc: PictureSrvc,
    private balerEmptiedEvent: BalerEmptiedEvent) {
      $log.debug("BalerEmptiedConfirmationDlgCtrl constructor: " + balerEmptiedEvent);
    }

  cancel() {
    this.$log.debug("BalerEmptiedConfirmationDlgCtrl::cancel() pressed");
    this.$uibModalInstance.dismiss("cancel");
  };

  confirm() {
    this.$log.debug("BalerEmptiedConfirmationDlgCtrl::confirm() pressed");
    this.$uibModalInstance.close(this.balerEmptiedEvent);
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
};
