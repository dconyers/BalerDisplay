import {WorkersDataStore} from "./WorkersDataStore";
import {BalerWorker} from "./BalerWorker";
import * as q from "q";

export class WorkersService {

    static $inject: string[] = [
        "$log",
        "WorkersDataStoreService",
    ];

    constructor(private $log: ng.ILogService,
                private workersDataStoreService: WorkersDataStore) {
        $log.debug("Top of WorkersService constructor");
    }

    public getCurrentWorker(): q.Promise<BalerWorker> {
        return this.workersDataStoreService.findOnePromise({current: true}).then((retVal: BalerWorker) => {
            return retVal;
        }).catch((exception: any) => {
                this.$log.error("getCurrentWorker got exception: "  + exception);
                return exception;
        });
    }

    public getMaterialList(): q.Promise<String[]> {
        return this.workersDataStoreService.initializeDataStore();
    }

    public changeCurrentWorker(newCurrentID: string): q.Promise<BalerWorker> {

      this.$log.debug("top of currentWorkerChangeRequest: " + newCurrentID);
      this.$log.debug(newCurrentID);
      return this.getCurrentWorker().then((currentWorker: BalerWorker) => {
        this.$log.debug("currentWorkerChangeRequest::got current bale type: " + currentWorker.username);
        this.workersDataStoreService.updateRowPromise(currentWorker._id, { $set: { current: false } }, {});
        this.$log.debug("currentWorkerChangeRequest::done uploading old row");
      }).then(() => {
        this.$log.debug("currentWorkerChangeRequest::uploading new row");
        return this.workersDataStoreService.updateRowPromise(newCurrentID, { $set: { current: true } }, {});
      }).then(() => {
        return this.getCurrentWorker();
      }).catch((exception: any) => {
        this.$log.error("balerCtrl::currentWorkerChangeRequest Got exception" + exception);
        return exception;
      });

    }
}
