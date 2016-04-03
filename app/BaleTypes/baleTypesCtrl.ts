import * as BaleTypeDataStore from "./BaleTypesDataStore";
import * as q from "q";

type BaleType = BaleTypeDataStore.BaleType;

export function BaleTypesCtrl($scope, $filter, $http, $q, baleTypesDataStoreService) {

    this.$inject = [
        "$scope",
        "$filter",
        "$http",
        "BaleTypesDataStoreService"
    ];

    this.reloadBaleTypes = function(): void {
        baleTypesDataStoreService.initializeDataStore()
        .then((return_val: Array<BaleType>): void => {
            console.log("got return value: " + return_val);
            return $q((resolve): void => {
                this.baleTypes = return_val;
                resolve();
                $scope.$apply();
                for (let baleType of return_val) {
                    console.log(baleType);
                }
            });
        }).catch(function(error) {
            console.log("Got error from find_synch: " + error);
        }).done();
    };
    this.saveBaleType = function(data: BaleType, id: any): q.Promise<any> {
        console.log("got save request for id: " + id);
        angular.extend(data, {_id: id});
        console.log(data);
        return baleTypesDataStoreService.updateRow(id, data)
        .then((updateCount: number): any => {
            console.log("updated row count: " + updateCount);
            if (updateCount !== 1) {
                return "Error, Expected updateCount of 1, got: " + updateCount;
            }
            return true;
        });
    };

    // remove user
    this.removeBaleType = function(id: any): q.Promise<any> {
        console.log("got delete request for id: " + id);
        return this.baleTypesDataStoreService.deleteRow(id)
        .then((deleteCount: number): any => {
            console.log("deleted row count: " + deleteCount);
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
            max: undefined
        };
        this.BaleTypesDataStore.insertRow(inserted)
        .then((): any => {
            return this.reloadBaleTypes();
        }).catch(function(error) {
            console.log("addBaleType returned error: " + error);
        }).done();
    };

    this.reloadBaleTypes();
};
