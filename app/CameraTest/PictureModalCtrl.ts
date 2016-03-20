const exec = require('child_process').exec;

export function PictureModalCtrl($scope, $uibModalInstance, $location, fileName) {
  this.fileName = fileName;

  this.closeModal = function () {
    let child = exec('rm ' + this.fileName);
    $uibModalInstance.close();
  };
};
