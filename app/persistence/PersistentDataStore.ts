import NeDBDataStore = require("nedb");
import * as q from "q";

export abstract class PersistentDataStore<T> extends NeDBDataStore {
    constructor(filenamePrefix: string) {
            super(PersistentDataStore.getOptions(filenamePrefix));
    };

    abstract getInitData(): Array<T>;

    static getOptions(filenamePrefix: string): NeDB.DataStoreOptions {
        PersistentDataStore.options["filename"] = filenamePrefix + ".db";
        return PersistentDataStore.options;
    };

    static options: any = {
        inMemoryOnly : false,
        autoload : false,
        timestampData: true,
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

    deleteRow(id: any) {
        console.log("deleteRow called");
        let myDelete: (query: any) => q.Promise<number> = q.nbind<number>(this.remove, this);
        return myDelete({"_id": id});
    }

    insertRowPromise(newRow: T): q.Promise<void> {
        let insertPromise: (newRow: T) => q.Promise<void> = q.nbind<void>(this.insert, this);
        return insertPromise(newRow);
    }


    updateRowPromise(id: any, updated: any, options: NeDB.UpdateOptions): q.Promise<number> {
        let updatePromise: (query: any, updated: any, options?: NeDB.UpdateOptions) => q.Promise<number> = q.nbind<number>(this.update, this);
        return updatePromise({"_id": id}, updated, options);
    }

    loadDatabasePromise(): q.Promise<void> {
        let myLoadDatabase: () => q.Promise<void> = q.nbind<void>(this.loadDatabase, this);
        return myLoadDatabase();
    }

    ensureIndexPromise(options: NeDB.EnsureIndexOptions): q.Promise<void> {
      let myEnsureIndex: (options: NeDB.EnsureIndexOptions) => q.Promise<void> = q.nbind<void>(this.ensureIndex, this);
      return myEnsureIndex(options);
    }

    removeIndexPromise(fieldName: string): q.Promise<void> {
      let myRemoveIndex: (fieldName: string) => q.Promise<void> = q.nbind<void>(this.removeIndex, this);
      return myRemoveIndex(fieldName);
    }

    // insert<T>(newDoc:T, cb?:(err:Error, document:T)=>void):void;
    insertInitializationData(): q.Promise<Array<T>> {
        let myInitDatabase: (data: Array<T>) => q.Promise<Array<T>> = q.nbind<Array<T>>(this.insert, this);
        return myInitDatabase(this.getInitData());
    }

    loadDataPromise(): q.Promise<Array<T>> {
        let find: (query: any) => q.Promise<Array<T>> = q.nbind<Array<T>>(this.find, this);
        return find({});
    }

    findOnePromise(query: any): q.Promise<T> {
        let findOnePromise: (query: any) => q.Promise<T> = q.nbind<T>(this.findOne, this);
        return findOnePromise(query);
    }

    // count(query:any, callback:(err:Error, n:number)=>void):void;
    countAllRows(): q.Promise<number> {
        let count: (query: any) => q.Promise<number> = q.nbind<number>(this.count, this);
        return count({});
    }
};
