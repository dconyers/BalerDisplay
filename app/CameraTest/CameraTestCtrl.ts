const exec = require('child_process').exec;

export function CameraTestCtrl($scope, $uibModal) {
  this.stream = null;
  this.statusMsg = "CAM_UNINIT";
  this.currModalInstance = null;
  this.picStatus = null;
  this.fileName = null;

  this.myChannel = {
    videoHeight: 640,
    videoWidth: 480,
    video: null // Will reference the video element on success
  };

  $scope.$on("$destroy", function() {
    $scope.cameraTestCtrl.stopWebcam();
  });
  
  this.onError = function (err) {
    this.statusMsg = err;
  };

  this.onStream = function (stream) {
    this.stream = stream;
  };

  this.onSuccess = function () {
    this.statusMsg = "CAM_SUCCESS";
    $scope.$apply();
  };

  this.stopWebcam = function () {
    if(this.stream) {
      this.stream.getTracks().forEach(function(e) {
        e.stop();
      });
    }
  };

  this.takePicture = function() {
    this.stopWebcam();
    this.picStatus = "TAKING_PICTURE";
    let obj = this;
    this.fileName = './photos/test'.concat(new Date().getTime(), '.jpg');
    // Wait a little bit for browser to release webcam device
    setTimeout(function() {
                 /* take picture at 1600x1200 resolution, skip 10 frames to
                    allow for camera to auto-adjust */
                 let child = exec('fswebcam -r 1600x1200 -S 10 ' + obj.fileName,
                                  function(err, stdout, stderr) {
                                    obj.takePictureCallback(err, stdout, stderr);
                                  });
               },
               100);
  };

  this.takePictureCallback = function(err, stdout, stderr) {
    if(err) {
      this.picStatus = err;
    }
    else {
      this.picStatus = null;
      this.openModal();
    }
    $scope.$apply();
  };

  this.openModal = function () {
    let obj = this;
    this.currModalInstance= $uibModal.open({
      templateUrl: './CameraTest/PictureModal.html',
      controller: 'PictureModalCtrl',
      controllerAs: "pictureModalCtrl",
      resolve: {
        fileName: function() {
          return obj.fileName;
        }
      }
    });
  };
};
