import {BalerCtrl} from "./balerCtrl";
import {BaleTypesCtrl} from "./BaleTypes/baleTypesCtrl";
import {BaleTypesDataStore} from "./BaleTypes/BaleTypesDataStore";
import {BaleTypesService} from "./BaleTypes/BaleTypesService";
import {LocalizationCtrl} from "./Localization/LocalizationCtrl";
import {SettingsMenuCtrl} from "./SettingsMenu/SettingsMenuCtrl";
import {CameraTestCtrl} from "./CameraTest/CameraTestCtrl";
import {MenuCtrl} from "./MenuCtrl";
import {PictureModalCtrl} from "./CameraTest/PictureModalCtrl";
import {PictureSrvc} from "./services/PictureSrvc";
import {LoadCellMonitorService} from "./services/LoadCellMonitorService";
import {LoadCellDataService} from "./load_cell_addon/LoadCellDataService";

angular.module("balerApp", [
                             "ui.bootstrap",
                             "pascalprecht.translate",
                             "angular-virtual-keyboard",
                             "ngRoute",
                             "xeditable",
                             "webcam",
                             "appRoutes",
                             "appConfig"
                           ]
)
    .service("BaleTypesDataStoreService", BaleTypesDataStore)
    .service("BaleTypesService", BaleTypesService)
    .service("PictureSrvc", PictureSrvc)
    .service("LoadCellMonitorService", LoadCellMonitorService)
    .service("LoadCellDataService", LoadCellDataService)
    .controller("BalerCtrl", BalerCtrl)
    .controller("LocalizationCtrl", LocalizationCtrl)
    .controller("BaleTypesCtrl", BaleTypesCtrl)
    .controller("SettingsMenuCtrl", SettingsMenuCtrl)
    .controller("CameraTestCtrl", CameraTestCtrl)
    .controller("PictureModalCtrl", PictureModalCtrl)
    .controller("MenuCtrl", MenuCtrl)
    .run((LoadCellMonitorService) => {
    })
;
