import NeDBDataStore = require("nedb");
import * as q from "q";

export class BaleTypesDataStore extends NeDBDataStore {
    constructor() {
            super(BaleTypesDataStore.options);
            this.loadDatabase(this.onload);
    };

    static options: NeDB.DataStoreOptions = {
        filename : "BaleTypes.dat",
        inMemoryOnly : false,
        autoload : false,
    };

    onload = (error: Error) => {
        if (error === null) {
            this.count({}, (err, cnt) => {
                if (err !== null) {
                    console.log("count returned error: " + err);
                }
                if (cnt === 0) {
                    this.insert(BaleTypesDataStore.initData, (err) => {
                        console.log("Insert returned error: " + err);
                    });
                }
            });
        }
    };

    deleteRow(stuff: any) {
        console.log("deleteRow called");
    }

    insertRow(stuff: any) {
        console.log("insertRow called");
    }

    updateRow(stuff: any) {
        console.log("updateRow called");
    }

    loadData() {
        let find_synch = q.nbind(this.find, this);
        return find_synch({});
    }

    static initData = [
        {material: "PAP", type: "OCC", gui: "Cardboard", min: 1200, max: 1300},
        {material: "HDP", type: "BB",  gui: "Detergent Bottles", min: 900, max: 1000},
        {material: "HDP", type: "BB",  gui: "Milk Bottles", min: 900, max: 1000},
        {material: "PPH", type: undefined,  gui: "Crates (Milk, Fruit)", min: 900, max: 1000},
        {material: "HDP", type: "FL", gui: "Grocery Bags", min: 1200, max: 1300},
        {material: "LDP", type: "FL", gui: "Packaging Film", min: 1200, max: 1300},
        {material: "HDP", type: undefined,  gui: "Pipe End Caps", min: 900, max: 1000},
        {material: "LLD", type: "FL", gui: "Shrink Wrap", min: 1200, max: 1300},
        {material: "PET", type: "ST",  gui: "Strapping", min: 900, max: 1000},
        {material: "PPH", type: "WF",  gui: "Super Sacks", min: 900, max: 1000},
        {material: "PET", type: "BB",  gui: "Water Bottles", min: 900, max: 1000}
    ];

};
