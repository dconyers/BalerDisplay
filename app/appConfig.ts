import {LocalizationProvider} from "./Localization/LocalizationProvider";
import {Sim800Srvc} from "./services/Sim800Srvc";
import {WifiService} from "./services/WifiService";

angular
    .module("appConfig", [])
    .config(configs)
    .service("Sim800Srvc", Sim800Srvc)
    .service("WifiService", WifiService)
    .run(runs);

function configs($translateProvider, LightboxProvider) {
  LocalizationProvider($translateProvider);
  LightboxProvider.templateUrl = './BalerEmptiedEvent/lightboxModal.html';
  LightboxProvider.calculateModalDimensions = function (dimensions) {
    return {
      'width': 'auto',                             // default
      'height': 'auto'                            // custom
    };
  };
  LightboxProvider.calculateImageDimensionLimits = function (dimensions) {
    return {
      'maxWidth': 512,
      'maxHeight': 384                           // custom
    };
  };
  LightboxProvider.getImageUrl = function (image) {
    return image.photoPath;
  };
}

function runs($rootScope, editableOptions, Sim800Srvc, WifiService) {
  /* On route change, set title property on $rootScope to be used for header
     titles. */
  $rootScope.$on("$routeChangeSuccess",
    function (event, current, previous) {
      $rootScope.title = current.$$route !== undefined ?
                         current.$$route.title :
                         "BALER_STATS";
    }
  );
  editableOptions.theme = "bs3";
  Sim800Srvc.start();
  WifiService.start();
}
