import { BalerCtrl } from "./balerCtrl";
import { BaleTypesCtrl } from "./BaleTypes/baleTypesCtrl";
import { BaleTypesDataStore } from "./BaleTypes/BaleTypesDataStore";
import {LocalizationProvider} from "./Localization/LocalizationProvider";
import {LocalizationCtrl} from "./Localization/LocalizationCtrl";
import {SettingsMenuCtrl} from "./SettingsMenu/SettingsMenuCtrl";
import {CameraTestCtrl} from "./CameraTest/CameraTestCtrl";
import {MenuCtrl} from "./MenuCtrl";
import {PictureModalCtrl} from "./CameraTest/PictureModalCtrl";

angular.module("balerApp", [
                             "ui.bootstrap",
                             "pascalprecht.translate",
                             "angular-virtual-keyboard",
                             "ngRoute",
                             "xeditable",
                             "webcam"
                           ]
)
    .config(["$translateProvider", LocalizationProvider])
    .service("BaleTypesDataStoreService", BaleTypesDataStore)
    .controller("BalerCtrl", BalerCtrl)
    .controller("LocalizationCtrl", LocalizationCtrl)
    .controller("BaleTypesCtrl", BaleTypesCtrl)
    .controller("SettingsMenuCtrl", SettingsMenuCtrl)
    .controller("CameraTestCtrl", CameraTestCtrl)
    .controller("PictureModalCtrl", PictureModalCtrl)
    .controller("TextBtnCtrl", function($scope) {
        $scope.user = {
            name: "Test Edit"
        };
    })
    .run((editableOptions: any) => { // setting up xeditable options
        editableOptions.theme = "bs3";
    })
    .controller("MenuCtrl", MenuCtrl)
    .config(["$routeProvider",
      function($routeProvider) {
        $routeProvider.
          when("/BalerStats", {
            title: "BALER_STATS",
            templateUrl: "BalerStatsPanel/BalerStatsPanel.html",
            controller: "BalerCtrl",
            controllerAs: "balerCtrl"
          }).
          when("/SettingsMenu", {
            title: "SETTINGS_MENU",
            templateUrl: "SettingsMenu/SettingsMenu.html",
            controller: "SettingsMenuCtrl",
            controllerAs: "SettingsMenuCtrl"
          }).
          when("/BaleTypes", {
            title: "MATERIAL_SETTINGS",
            templateUrl: "BaleTypes/BaleTypesPanel.html",
            controller: "BaleTypesCtrl",
            controllerAs: "baleTypesCtrl"
          }).
          when("/CameraTest", {
            title: "CAMERA_TEST",
            templateUrl: "CameraTest/CameraTest.html",
            controller: "CameraTestCtrl",
            controllerAs: "cameraTestCtrl"
          }).
          otherwise({
            redirectTo: "/BalerStats"
          });
      }])
    .run(['$rootScope', function($rootScope) {
      $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
        $rootScope.title = current.$$route !== undefined ? current.$$route.title : 'BALER_STATS';
      });
    }])
    .directive('goBack', function($window){
      return function($scope, $element){
        $element.on('click', function(){
          $window.history.back();
        })
      }
    })
;
