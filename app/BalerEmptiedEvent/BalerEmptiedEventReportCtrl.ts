import {BaleTypesDataStore} from "../BaleTypes/BaleTypesDataStore";
import {BalerEmptiedEvent} from "./BalerEmptiedEvent";
import {BalerEmptiedEventService} from "./BalerEmptiedEventService";

export class BalerEmptiedEventReportCtrl {

    static $inject: string[] = [
        "$scope",
        "$log",
        "BalerEmptiedEventService"
    ];

    constructor(private $scope: ng.IScope,
                private $log: ng.ILogService,
                private BalerEmptiedEventService: BalerEmptiedEventService) {
        this.$log.debug("Top of BalerEmptiedEventReportCtrl constructor");
        this.$log.debug("transmistted:"  + this.BalerEmptiedEventService.BalerEmptiedEvents[0].transmitted);
    }


}
