import {LoadCellDataService} from "./load_cell_addon/LoadCellDataService";
import {BaleTypesService} from "./BaleTypes/BaleTypesService";
import {BaleEventService} from "./BaleEvent/BaleEventService";
import {BaleType} from "./BaleTypes/BaleType";
import * as q from "q";
import {BaleTypesDataStore} from "./BaleTypes/BaleTypesDataStore";

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
        "BaleTypesDataStoreService",
        "BaleEventService"
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
        private baleTypesService: BaleTypesService,
        private baleTypesDataStoreService: BaleTypesDataStore,
        private baleEventService: BaleEventService) {
        $log.debug("Top of BalerCtrl constructor");
        this.refreshData();
    }

    public currentBaleTypeChangeRequest(newCurrent: BaleType): q.Promise<any> {
        return q.fcall(() => {
            if (this.balerData.baleType !== null) {
                this.$log.debug("it's not undefined: " + this.balerData.baleType);
                return this.baleTypesDataStoreService.updateRowPromise(this.balerData.baleType._id, { $set: { currentType: false } }, {});
            }
        }).then(() => {
            return this.baleTypesDataStoreService.updateRowPromise(newCurrent._id, { $set: { currentType: true } }, {});
        }).catch((exception: any) => {
                this.$log.error("balerCtrl::currentBaleTypeChangeRequest Got exception" + exception);
                return exception;
        });
    }

    public loadBaleTypeData(): q.Promise<any> {
        this.$log.debug("Top of loadBaleTypeData");
        return  this.baleTypesService.getMaterialList().then((retVal: string[]) => {
                    this.materialList = retVal;
                });
    }

    private refreshData() {
        this.$log.debug("Top of refreshData()");

        this.baleTypesDataStoreService.initializeDataStore()
        .then(() => {
            return this.baleTypesService.getCurrentBaleType();
        }).then ((returnVal: BaleType) => {
            this.$log.debug("balerCtrl::refreshData");
            this.balerData.baleType = returnVal;
            this.balerData.lowWeight = returnVal.min;
            this.balerData.highWeight = returnVal.max;
            this.$scope.$apply();
        }).done;

        this.balerData.currentWeight = this.loadCellDataService.getLoadCellWeight();
        this.$scope.$watch(() => {
            return this.loadCellDataService.getLoadCellWeight();
        }, () => {
            this.balerData.currentWeight = this.loadCellDataService.getLoadCellWeight();
        });
    }

};
