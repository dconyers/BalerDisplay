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
            this.$log.debug("getCurrentWorker return: " + retVal);
            return retVal;
        }).catch((exception: any) => {
                this.$log.error("Really Got exception: "  + exception);
                return exception;
        });
    }

    public getMaterialList(): q.Promise<String[]> {
        return this.workersDataStoreService.initializeDataStore();
    }
}
