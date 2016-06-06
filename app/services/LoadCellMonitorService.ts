import {GeneralConfigurationDataStore} from "../GeneralConfiguration/GeneralConfigurationDataStore";
import * as GeneralConfiguration from  "../GeneralConfiguration/GeneralConfigurationRecord";
import {LoadCellDataService} from "../loadCell/LoadCellDataService";
import {BaleWeightRecord} from "../BaleWeightRecord/BaleWeightRecord";
import {BaleWeightRecordDataStore} from "../BaleWeightRecord/BaleWeightRecordDataStore";
import {GPIOService} from "../services/GPIOService";
import {BaleTypesDataStore} from "../BaleTypes/BaleTypesDataStore";
import {BaleType} from "../BaleTypes/BaleType";
import * as q from "q";
import events = require("events");



export class LoadCellMonitorService extends events.EventEmitter {
    static $inject: string[] = [
        "$log",
        "$interval",
        "LoadCellDataService",
        "BaleWeightRecordDataStoreService",
        "BaleTypesDataStoreService",
        "GPIOService",
        "GeneralConfigurationDataStoreService",
    ];

    private timerPromise: ng.IPromise<any> = undefined;

    constructor(private $log: ng.ILogService,
                private $interval: ng.IIntervalService,
                private loadCellDataService: LoadCellDataService,
                private baleWeightRecordDataStore: BaleWeightRecordDataStore,
                private baleTypesDataStore: BaleTypesDataStore,
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
      this.baleTypesDataStore.getCurrentBaleType().then((returnVal: BaleType) => {
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
      q.all(
        [
          this.baleWeightRecordDataStore.initializeDataStore(),
          this.generalConfigurationDataStoreService.getGeneralConfigurationRecord(GeneralConfiguration.MIN_BALE_DECREASE)
        ])
        .spread((baleWeights: Array<BaleWeightRecord>, minDeltaRecord: GeneralConfiguration.GeneralConfigurationRecord) => {
          let currentWeight: number = baleWeights[baleWeights.length - 1].weight;
          let maxWeight: number = Math.max.apply(Math, baleWeights.map((baleWeight: BaleWeightRecord) => { return baleWeight.weight; }));
          let maxDelta: number = maxWeight - currentWeight;
          let minDelta: number = Number(minDeltaRecord.value);

          if (maxDelta > minDelta) {
            this.$log.debug("Identified Baler Emptying Event, Emitting Event.");
            this.emit("BalerEmptiedEvent", maxWeight, currentWeight);
            this.clearBaleWeightRecordDataStore();
          }
        });
    }

    public clearBaleWeightRecordDataStore(): void {
      this.baleWeightRecordDataStore.remove({}, { multi: true }, (err: Error, n: number) => {
        if (err !== null) {
          this.$log.error("Called baleWeightRecordDataStore.remove() and received Received error: " + err);
        } else {
          this.$log.debug("LoadCellMonitorService::clearBaleWeightRecordDataStore Success!");
        }
      });
    }

    public startMonitor(): any {
      this.timerPromise = this.$interval(() => this.loadCellMonitorIteration(), 1000);
    }

    public stopMonitor(): boolean {
      let returnVal: boolean = false;
      if (angular.isDefined(this.timerPromise)) {
        returnVal = this.$interval.cancel(this.timerPromise);
        if (!returnVal) {
          this.$log.error("LoadCellMonitorService::stopMonitor failed to cancel timer.");
        }
        this.timerPromise = undefined;
      }
      return returnVal;
    }
}
