"use strict";

import { BaleTypesCtrl } from "./baleTypesCtrl";


export function BaleTypesPanel() {
    console.log("Top of BaleTypesPanel function");
    return {
            restrict: "E",
            templateUrl: "./BaleTypes/BaleTypesPanel.html",
            controller: BaleTypesCtrl,
            controllerAs: "baleTypesCtrl"
    };
};
