export function MenuCtrl($scope, $location, Sim800Srvc, WifiService) {
  this.wifiConnected = false;

  this.closeMenu = function() {
    console.log("Clicked");
    angular.element(".navbar-toggle").trigger('click');
  };

  this.getLocation = function() {
    return $location.path();
  };
  
  this.isConnected3g = function() {
    return Sim800Srvc.isConnected();
  };
  
  this.isConnectedWifi = function() {
    return WifiService.currentSSID !== null;
  };
};
