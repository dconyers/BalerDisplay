export function CameraTestModalCtrl($scope) {
  this.statusMsg = "CAM_UNINIT";
  this.stream = null;
  
  this.myChannel = {
    videoHeight: 640,
    videoWidth: 480,
    video: null // Will reference the video element on success
  };
  
  $scope.$on("$destroy", () => {
    this.stopWebcam();
  });
  
  this.onStream = function (stream) {
    this.stream = stream;
  };
  
  this.onStream = function (stream) {
    this.stream = stream;
  };
  
  this.onSuccess = function () {
    this.statusMsg = "CAM_SUCCESS";
    $scope.$apply();
  };
  
  this.onError = function (err) {
    this.statusMsg = err;
  };
  
  this.stopWebcam = () => {
    if(this.stream) {
      this.stream.getTracks().forEach(function(e) {
        e.stop();
      });
    }
  };
}
