export function BaleTypesCtrl($scope, $filter, $http, BaleTypesDataStoreService) {

    this.$inject = [
        "$scope",
        "$filter",
        "$http",
        "BaleTypesDataStoreService"
    ];

    BaleTypesDataStoreService.loadData().then((return_val): void =>  {
        this.baleTypes = return_val;
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
