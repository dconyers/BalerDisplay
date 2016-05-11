import NeDBDataStore = require("nedb");
import {User} from "./User";
import * as q from "q";
import * as Persistence from "../persistence/PersistentDataStore";

export class UsersDataStore extends Persistence.PersistentDataStore<User> {

    static $inject: string[] = [
        "$log",
    ];

    private initialized: boolean = false;

    constructor(private $log: ng.ILogService) {
            super("Users");
            this.initializeDataStore(true);
            $log.debug("top of UsersDataStore constructor");
    };

    public initializeDataStore(seedData?: boolean): q.Promise<any> {
        this.$log.debug("Top of UsersDataStore::initializeDataStore");
        if (this.initialized) {
            this.$log.debug("UsersDataStore::initializeDataStore - already inited, skipping.");
            return this.loadDataPromise()
                .then((retVal: Array<User>) => {
                        return retVal.sort((a: User, b: User) => {
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
            .then((retVal: Array<User>) => {
                return retVal.sort((a: User, b: User) => {
                if (a.username === undefined)
                  return 1;
                  return a.username.localeCompare(b.username);
                });
            });
    }

    getInitData(): Array<User> {
        return [
        {_id: undefined, username: "doug", pin: 1234},
        {_id: undefined, username: "ed", pin: 1234},
        {_id: undefined, username: "nick", pin: 1234},
        {_id: undefined, username: "ben", pin: 1234},
        {_id: undefined, username: "shafiq", pin: 1234},
        {_id: undefined, username: "jason", pin: 1234},
        ];
    };

};
