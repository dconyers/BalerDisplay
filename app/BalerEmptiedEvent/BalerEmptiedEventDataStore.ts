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


    sort(a: BalerEmptiedEvent, b: BalerEmptiedEvent): number {
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
                .then((retVal: Array<BalerEmptiedEvent>) => {
                        return retVal.sort( (a, b): number => { return this.sort(a, b); });
                });
        }
        return this.loadDatabasePromise()
            .then(() => {
                this.initialized = true;
                return this.loadDataPromise();
            })
            .then((retVal: Array<BalerEmptiedEvent>) => {
                return retVal.sort( (a, b): number => { return this.sort(a, b); });
            });
    }

    getInitData(): Array<BalerEmptiedEvent> {
        return [];
    };

};
