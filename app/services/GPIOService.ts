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
   
   Redo whole thing much simpler.
   Only support blinking, cancelling blinking, and turning on/off.
*/

import {LoadCellDataService} from "../loadCell/LoadCellDataService";

const sim800PowerPinNum = 0;
const yellowLEDPinNum = 10;
const redLEDPinNum = 9;

const exec = require('child_process').exec;
const execSync = require('child_process').execSync;

export enum PinMode {
  UNKNOWN,
  OUT,
  EXTERNAL // Pin on loadcell board
}

export enum CmdResult {
  SUCCESSFUL,
  ERROR,
  CANCELLED
}

export class GPIOPin {
  gpioNum: number;
  isBlinking: boolean;
  currentCallback;
  currentTimeout;
  blinkOnDur: number;
  blinkOffDur: number;
  mode: PinMode;
  
  constructor(gpioNum: number,
              private loadCellDataService: LoadCellDataService) {
    this.gpioNum = gpioNum;
    this.isBlinking = false;
    this.currentCallback = null;
    this.currentTimeout = null;
    this.blinkOnDur = 0;
    this.blinkOffDur = 0;
    this.isBlinking = false;
    this.mode = PinMode.UNKNOWN;
  }

  setMode = (mode: PinMode) => {
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

  turnOn = (duration: number, callback) => {
      // If there is a current command running, clear current timeout, and call
      // current callback with cancelled
    if(this.currentTimeout) {
      clearTimeout(this.currentTimeout);
      this.currentTimeout = null;
      if(this.currentCallback) {
        this.currentCallback(CmdResult.CANCELLED);
      }
    }
    this.currentCallback = null;
    if(callback) {
      this.currentCallback = callback;
    }
    try {
      if(this.mode === PinMode.EXTERNAL) {
        if(this.gpioNum === 9) {
          this.loadCellDataService.turnRedOn();
        }
        else if(this.gpioNum === 10) {
          this.loadCellDataService.turnYellowOn();
        }
      }
      else {
        execSync('gpio write ' + this.gpioNum + ' 1');
      }
      if(duration) {
        // Set a timer to turn off pin
        this.currentTimeout = setTimeout(() => {
            if(this.mode === PinMode.EXTERNAL) {
              if(this.gpioNum === 9) {
                this.loadCellDataService.turnRedOn();
              }
              else if(this.gpioNum === 10) {
                this.loadCellDataService.turnYellowOn();
              }
            }
            else {
              execSync('gpio write ' + this.gpioNum + ' 0');
            }
            var curCallback = this.currentCallback
            this.currentCallback = null;
            this.currentTimeout = null;
            curCallback(CmdResult.SUCCESSFUL);
          },
          duration
        );
      }
      else {
        this.currentTimeout = null;
        if(this.currentCallback) {
          var curCallback = this.currentCallback;
          this.currentCallback = null;
          curCallback(CmdResult.SUCCESSFUL);
        }
      }
    }
    catch(err) {
      console.log("turning on GPIO pin " + this.gpioNum + " failed with: " + err.message); 
    }
  }

  turnOff = (duration: number, callback) => {
      // If there is a current command running, clear current timeout, and call
      // current callback with cancelled
    if(this.currentTimeout) {
      clearTimeout(this.currentTimeout);
      this.currentTimeout = null;
      if(this.currentCallback) {
        this.currentCallback(CmdResult.CANCELLED);
      }
    }
    this.currentCallback = null;
    if(callback) {
      this.currentCallback = callback;
    }
    try{
      if(this.mode === PinMode.EXTERNAL) {
        if(this.gpioNum === 9) {
          this.loadCellDataService.turnRedOff();
        }
        else if(this.gpioNum === 10) {
          this.loadCellDataService.turnYellowOff();
        }
      }
      else {
        execSync('gpio write ' + this.gpioNum + ' 0');
      }
      if(duration) {
        // Set a timer to turn on pin
        this.currentTimeout = setTimeout(() => {
            if(this.mode === PinMode.EXTERNAL) {
              if(this.gpioNum === 9) {
                this.loadCellDataService.turnRedOff();
              }
              else if(this.gpioNum === 10) {
                this.loadCellDataService.turnYellowOff();
              }
            }
            else {
              execSync('gpio write ' + this.gpioNum + ' 1');
            }
            var curCallback = this.currentCallback
            this.currentCallback = null;
            this.currentTimeout = null;
            curCallback(CmdResult.SUCCESSFUL);
          },
          duration
        );
      }
      else {
        this.currentTimeout = null;
        if(this.currentCallback) {
          var curCallback = this.currentCallback;
          this.currentCallback = null;
          curCallback(CmdResult.SUCCESSFUL);
        }
      }
    }
    catch(err) {
      console.log("turning off GPIO pin " + this.gpioNum + " failed with: " + err.message); 
    }
  }

  blinkCallback = (result: CmdResult) => {
    if(result == CmdResult.SUCCESSFUL) {
      // blinking hasn't been cancelled.
      this.currentCallback = this.blinkCallback;
      this.currentTimeout = setTimeout(
        () => {
          this.currentTimeout = null;
          this.turnOn(this.blinkOnDur, this.blinkCallback);
        },
        this.blinkOffDur
      );
    }
    else {
      this.isBlinking = false;
    }
  }

  blink = (onDur: number, offDur: number) => {
    this.blinkOnDur = onDur;
    this.blinkOffDur = offDur;
    this.isBlinking = true;
    this.turnOn(onDur, this.blinkCallback);
  }
} // end class GPIOPin

export class GPIOService {
  sim800PowerPin: GPIOPin;
  yellowLEDPin: GPIOPin;
  redLEDPin: GPIOPin;
  
  constructor(LoadCellDataService) {
    this.sim800PowerPin = new GPIOPin(sim800PowerPinNum, LoadCellDataService);
    this.yellowLEDPin = new GPIOPin(yellowLEDPinNum, LoadCellDataService);
    this.redLEDPin = new GPIOPin(redLEDPinNum, LoadCellDataService);
    this.sim800PowerPin.setMode(PinMode.OUT);
    this.yellowLEDPin.setMode(PinMode.EXTERNAL);
    this.redLEDPin.setMode(PinMode.EXTERNAL);
  }
  
  turnOnSim800 = (callback) => {
    this.sim800PowerPin.turnOn(2000, callback);
  }
  
  showWarningState = () => {
    if(!this.yellowLEDPin.isBlinking) {
      this.yellowLEDPin.blink(1500, 1500);
    }
    if(this.redLEDPin.isBlinking) {
      this.redLEDPin.turnOff(0, null);
    }
  }
  
  showOverweightState = () => {
    if(!this.redLEDPin.isBlinking) {
      this.redLEDPin.turnOn(0, null);
    }
    if(this.yellowLEDPin.isBlinking) {
      this.yellowLEDPin.turnOff(0, null);
    }
  }
  
  showDefaultState = () => {
    if(this.redLEDPin.isBlinking) {
      this.redLEDPin.turnOff(0, null);
    }
    if(this.yellowLEDPin.isBlinking) {
      this.yellowLEDPin.turnOff(0, null);
    }
  }
  
};
