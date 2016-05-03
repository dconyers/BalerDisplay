import * as q from "q";
import {BalerEmptiedEvent} from "./BalerEmptiedEvent";
import {BalerEmptiedEventDataStore} from "./BalerEmptiedEventDataStore";
import {LoadCellMonitorService} from "../services/LoadCellMonitorService";
import {BaleTypesService} from "../BaleTypes/BaleTypesService";
import {BaleType} from "../BaleTypes/BaleType";
import {PictureSrvc} from "../services/PictureSrvc";

export class BalerEmptiedEventService {

    static $inject: string[] = [
        "$log",
        "LoadCellMonitorService",
        "BalerEmptiedEventDataStoreService",
        "BaleTypesService",
        "PictureSrvc"
    ];

    BalerEmptiedEvents: Array<BalerEmptiedEvent> = [
        { _id: undefined, baleType: {_id: undefined, material: "PAP4", type: "OCC", gui: "Cardboard", min: 1200, max: 1300, currentType: false}, weight: 740, baleDate : new Date(2016, 3,  4, 15, 12, 32), transmitted: false},
        { _id: undefined, baleType: {_id: undefined, material: "PAP2", type: "OCC", gui: "Cardboard", min: 1200, max: 1300, currentType: false}, weight: 720, baleDate : new Date(2016, 3,  3, 14, 26, 32), transmitted: false},
        { _id: undefined, baleType: {_id: undefined, material: "PAP3", type: "OCC", gui: "Cardboard", min: 1200, max: 1300, currentType: false}, weight: 730, baleDate : new Date(2016, 3,  3, 11, 46, 11), transmitted: false},
        { _id: undefined, baleType: {_id: undefined, material: "PAP1", type: "OCC", gui: "Cardboard", min: 1200, max: 1300, currentType: false}, weight: 701, baleDate : new Date(2016, 30, 2, 18, 33, 46), transmitted: false},
        { _id: undefined, baleType: {_id: undefined, material: "PAP0", type: "OCC", gui: "Cardboard", min: 1200, max: 1300, currentType: false}, weight: 700, baleDate : new Date(2016, 3,  1, 11, 24, 40), transmitted: false},
    ];

    constructor(private $log: ng.ILogService,
                private loadCellMonitorService: LoadCellMonitorService,
                private balerEmptiedEventDataStoreService: BalerEmptiedEventDataStore,
                private baleTypesService: BaleTypesService,
                private pictureService: PictureSrvc) {
        loadCellMonitorService.on("BalerEmptiedEvent", (maxWeight, currentWeight) => {
          this.$log.debug("got BalerEmptied event max: " + maxWeight + " current: " + currentWeight);
          this.takePicture();
          baleTypesService.getCurrentBaleType()
          .then((currentBaleType: BaleType) => {
            let balerEmptiedEvent: BalerEmptiedEvent = {
              baleType: currentBaleType,
              weight: maxWeight,
              baleDate : new Date(),
              transmitted: false
            };
            balerEmptiedEventDataStoreService.insertRowPromise(balerEmptiedEvent);
          })
          .then(() => {
            this.$log.debug("Successfully inserted new Row for balerEmptiedEvent");
          })
          .catch((exception) => {
            this.$log.error("balerEmptiedEventDataStoreService.insertRowPromise failed: " + exception);
          })
          .done();
        });
    }

    takePicture(): void {
      this.pictureService.width = 1920;
      this.pictureService.height = 1080;

      this.$log.debug("about to call takePicturePromise()");
      this.pictureService.takePicturePromise("./images/test.jpg")
      .then((returnCode: number) => {
        this.$log.debug("Got return code of: " + returnCode + " from takePicturePomise");
      }).catch((exception) => {
        this.$log.error("Received exception taking picture");
      }).done();


      this.pictureService.takePicture("./images/test.jpg",
        (pathname, err) => {
          if (err) {
            this.$log.error(err);
          }
          else {
            // record pathname to database ...
            PictureSrvc.deletePicture(pathname);
          }
        }
      );

    }

}
