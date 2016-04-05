import {BaleTypesDataStore} from "../BaleTypes/BaleTypesDataStore";
import {BaleEvent} from "./BaleEvent";

export class BaleEventReportCtrl {

    // export interface BaleEvent {
    //     _id?: string;
    //     baleType: BaleType;
    //     weight: number;
    //     baleDate: Date;
    // };

    baleEvents: Array<BaleEvent> = [
        { _id: undefined, baleType: {_id: undefined, material: "PAP4", type: "OCC", gui: "Cardboard", min: 1200, max: 1300, currentType: false}, weight: 740, baleDate : new Date(2016,3,4, 15, 12, 32), transmitted: false},
        { _id: undefined, baleType: {_id: undefined, material: "PAP2", type: "OCC", gui: "Cardboard", min: 1200, max: 1300, currentType: false}, weight: 720, baleDate : new Date(2016,3,3, 14, 26, 32), transmitted: false},
        { _id: undefined, baleType: {_id: undefined, material: "PAP3", type: "OCC", gui: "Cardboard", min: 1200, max: 1300, currentType: false}, weight: 730, baleDate : new Date(2016,3,3, 11, 46, 11), transmitted: false},
        { _id: undefined, baleType: {_id: undefined, material: "PAP1", type: "OCC", gui: "Cardboard", min: 1200, max: 1300, currentType: false}, weight: 701, baleDate : new Date(2016,3,2, 18, 33, 46), transmitted: false},
        { _id: undefined, baleType: {_id: undefined, material: "PAP0", type: "OCC", gui: "Cardboard", min: 1200, max: 1300, currentType: false}, weight: 700, baleDate : new Date(2016,3,1, 11, 24, 40), transmitted: false},
    ];

    static $inject: string[] = [
        "$scope",
        "$log",
        "BaleTypesDataStoreService"
    ];

    constructor(private $scope: ng.IScope,
                private $log: ng.ILogService,
                private baleTypesDataStoreService: BaleTypesDataStore) {
        this.$log.debug("Top of BaleEventReportCtrl constructor");
        this.$log.debug("transmistted:"  + this.baleEvents[0].transmitted);
    }


}
