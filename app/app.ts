import { BalerCtrl } from "./balerCtrl";
import { BalerStatsPanel } from "./BalerStatsPanel/BalerStatsPanel";
import { BaleTypesCtrl } from "./BaleTypes/baleTypesCtrl";
import { BaleTypesPanel } from "./BaleTypes/BaleTypesPanel";
import { BaleTypesDataStore } from "./BaleTypes/BaleTypesDataStore";
import {LocalizationProvider} from "./Localization/LocalizationProvider";
import {LocalizationChooser} from "./Localization/LocalizationChooser";

angular.module("balerApp", ["modal-dialog", "pascalprecht.translate", "angular-virtual-keyboard", "xeditable"])
    .config(["$translateProvider", LocalizationProvider])
    .service("BaleTypesDataStoreService", BaleTypesDataStore)
    .controller("BalerCtrl", BalerCtrl)
    .controller("BaleTypesCtrl", BaleTypesCtrl)
    .directive("balerStatsPanel", BalerStatsPanel)
    .directive("baleTypesPanel", BaleTypesPanel)
    .directive("localizationChooser", LocalizationChooser)
    .controller("TextBtnCtrl", function($scope) {
        $scope.user = {
            name: "Test Edit"
        };
    })
    .run((editableOptions: any) => { // setting up xeditable options
        editableOptions.theme = "bs3";
    })
;
