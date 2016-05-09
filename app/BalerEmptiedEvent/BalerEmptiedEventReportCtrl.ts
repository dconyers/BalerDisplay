import {BaleTypesDataStore} from "../BaleTypes/BaleTypesDataStore";
import {BalerEmptiedEvent} from "./BalerEmptiedEvent";
import {BalerEmptiedEventService} from "./BalerEmptiedEventService";
import {BalerEmptiedEventDataStore} from "./BalerEmptiedEventDataStore";
import {LoadCellMonitorService} from "../services/LoadCellMonitorService";


export class BalerEmptiedEventReportCtrl {

    static $inject: string[] = [
        "$scope",
        "$log",
        "BalerEmptiedEventService",
        "BalerEmptiedEventDataStoreService",
        "LoadCellMonitorService",
    ];


    constructor(private $scope: ng.IScope,
                private $log: ng.ILogService,
                public  balerEmptiedEventService: BalerEmptiedEventService,
                private balerEmptiedEventDataStoreService: BalerEmptiedEventDataStore,
                private loadCellMonitorService: LoadCellMonitorService) {
        this.$log.debug("Top of BalerEmptiedEventReportCtrl constructor");
    }




}
