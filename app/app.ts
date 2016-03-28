import { BalerCtrl } from "./balerCtrl";
import { BaleTypesCtrl } from "./BaleTypes/baleTypesCtrl";
import { BaleTypesDataStore } from "./BaleTypes/BaleTypesDataStore";
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
                             "webcam",
                             'appRoutes',
                             "appConfig"
                           ]
)
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
    .controller("MenuCtrl", MenuCtrl)
    .directive('goBack', function($window){
      return function($scope, $element){
        $element.on('click', function(){
          $window.history.back();
        })
      }
    })
;
