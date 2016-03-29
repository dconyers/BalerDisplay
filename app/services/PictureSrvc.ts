/* Service that provides way to take pictures with the webcam. Example usage:
 * 
 * // pictureSrvc should be injected
 * function someFunction(PictureSrvc) {
 *   // In this case, we want to change the default resolution.
 *   pictureSrvc.width = 1920;
 *   pictureSrvc.height = 1080;
 *
 *   pictureSrvc.takePicture("./images/test.jpg",
 *     function(pathname, err) {
 *       if(err) {
 *         console.log(err);
 *       }
 *       else {
 *         // record pathname to database ...
 *         pictureSrvc.deletePicture(pathname);
 *       }
 *     }
 *   );
 */

const exec = require('child_process').exec;

enum PictureState {
  Ready,
  Busy
}

const filterRedAwk = "awk -v RS='\\033' '\
    match($0, /^\\[[0-9;]*m/) {\
        color = \";\" substr($0, 2, RLENGTH-2) \";\";\
        $0 = substr($0, RLENGTH+1);\
        gsub(/(^|;)0*[^03;][0-9]*($|;)/, \";\", color);\
        red = (color ~ /1;*$/)\
    }\
    red'"

export class PictureSrvc {
  width: number;
  height: number;
  /* Depending on the webcam need to skip a number of frames to allow it to auto
  adjust */
  skipFrames: number;
  state: PictureState = PictureState.Ready;
  curCallback = null;
  curPathname: string = null;
  
  /** @param callback function that will be called when command to take picture
    * is complete. Callback should accept 2 strings.
    * - param1: requested pathname of picture to be taken
    * - param2: null if no errors occured. String describing errors if there
    *   are errors.
    */
  constructor() {
    this.width = 680;
    this.height = 480;
    this.skipFrames = 5;
  }
  
  /** @return 1 if busy, return 0 otherwise.
    *
    * @param callback function that will be called when command to take picture
    * is complete. Callback should accept 2 strings.
    * - param1: requested pathname of picture to be taken
    * - param2: null if no errors occured. String describing errors if there
    *   are errors.
    */
  takePicture(pathname: string, callback) {
    let child;
    let obj = this;
    if(this.state == PictureState.Ready) {
      this.state = PictureState.Busy
      this.curCallback = callback;
      this.curPathname = pathname;
      child = exec('fswebcam -r ' + this.width + 'x' + this.height + ' -S 10 '
                   /* fswebcam outputs everything to stderr, with actual errors
                   colored red. */
                   + pathname + " 2>&1 | " + filterRedAwk,
                 function(err, stdout, stderr) {
                   obj.childProcessCallback(err, stdout, stderr);
                 });
      return 0;
    }
    else {
      return 1;
    }
  }
  
  childProcessCallback(err, stdout, stderr) {
    this.state = PictureState.Ready;
    this.curCallback(this.curPathname, stdout ? stdout : err);
  }
  
  static deletePicture(pathname: string) {
    let child = exec('rm ' + pathname);
  }
  
}
