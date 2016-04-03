const exec = require('child_process').exec;

enum Sim800State {
  Connected,
  Not_Connected
}

export function Sim800Srvc() {

  this.state = Sim800State.Not_Connected;
  this.serialPort = null;
  this.numAt = 0;

  this.start  = function() {
    console.log("Sim srvc started");
    let obj = this;
    setInterval(obj.checkPPP0, 60000);
  };
  
  this.checkPPP0 = () => {
    console.log("checkPPP0 called");
    let obj = this;
    let child = exec("cat /proc/net/dev | grep ppp0",
                     obj.checkPPP0String);
  };
  
  this.checkPPP0String = (err, stdout, stderr) => {
    let obj = this;
    if(stdout === "") {
      // ppp0 does not exist. Try to see if sim800 is powered on
      // first tell pppd to stop trying to bring the sim800 up
      console.log("No ppp0 found");
      let child = exec("sudo poff sim800",
        obj.poffDone);
    }
    else {
      console.log("ppp0 found");
      this.state = Sim800State.Connected;
    }
  };
  
  this.poffDone = (err, stdout, stderr) => {
    // Check if sim800 is responding
    let obj = this;
    let child = exec("python externalScripts/sim800Responding.py",
      (err, stdout, stderr) => {
        console.log("python script completed");
        let child;
        console.log(err);
        console.log(stdout);
        console.log(stderr);
        if(~stdout.indexOf("Not Responding")) {
          console.log("Not Responding");
          child = exec("gpio mode 0 out", obj.gpioModeDone);
        }
        else {
          // Sim800 responding, so tell pppd to try to set up a connection
          console.log("Responding");
          child = exec("sudo pon sim800");
        }
      });
  };
  
  this.gpioModeDone = (err, stdout, stderr) => {
    console.log("changed gpio mode");
    // turn on pin for 2 seconds to turn on sim800
    let child = exec("gpio write 0 1");
    // turn of pin after 2 seonds
    setTimeout(function(err, stdout, stderr) {
      console.log("wrote to pin");
      let child = exec("gpio write 0 0");
      // tell pppd to try to connect
      child = exec("sudo pon sim800");
    },
    2000);
  };
}
