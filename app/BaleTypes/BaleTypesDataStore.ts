import NeDBDataStore = require("nedb");
import {BaleType} from "./BaleType";
import * as q from "q";
import * as Persistence from "../persistence/PersistentDataStore";

export class BaleTypesDataStore extends Persistence.PersistentDataStore<BaleType> {

    static $inject: string[] = [
        "$log",
    ];

    constructor(private $log: ng.ILogService) {
            super("BaleTypes");
    };

    initializeDataStore(): q.Promise<any> {
        return this.loadDatabasePromise()
            .then((): q.Promise<number> => {
                console.log("Database loaded, about to count rows");
                return this.countAllRows();
            })
            .then((return_val: number) => {
                console.log("got back row count of: " + return_val);
                if (return_val === 0) {
                    return this.insertInitializationData();
                }
            })
            .then(() => {
                return this.loadData();
            });
    }

    getInitData(): Array<BaleType> {
        return [
        {material: "PAP", type: "OCC", gui: "Cardboard", min: 1200, max: 1300, currentType: true},
        {material: "HDP", type: "BB",  gui: "Detergent Bottles", min: 900, max: 1000, currentType: false},
        {material: "HDP", type: "BB",  gui: "Milk Bottles", min: 900, max: 1000, currentType: false},
        {material: "PPH", type: undefined,  gui: "Crates (Milk, Fruit)", min: 900, max: 1000, currentType: false},
        {material: "HDP", type: "FL", gui: "Grocery Bags", min: 1200, max: 1300, currentType: false},
        {material: "LDP", type: "FL", gui: "Packaging Film", min: 1200, max: 1300, currentType: false},
        {material: "HDP", type: undefined,  gui: "Pipe End Caps", min: 900, max: 1000, currentType: false},
        {material: "LLD", type: "FL", gui: "Shrink Wrap", min: 1200, max: 1300, currentType: false},
        {material: "PET", type: "ST",  gui: "Strapping", min: 900, max: 1000, currentType: false},
        {material: "PPH", type: "WF",  gui: "Super Sacks", min: 900, max: 1000, currentType: false},
        {material: "PET", type: "BB",  gui: "Water Bottles", min: 900, max: 1000, currentType: false}
        ];
    };

};
