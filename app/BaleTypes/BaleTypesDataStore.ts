import NeDBDataStore = require("nedb");
import {BaleType} from "./BaleType";
import * as q from "q";
import * as Persistence from "../persistence/PersistentDataStore";

export class BaleTypesDataStore extends Persistence.PersistentDataStore<BaleType> {

    static $inject: string[] = [
        "$log",
    ];

    private initialized: boolean = false;

    constructor(private $log: ng.ILogService) {
            super("BaleTypes");
            $log.debug("top of BaleTypesDataStore constructor");
    };

    initializeDataStore(): q.Promise<any> {
        this.$log.debug("Top of BaleTypesDataStore::initializeDataStore");
        if (this.initialized) {
            this.$log.debug("BaleTypesDataStore::initializeDataStore - already inited, skipping.");
            return this.loadDataPromise()
                .then((retVal: Array<BaleType>) => {
                        return retVal.sort((a: BaleType, b: BaleType) => {
                            if (a.gui === undefined)
                                return 1;
                            return a.gui.localeCompare(b.gui);
                        });
                });
        }
        this.$log.debug("BaleTypesDataStore::initializeDataStore - initializing.");
        return this.loadDatabasePromise()
            .then((): q.Promise<number> => {
                return this.countAllRows();
            })
            .then((return_val: number) => {
                if (return_val === 0) {
                    return this.insertInitializationData();
                }
            })
            .then(() => {
                this.initialized = true;
                return this.loadDataPromise();
            })
            .then((retVal: Array<BaleType>) => {
                return retVal.sort((a: BaleType, b: BaleType) => {
                if (a.gui === undefined)
                  return 1;
                  return a.gui.localeCompare(b.gui);
                });
            });
    }

    getInitData(): Array<BaleType> {
        return [
        {_id: undefined, material: "PAP", type: "OCC", gui: "Cardboard", min: 1200, max: 1300, currentType: false, imageName: "cardboard.jpg" },
        {_id: undefined, material: "HDP", type: "BB",  gui: "Detergent Bottles", min: 900, max: 1000, currentType: true, imageName: "detergent_bottle.jpg"},
        {_id: undefined, material: "HDP", type: "BB",  gui: "Milk Bottles", min: 900, max: 1000, currentType: false, imageName: "milk_bottles.jpg"},
        {_id: undefined, material: "PPH", type: undefined,  gui: "Crates (Milk, Fruit)", min: 900, max: 1000, currentType: false, imageName: "milk_crates.jpg"},
        {_id: undefined, material: "HDP", type: "FL", gui: "Grocery Bags", min: 1200, max: 1300, currentType: false, imageName: "grocery_bags.jpg"},
        {_id: undefined, material: "LDP", type: "FL", gui: "Packaging Film", min: 1200, max: 1300, currentType: false, imageName: "packaging_film.jpg"},
        {_id: undefined, material: "HDP", type: undefined,  gui: "Pipe End Caps", min: 900, max: 1000, currentType: false, imageName: "pipe_end_caps.jpg"},
        {_id: undefined, material: "LLD", type: "FL", gui: "Shrink Wrap", min: 1200, max: 1300, currentType: false, imageName: "shrink_wrap.jpg"},
        {_id: undefined, material: "PET", type: "ST",  gui: "Strapping", min: 900, max: 1000, currentType: false, imageName: "strapping.jpg"},
        {_id: undefined, material: "PPH", type: "WF",  gui: "Super Sacks", min: 900, max: 1000, currentType: false, imageName: "super_sacks.jpg"},
        {_id: undefined, material: "PET", type: "BB",  gui: "Water Bottles", min: 900, max: 1000, currentType: false, imageName: "water_bottles.jpg"}
        ];
    };

};
