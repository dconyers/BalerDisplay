import {LoadCellDataService} from "./load_cell_addon/LoadCellDataService";

export class BalerCtrl {

    static $inject: string[] = [
        "$log",
        "LoadCellDataService"
    ];

    constructor(private $log: ng.ILogService, private loadCellDataService: LoadCellDataService) {
        // console.log("Top of BalerCtrl function: " + LoadCellDataService);
        $log.warn("Hello: " + loadCellDataService);
    }

    private balerData: any = {
        lowWeight: this.getLowWeight,
        currentWeight: this.getCurrentWeight,
        highWeight: this.getHighWeight,
    };

    getLowWeight(): number {
        return 1000;
        // this.balerData.lowWeight;
    }

    getHighWeight(): number {
        return 3000;
        // this.balerData.highWeight;
    };

    getCurrentWeight(): number {
        // console.log("top of getCurrentWeight: " + this.LoadCellDataService);
        this.$log.warn("Here?");
        return this.loadCellDataService.getLoadCellWeight();
        // this.balerData.currentWeight = this.LoadCellDataService.getLoadCellWeight();
        // return this.balerData.currentWeight;
    };
};
