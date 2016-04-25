export class LoadCellDataService {

    fakeData: number = 789;

    static IID = "LoadCellDataService";
    addon = require("./build/Release/load_cell_addon");

    static $inject: string[] = [
        "$log",
        "$interval"
    ];

    private getRandomIntInclusive(min: number, max: number): number {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    constructor(private $log: ng.ILogService, private $interval: ng.IIntervalService) {
        console.log("LoadCellDataService Constructor");
        this.$interval(() => this.doStuff(), 200);
    }

    private doStuff(): void {
        this.$log.debug("LoadCellDataService::doStuff()" + this.fakeData);
        this.fakeData +=  this.getRandomIntInclusive(-1, 4);
    }

    getLoadCellWeight(): number  {
        return this.fakeData;
        // npm return this.addon.getCurrentWeight();
    }
};
