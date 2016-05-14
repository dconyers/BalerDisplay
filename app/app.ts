import {BalerCtrl} from "./BalerCtrl";
import {BalerEmptiedEventReportCtrl} from "./BalerEmptiedEvent/BalerEmptiedEventReportCtrl";
import {BaleTypesCtrl} from "./BaleTypes/BaleTypesCtrl";
import {BaleTypesDataStore} from "./BaleTypes/BaleTypesDataStore";
import {BaleTypeSelectorService} from "./BaleTypes/BaleTypeSelectorService";
import {BaleTypeSelectorDlgCtrl} from "./BaleTypes/BaleTypeSelectorDlgCtrl";
import {BaleTypesService} from "./BaleTypes/BaleTypesService";
import {BaleWeightRecordDataStore} from "./BaleWeightRecord/BaleWeightRecordDataStore";
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
import {GPIOService} from "./services/GPIOService";
import {WorkersDataStore} from "./WorkerSettings/WorkersDataStore";
import {WorkerSelectorService} from "./WorkerSettings/WorkerSelectorService";
import {WorkerSelectorDlgCtrl} from "./WorkerSettings/WorkerSelectorDlgCtrl";
import {WorkersService} from "./WorkerSettings/WorkersService";
import {WorkerSettingsCtrl} from "./WorkerSettings/WorkerSettingsCtrl";

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
    .service("BalerEmptiedEventService", BalerEmptiedEventService)
    .service("BalerEmptiedEventDataStoreService", BalerEmptiedEventDataStore)
    .service("BaleTypesDataStoreService", BaleTypesDataStore)
    .service("BaleTypeSelectorService", BaleTypeSelectorService)
    .service("BaleTypesService", BaleTypesService)
    .service("BaleWeightRecordDataStoreService", BaleWeightRecordDataStore)
    .service("GPIOService", GPIOService)
    .service("LoadCellDataService", LoadCellDataService)
    .service("LoadCellMonitorService", LoadCellMonitorService)
    .service("PictureSrvc", PictureSrvc)
    .service("WorkersDataStoreService", WorkersDataStore)
    .service("WorkerSelectorService", WorkersDataStore)
    .service("WorkersService", WorkersService)
    .controller("BalerCtrl", BalerCtrl)
    .controller("BalerEmptiedEventReportCtrl", BalerEmptiedEventReportCtrl)
    .controller("BalerEmptiedConfirmationDlgCtrl", BalerEmptiedConfirmationDlgCtrl)
    .controller("BaleTypesCtrl", BaleTypesCtrl)
    .controller("BaleTypeSelectorDlgCtrl", BaleTypeSelectorDlgCtrl)
    .controller("CalibrationModalCtrl", CalibrationModalCtrl)
    .controller("CameraTestCtrl", CameraTestCtrl)
    .controller("CameraTestModalCtrl", CameraTestModalCtrl)
    .controller("LocalizationCtrl", LocalizationCtrl)
    .controller("MenuCtrl", MenuCtrl)
    .controller("NetworkSettingsCtrl", NetworkSettingsCtrl)
    .controller("MachineSettingsCtrl", MachineSettingsCtrl)
    .controller("PictureModalCtrl", PictureModalCtrl)
    .controller("SettingsMenuCtrl", SettingsMenuCtrl)
    .controller("SetCalModalCtrl", SetCalModalCtrl)
    .controller("WorkerSelectorDlgCtrl", WorkerSelectorDlgCtrl)
    .controller("WorkerSettingsCtrl", WorkerSettingsCtrl)
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
            $log.debug("BaleWeightRecordDataStore.initializeDataStore success:");
        })
            .catch((exception) => {
                $log.error("Got exception: " + exception);
            })
            .done();
    }])
    .run(["BalerEmptiedEventDataStoreService", "$log", (balerEmptiedEventDataStore, $log) => {
        balerEmptiedEventDataStore.initializeDataStore().then(() => {
            $log.debug("BalerEmptiedEventDataStore.initializeDataStore success:");
        })
            .catch((exception) => {
                $log.error("Got exception: " + exception);
            })
            .done();
    }])
    .run(["editableOptions", (editableOptions) => {
        editableOptions.theme = "default"; // bootstrap3 theme. Can be also 'bs2', 'default'
    }])
    .run(["WorkersDataStoreService", "$log", (workersDataStore, $log) => {
        workersDataStore.initializeDataStore().then(() => {
            $log.debug("WorkersDataStoreService.initializeDataStore success:");
        })
            .catch((exception) => {
                $log.error("Got exception: " + exception);
            })
            .done();
    }])
    .run(["LoadCellMonitorService", "$log", (loadCellMonitorService, $log) => {
        loadCellMonitorService.startMonitor();
    }])
    .config(["VKI_CONFIG", function(VKI_CONFIG) {
        VKI_CONFIG.layout.Numeric = {
            "name": "Numeric", "keys": [
                [["1", "1"], ["2", "2"], ["3", "3"], []],
                [["4", "4"], ["5", "5"], ["6", "6"], []],
                [["7", "7"], ["8", "8"], ["9", "9"], ["\u2421", "Bksp"]],
                [[], ["0", "0"], [], ["\u23CE", "Enter"]]
            ], "lang": ["en-us"]
        };
    }])
    ;
