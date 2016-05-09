import {BalerCtrl} from "./BalerCtrl";
import {BaleTypesCtrl} from "./BaleTypes/BaleTypesCtrl";
import {BaleTypeSelectorService} from "./BaleTypes/BaleTypeSelectorService";
import {BaleTypeSelectorDlgCtrl} from "./BaleTypes/BaleTypeSelectorDlgCtrl";
import {BalerEmptiedEventReportCtrl} from "./BalerEmptiedEvent/BalerEmptiedEventReportCtrl";
import {BaleTypesDataStore} from "./BaleTypes/BaleTypesDataStore";
import {BaleWeightRecordDataStore} from "./BaleWeightRecord/BaleWeightRecordDataStore";
import {BaleTypesService} from "./BaleTypes/BaleTypesService";
import {LocalizationCtrl} from "./Localization/LocalizationCtrl";
import {SettingsMenuCtrl} from "./SettingsMenu/SettingsMenuCtrl";
import {CameraTestCtrl} from "./CameraTest/CameraTestCtrl";
import {MenuCtrl} from "./MenuCtrl";
import {PictureModalCtrl} from "./CameraTest/PictureModalCtrl";
import {PictureSrvc} from "./services/PictureSrvc";
import {NetworkSettingsCtrl} from "./NetworkSettings/NetworkSettingsCtrl";
import {LoadCellMonitorService} from "./services/LoadCellMonitorService";
import {LoadCellDataService} from "./loadCell/LoadCellDataService";
import {BalerEmptiedEventService} from "./BalerEmptiedEvent/BalerEmptiedEventService";
import {BalerEmptiedEventDataStore} from "./BalerEmptiedEvent/BalerEmptiedEventDataStore";
import {BalerEmptiedConfirmationDlgCtrl} from "./BalerEmptiedEvent/BalerEmptiedConfirmationDlgCtrl";
import {MachineSettingsCtrl} from "./MachineSettings/MachineSettingsCtrl";
import {SetCalModalCtrl} from "./MachineSettings/SetCalModalCtrl";
import {CalibrationModalCtrl} from "./MachineSettings/CalibrationModalCtrl";
import {CameraTestModalCtrl} from "./MachineSettings/CameraTestModalCtrl";

angular.module("balerApp", [
                             "ui.bootstrap",
                             "pascalprecht.translate",
                             "angular-virtual-keyboard",
                             "ngRoute",
                             "xeditable",
                             "webcam",
                             "ngTouch",
                             "bootstrapLightbox",
                             "appRoutes",
                             "appConfig",
                             "jqwidgets"
                           ]
)
  .factory("$log", function() {
    let log4js = require("log4js");
    log4js.configure("log4js.json", { reloadSecs: 10 });
    let logger = log4js.getLogger();
    return logger;
  })
    .service("BaleTypesDataStoreService", BaleTypesDataStore)
    .service("BaleTypesService", BaleTypesService)
    .service("PictureSrvc", PictureSrvc)
    .service("LoadCellDataService", LoadCellDataService)
    .service("BalerEmptiedEventService", BalerEmptiedEventService)
    .service("BalerEmptiedEventDataStoreService", BalerEmptiedEventDataStore)
    .service("BaleWeightRecordDataStoreService", BaleWeightRecordDataStore)
    .service("LoadCellMonitorService", LoadCellMonitorService)
    .service("BaleTypeSelectorService", BaleTypeSelectorService)
    .controller("BalerCtrl", BalerCtrl)
    .controller("BalerEmptiedEventReportCtrl", BalerEmptiedEventReportCtrl)
    .controller("BalerEmptiedConfirmationDlgCtrl", BalerEmptiedConfirmationDlgCtrl)
    .controller("LocalizationCtrl", LocalizationCtrl)
    .controller("BaleTypesCtrl", BaleTypesCtrl)
    .controller("BaleTypeSelectorDlgCtrl", BaleTypeSelectorDlgCtrl)
    .controller("SettingsMenuCtrl", SettingsMenuCtrl)
    .controller("CameraTestCtrl", CameraTestCtrl)
    .controller("PictureModalCtrl", PictureModalCtrl)
    .controller("MenuCtrl", MenuCtrl)
    .controller("NetworkSettingsCtrl", NetworkSettingsCtrl)
    .controller("MachineSettingsCtrl", MachineSettingsCtrl)
    .controller("SetCalModalCtrl", SetCalModalCtrl)
    .controller("CalibrationModalCtrl", CalibrationModalCtrl)
    .controller("CameraTestModalCtrl", CameraTestModalCtrl)
    .run(["BaleTypesDataStoreService", "$log", (baleTypesDataStoreService, $log) => {
      baleTypesDataStoreService.initializeDataStore().then(() => {
        $log.debug("BaleTypesDataStoreService.initDataStore success:");
      })
      .catch((exception) => {
        $log.error("Got exception: " + exception);
      })
      .done();
    }])
    .run(["BaleWeightRecordDataStoreService", "$log", (baleWeightRecordDataStore, $log) => {
      baleWeightRecordDataStore.initializeDataStore().then(() => {
        $log.debug("BaleWeightRecordDataStore.initDataStore success:");
      })
      .catch((exception) => {
        $log.error("Got exception: " + exception);
      })
      .done();
    }])
    .run(["BalerEmptiedEventDataStoreService", "$log", (balerEmptiedEventDataStore, $log) => {
      balerEmptiedEventDataStore.initializeDataStore().then(() => {
        $log.debug("BalerEmptiedEventDataStore.initDataStore success:");
      })
      .catch((exception) => {
        $log.error("Got exception: " + exception);
      })
      .done();
    }])
    .run(["LoadCellMonitorService", "$log", (loadCellMonitorService, $log) => {
      loadCellMonitorService.startMonitor();
    }])
;
