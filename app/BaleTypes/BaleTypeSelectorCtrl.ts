import {BaleTypesDataStore} from "./BaleTypesDataStore";
import {BaleType} from "./BaleType";

export class BaleTypeSelectorCtrl {

    static $inject: string[] = [
      "$scope",
      "$log",
      "$uibModal",
      "BaleTypesDataStoreService"
    ];

    constructor(private $scope: ng.IScope,
      private $log: ng.ILogService,
      private $uibModal,
      private baleTypesDataStoreService: BaleTypesDataStore) {
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

  toggleAnimation() {
    this.animationsEnabled = !this.animationsEnabled;
  }

}

// Please note that $uibModalInstance represents a modal window (instance) dependency.
// It is not the same as the $uibModal service used above.

export class BaleTypeSelectorInstanceCtrl {

  static $inject: string[] = [
    "$scope",
    "$uibModalInstance",
    "$log",
    "baleTypes"
  ];

  constructor(private $scope: ng.IScope,
    private $uibModalInstance,
    private $log,
    private baleTypes: Array<BaleType> ) {
      $log.debug("BaleTypeSelectorInstanceCtrl constructor");
    }

  baleSelected(selected: BaleType) {
    this.$log.debug("baleSelected clicked with bale: " + selected.gui);
  }

  cancel() {
    this.$log.debug("cancel pressed");
    this.$uibModalInstance.dismiss("cancel");
  };
};
