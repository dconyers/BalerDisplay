import NeDBDataStore = require("nedb");
import {BalerEmptiedEvent} from "./BalerEmptiedEvent";
import * as q from "q";
import * as Persistence from "../persistence/PersistentDataStore";

export class BalerEmptiedEventDataStore extends Persistence.PersistentDataStore<BalerEmptiedEvent> {

    static $inject: string[] = [
        "$log",
    ];

    private initialized: boolean = false;

    constructor(private $log: ng.ILogService) {
            super("BalerEmptiedEvents");
    };

    /**
     * Method initializes the data store by loading the database, counting the number
     * of rows and seeding it with data if necessary
     * @return {q.Promise<any>} [description]
     */
    initializeDataStore(): q.Promise<any> {
      this.$log.debug("top of BalerEmptiedEventDataStore::initializeDataStore()");
        if (this.initialized) {
            return this.loadDataPromise({createdAt: -1}, 10);
        }
        return this.loadDatabasePromise()
            .then(() => {
                this.initialized = true;
                return this.loadDataPromise({createdAt: -1}, 10);
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

};
