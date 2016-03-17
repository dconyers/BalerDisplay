import NeDBDataStore = require("nedb");
import * as q from "q";
import * as Persistence from "../persistence/PersistentDataStore";

export interface BaleType {
    material: string;
    type: string;
    gui: string;
    min: number;
    max: number;
};

export class BaleTypesDataStore extends Persistence.PersistentDataStore<BaleType> {
    constructor() {
            super("BaleTypes");
    };

    getInitData(): Array<BaleType> {

        return [
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

};
