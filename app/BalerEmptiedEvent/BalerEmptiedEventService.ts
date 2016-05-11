import * as q from "q";
import {BalerEmptiedEvent} from "./BalerEmptiedEvent";
import {BalerEmptiedEventDataStore} from "./BalerEmptiedEventDataStore";
import {LoadCellMonitorService} from "../services/LoadCellMonitorService";
import {BaleTypesService} from "../BaleTypes/BaleTypesService";
import {BaleType} from "../BaleTypes/BaleType";
import {PictureSrvc} from "../services/PictureSrvc";

export class BalerEmptiedEventService {

  balerEmptiedEvents: Array<BalerEmptiedEvent> = [];

  static $inject: string[] = [
    "$log",
    "$uibModal",
    "LoadCellMonitorService",
    "BalerEmptiedEventDataStoreService",
    "BaleTypesService",
    "PictureSrvc"
  ];

  constructor(private $log: ng.ILogService,
    private $uibModal,
    private loadCellMonitorService: LoadCellMonitorService,
    private balerEmptiedEventDataStoreService: BalerEmptiedEventDataStore,
    private baleTypesService: BaleTypesService,
    private pictureService: PictureSrvc) {

    loadCellMonitorService.on("BalerEmptiedEvent", (maxWeight, currentWeight) => {
      this.$log.debug("got BalerEmptied event max: " + maxWeight + " current: " + currentWeight);
      let pic_fname: string;
      this.pictureService.takePicturePromise()
        .then((filename: string) => {
          pic_fname = filename;
          return baleTypesService.getCurrentBaleType();
        })
        .then((currentBaleType: BaleType) => {
          let balerEmptiedEvent: BalerEmptiedEvent = {
            baleType: currentBaleType,
            weight: maxWeight,
            baleDate: new Date(),
            transmitted: false,
            photoPath: pic_fname
          };
          this.$log.debug("original inserted: " + balerEmptiedEvent);
          this.$log.debug(balerEmptiedEvent);
          return balerEmptiedEventDataStoreService.insertRowPromise(balerEmptiedEvent);
        })
        .then((balerEmptiedEvent: BalerEmptiedEvent) => {
          this.loadBalerEmptiedEvents();
          return this.openConfirmation(balerEmptiedEvent).result;
        })
        .then((balerEmptiedEvent: BalerEmptiedEvent) => {
          this.$log.debug("about to update with");
          this.$log.debug(balerEmptiedEvent);
          return balerEmptiedEventDataStoreService.updateRowPromise(balerEmptiedEvent._id, balerEmptiedEvent, {});
        })
        .then((updatedRowCount: number) => {
          this.loadBalerEmptiedEvents();
          this.$log.debug("return from update:" + updatedRowCount);
        })
        .catch((exception) => {
          this.$log.error("balerEmptiedEventDataStoreService.insertRowPromise failed: " + exception);
        })
        .done();
    });

    this.loadBalerEmptiedEvents();
  }



  private modal: ng.ui.bootstrap.IModalServiceInstance = null;

  openConfirmation(myBalerEmptiedEvent: BalerEmptiedEvent): any {

    if (this.modal !== null) {
      this.modal.dismiss("Previous Instance Unconfirmed, dismissing");
    }

    this.modal = this.$uibModal.open({
      animation: true,
      templateUrl: "./BalerEmptiedEvent/BalerEmptiedConfirmationDlg.html",
      controller: "BalerEmptiedConfirmationDlgCtrl",
      controllerAs: "balerEmptiedConfirmationDlgCtrl",
      resolve: {
        balerEmptiedEvent: () => {
          this.$log.debug("sending: " + myBalerEmptiedEvent);
          return myBalerEmptiedEvent;
        }
      }
    });
    return this.modal;
  }

  public loadBalerEmptiedEvents(): Array<BalerEmptiedEvent> {
    this.$log.debug("BalerEmptiedEventReportCtrl::loadBalerEmptiedEvents called");
    this.balerEmptiedEventDataStoreService.initializeDataStore().then((baleEvents: Array<BalerEmptiedEvent>) => {
      this.$log.debug("Successfully loaded " + baleEvents.length + " Bale Events in loadBalerEmptiedEvents");
      this.balerEmptiedEvents = baleEvents;
    });
    return this.balerEmptiedEvents;
  }

  public getNewestBalerEmptiedEvent(): BalerEmptiedEvent {
    if (!this.balerEmptiedEvents) {
      return null;
    }
    let theEvent: BalerEmptiedEvent = this.balerEmptiedEvents[this.balerEmptiedEvents.length - 1];
    return theEvent;
  }


}
