export function NetworkSettingsCtrl($scope, Sim800Srvc, WifiService) {

  this.SSIDList = [];
  this.selectedSSID = null;
  
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
    if(WifiService.currentSSID) {
      this.selectedSSID = WifiService.makeSSIDObj(WifiService.currentSSID.ssid,
                                                  WifiService.currentSSID.key,
                                                  WifiService.currentSSID.conName,
                                                  WifiService.currentSSID.security);
    }
  };
  
  this.loadCurrentSSIDList = () => {
    this.SSIDList = WifiService.getSSIDs();
    this.SSIDList.push(WifiService.makeSSIDObj("New", "New", "New", "New"));
  };
  
  this.addSSID = (newSSID) => {
    let newObj = WifiService.makeSSIDObj(newSSID, "", "", "");
    this.SSIDList.push(newObj);
    this.selectedSSID = newObj;
  };
  
  this.checkForConnectionFile = () => {
    let files = WifiService.findConnectionFile(this.selectedSSID.ssid);
    if(files.length > 0 && files[0] !== "") {
      this.selectedSSID = WifiService.ssidFromName(files[0].split("/").pop());
    }
  };
  
  this.saveWifiSettings = () => {
    WifiService.saveSSID(this.selectedSSID);
  };
  
  this.loadCurrentSSID();
  this.loadCurrentSSIDList();
}
