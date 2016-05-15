import NeDBDataStore = require("nedb");
import {BalerWorker} from "./BalerWorker";
import * as q from "q";
import * as Persistence from "../persistence/PersistentDataStore";

export class WorkersDataStore extends Persistence.PersistentDataStore<BalerWorker> {

    static $inject: string[] = [
        "$log",
    ];

    private initialized: boolean = false;

    constructor(private $log: ng.ILogService) {
        super("BalerWorkers");
        this.initializeDataStore(true);
        $log.debug("top of WorkersDataStore constructor");
    };

    public initializeDataStore(seedData?: boolean): q.Promise<any> {
        this.$log.debug("Top of WorkersDataStore::initializeDataStore");
        if (this.initialized) {
            this.$log.debug("WorkersDataStore::initializeDataStore - already inited, skipping.");
            return this.loadDataPromise()
                .then((retVal: Array<BalerWorker>) => {
                    return retVal.sort((a: BalerWorker, b: BalerWorker) => {
                        if (a.username === undefined)
                            return 1;
                        return a.username.localeCompare(b.username);
                    });
                });
        }
        return this.loadDatabasePromise()
            .then((): q.Promise<number> => {
                return this.countAllRows();
            })
            .then((return_val: number) => {
                if (return_val === 0 && seedData) {
                    return this.insertInitializationData();
                }
            })
            .then(() => {
                this.initialized = true;
                return this.loadDataPromise();
            })
            .then((retVal: Array<BalerWorker>) => {
                return retVal.sort((a: BalerWorker, b: BalerWorker) => {
                    if (a.username === undefined)
                        return 1;
                    return a.username.localeCompare(b.username);
                });
            });
    }

    getInitData(): Array<BalerWorker> {
        return [
            { _id: undefined, username: "doug", pin: 1234, current: true },
            { _id: undefined, username: "ed", pin: 1234, current: false },
            { _id: undefined, username: "nick", pin: 1234, current: false },
            { _id: undefined, username: "ben", pin: 1234, current: false },
            { _id: undefined, username: "shafiq", pin: 1234, current: false },
            { _id: undefined, username: "jason", pin: 1234, current: false },
        ];
    };

};
