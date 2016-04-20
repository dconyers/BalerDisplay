import {BalerCtrl} from "./balerCtrl";
import {BaleTypesCtrl} from "./BaleTypes/baleTypesCtrl";
import {BaleTypeSelectorCtrl} from "./BaleTypes/BaleTypeSelectorCtrl";
import {BaleTypeSelectorInstanceCtrl} from "./BaleTypes/BaleTypeSelectorCtrl";
import {BaleEventReportCtrl} from "./BaleEvent/BaleEventReportCtrl";
import {BaleTypesDataStore} from "./BaleTypes/BaleTypesDataStore";
import {BaleTypesService} from "./BaleTypes/BaleTypesService";
import {LocalizationCtrl} from "./Localization/LocalizationCtrl";
import {SettingsMenuCtrl} from "./SettingsMenu/SettingsMenuCtrl";
import {CameraTestCtrl} from "./CameraTest/CameraTestCtrl";
import {MenuCtrl} from "./MenuCtrl";
import {PictureModalCtrl} from "./CameraTest/PictureModalCtrl";
import {PictureSrvc} from "./services/PictureSrvc";
import {NetworkSettingsCtrl} from "./NetworkSettings/NetworkSettingsCtrl";
import {LoadCellMonitorService} from "./services/LoadCellMonitorService";
import {LoadCellDataService} from "./load_cell_addon/LoadCellDataService";
import {BaleEventService} from "./BaleEvent/BaleEventService";

angular.module("balerApp", [
                             "ui.bootstrap",
                             "pascalprecht.translate",
                             "angular-virtual-keyboard",
                             "ngRoute",
                             "xeditable",
                             "webcam",
                             "appRoutes",
                             "appConfig",
                             "jqwidgets"
                           ]
)
    .service("BaleTypesDataStoreService", BaleTypesDataStore)
    .service("BaleTypesService", BaleTypesService)
    .service("PictureSrvc", PictureSrvc)
    .service("LoadCellMonitorService", LoadCellMonitorService)
    .service("LoadCellDataService", LoadCellDataService)
    .service("BaleEventService", BaleEventService)
    .controller("BalerCtrl", BalerCtrl)
    .controller("BaleEventReportCtrl", BaleEventReportCtrl)
    .controller("LocalizationCtrl", LocalizationCtrl)
    .controller("BaleTypesCtrl", BaleTypesCtrl)
    .controller("BaleTypeSelectorCtrl", BaleTypeSelectorCtrl)
    .controller("BaleTypeSelectorInstanceCtrl", BaleTypeSelectorInstanceCtrl)
    .controller("SettingsMenuCtrl", SettingsMenuCtrl)
    .controller("CameraTestCtrl", CameraTestCtrl)
    .controller("PictureModalCtrl", PictureModalCtrl)
    .controller("MenuCtrl", MenuCtrl)
    .controller("NetworkSettingsCtrl", NetworkSettingsCtrl)
    .run((LoadCellMonitorService) => {
    })
;
