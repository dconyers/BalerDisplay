import {BaleTypesDataStore} from "./BaleTypesDataStore";
import {BaleTypesService} from "./BaleTypesService";
import {BaleType} from "./BaleType";
import * as q from "q";

export class BaleTypeSelectorCtrl {

    static $inject: string[] = [
      "$scope",
      "$log",
      "$uibModal",
      "BaleTypesDataStoreService",
      "BaleTypesService",
    ];

    constructor(private $scope: ng.IScope,
      private $log: ng.ILogService,
      private $uibModal,
      private baleTypesDataStoreService: BaleTypesDataStore,
      private baleTypesService: BaleTypesService) {
        $log.debug("top of BaleTypeSelector Modal Dialog");
    }

  animationsEnabled = true;

  open(size) {

    let modalInstance = this.$uibModal.open({
      animation: this.animationsEnabled,
      templateUrl:  "./BaleTypes/BaleTypeSelector.html",
      controller:   "BaleTypeSelectorInstanceCtrl",
      controllerAs: "baleTypeSelectorInstanceCtrl",
      size: size,
      resolve: {
        baleTypes: () => {
          return this.baleTypesDataStoreService.initializeDataStore();
        }
      }
    });

    modalInstance.result.then(function (selectedItem) {
      this.selected = selectedItem;
    }, () => {
      this.$log.info("Modal dismissed at: " + new Date());
    });
  }

}

// Please note that $uibModalInstance represents a modal window (instance) dependency.
// It is not the same as the $uibModal service used above.

export class BaleTypeSelectorInstanceCtrl {

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
      $log.debug("BaleTypeSelectorInstanceCtrl constructor");
    }

  baleSelected(selected: BaleType) {
    this.$log.debug("baleSelected clicked with bale: " + selected.gui);
    return this.currentBaleTypeChangeRequest(selected);
  }

  cancel() {
    this.$log.debug("cancel pressed");
    this.$uibModalInstance.dismiss("cancel");
  };

  public currentBaleTypeChangeRequest(newCurrent: BaleType): q.Promise<any> {
    return this.baleTypesService.getCurrentBaleType().then((currentBaleType: BaleType) => {
        this.$log.debug("currentBaleTypeChangeRequest::got current bale type: " + currentBaleType.gui);
        this.baleTypesDataStoreService.updateRowPromise(currentBaleType._id, { $set: { currentType: false } }, {});
        this.$log.debug("currentBaleTypeChangeRequest::done uploading old row");
    }).then(() => {
      this.$log.debug("currentBaleTypeChangeRequest::uploading new row");
      return this.baleTypesDataStoreService.updateRowPromise(newCurrent._id, { $set: { currentType: true } }, {});
    }).then(() => {
      this.$uibModalInstance.close(newCurrent);
    }).catch((exception: any) => {
      this.$log.error("balerCtrl::currentBaleTypeChangeRequest Got exception" + exception);
      return exception;
    });
  }

};
