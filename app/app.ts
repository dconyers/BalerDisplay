import { BalerCtrl } from "./balerCtrl";
import { BaleTypesCtrl } from "./BaleTypes/baleTypesCtrl";
import { BaleTypesDataStore } from "./BaleTypes/BaleTypesDataStore";
import {LocalizationCtrl} from "./Localization/LocalizationCtrl";
import {SettingsMenuCtrl} from "./SettingsMenu/SettingsMenuCtrl";
import {CameraTestCtrl} from "./CameraTest/CameraTestCtrl";
import {MenuCtrl} from "./MenuCtrl";
import {PictureModalCtrl} from "./CameraTest/PictureModalCtrl";
import {PictureSrvc} from "./services/PictureSrvc";
import {NetworkSettingsCtrl} from "./NetworkSettings/NetworkSettingsCtrl"

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
    .service("PictureSrvc", PictureSrvc)
    .controller("BalerCtrl", BalerCtrl)
    .controller("LocalizationCtrl", LocalizationCtrl)
    .controller("BaleTypesCtrl", BaleTypesCtrl)
    .controller("SettingsMenuCtrl", SettingsMenuCtrl)
    .controller("CameraTestCtrl", CameraTestCtrl)
    .controller("PictureModalCtrl", PictureModalCtrl)
    .controller("MenuCtrl", MenuCtrl)
    .controller("NetworkSettingsCtrl", NetworkSettingsCtrl)
;
