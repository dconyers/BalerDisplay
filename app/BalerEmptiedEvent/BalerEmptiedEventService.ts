import * as q from "q";
import {BalerEmptiedEvent} from "./BalerEmptiedEvent";
import {BalerEmptiedEventDataStore} from "./BalerEmptiedEventDataStore";
import {LoadCellMonitorService} from "../services/LoadCellMonitorService";
import {BaleTypesService} from "../BaleTypes/BaleTypesService";
import {BaleType} from "../BaleTypes/BaleType";
import {PictureSrvc} from "../services/PictureSrvc";
import {QRService} from "../services/QRService";
import {WorkersService} from "../Settings/WorkerSettings/WorkersService";
import {BalerWorker} from "../Settings/WorkerSettings/BalerWorker";

export class BalerEmptiedEventService {

  balerEmptiedEvents: Array<BalerEmptiedEvent> = [];

  static $inject: string[] = [
    "$log",
    "$uibModal",
    "LoadCellMonitorService",
    "BalerEmptiedEventDataStoreService",
    "BaleTypesService",
    "PictureSrvc",
    "WorkersService",
    "QRService"
  ];

  constructor(private $log: ng.ILogService,
    private $uibModal,
    private loadCellMonitorService: LoadCellMonitorService,
    private balerEmptiedEventDataStoreService: BalerEmptiedEventDataStore,
    private baleTypesService: BaleTypesService,
    private pictureService: PictureSrvc,
    private workersService: WorkersService,
    private qrService: QRService) {

    loadCellMonitorService.on("BalerEmptiedEvent", (maxWeight, currentWeight) => {
      this.$log.debug("got BalerEmptied event max: " + maxWeight + " current: " + currentWeight);
      let pic_fname: string;
      let currentBaleType: BaleType;
      let nextBaleID: number;
      // Between Here...
      let baleEmptyPromise: q.Promise<any> = this.pictureService.takePicturePromise()
        .then((filename: string) => {
          pic_fname = filename;
          return baleTypesService.getCurrentBaleType();
        })
        .then((currBaleType: BaleType) => {
          // this.$log.debug("currBaleTypegot back");
          // this.$log.debug(currBaleType);
          currentBaleType = currBaleType;
          return balerEmptiedEventDataStoreService.getNextBaleIDPromise();
        })
        .then((baleID: number) => {
          nextBaleID = baleID;
          return workersService.getCurrentWorker();
        })
        .then((currentWorker: BalerWorker) => {
          // this.$log.debug("got back currentWorker");
          // this.$log.debug(currentWorker);
          this.$log.debug("Creating new balerEmptiedEvent with ID: " + nextBaleID);
          let balerEmptiedEvent: BalerEmptiedEvent = {
            baleID: nextBaleID,
            baleType: currentBaleType,
            weight: maxWeight,
            baleDate: new Date(),
            transmitted: false,
            photoPath: pic_fname,
            worker: currentWorker
          };

          return balerEmptiedEventDataStoreService.insertRowPromise(balerEmptiedEvent);
        })
        .catch((exception) => {
          this.$log.error("balerEmptiedEventDataStoreService.insertRowPromise failed: " + exception);
        });
        // .... and here.

      baleEmptyPromise
        .then((balerEmptiedEvent: BalerEmptiedEvent) => {
          this.loadBalerEmptiedEvents();
          return this.openConfirmation(balerEmptiedEvent).result;
        })
        .then((balerEmptiedEvent: BalerEmptiedEvent) => {
          this.qrService.createLabelImage(balerEmptiedEvent).then((path: string) => {
            console.log("createLabelImage done");
            this.qrService.printLabelImage(path);
          });
          return balerEmptiedEvent;
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
          this.$log.error("balerEmptiedEventDataStoreService::Confirmation Dialog Processing failed: " + exception);
        })
        .done();
    });

    this.loadBalerEmptiedEvents();
  }

  private modal: ng.ui.bootstrap.IModalServiceInstance = null;

  openConfirmation(myBalerEmptiedEvent: BalerEmptiedEvent): any {

    if (this.modal !== null) {
      this.modal.dismiss("Previous Instance Unconfirmed, dismissing dialog");
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
    let theEvent: BalerEmptiedEvent = this.balerEmptiedEvents[0];
    return theEvent;
  }
}
