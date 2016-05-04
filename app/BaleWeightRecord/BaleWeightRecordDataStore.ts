import NeDBDataStore = require("nedb");
import {BaleWeightRecord} from "./BaleWeightRecord";
import * as q from "q";
import * as Persistence from "../persistence/PersistentDataStore";

export class BaleWeightRecordDataStore extends Persistence.PersistentDataStore<BaleWeightRecord> {

    static $inject: string[] = [
        "$log",
    ];

    private initialized: boolean = false;

    constructor(private $log: ng.ILogService) {
            super("BaleWeightRecords");
    };


    sort(a: BaleWeightRecord, b: BaleWeightRecord): number {
      if ((a.createdAt === undefined) || (a.createdAt === null))
        return 1;
      return a.createdAt.valueOf() - b.createdAt.valueOf();
    }

    /**
     * Method initializes the data store by loading the database, counting the number
     * of rows and seeding it with data if necessary
     * @return {q.Promise<any>} [description]
     */
    initializeDataStore(): q.Promise<any> {
        if (this.initialized) {
            return this.loadDataPromise()
                .then((retVal: Array<BaleWeightRecord>) => {
                        return retVal.sort( (a, b): number => { return this.sort(a, b); });
                });
        }
        return this.loadDatabasePromise()
            .then((): q.Promise<void> => {
                // DEC: 2016-05-02 This should be unnecessary, but is required due to a bug
                // in nedb. The indexes are persisted in the main datastore file, but when they
                // are restored, the ttl (expireAfterSeconds) attribute is lost. By removing
                // the index and re-adding it, this issue is avoided.
                return this.removeIndexPromise("createdAt");
            })
            .then((): q.Promise<void> => {
              return this.ensureIndexPromise({ fieldName: "createdAt", expireAfterSeconds: 10 });
            })
            .then(() => {
                this.initialized = true;
                return this.loadDataPromise();
            })
            .then((retVal: Array<BaleWeightRecord>) => {
                return retVal.sort( (a, b): number => { return this.sort(a, b); });
            });
    }

    getInitData(): Array<BaleWeightRecord> {
        return [];
    };

};
