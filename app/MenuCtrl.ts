export function MenuCtrl($scope, $location) {
  this.closeMenu = function() {
    console.log("Clicked");
    angular.element(".navbar-toggle").trigger('click');
  };

  this.getLocation = function() {
    return $location.path();
  };
};
