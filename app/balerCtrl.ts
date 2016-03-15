"use strict";
const load_cell_addon = require("./load_cell_addon/load_cell_addon");

export function BalerCtrl($scope) {
    console.log("Top of BalerCtrl function");
    this.balerData = {
        lowWeight: 1000,
        currentWeight: 2345,
        highWeight: 3000,
    };

    this.getLowWeight = function() {
        return this.balerData.lowWeight;
    };


    this.getHighWeight = function() {
        return this.balerData.highWeight;
    };

    this.getCurrentWeight = function() {
        this.balerData.currentWeight = load_cell_addon.getLoadCellWeight();
        return this.balerData.currentWeight;
    };
};
