import * as q from "q";
import {BaleType} from "./BaleType";
import {BaleTypesDataStore} from "./BaleTypesDataStore";
import {BaleTypesService} from "./BaleTypesService";
import {BaleTypeSelectorService} from "./BaleTypeSelectorService";

export class BaleTypesCtrl {

  static $inject: string[] = [
        "$scope",
        "$log",
        "$filter",
        "$http",
        "$q",
        "BaleTypesDataStoreService",
        "BaleTypesService",
        "BaleTypeSelectorService"
    ];

    baleTypes: Array<BaleType> = [];

    constructor(private $scope,
                private $log: ng.ILogService,
                private $filter,
                private $http,
                private $q,
                private baleTypesDataStore: BaleTypesDataStore,
                private baleTypesService: BaleTypesService,
                private baleTypeSelectorService: BaleTypeSelectorService) {
                  this.reloadBaleTypes();
    }

    reloadBaleTypes(): void {
        this.baleTypesDataStore.initializeDataStore()
        .then((return_val: Array<BaleType>): void => {
            return this.$q((resolve): void => {
                this.baleTypes = return_val;
                resolve();
                this.$scope.$apply();
            });
        }).catch(function(error) {
            this.$log.error("Got error from find_synch: " + error);
        }).done();
    }

    saveBaleType(data: BaleType, id: any): q.Promise<any> {
        this.$log.debug("got save request for id: " + id);
        angular.extend(data, {_id: id});
        this.$log.debug(data);
        return this.baleTypesDataStore.updateRowPromise(id, { $set: data} , {})
        .then((updateCount: number): any => {
            this.$log.debug("updated row count: " + updateCount);
            if (updateCount !== 1) {
                return "Error, Expected updateCount of 1, got: " + updateCount;
            }
            return true;
        });
    }

    // remove user
    removeBaleType(id: any): q.Promise<any> {
        this.$log.debug("got delete request for id: " + id);
        return this.baleTypesDataStore.deleteRowWithIDPromise(id)
        .then((deleteCount: number): any => {
            this.$log.debug("deleted row count: " + deleteCount);
            if (deleteCount !== 1) {
                return "Error, Expected deleteCount of 1, got: " + deleteCount;
            }
            return this.reloadBaleTypes();
        });
    }

    // add Bale Type
    addBaleType() {
        let inserted: BaleType = {
            _id: undefined,
            material: undefined,
            type: undefined,
            gui: undefined,
            min: undefined,
            max: undefined,
            currentType: false,
        };
        this.baleTypesDataStore.insertRowPromise(inserted)
        .then((): any => {
            return this.reloadBaleTypes();
        }).catch(function(error) {
            this.$log.error("addBaleType returned error: " + error);
        }).done();
    }

    public changeCurrentBaleType(): void {
      this.$log.debug("BaleTypesCtrl::changeCurrentBaleType");
      this.baleTypeSelectorService.open().result.then((selectedItem: BaleType) => {
        this.$log.debug("user selected new value: " + selectedItem);
        return this.currentBaleTypeChangeRequest(selectedItem);
      }).catch(() => {
        this.$log.debug("selection cancelled");
      });
    }

    public currentBaleTypeChangeRequest(newCurrent: BaleType): q.Promise<any> {
      return this.baleTypesService.getCurrentBaleType().then((currentBaleType: BaleType) => {
          this.$log.debug("currentBaleTypeChangeRequest::got current bale type: " + currentBaleType.gui);
          this.baleTypesDataStore.updateRowPromise(currentBaleType._id, { $set: { currentType: false } }, {});
          this.$log.debug("currentBaleTypeChangeRequest::done uploading old row");
      }).then(() => {
        this.$log.debug("currentBaleTypeChangeRequest::uploading new row");
        return this.baleTypesDataStore.updateRowPromise(newCurrent._id, { $set: { currentType: true } }, {});
      }).then(() => {

      }).catch((exception: any) => {
        this.$log.error("balerCtrl::currentBaleTypeChangeRequest Got exception" + exception);
        return exception;
      });
    }



}
