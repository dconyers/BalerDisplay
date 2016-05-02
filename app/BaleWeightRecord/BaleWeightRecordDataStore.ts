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
            $log.debug("top of BaleWeightRecordDataStore constructor");
    };


    sort(a: BaleWeightRecord, b: BaleWeightRecord): number {
      // this.$log.debug("Comparing: " + a.createdAt + " and: " + b.createdAt);
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
        this.$log.debug("Top of BaleWeightRecordDataStore::initializeDataStore");
        if (this.initialized) {
            console.debug("BaleWeightRecordDataStore::initializeDataStore - already inited, skipping.");
            return this.loadDataPromise()
                .then((retVal: Array<BaleWeightRecord>) => {
                        return retVal.sort( (a, b): number => { return this.sort(a, b); });
                });
        }
        this.$log.debug("BaleWeightRecordDataStore::initializeDataStore - initializing.");
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
            .then((): q.Promise<number> => {
              return this.countAllRows();
            })
            .then((return_val: number) => {
                console.log("got back row count of: " + return_val);
                if (return_val === 0) {
                    return this.insertInitializationData();
                }
            })
            .then(() => {
                this.initialized = true;
                return this.loadDataPromise()
                    .then((retVal: Array<BaleWeightRecord>) => {
                            return retVal.sort( (a, b): number => { return this.sort(a, b); });
                    });
            });
    }

    getInitData(): Array<BaleWeightRecord> {
        return [];
    };

};
