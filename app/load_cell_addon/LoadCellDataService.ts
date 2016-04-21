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
        this.$interval(() => this.doStuff(), 3000);
    }

    private doStuff(): void {
        this.$log.debug("LoadCellDataService::doStuff()" + this.fakeData);
        this.fakeData += 10; // this.getRandomIntInclusive(-1, 1);
    }

    getLoadCellWeight(): number  {
        return this.fakeData;
        // npm return this.addon.getCurrentWeight();
    }
};
