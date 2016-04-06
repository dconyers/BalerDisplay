const exec = require('child_process').exec;

enum Sim800State {
  Connected,
  Connecting,
  Not_Connected
}cons

enum ConfigState {
  Invalid,
  Dirty,
  Valid
}

export function Sim800Srvc() {

  this.state = Sim800State.Not_Connected;
  this.serialPort = null;
  this.numAt = 0;
  this.interval = null;
  this.apn = "";
  this.configState = ConfigState.Invalid;

  this.start  = function() {
    let obj = this;
    this.interval = setInterval(obj.checkPPP0, 60000);
    this.configInterval = setInterval(obj.updateConfig, 1000);
  };
  
  this.checkPPP0 = () => {
    let obj = this;
    let child = exec("cat /proc/net/dev | grep ppp0",
                     obj.checkPPP0String);
  };
  
  this.checkPPP0String = (err, stdout, stderr) => {
    let obj = this;
    if(stdout === "") {
      // ppp0 does not exist. Try to see if sim800 is powered on
      // first tell pppd to stop trying to bring the sim800 up
      this.state = Sim800State.Not_Connected;
      let child = exec("poff sim800",
        obj.poffDone);
    }
    else {
      this.state = Sim800State.Connected;
    }
  };
  
  this.poffDone = (err, stdout, stderr) => {
    // Check if sim800 is responding
    let obj = this;
    let child = exec("python externalScripts/sim800Responding.py",
      (err, stdout, stderr) => {
        let child;
        if(~stdout.indexOf("Not Responding")) {
          child = exec("gpio mode 0 out", obj.gpioModeDone);
        }
        else {
          // Sim800 responding, so tell pppd to try to set up a connection
          this.state = Sim800State.Connecting;
          child = exec("pon sim800");
        }
      });
  };
  
  this.gpioModeDone = (err, stdout, stderr) => {
    // turn on pin for 2 seconds to turn on sim800
    let child = exec("gpio write 0 1");
    // turn of pin after 2 seonds
    setTimeout(function(err, stdout, stderr) {
      let child = exec("gpio write 0 0");
      // tell pppd to try to connect
      this.state = Sim800State.Connecting;
      child = exec("pon sim800");
    },
    2000);
  };
  
  this.updateConfig = () => {
    if(this.configState === ConfigState.Invalid) {
      // read config
      exec(
//        "sed -i 's/\\(OK.*AT+CGDCONT.*,.*,"\\).*\\(",,0,0\\)/\\1" + apn +"\\2/' /etc/chatscripts/gprs"
        "sed -n 's/OK.*AT+CGDCONT.*,.*,\"\\(.*\\)\",,0,0/\\1/p' ../piSetup/configFiles/gprs",
        this.configRead
      );
    }
    else if(this.configState === ConfigState.Dirty) {
      // write config
      exec(
//        "sed -i 's/\\(OK.*AT+CGDCONT.*,.*,"\\).*\\(",,0,0\\)/\\1" + apn +"\\2/' /etc/chatscripts/gprs"
      "sed -i 's/\\(OK.*AT+CGDCONT.*,.*,\"\\).*\\(\",,0,0\\)/\\1" + this.apn + "\\2/' ../piSetup/configFiles/gprs",
      this.configWritten
      );
    }
  };
  
  this.restartPPPD = () => {
    if(this.state !== Sim800State.Not_Connected) {
      this.state = Sim800State.Not_Connected;
      exec("poff sim800", () => {
        this.state = Sim800State.Connecting;
        exec("pon sim800");
      });
    }
  }
  
  this.configRead = (err, stdout, stderr) => {
    this.apn = stdout;
    this.configState = ConfigState.Valid;
  };
  
  this.configWritten = (err, stdout, stderr) => {
    if(!(err && stderr)) {
      this.configState = ConfigState.Valid;
      this.restartPPPD();
    }
  }
  
  this.setApn = function(apn) {
    this.apn = apn;
    this.configState = ConfigState.Dirty;
  };
  
  this.getApn = function() {
    return this.apn;
  };
}
