import * as q from "q";
import {BaleType} from "./BaleType";

export function BaleTypesCtrl($scope, $log: ng.ILogService, $filter, $http, $q, BaleTypesDataStoreService) {

    this.$inject = [
        "$scope",
        "$log",
        "$filter",
        "$http",
        "BaleTypesDataStoreService"
    ];

    this.reloadBaleTypes = function(): void {
        BaleTypesDataStoreService.initializeDataStore()
        .then((return_val: Array<BaleType>): void => {
            $log.debug("got return value: " + return_val);
            return $q((resolve): void => {
                this.baleTypes = return_val;
                resolve();
                $scope.$apply();
                for (let baleType of return_val) {
                    $log.debug(baleType);
                }
            });
        }).catch(function(error) {
            $log.error("Got error from find_synch: " + error);
        }).done();
    };
    this.saveBaleType = function(data: BaleType, id: any): q.Promise<any> {
        $log.debug("got save request for id: " + id);
        angular.extend(data, {_id: id});
        $log.debug(data);
        return BaleTypesDataStoreService.updateRow(id, data)
        .then((updateCount: number): any => {
            $log.debug("updated row count: " + updateCount);
            if (updateCount !== 1) {
                return "Error, Expected updateCount of 1, got: " + updateCount;
            }
            return true;
        });
    };

    // remove user
    this.removeBaleType = function(id: any): q.Promise<any> {
        $log.debug("got delete request for id: " + id);
        return BaleTypesDataStoreService.deleteRow(id)
        .then((deleteCount: number): any => {
            $log.debug("deleted row count: " + deleteCount);
            if (deleteCount !== 1) {
                return "Error, Expected deleteCount of 1, got: " + deleteCount;
            }
            return this.reloadBaleTypes();
        }).done();
    };

    // add Bale Type
    this.addBaleType = function() {
        let inserted: BaleType = {
            material: "New",
            type: undefined,
            gui: undefined,
            min: undefined,
            max: undefined,
            currentType: false,
        };
        this.BaleTypesDataStore.insertRow(inserted)
        .then((): any => {
            return this.reloadBaleTypes();
        }).catch(function(error) {
            $log.error("addBaleType returned error: " + error);
        }).done();
    };

    this.reloadBaleTypes();
};
