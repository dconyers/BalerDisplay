export function MenuCtrl($scope) {
    this.closeMenu = function() {
      console.log("Clicked");
      angular.element(".navbar-toggle").trigger('click');
    };
};
