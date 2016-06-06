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
import {GeneralConfigurationDataStore} from "../GeneralConfiguration/GeneralConfigurationDataStore";
import * as GeneralConfiguration from  "../GeneralConfiguration/GeneralConfigurationRecord";


export class BalerEmptiedEventService {

  static $inject: string[] = [
    "$log",
    "$uibModal",
    "LoadCellMonitorService",
    "BalerEmptiedEventDataStoreService",
    "BaleTypesService",
    "PictureSrvc",
    "WorkersService",
    "QRService",
    "GeneralConfigurationDataStoreService",
  ];

  constructor(private $log: ng.ILogService,
    private $uibModal,
    private loadCellMonitorService: LoadCellMonitorService,
    private balerEmptiedEventDataStoreService: BalerEmptiedEventDataStore,
    private baleTypesService: BaleTypesService,
    private pictureService: PictureSrvc,
    private workersService: WorkersService,
    private qrService: QRService,
    private generalConfigurationDataStoreService: GeneralConfigurationDataStore) {

    loadCellMonitorService.on("BalerEmptiedEvent", (maxWeight, currentWeight) => {
      this.$log.debug("got BalerEmptied event max: " + maxWeight + " current: " + currentWeight);
      let baleEmptyPromise: q.Promise<any> =
        q.all(
          [
            this.pictureService.takePicturePromise(),
            baleTypesService.getCurrentBaleType(),
            balerEmptiedEventDataStoreService.getNextBaleIDPromise(),
            workersService.getCurrentWorker(),
            this.generalConfigurationDataStoreService.getGeneralConfigurationRecord(GeneralConfiguration.CUSTOMER_ID),
            this.generalConfigurationDataStoreService.getGeneralConfigurationRecord(GeneralConfiguration.BALER_ID)
          ]
        ).spread((
          filename: string,
          currBaleType: BaleType,
          baleID: number,
          currentWorker: BalerWorker,
          customerIDRecord: GeneralConfiguration.GeneralConfigurationRecord,
          balerIDRecord: GeneralConfiguration.GeneralConfigurationRecord
        ) => {
          let balerEmptiedEvent: BalerEmptiedEvent = {
            baleID: baleID,
            baleType: currBaleType,
            weight: maxWeight,
            baleDate: new Date(),
            transmitted: false,
            photoPath: filename,
            worker: currentWorker,
            balerID: balerIDRecord.value,
            customerID: customerIDRecord.value
          };
          return balerEmptiedEventDataStoreService.insertRowPromise(balerEmptiedEvent);
        }).catch((exception) => {
          this.$log.error("balerEmptiedEventDataStoreService.insertRowPromise failed: " + exception);
        });

      baleEmptyPromise
        .then((balerEmptiedEvent: BalerEmptiedEvent) => {
          return this.openConfirmation(balerEmptiedEvent).result;
        })
        .then((balerEmptiedEvent: BalerEmptiedEvent) => {
          this.qrService.createLabelImage(balerEmptiedEvent).then((path: string) => {
            this.qrService.printLabelImage(path);
          });
          return balerEmptiedEvent;
        })
        .then((balerEmptiedEvent: BalerEmptiedEvent) => {
          return balerEmptiedEventDataStoreService.updateRowPromise(balerEmptiedEvent._id, balerEmptiedEvent, {});
        })
        .catch((exception) => {
          this.$log.error("balerEmptiedEventDataStoreService::Confirmation Dialog Processing failed: " + exception);
        })
        .done();
    });
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

  public getNewestBalerEmptiedEvent(): BalerEmptiedEvent {

    if (!this.balerEmptiedEventDataStoreService.balerEmptiedEvents) {
      return null;
    }
    let theEvent: BalerEmptiedEvent = this.balerEmptiedEventDataStoreService.balerEmptiedEvents[0];
    return theEvent;
  }
}
