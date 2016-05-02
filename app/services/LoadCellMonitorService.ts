import {LoadCellDataService} from "../loadCell/LoadCellDataService";
import {BaleWeightRecord} from "../BaleWeightRecord/BaleWeightRecord";
import {BaleWeightRecordDataStore} from "../BaleWeightRecord/BaleWeightRecordDataStore";
import * as q from "q";
import events = require("events");



export class LoadCellMonitorService extends events.EventEmitter {
    public static MIN_BALE_WEIGHT: number;

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
      this.baleWeightRecordDataStore.persistence.compactDatafile();
      // Determine if "Bale Event" occurred
      this.checkBalerStatus();
      // Purge old data
    }

    private checkBalerStatus(): void {
      this.baleWeightRecordDataStore.initializeDataStore().then((baleWeights: Array<BaleWeightRecord>) => {
        this.$log.debug("returned: " + baleWeights.length + " records");
        this.$log.debug(baleWeights);
        let currentWeight: number = baleWeights[baleWeights.length - 1].weight;
        let maxWeight: number = Math.max.apply(null, baleWeights);
        let maxDelta: number = maxWeight - currentWeight;
        if (maxDelta > LoadCellMonitorService.MIN_BALE_WEIGHT) {
          this.$log.debug("Baler Emptied Scenario Identified!");
          this.emit("BalerEmptied", maxWeight, currentWeight);
          // TODO: Throw new Bale Event
        }
      });
    }

    public startMonitor(): any {
      this.$interval(() => this.loadCellMonitorIteration(), 1000);
    }
}
