import {BalerEmptiedEvent} from "./BalerEmptiedEvent";
import {BaleType} from "../BaleTypes/BaleType";
import {BaleTypeSelectorService} from "../BaleTypes/BaleTypeSelectorService";
import * as q from "q";

export class BalerEmptiedConfirmationDlgCtrl {

  static $inject: string[] = [
    "$scope",
    "$uibModalInstance",
    "$log",
    "BaleTypeSelectorService",
    "balerEmptiedEvent"
  ];

  constructor(private $scope: ng.IScope,
    private $uibModalInstance,
    private $log,
    private baleTypeSelectorService: BaleTypeSelectorService,
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

  userChangeBaleTypeRequest(): void {
    this.$log.debug("Current baleType is: " + this.balerEmptiedEvent.baleType.gui);
    this.baleTypeSelectorService.open().result.then((selectedItem: BaleType) => {
      this.$log.debug("user selected new value: " + selectedItem);
      this.balerEmptiedEvent.baleType = selectedItem;
    })
    .catch(() => {
    });
  }
};
