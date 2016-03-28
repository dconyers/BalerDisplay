import {LocalizationProvider} from "./Localization/LocalizationProvider";

angular
    .module('appConfig', [])
    .config(configs)
    .run(runs);

function configs($translateProvider) {
  LocalizationProvider($translateProvider);
}
    
function runs($rootScope, editableOptions) {
  /* On route change, set title property on $rootScope to be used for header
     titles. */
  $rootScope.$on('$routeChangeSuccess',
    function (event, current, previous) {
      $rootScope.title = current.$$route !== undefined ?
                         current.$$route.title :
                         'BALER_STATS';
    }
  );
  editableOptions.theme = "bs3";
}
