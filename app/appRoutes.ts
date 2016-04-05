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
    when("/Report", {
      title: "TRANSER_REPORT",
      templateUrl: "BaleEvent/BaleEventReport.html",
      controller: "BaleEventReportCtrl",
      controllerAs: "baleEventReportCtrl"
    }).
    otherwise({
      redirectTo: "/BalerStats"
    });
}
