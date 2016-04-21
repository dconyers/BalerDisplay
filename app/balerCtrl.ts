import {LoadCellDataService} from "./load_cell_addon/LoadCellDataService";
import {BaleTypesService} from "./BaleTypes/BaleTypesService";
import {BaleEventService} from "./BaleEvent/BaleEventService";
import {BaleType} from "./BaleTypes/BaleType";
import * as q from "q";
import {BaleTypesDataStore} from "./BaleTypes/BaleTypesDataStore";
import * as bb from "bootbox";

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

  gaugeSettings: any = {
    ranges: [{ startValue: 0, endValue: 1000, endWidth: 10, startWidth: 1, style: { fill: "#4cb848", stroke: "#4cb848" }, startDistance: 0, endDistance: 0 },
      { startValue: 900, endValue: 1200, endWidth: 15, startWidth: 10, style: { fill: "#fad00b", stroke: "#fad00b" }, startDistance: 0, endDistance: 0 },
      { startValue: 1200, endValue: 1200 * 1.2, endWidth: 20, startWidth: 15, style: { fill: "#e53d37", stroke: "#e53d37" }, startDistance: 0, endDistance: 0 }],
    cap: { size: "5%", style: { fill: "#2e79bb", stroke: "#2e79bb" } },
    max: 1200 * 1.2,
    height: 275,
    width: 275,
    border: { style: { fill: "#8e9495", stroke: "#7b8384", "stroke-width": 1 } },
    ticksMinor: { interval: 50, size: "5%" },
    ticksMajor: { interval: 200, size: "10%" },
    labels: { position: "inside", interval: 200 },
    pointer: { style: { fill: "#2e79bb" }, width: 5 },
    animationDuration: 0,
    caption: { value: "Loading, please wait...", position: "bottom", offset: [0, 10], visible: true }
  };


  constructor(private $scope: ng.IScope,
    private $log: ng.ILogService,
    private loadCellDataService: LoadCellDataService,
    private baleTypesService: BaleTypesService,
    private baleTypesDataStoreService: BaleTypesDataStore,
    private baleEventService: BaleEventService) {
    this.refreshData();
  }




  public loadBaleTypeData(): q.Promise<any> {
    return this.baleTypesService.getMaterialList().then((retVal: string[]) => {
      this.materialList = retVal;
    });
  }

  private refreshData() {
    this.baleTypesDataStoreService.initializeDataStore()
      .then(() => {
        return this.baleTypesService.getCurrentBaleType();
      }).then((returnVal: BaleType) => {
        this.balerData.baleType = returnVal;
        this.balerData.lowWeight = returnVal.min;
        this.balerData.highWeight = returnVal.max;

        this.gaugeSettings.max = this.balerData.highWeight * 1.2;
        this.gaugeSettings.ranges[0].endValue = this.balerData.lowWeight;
        this.gaugeSettings.ranges[1].startValue = this.balerData.lowWeight;
        this.gaugeSettings.ranges[1].endValue = this.balerData.highWeight;
        this.gaugeSettings.ranges[2].startValue = this.balerData.highWeight;
        this.gaugeSettings.ranges[2].endValue = this.balerData.highWeight * 1.2;

        this.gaugeSettings.apply("ranges", this.gaugeSettings.ranges);
        this.gaugeSettings.apply("max", this.gaugeSettings.max);

      }).done;

    this.$scope.$on("jqxGaugeCreated", (event) => {
      this.$scope.$watch(() => {
        return this.loadCellDataService.getLoadCellWeight();
      }, () => {
        this.balerData.currentWeight = this.loadCellDataService.getLoadCellWeight();
        this.gaugeSettings.caption.value = "" + this.balerData.currentWeight + " lbs.";
        this.gaugeSettings.apply("caption", this.gaugeSettings.caption);
      });
    });
  }

};
