const spawn = require("child_process").spawn;
const exec = require("child_process").exec;

enum LoadCellState {
  UNINITIALIZED,
  WAITING_FOR_OPEN,
  OPEN,
  WAITING_FOR_WEIGHT,
  WAITING_FOR_ZERO_PROMPT,
  WAITING_FOR_WEIGHT_PROMPT,
  WAITING_FOR_WEIGHT_INPUT,
  WAITING_FOR_CAL_FINISH,
  WAITING_FOR_CAL_INTERCEPT,
  WAITING_FOR_CAL_SLOPE,
  ERROR
}

enum ErrorState {
  NONE,
  NO_DEVICE_FOUND,
  CONFIG_FAILED,
  SWITCH_FAILED,
  WRONG_STATE,
  LED_TOGGLE_FAILED
}

process.on("exit", function() {
  exec("pkill loadCell");
});

export class LoadCellDataService {

    weight: number = 0;
    loadCellState: LoadCellState = LoadCellState.UNINITIALIZED;
    errorState: ErrorState = ErrorState.NONE;
    calSlope: number;
    calIntercept: number;
    stateAfterIntercept: LoadCellState;
    child = null;
    callbackZeroDone = null;
    callbackWeightDone = null;

    static IID = "LoadCellDataService";

    static $inject: string[] = [
        "$log",
        "$interval"
    ];

    constructor(private $log: ng.ILogService, private $interval: ng.IIntervalService) {
      try {
        this.launchChildAndListen();
      } catch (exception) {
        $log.error("Failed to launchChildAndListen in LoadCellDataService constructor: " + exception);
      }
//      this.$interval(() => this.getWeight(), 500);
      this.$interval(() => this.simulateData(), 5000);
    }

    private launchChildAndListen() {
      let obj = this;
      if (this.child) {
        this.child.kill();
        this.child = null;
      }
      try {
        this.child = spawn("loadCell/loadCell");
      } catch (exception) {
        this.$log.error("Received error trying to spawn loadCell/loadCell: " + exception);
        return;
      }
      this.child.stderr.on("data", obj.stderrCallback);
      process.on("exit", () => {
        this.child.kill();
      });
      this.child.stdout.on("data", obj.dataCallback);
      this.child.on("exit", obj.processTerminated);
      this.openDevice();
    }

    private openDevice() {
      this.loadCellState = LoadCellState.WAITING_FOR_OPEN;
      this.child.stdin.write("OPEN_AND_CONFIG_DEVICE\n");
    }

    private getWeight(): void {
        if (this.loadCellState === LoadCellState.OPEN) {
          this.loadCellState = LoadCellState.WAITING_FOR_WEIGHT;
          this.child.stdin.write("GET_WEIGHT\n");
        }
        else if (this.loadCellState === LoadCellState.ERROR) {
          // There is some type of error. Try to open device
          this.openDevice();
        }
    }

    stderrCallback(data) {
      console.log(data.toString());
    }

    /* Call this function once there is "zero" wieght on the baler. The callback
       is executed once sampling the "zero" weight is done. Then calibrateWeight
       should be called when the known weight is on the baler.
     */
    calibrate(callbackZeroDone) {
      this.callbackZeroDone = callbackZeroDone;
      this.loadCellState = LoadCellState.WAITING_FOR_ZERO_PROMPT;
      this.child.stdin.write("CALIBRATE\n");
    }

    // Only call this function after calling calibrate. See above.
    calibrateWeight(weight: number, callbackWeightDone) {
      this.callbackWeightDone = callbackWeightDone;
      this.loadCellState = LoadCellState.WAITING_FOR_CAL_FINISH;
      this.child.stdin.write(weight + "\n");
    }

    setCalibration(slope: number, intercept: number) {
      this.child.stdin.write("SET_CALIBRATION\n" + slope + "\n" + intercept + "\n");
      this.calSlope = slope;
      this.calIntercept = intercept;
    }

    getLoadCellWeight(): number  {
      return this.weight;
    }

    processTerminated = (exitCode) => {
      // Process terminated for some reason. Try to restart.
      console.log("loadCell process terminated with code: " + exitCode);
      this.loadCellState = LoadCellState.UNINITIALIZED;
      this.launchChildAndListen();
    }

    dataCallback = (data) => {
      let lines = data.toString().trim().split("\n");
      for (let i = 0; i < lines.length; i++) {
        if (lines[i] === "NO_DEVICE_FOUND") {
          this.loadCellState = LoadCellState.ERROR;
          this.errorState = ErrorState.NO_DEVICE_FOUND;
          console.log("NO_DEVICE_FOUND");
        }
        else if (lines[i] === "CONFIG_FAILED") {
          this.loadCellState = LoadCellState.ERROR;
          this.errorState = ErrorState.CONFIG_FAILED;
          console.log("CONFIG_FAILED");
        }
        else if (lines[i] === "SWITCH_FAILED") {
          this.loadCellState = LoadCellState.ERROR;
          this.errorState = ErrorState.SWITCH_FAILED;
          console.log("SWITCH_FAILED");
        }
        else if (lines[i] === "WRONG_STATE") {
          this.loadCellState = LoadCellState.ERROR;
          this.errorState = ErrorState.WRONG_STATE;
          console.log("WRONG_STATE");
        }
        else if (lines[i] === "LED_TOGGLE_FAILED") {
          this.loadCellState = LoadCellState.ERROR;
          this.errorState = ErrorState.LED_TOGGLE_FAILED;
          console.log("LED_TOGGLE_FAILED");
        }

        switch (this.loadCellState) {
          case LoadCellState.WAITING_FOR_OPEN:
            if (lines[i] === "OK") {
              this.loadCellState = LoadCellState.WAITING_FOR_CAL_SLOPE;
              this.child.stdin.write("GET_CALIBRATION\n");
            }
            break;
          case LoadCellState.WAITING_FOR_WEIGHT:
            this.loadCellState = LoadCellState.OPEN;
            // Weight should never be less than zero.
            this.weight = Math.max(Math.round(parseFloat(lines[i])), 0);
            break;
          case LoadCellState.WAITING_FOR_ZERO_PROMPT:
            if (lines[i] === "EMPTY_AND_PRESS_ENTER") {
              this.loadCellState = LoadCellState.WAITING_FOR_WEIGHT_PROMPT;
              this.child.stdin.write("\n");
            }
            break;
          case LoadCellState.WAITING_FOR_WEIGHT_PROMPT:
            if (lines[i] === "ENTER_CAL_WEIGHT") {
              this.loadCellState = LoadCellState.WAITING_FOR_WEIGHT_INPUT;
              this.callbackZeroDone();
            }
            break;
          case LoadCellState.WAITING_FOR_CAL_FINISH:
            if (lines[i] === "CALIBRATION_COMPLETE") {
              this.loadCellState = LoadCellState.WAITING_FOR_CAL_SLOPE;
            }
            this.callbackWeightDone();
            break;
          case LoadCellState.WAITING_FOR_CAL_SLOPE:
            this.loadCellState = LoadCellState.WAITING_FOR_CAL_INTERCEPT;
            this.calSlope = parseFloat(lines[i]);
            break;
          case LoadCellState.WAITING_FOR_CAL_INTERCEPT:
            this.loadCellState = LoadCellState.OPEN;
            this.calIntercept = parseFloat(lines[i]);
            break;
        }
      }
    };

    isInit() {
      return this.loadCellState !== LoadCellState.UNINITIALIZED &&
             this.loadCellState !== LoadCellState.WAITING_FOR_OPEN &&
             this.loadCellState !== LoadCellState.ERROR;
    }

    turnRedOn = () => {
      this.child.stdin.write("TURN_RED_ON\n");
    }

    turnRedOff = () => {
      this.child.stdin.write("TURN_RED_OFF\n");
    }

    turnYellowOn = () => {
      this.child.stdin.write("TURN_YELLOW_ON\n");
    }

    turnYellowOff = () => {
      this.child.stdin.write("TURN_YELLOW_OFF\n");
    }

    private getRandomIntInclusive(min: number, max: number): number {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    private simulateData(): void {
        this.weight +=  this.getRandomIntInclusive(-10, 40);
        if (this.weight > 1200) {
          this.weight = 800.1234567890;
        }
    }
};
