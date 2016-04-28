export function NetworkSettingsCtrl($scope, Sim800Srvc, WifiService) {

  this.SSIDList = [];
  this.selectedSSID = WifiService.makeSSIDObj("TEST",
                                              "TEST",
                                              "TEST");
  
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
  
  this.loadCurrentSSID = () => {
    console.log("load current caled");
    this.selectedSSID = WifiService.makeSSIDObj(WifiService.currentSSID.ssid,
                                                WifiService.currentSSID.key,
                                                WifiService.currentSSID.conName);
  };
  
  this.loadCurrentSSIDList = () => {
    this.SSIDList = WifiService.getSSIDs();
  };
  
  this.loadCurrentSSID();
}
