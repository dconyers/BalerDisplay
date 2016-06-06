import NeDBDataStore = require("nedb");
import {BalerEmptiedEvent} from "./BalerEmptiedEvent";
import * as q from "q";
import * as Persistence from "../persistence/PersistentDataStore";

export class BalerEmptiedEventDataStore extends Persistence.PersistentDataStore<BalerEmptiedEvent> {

    private static CACHED_ROW_COUNT: number = 10;

    static $inject: string[] = [
        "$log",
    ];

    private initialized: boolean = false;

    constructor(private $log: ng.ILogService) {
            super("BalerEmptiedEvents");
    };

    balerEmptiedEvents: Array<BalerEmptiedEvent>;

    /**
     * Method initializes the data store by loading the database, counting the number
     * of rows and seeding it with data if necessary
     * @return {q.Promise<any>} [description]
     */
    initializeDataStore(): q.Promise<any> {
      this.$log.debug("top of BalerEmptiedEventDataStore::initializeDataStore()");
        if (this.initialized) {
            return this.loadDataPromise({createdAt: -1}, BalerEmptiedEventDataStore.CACHED_ROW_COUNT);
        }
        return this.loadDatabasePromise()
            .then(() => {
                this.initialized = true;
                return this.loadDataPromise({createdAt: -1}, BalerEmptiedEventDataStore.CACHED_ROW_COUNT);
            });
    }

    loadDataPromise(sortParam?: any, limit?: number): q.Promise<Array<BalerEmptiedEvent>> {
      this.$log.debug("BalerEmptiedEventDataStore::loadDataPromise called");
      return super.loadDataPromise(sortParam, limit)
      .then((returnVal: Array<BalerEmptiedEvent>) => {
        this.balerEmptiedEvents = returnVal;
        return returnVal;
      });
    }


    getInitData(): Array<BalerEmptiedEvent> {
        return [];
    };

    getNextBaleIDPromise(): q.Promise<number> {
      return this.loadDataPromise({baleID: -1}, 1)
      .then((baleEvents: Array<BalerEmptiedEvent>) => {
        this.$log.debug("getNextBaleIDPromise returned array of size: " + baleEvents.length);
        if (baleEvents.length < 1 || baleEvents[0].baleID === null) {
          this.$log.debug("getNextBaleIDPromise got 0 length or null value for baleID, setting to 0");
          return 0;
        }
        this.$log.debug("getNextBaleIDPromise got id: " + baleEvents[0].baleID);
        return baleEvents[0].baleID + 1;
      });
    };

    insertRowPromise(newRow: BalerEmptiedEvent): q.Promise<BalerEmptiedEvent> {
      return super.insertRowPromise(newRow)
      .then((event: BalerEmptiedEvent) => {
        // Since the update occurred, reload the data (asynchronous)
        this.loadDataPromise({createdAt: -1}, BalerEmptiedEventDataStore.CACHED_ROW_COUNT);
        return event;
      });
    }

    updateRowPromise(id: any, updated: any, options: NeDB.UpdateOptions): q.Promise<number> {
      return super.updateRowPromise(id, updated, options)
      .then((rowCount: number) => {
        // Since the update occurred, reload the data (asynchronous)
        this.loadDataPromise({createdAt: -1}, BalerEmptiedEventDataStore.CACHED_ROW_COUNT);
        return rowCount;
      });
    }


};
