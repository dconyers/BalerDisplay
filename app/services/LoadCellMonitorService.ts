import {GeneralConfigurationDataStore} from "../Settings/MachineSettings/GeneralConfigurationDataStore";
import * as GeneralConfiguration from  "../Settings/MachineSettings/GeneralConfigurationRecord";
import {LoadCellDataService} from "../loadCell/LoadCellDataService";
import {BaleWeightRecord} from "../BaleWeightRecord/BaleWeightRecord";
import {BaleWeightRecordDataStore} from "../BaleWeightRecord/BaleWeightRecordDataStore";
import {GPIOService} from "../services/GPIOService";
import {BaleTypesService} from "../BaleTypes/BaleTypesService";
import {BaleType} from "../BaleTypes/BaleType";
import * as q from "q";
import events = require("events");



export class LoadCellMonitorService extends events.EventEmitter {
    static $inject: string[] = [
        "$log",
        "$interval",
        "LoadCellDataService",
        "BaleWeightRecordDataStoreService",
        "BaleTypesService",
        "GPIOService",
        "GeneralConfigurationDataStoreService",
    ];

    constructor(private $log: ng.ILogService,
                private $interval: ng.IIntervalService,
                private loadCellDataService: LoadCellDataService,
                private baleWeightRecordDataStore: BaleWeightRecordDataStore,
                private baleTypesService: BaleTypesService,
                private gpioService: GPIOService,
                private generalConfigurationDataStoreService: GeneralConfigurationDataStore) {
        super();
        $log.debug("LoadCellMonitorService Constructor");
    }

    /**
     * LoadCell Monitoring Service that looks at the current weight and determines
     * if the baler has recently been emptied. If so, an event is created to handle the
     * propogate the bale event.
     */
    public loadCellMonitorIteration(): void {
      // Insert Data for current iteration
      let sample: BaleWeightRecord = <BaleWeightRecord> {};
      sample.weight = this.loadCellDataService.getLoadCellWeight();
      this.baleWeightRecordDataStore.insertRowPromise(sample).then(() => {
      }).done();
      this.checkBalerStatus();
      // Control LEDs:
      this.baleTypesService.getCurrentBaleType().then((returnVal: BaleType) => {
        if (sample.weight > returnVal.max) {
          this.gpioService.showOverweightState();
        }
        else if (sample.weight > returnVal.min) {
          this.gpioService.showWarningState();
        }
        else {
          this.gpioService.showDefaultState();
        }
      });
    }

    private checkBalerStatus(): void {
      this.baleWeightRecordDataStore.initializeDataStore().then((baleWeights: Array<BaleWeightRecord>) => {
        let currentWeight: number = baleWeights[baleWeights.length - 1].weight;
        let maxWeight: number = Math.max.apply(Math, baleWeights.map((baleWeight: BaleWeightRecord) => { return baleWeight.weight; }));
        let maxDelta: number = maxWeight - currentWeight;
        let minDelta: number = Number(this.generalConfigurationDataStoreService.getGeneralConfigurationRecord(GeneralConfiguration.MIN_BALE_DECREASE).value);

        if (maxDelta > minDelta) {
          this.$log.debug("Identified Baler Emptying Event, Emitting Event.");
          this.emit("BalerEmptiedEvent", maxWeight, currentWeight);
          this.baleWeightRecordDataStore.remove({}, {multi: true}, (err: Error, n: number ) => {
            if (err !== null) {
              this.$log.error("Called baleWeightRecordDataStore.remove() and received Received error: " + err);
            }
          });

        }
      });
    }

    public startMonitor(): any {
      this.$interval(() => this.loadCellMonitorIteration(), 1000);
    }
}
