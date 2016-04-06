import {BaleTypesDataStore} from "../BaleTypes/BaleTypesDataStore";
import {BaleEvent} from "./BaleEvent";
import {BaleEventService} from "./BaleEventService";

export class BaleEventReportCtrl {

    // export interface BaleEvent {
    //     _id?: string;
    //     baleType: BaleType;
    //     weight: number;
    //     baleDate: Date;
    // };


    static $inject: string[] = [
        "$scope",
        "$log",
        "BaleEventService"
    ];

    constructor(private $scope: ng.IScope,
                private $log: ng.ILogService,
                private baleEventService: BaleEventService) {
        this.$log.debug("Top of BaleEventReportCtrl constructor");
        this.$log.debug("transmistted:"  + this.baleEventService.baleEvents[0].transmitted);
    }


}
