import {LoadCellDataService} from "./load_cell_addon/LoadCellDataService";
import {BaleTypesService} from "./BaleTypes/BaleTypesService";
import {BaleType} from "./BaleTypes/BaleType";
import * as q from "q";

export interface BalerData {
    baleType: BaleType;
    lowWeight: number;
    currentWeight: number;
    highWeight: number;
};

export class BalerCtrl {

    static $inject: string[] = [
        "$scope",
        "$log",
        "LoadCellDataService",
        "BaleTypesService",
    ];

    materialList: string[] = [];

    balerData: BalerData = {
        baleType: undefined,
        lowWeight: undefined,
        currentWeight: undefined,
        highWeight: undefined,
    };

    constructor(private $scope: ng.IScope,
                private $log: ng.ILogService,
                private loadCellDataService: LoadCellDataService,
                private baleTypesService: BaleTypesService) {
        $log.debug("Top of BalerCtrl constructor");
        this.refreshData();
    }

    public materialTypeChange(data: BaleType): boolean {
        // TODO: DEC - This needs to be implemented
        this.$log.debug("test called for material: " + data.gui);
        return true;
    }

    public loadBaleTypeData(): q.Promise<any> {
        this.$log.debug("Top of loadBaleTypeData");
        return  this.baleTypesService.getMaterialList().then((retVal: string[]) => {
                    this.materialList = retVal;
                });
    }

    private refreshData() {
        this.$log.debug("Top of refreshData()");
        this.baleTypesService.getCurrentBaleType().then((baleType: BaleType) => {
            this.$log.debug("promise resolved with bale type: " + baleType.material);
            this.balerData.baleType = baleType;
            this.balerData.lowWeight = baleType.min;
            this.balerData.highWeight = baleType.max;
            this.$scope.$apply();
        }).catch((error) => {
            this.$log.error("Promise generated exception: " + error);
        }).done();

        // this.baleTypesService.getMaterialList().then((retVal: string[]) => {
        //     this.materialList = retVal;
        //     this.$scope.$apply();
        // }).catch((error) => {
        //     this.$log.error("Promise generated exception: " + error);
        // }).done();

        this.balerData.currentWeight = this.loadCellDataService.getLoadCellWeight();
    }

};
