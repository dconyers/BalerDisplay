import {LoadCellDataService} from "./load_cell_addon/LoadCellDataService";

export class BalerCtrl {

    static $inject: string[] = [
        "$log",
        "LoadCellDataService"
    ];

    constructor(private $log: ng.ILogService, private loadCellDataService: LoadCellDataService) {
        $log.debug("Top of LoadCellDataService constructor");
    }

    private balerData: any = {
        lowWeight: this.getLowWeight,
        currentWeight: this.getCurrentWeight,
        highWeight: this.getHighWeight,
    };

    private getBalerData(): any  {
        return {
            lowWeight: this.getLowWeight(),
            currentWeight: this.getCurrentWeight(),
            highWeight: this.getHighWeight(),
        };
    };

    getLowWeight(): number {
        return 1000;
    }

    getHighWeight(): number {
        return 3000;
    };

    getCurrentWeight(): number {
        this.$log.warn("Here?");
        return this.loadCellDataService.getLoadCellWeight();
    };
};
