import NeDBDataStore = require("nedb");
import * as q from "q";

export abstract class PersistentDataStore<T> extends NeDBDataStore {
    constructor(filenamePrefix: string) {
            super(PersistentDataStore.getOptions(filenamePrefix));
            // console.log("Before calling loadDatabase");
            // this.loadDatabase(this.onload);
            // console.log("After  calling loadDatabase");
    };

    abstract getInitData(): Array<T>;

    static getOptions(filenamePrefix: string): NeDB.DataStoreOptions {
        PersistentDataStore.options["filename"] = filenamePrefix + ".db";
        return PersistentDataStore.options;
    };

    static options: NeDB.DataStoreOptions = {
        inMemoryOnly : false,
        autoload : false,
    };

    onload = (error: Error) => {
        console.log("top of onload callback");
        if (error === null) {
            this.count({}, (err, cnt) => {
                if (err !== null) {
                    console.log("count returned error: " + err);
                }
                if (cnt === 0) {
                    console.log("Database is empty, initializing...");
                    console.log("Before calling insert");
                    this.insert<Array<T>>(this.getInitData(), (err) => {
                        console.log("Insert returned error: " + err);
                    });
                    console.log("After calling insert");
                }
            });
        }
    };

    deleteRow(stuff: any) {
        console.log("deleteRow called");
    }

    insertRow(stuff: any) {
        console.log("insertRow called");
    }

    updateRow(stuff: any) {
        console.log("updateRow called");
    }

    loadDatabasePromise(): q.Promise<void> {
        let myLoadDatabase: () => q.Promise<void> = q.nbind<void>(this.loadDatabase, this);
        return myLoadDatabase();
    }

    // insert<T>(newDoc:T, cb?:(err:Error, document:T)=>void):void;
    insertInitializationData(): q.Promise<Array<T>> {
        let myInitDatabase: (data: Array<T>) => q.Promise<Array<T>> = q.nbind<Array<T>>(this.insert, this);
        return myInitDatabase(this.getInitData());
    }

    loadData(): q.Promise<Array<T>> {
        let find: (query: any) => q.Promise<Array<T>> = q.nbind<Array<T>>(this.find, this);
        return find({});
    }

    // count(query:any, callback:(err:Error, n:number)=>void):void;
    countAllRows(): q.Promise<number> {
        let count: (query: any) => q.Promise<number> = q.nbind<number>(this.count, this);
        return count({});
    }
};
