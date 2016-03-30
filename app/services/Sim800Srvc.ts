const exec = require('child_process').exec;

enum Sim800State {
  Connected,
  Not_Connected,
  Waiting_For_Ok,
  Ok_Received
}

function Sim800Srvc() {

  this.state = Sim800State.Not_Connected;
  this.serialPort = null;
  this.numAt = 0;

  this.start  = function() {
    let obj = this;
    setInterval(obj.checkPPP0, 60000);
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
      let child = exec("sudo poff SIM800",
        obj.poffDone);
    }
    else {
      this.state = Sim800State.Connected;
    }
  };
  
  this.poffDone = (err, stdout, stderr) => {
    // open serial port
    let obj = this;
    this.serialPort = new SerialPort("/dev/ttyAMA0", {
      baudrate: 115200,
      parser: serialport.parsers.readline("\n"),
      dataCallback: obj.serData
    });
    serialPort.on("open", obj.portOpened);
  };
  
  this.sendAts = () => {
    let obj = this;
    if(this.state === Sim800State.Waiting_For_Ok) {
      if(this.numAts > 10) {
        // sim800 not responding. Turn on.
        this.serialPort.close();
        let child = exec("gpio mode 0 out", obj.gpioModeDone);
      }
      else {
        // retry sending AT commands 10 times.
        this.serialPort.write("AT\n");
        setTimeout(obj.sendAts, 1);
        this.numAts++;
      }
    }
    else {
      // OK received
      this.serialPort.close();
      let child = exec("sudo pon SIM800");
    }
  };
  
  this.gpioModeDone = (err, stdout, stderr) => {
    // turn on pin for 2 seconds to turn on sim800
    let child = exec("gpio write 0 1");
    // turn of pin after 2 seonds
    setTimeout(function(err, stdout, stderr) {
      let child = exec("gpio write 0 0");
      // tell pppd to try to connect
      child = exec("sudo pon SIM800");
    },
    2000);
  };
  
  this.portOpened = () => {
    this.state = Sim800State.Waiting_For_Ok;
    this.numAt = 0;
    this.sendAts();
  };
  
  this.serData = (data) => {
    if(this.state === Sim800State.Waiting_For_Ok) {
      if(~data.indexOf("OK")) {
        // Ok received. Sim800 is powered up. Let pppd try to open a connection.
        this.state = Sim800State.Ok_Received;
      }
    }
  };
}
