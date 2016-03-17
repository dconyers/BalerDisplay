import { BalerCtrl } from "./balerCtrl";
import { BaleTypesCtrl } from "./BaleTypes/baleTypesCtrl";
import { BaleTypesPanel } from "./BaleTypes/BaleTypesPanel";
import { BaleTypesDataStore } from "./BaleTypes/BaleTypesDataStore";
import {LocalizationProvider} from "./Localization/LocalizationProvider";
import {LocalizationCtrl} from "./Localization/LocalizationCtrl";

angular.module("balerApp", [
                             "modal-dialog",
                             "pascalprecht.translate",
                             "angular-virtual-keyboard",
                             "ngRoute",
                             "xeditable"
                           ]
)
    .config(["$translateProvider", LocalizationProvider])
    .service("BaleTypesDataStoreService", BaleTypesDataStore)
    .controller("BalerCtrl", BalerCtrl)
    .controller("BaleTypesCtrl", BaleTypesCtrl)
    .directive("balerStatsPanel", BalerStatsPanel)
    .directive("baleTypesPanel", BaleTypesPanel)
    .controller("TextBtnCtrl", function($scope) {
        $scope.user = {
            name: "Test Edit"
        };
    })
    .run((editableOptions: any) => { // setting up xeditable options
        editableOptions.theme = "bs3";
    })
    .controller("LocalizationCtrl", LocalizationCtrl)
    .config(["$routeProvider",
      function($routeProvider) {
        $routeProvider.
          when("/BalerStats", {
            templateUrl: "BalerStatsPanel/BalerStatsPanel.html",
            controller: "BalerCtrl",
            controllerAs: "balerCtrl"
          }).
          otherwise({
            redirectTo: "/BalerStats"
          });
      }])
;
