import {LoadCellDataService} from "../loadCell/LoadCellDataService";
import {BaleWeightRecord} from "../BaleWeightRecord/BaleWeightRecord";
import {BaleWeightRecordDataStore} from "../BaleWeightRecord/BaleWeightRecordDataStore";
import * as q from "q";
import events = require("events");



export class LoadCellMonitorService extends events.EventEmitter {
    public static MIN_BALE_WEIGHT: number = 200;

    static $inject: string[] = [
        "$log",
        "$interval",
        "LoadCellDataService",
        "BaleWeightRecordDataStoreService"
    ];

    constructor(private $log: ng.ILogService,
                private $interval: ng.IIntervalService,
                private loadCellDataService: LoadCellDataService, // ) {
                private baleWeightRecordDataStore: BaleWeightRecordDataStore) {
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
    }

    private checkBalerStatus(): void {
      this.baleWeightRecordDataStore.initializeDataStore().then((baleWeights: Array<BaleWeightRecord>) => {
        let currentWeight: number = baleWeights[baleWeights.length - 1].weight;
        let maxWeight: number = Math.max.apply(Math, baleWeights.map((baleWeight: BaleWeightRecord) => { return baleWeight.weight; }));
        let maxDelta: number = maxWeight - currentWeight;
        if (maxDelta > LoadCellMonitorService.MIN_BALE_WEIGHT) {
          this.$log.debug("Identified Baler Emptying Event, Emitting Event.");
          this.emit("BalerEmptiedEvent", maxWeight, currentWeight);
          this.baleWeightRecordDataStore.deleteRowsPromise({}, {multi: true}).done();
        }
      });
    }

    public startMonitor(): any {
      this.$interval(() => this.loadCellMonitorIteration(), 1000);
    }
}
