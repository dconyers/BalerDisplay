/* GPIOs are numbered by the wPi from the 'gpio readall' command. This is
   different than the physical pin numbers.
   
   These pins are used by 3g board:
   Phys. Pin #  wPi #
   3            2
   5            3
   11           17
   8            14
   10           15
   12           18
   
   
*/

const sim800PowerPin = 0;
const yellowLEDPin = 28;
const redLEDPin = 29;

const exec = require('child_process').exec;
const execSync = require('child_process').execSync;

export enum PinMode {
  UNKNOWN,
  OUT
}

export enum CmdResult {
  SUCCESSFUL,
  ERROR,
  CANCELLED
}

export class GPIOPin {
  mode: PinMode;
  currentTimeout; /* keep current timeout, because may need to cancel. Used for
  blinking right now */
  currentCallback; // Callback to call when command completes, or gets cancelled.
  isHigh: boolean;
  isBlinking: boolean;
  
  blinkOnDur: number;
  blinkOffDur: number;
  blinkIsOn: boolean;
  
  constructor(private gpioNum: number) {
    this.mode = PinMode.UNKNOWN;
    this.currentTimeout = null;
    this.currentCallback = null;
    this.isHigh = false;
    this.isBlinking = false;
  }
  
  setMode(mode: PinMode) {
    switch(mode) {
      case PinMode.OUT:
        try {
          execSync('gpio mode ' + this.gpioNum + ' out');
        }
        catch(err) {
          console.log('gpio mode ' + this.gpioNum + ' out failed with: ' + err.message);
        }
        break;
    }
    this.mode = mode;
  }
  
  /*  @param duration time in milliseconds to turn on. If duration is not
      specified, turns pin on indefinitely.
      
      @param callback optional callback to notify completion.
  */
  turnOn(duration: number, callback) {
    try {
      let child = execSync('gpio write ' + this.gpioNum + ' 1');
      this.isHigh = true;
    }
    catch(err) {
      console.log('gpio write ' + this.gpioNum + ' 1 failed with: ' + err.message);
      if(callback) {
        callback(CmdResult.ERROR);
      }
    }
    if(duration) {
      this.setNewTimeout(this.turnOff, duration, 0, callback);
    }
    else {
      if(callback) {
        callback(CmdResult.SUCCESSFUL);
      }
      this.currentCallback = null;
    }
  }
  
  /*  @param duration time in milliseconds to turn off. If duration is not
      specified, turns pin off indefinitely.
      
      @param callback optional callback to notify completion.
  */
  turnOff(duration: number, callback) {
    try {
      let child = execSync('gpio write ' + this.gpioNum + ' 0');
      this.isHigh = false;
    }
    catch(err) {
      console.log('gpio write ' + this.gpioNum + ' 0 failed with: ' + err.message);
      if(callback) {
        callback(CmdResult.ERROR);
      }
    }
    if(duration) {
      this.setNewTimeout(this.turnOn, duration, 0, callback);
    }
    else {
      if(callback) {
        callback(CmdResult.SUCCESSFUL);
      }
      this.currentCallback = null;
    }
  }
  
  /* Continuously blinks until another command is received.
      
     @param onDur duration pin should be high.
     @param offDur duration pin should be low.
     @paeam startHigh 
  */
  blink(onDur: number, offDur: number) {
    this.blinkOnDur = onDur;
    this.blinkOffDur = offDur;
    this.blinkIsOn = true;
    this.isBlinking = true;
    this.turnOn(onDur, this.blinkCallback);
  }
  
  private blinkCallback(result: CmdResult) {
    if(result == CmdResult.SUCCESSFUL) {
      if(this.blinkIsOn) {
        // turn off
        this.blinkIsOn = false;
        this.turnOff(this.blinkOffDur, this.blinkCallback);
      }
      else {
        // turn on
        this.blinkIsOn = true;
        this.turnOn(this.blinkOnDur, this.blinkCallback);
      }
    }
    else {
      this.isBlinking = false;
    }
  }
  
  /* @param fun The function to be called after timeout
     @param dur MS before timeout
     @param secondDuration Duration of next action.
     @param callback Called to notify when command completes
  */
  private setNewTimeout(fun, dur, secondDuration, callback) {
    if(this.currentTimeout) {
      clearTimeout(this.currentTimeout);
      this.currentTimeout = null;
      if(this.currentCallback) {
        this.currentCallback(CmdResult.CANCELLED);
        this.currentCallback = null;
      }
    }
    this.currentCallback = callback;
    this.currentTimeout = setTimeout(fun, dur, secondDuration, callback);
  }
}

export class GPIOService {
  sim800PowerPin: GPIOPin;
  yellowLEDPin: GPIOPin;
  redLEDPin: GPIOPin;
  
  constructor() {
    this.sim800PowerPin = new GPIOPin(sim800PowerPin);
    this.yellowLEDPin = new GPIOPin(yellowLEDPin);
    this.redLEDPin = new GPIOPin(redLEDPin);
  }
  
  turnOnSim800(callback) {
    this.sim800PowerPin.turnOn(2000, callback);
  }
  
  toggleYellowLED() {
    if(this.yellowLEDPin.isHigh) {
      this.yellowLEDPin.turnOff(0, null);
    }
    else {
      this.yellowLEDPin.turnOn(0, null);
    }
  }
  
  toggleRedLED() {
    if(this.redLEDPin.isHigh) {
      this.redLEDPin.turnOff(0, null);
    }
    else {
      this.redLEDPin.turnOn(0, null);
    }
  }
  
  showWarningState() {
    if(!this.yellowLEDPin.isBlinking) {
      this.yellowLEDPin.blink(1500, 1500);
    }
    if(this.redLEDPin.isBlinking) {
      this.redLEDPin.turnOff(0, null);
    }
  }
  
  showOverweightState() {
    if(!this.redLEDPin.isBlinking) {
      this.redLEDPin.blink(1500, 1500);
    }
    if(this.yellowLEDPin.isBlinking) {
      this.yellowLEDPin.turnOff(0, null);
    }
  }
  
  showDefaultState() {
    if(this.redLEDPin.isBlinking) {
      this.redLEDPin.turnOff(0, null);
    }
    if(this.yellowLEDPin.isBlinking) {
      this.yellowLEDPin.turnOff(0, null);
    }
  }
  
};
