import * as BaleTypeDataStore from "./BaleTypesDataStore";

type BaleType = BaleTypeDataStore.BaleType;

export function BaleTypesCtrl($scope, $filter, $http, BaleTypesDataStoreService) {

    this.$inject = [
        "$scope",
        "$filter",
        "$http",
        "BaleTypesDataStoreService"
    ];

    BaleTypesDataStoreService.loadDatabasePromise()
    .then((): void => {
        console.log("Database loaded, abot to count rows");
        return BaleTypesDataStoreService.countAllRows();
    })
    .then((return_val: number): void => {
        console.log("got back row count of: " + return_val);
        if (return_val === 0) {
            return BaleTypesDataStoreService.insertInitializationData();
        }
    })
    .then((): void => {
        return BaleTypesDataStoreService.loadData();
    })
    .then((return_val: Array<BaleType>): void =>  {
        this.baleTypes = return_val;
        console.log("promise returned: " + return_val);
        $scope.$apply();
    }).catch(function (error) {
            console.log("Got error from find_synch: " + error);
    }).done();


    this.saveBaleType = function(data, id) {
        angular.extend(data, {id: id});
        BaleTypesDataStoreService.updateRow(id);
    };

    // remove user
    this.removeBaleType = function(index) {
        BaleTypesDataStoreService.deleteRow(index);
    };

    // add user
    this.addBaleType = function() {
        $scope.inserted = {
            material: "New",
            type: undefined,
            gui: undefined,
            min: undefined,
            max: undefined
        };
        this.baleTypes.push($scope.inserted);
        BaleTypesDataStoreService.insertRow($scope.inserted);
    };
};
