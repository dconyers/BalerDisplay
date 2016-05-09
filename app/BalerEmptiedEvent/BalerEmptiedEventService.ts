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
        this.$log.debug("BalerEmptiedEventReportCtrl::notified of BalerEmptiedEvent");
        this.loadBalerEmptiedEvents();
      });
      this.loadBalerEmptiedEvents();


        loadCellMonitorService.on("BalerEmptiedEvent", (maxWeight, currentWeight) => {
          this.$log.debug("got BalerEmptied event max: " + maxWeight + " current: " + currentWeight);
          let pic_fname: string = this.takePicture();
          baleTypesService.getCurrentBaleType()
          .then((currentBaleType: BaleType) => {
            let balerEmptiedEvent: BalerEmptiedEvent = {
              baleType: currentBaleType,
              weight: maxWeight,
              baleDate : new Date(),
              transmitted: false,
              photoPath: pic_fname
            };
            this.$log.debug("original inserted: " + balerEmptiedEvent);
            this.$log.debug(balerEmptiedEvent);
            return balerEmptiedEventDataStoreService.insertRowPromise(balerEmptiedEvent);
          })
          .then((balerEmptiedEvent: BalerEmptiedEvent) => {
            return this.openConfirmation(balerEmptiedEvent).result;
          })
          .then((balerEmptiedEvent: BalerEmptiedEvent) => {

            this.$log.debug("about to update with");
            this.$log.debug(balerEmptiedEvent);
            return balerEmptiedEventDataStoreService.updateRowPromise(balerEmptiedEvent._id, balerEmptiedEvent, {});
          })
          .then((updatedRowCount: number) => {
            this.$log.debug("return from update:" + updatedRowCount);
          })
          .catch((exception) => {
            this.$log.error("balerEmptiedEventDataStoreService.insertRowPromise failed: " + exception);
          })
          .done();
        });
    }

    takePicture(): string {
      this.pictureService.width = 1920;
      this.pictureService.height = 1080;

      const tmp = require("tmp");
      let tmpName = tmp.tmpNameSync({template: "./photos/capture-XXXXXX.jpg"});
      this.pictureService.takePicturePromise(tmpName)
      .then((returnCode: number) => {
      }).catch((exception) => {
        this.$log.error("Received exception taking picture: " + exception);
      }).done();
      return tmpName;
    }

    private modal: ng.ui.bootstrap.IModalServiceInstance = null;

    openConfirmation(myBalerEmptiedEvent: BalerEmptiedEvent): any {

      if (this.modal !== null) {
        this.modal.dismiss("Previous Instance Unconfirmed, dismissing");
      }

      this.modal = this.$uibModal.open({
        animation: true,
        templateUrl:  "./BalerEmptiedEvent/BalerEmptiedConfirmationDlg.html",
        controller:   "BalerEmptiedConfirmationDlgCtrl",
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


}
