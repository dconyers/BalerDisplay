import * as q from "q";
import {BaleEvent} from "./BaleEvent";

export class BaleEventService {

    static $inject: string[] = [
        "$log",
    ];

    baleEvents: Array<BaleEvent> = [
        { _id: undefined, baleType: {_id: undefined, material: "PAP4", type: "OCC", gui: "Cardboard", min: 1200, max: 1300, currentType: false}, weight: 740, baleDate : new Date(2016, 3,  4, 15, 12, 32), transmitted: false},
        { _id: undefined, baleType: {_id: undefined, material: "PAP2", type: "OCC", gui: "Cardboard", min: 1200, max: 1300, currentType: false}, weight: 720, baleDate : new Date(2016, 3,  3, 14, 26, 32), transmitted: false},
        { _id: undefined, baleType: {_id: undefined, material: "PAP3", type: "OCC", gui: "Cardboard", min: 1200, max: 1300, currentType: false}, weight: 730, baleDate : new Date(2016, 3,  3, 11, 46, 11), transmitted: false},
        { _id: undefined, baleType: {_id: undefined, material: "PAP1", type: "OCC", gui: "Cardboard", min: 1200, max: 1300, currentType: false}, weight: 701, baleDate : new Date(2016, 30, 2, 18, 33, 46), transmitted: false},
        { _id: undefined, baleType: {_id: undefined, material: "PAP0", type: "OCC", gui: "Cardboard", min: 1200, max: 1300, currentType: false}, weight: 700, baleDate : new Date(2016, 3,  1, 11, 24, 40), transmitted: false},
    ];

    constructor(private $log: ng.ILogService) {
        $log.debug("Top of BaleTypsService constructor");
    }

}
