export function NetworkSettingsCtrl($scope, Sim800Srvc) {
  
  this.APNGetSet = function(apn) {
    if(arguments.length) {
      Sim800Srvc.setApn(apn);
    }
    else {
      return Sim800Srvc.getApn();
    }
  };
  
  this.dialNumGetSet = function(dialNum) {
    if(arguments.length) {
      Sim800Srvc.setDialNum(dialNum);
    }
    else {
      return Sim800Srvc.getDialNum();
    }
  };
}
