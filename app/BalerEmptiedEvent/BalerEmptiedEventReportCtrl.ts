import {BaleTypesDataStore} from "../BaleTypes/BaleTypesDataStore";
import {BalerEmptiedEvent} from "./BalerEmptiedEvent";
import {BalerEmptiedEventService} from "./BalerEmptiedEventService";
import {BalerEmptiedEventDataStore} from "./BalerEmptiedEventDataStore";
import {LoadCellMonitorService} from "../services/LoadCellMonitorService";


export class BalerEmptiedEventReportCtrl {

    static $inject: string[] = [
        "$scope",
        "$log",
        "BalerEmptiedEventService",
        "BalerEmptiedEventDataStoreService",
        "LoadCellMonitorService",
        "Lightbox"
    ];

    lightboxArray = [];

    constructor(private $scope: ng.IScope,
                private $log: ng.ILogService,
                private balerEmptiedEventService: BalerEmptiedEventService,
                private balerEmptiedEventDataStoreService: BalerEmptiedEventDataStore,
                private loadCellMonitorService: LoadCellMonitorService,
                private Lightbox) {
        this.$log.debug("Top of BalerEmptiedEventReportCtrl constructor");
    }

    public openLightboxModal(index: number) {
/*      this.lightboxArray = this.balerEmptiedEvents.map(e => {
        return {
          'url': e.photoPath,
          'caption': "Bale Date: " + e.baleDate.toLocaleDateString("en-US") +
                     " Bale Time: " + e.baleDate.toLocaleTimeString("en-US") +
                     " Material Type: " + e.baleType.gui +
                     " Weight: " + e.weight +
                     " Transmitted?: " + e.transmitted
          'url': e.photoPath,
          'caption': '<p>TEST</p>'`
<table>
<tr>
<td>Bale Date: ${e.baleDate.toLocaleDateString("en-US")}</td>
<td>Bale Time: ${e.baleDate.toLocaleTimeString("en-US")}</td>
<td>Material Type: ${e.baleType.gui}</td>
<td>Weight: ${e.weight}</td>
<td>Transmitted?: ${e.transmitted}</td>
</tr>
</table>
`
        };
      });*/
      this.Lightbox.openModal(this.balerEmptiedEventService.balerEmptiedEvents, index);
    }
}