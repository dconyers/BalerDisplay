angular
  .module("appRoutes", ["ngRoute"])
  .config(config);

function config ($routeProvider) {
  $routeProvider.
    when("/BalerStats", {
      title: "BALER_STATS",
      templateUrl: "BalerStatsPanel/BalerStatsPanel.html",
      controller: "BalerCtrl",
      controllerAs: "balerCtrl"
    }).
    when("/SettingsMenu", {
      title: "SETTINGS_MENU",
      templateUrl: "Settings/SettingsMenu/SettingsMenu.html",
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
    when("/NetworkSettings", {
      title: "NETWORK_SETTINGS",
      templateUrl: "Settings/NetworkSettings/NetworkSettings.html",
      controller: "NetworkSettingsCtrl",
      controllerAs: "networkSettingsCtrl"
    }).
    when("/WorkerSettings", {
      title: "WORKER_SETTINGS",
      templateUrl: "Settings/WorkerSettings/WorkerSettings.html",
      controller: "WorkerSettingsCtrl",
      controllerAs: "workerSettingsCtrl"
    }).
    when("/Report", {
      title: "TRANSER_REPORT",
      templateUrl: "BalerEmptiedEvent/BalerEmptiedEventReport.html",
      controller: "BalerEmptiedEventReportCtrl",
      controllerAs: "balerEmptiedEventReportCtrl"
    }).
    when("/MachineSettings", {
      title: "MACHINE_SETTINGS",
      templateUrl: "Settings/MachineSettings/MachineSettings.html",
      controller: "MachineSettingsCtrl",
      controllerAs: "machineSettingsCtrl"
    }).
    otherwise({
      redirectTo: "/BalerStats"
    });
}
