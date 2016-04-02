export class LoadCellDataService {

    static IID = "LoadCellDataService";
    addon = require("./build/Release/load_cell_addon");

    static $inject: string[] = [
    ];

    constructor() {
        console.log("LoadCellDataService Constructor");
    }

    getLoadCellWeight(): number  {
        return this.addon.getCurrentWeight();
    }
};
