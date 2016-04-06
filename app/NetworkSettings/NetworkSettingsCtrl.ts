export function NetworkSettingsCtrl($scope, Sim800Srvc) {
  
  this.APNGetSet = function(apn) {
    if(arguments.length) {
      Sim800Srvc.setApn(apn);
    }
    else {
      return Sim800Srvc.getApn();
    }
  };
}
