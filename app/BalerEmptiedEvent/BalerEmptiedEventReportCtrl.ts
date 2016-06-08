import {BaleTypesDataStore} from "../BaleTypes/BaleTypesDataStore";
import {BalerEmptiedEvent} from "./BalerEmptiedEvent";
import {BalerEmptiedEventService} from "./BalerEmptiedEventService";
import {BalerEmptiedEventDataStore} from "./BalerEmptiedEventDataStore";
import {LoadCellMonitorService} from "../services/LoadCellMonitorService";
import {QRService} from "../services/QRService";


export class BalerEmptiedEventReportCtrl {

    static $inject: string[] = [
        "$scope",
        "$log",
        "BalerEmptiedEventService",
        "BalerEmptiedEventDataStoreService",
        "LoadCellMonitorService",
        "Lightbox",
        "QRService"
    ];

    lightboxArray = [];

    constructor(private $scope: ng.IScope,
                private $log: ng.ILogService,
                private balerEmptiedEventService: BalerEmptiedEventService,
                private balerEmptiedEventDataStoreService: BalerEmptiedEventDataStore,
                private loadCellMonitorService: LoadCellMonitorService,
                private Lightbox,
                private QRService) {
        this.$log.debug("Top of BalerEmptiedEventReportCtrl constructor");
    }

    public openLightboxModal(index: number) {
      this.Lightbox.openModal(this.balerEmptiedEventDataStoreService.balerEmptiedEvents, index);
    }

    public printBaleEvent(e: BalerEmptiedEvent) {
      this.QRService.createLabelImage(e).then((path: string) => {
        this.QRService.printLabelImage(path);
      });
    }
}
