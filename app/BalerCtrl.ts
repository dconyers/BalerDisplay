import {LoadCellDataService} from "./loadCell/LoadCellDataService";
import {BaleTypesService} from "./BaleTypes/BaleTypesService";
import {BalerEmptiedEventService} from "./BalerEmptiedEvent/BalerEmptiedEventService";
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
    "$interval",
    "LoadCellDataService",
    "BaleTypesService",
    "BaleTypesDataStoreService",
    "BalerEmptiedEventService"
  ];

  materialList: string[] = [];

  public balerData: BalerData = {
    baleType: undefined,
    lowWeight: undefined,
    currentWeight: undefined,
    highWeight: undefined,
  };

  gaugeSettings: any = {
    ranges: [{ startValue: 0, endValue: 1000, endWidth: 10, startWidth: 1, style: { fill: "#fad00b", stroke: "#fad00b" }, startDistance: 0, endDistance: 0 },
      { startValue: 900, endValue: 1200, endWidth: 15, startWidth: 10, style: { fill: "#4cb848", stroke: "#4cb848" }, startDistance: 0, endDistance: 0 },
      { startValue: 1200, endValue: 1200 * 1.2, endWidth: 20, startWidth: 15, style: { fill: "#e53d37", stroke: "#e53d37" }, startDistance: 0, endDistance: 0 }],
    cap: { size: "5%", style: { fill: "#2e79bb", stroke: "#2e79bb" } },
    max: 1200 * 1.2,
    height: 240,
    width: 240,
    border: { style: { fill: "#8e9495", stroke: "#7b8384", "stroke-width": 1 } },
    ticksMinor: { interval: 50, size: "5%" },
    ticksMajor: { interval: 200, size: "10%" },
    labels: { position: "inside", interval: 200 },
    pointer: { style: { fill: "#2e79bb" }, width: 5 },
    animationDuration: 0,
    caption: { value: "", position: "bottom", offset: [0, 10], visible: true }
  };


  constructor(private $scope: ng.IScope,
    private $log: ng.ILogService,
    private $interval: ng.IIntervalService,
    private loadCellDataService: LoadCellDataService,
    private baleTypesService: BaleTypesService,
    public baleTypesDataStoreService: BaleTypesDataStore,
    private BalerEmptiedEventService: BalerEmptiedEventService) {
      this.$log.debug("BalerCtrl::constructor");
    this.refreshData();
  }

  public loadBaleTypeData(): q.Promise<any> {
    return this.baleTypesService.getMaterialList().then((retVal: string[]) => {
      this.materialList = retVal;
    });
  }

  private refreshData() {
    this.$log.debug("BalerCtrl::refreshData");
    this.baleTypesDataStoreService.getCurrentBaleType()
      .then((returnVal: BaleType) => {
        this.$log.debug("Current baleType is: " + returnVal.gui);
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
      }, (newValue, oldValue) => {
        if (oldValue !== newValue) {
          this.updateCaption(newValue);
        }
      });

      this.$scope.$watch(() => {
        return this.baleTypesDataStoreService.currentBaleType;
      }, (newValue, oldValue) => {
        if (oldValue !== newValue) {
          this.refreshData();
        }
      });


      // Since it was just created, initialize the caption
      this.updateCaption(this.loadCellDataService.getLoadCellWeight());
    });
  }

  private updateCaption(weight: number) {
    this.balerData.currentWeight = this.loadCellDataService.getLoadCellWeight();
    this.gaugeSettings.caption.value = "" + this.balerData.currentWeight.toFixed(0) + " lbs.";
    this.gaugeSettings.apply("caption", this.gaugeSettings.caption);
  }
};
