import NeDBDataStore = require("nedb");
import * as GeneralConfiguration from  "./GeneralConfigurationRecord";
import * as q from "q";
import * as Persistence from "../persistence/PersistentDataStore";

export class GeneralConfigurationDataStore extends Persistence.PersistentDataStore<GeneralConfiguration.GeneralConfigurationRecord> {

    static $inject: string[] = [
        "$log",
    ];

    private initialized: boolean = false;

    constructor(private $log: ng.ILogService) {
            super("GeneralConfiguration");
            this.initializeDataStore(true);
    };

    generalConfig: Array<GeneralConfiguration.GeneralConfigurationRecord> = null;
    /**
     * Method initializes the data store by loading the database, counting the number
     * of rows and seeding it with data if necessary
     * @return {q.Promise<any>} [description]
     */
    initializeDataStore(seedData?: boolean): q.Promise<any> {
      if (this.initialized) {
        return this.loadDataPromise();
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
        });
    }

    loadDataPromise(sortParam?: any, limit?: number): q.Promise<Array<GeneralConfiguration.GeneralConfigurationRecord>> {
      return super.loadDataPromise(sortParam, limit)
      .then((returnVal: Array<GeneralConfiguration.GeneralConfigurationRecord>) => {
        this.generalConfig = returnVal;
        return returnVal;
      });
    }

    getInitData(): Array<GeneralConfiguration.GeneralConfigurationRecord> {
        return [
          {key: GeneralConfiguration.MIN_BALE_DECREASE, value: GeneralConfiguration.MIN_BALE_DECREASE_DEFAULT},
          {key: GeneralConfiguration.CUSTOMER_ID, value: GeneralConfiguration.CUSTOMER_ID_DEFAULT},
          {key: GeneralConfiguration.BALER_ID, value: GeneralConfiguration.BALER_ID_DEFAULT},
        ];
    };

    updateGeneralConfiguration(toBeSaved: GeneralConfiguration.GeneralConfigurationRecord): q.Promise<number> {
        let updatePromise: (query: any, updated: any, options?: NeDB.UpdateOptions) => q.Promise<number> = q.nbind<number>(this.update, this);
        let returnPromise: q.Promise<number> = updatePromise({"key": toBeSaved.key}, toBeSaved, {upsert: true});
        returnPromise.then(() => {
          this.loadDataPromise();
        });
        return returnPromise;
    }

    getGeneralConfigurationRecord(key: string): q.Promise<GeneralConfiguration.GeneralConfigurationRecord> {
      if (this.generalConfig !== null) {
        let result: GeneralConfiguration.GeneralConfigurationRecord = this.generalConfig.find(x => x.key === key)
        return q.fcall(() => {return result; });
      }
      return this.loadDataPromise()
      .then(() => {
        return this.getGeneralConfigurationRecord(key);
      });
    }
};
