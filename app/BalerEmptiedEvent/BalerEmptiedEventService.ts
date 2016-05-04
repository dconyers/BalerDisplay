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

      const tmp = require("tmp");
      let tmpName = tmp.tmpNameSync({template: "./photos/capture-XXXXXX"});
      this.$log.debug("Temp Name is: " + tmpName);
    }

}
