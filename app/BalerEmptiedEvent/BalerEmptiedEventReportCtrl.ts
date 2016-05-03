import {BaleTypesDataStore} from "../BaleTypes/BaleTypesDataStore";
import {BalerEmptiedEvent} from "./BalerEmptiedEvent";
import {BalerEmptiedEventService} from "./BalerEmptiedEventService";
import {BalerEmptiedEventDataStore} from "./BalerEmptiedEventDataStore";


export class BalerEmptiedEventReportCtrl {

    static $inject: string[] = [
        "$scope",
        "$log",
        "BalerEmptiedEventService",
        "BalerEmptiedEventDataStoreService",
    ];

    balerEmptiedEvents: Array<BalerEmptiedEvent> = [];

    constructor(private $scope: ng.IScope,
                private $log: ng.ILogService,
                private BalerEmptiedEventService: BalerEmptiedEventService,
                private balerEmptiedEventDataStoreService: BalerEmptiedEventDataStore) {
        this.$log.debug("Top of BalerEmptiedEventReportCtrl constructor");
        this.loadBalerEmptiedEvents();
    }

    public loadBalerEmptiedEvents(): Array<BalerEmptiedEvent> {
      this.balerEmptiedEventDataStoreService.initializeDataStore().then((baleEvents: Array<BalerEmptiedEvent>) => {
        this.$log.debug("Successfully loaded " + baleEvents.length + " Bale Events in loadBalerEmptiedEvents")
        this.balerEmptiedEvents = baleEvents;
      });
      return this.balerEmptiedEvents;
    }



}
