"use strict";

import { LocalizationCtrl } from "./LocalizationCtrl";


export function LocalizationChooser() {
    return {
            restrict: "E",
            templateUrl: "./Localization/LocalizationChooser.html",
            controller: LocalizationCtrl,
            controllerAs: "localizationCtrl"
    };
};
