import * as q from "q";
import {BalerWorker} from "./BalerWorker";
import {WorkersDataStore} from "./WorkersDataStore";
import {WorkersService} from "./WorkersService";
import {WorkerSelectorService} from "./WorkerSelectorService";

export class WorkerSettingsCtrl {

  static $inject: string[] = [
        "$scope",
        "$log",
        "$filter",
        "$http",
        "$q",
        "WorkersDataStoreService",
        "WorkersService",
        "WorkerSelectorService"
    ];

    constructor(private $scope,
                private $log: ng.ILogService,
                private $filter,
                private $http,
                private $q,
                private workersDataStore: WorkersDataStore,
                public workersService: WorkersService,
                private workerSelectorService: WorkerSelectorService) {
    }

    saveWorker(data: BalerWorker, id: any): q.Promise<any> {
        this.$log.debug("got save request for id: " + id);
        angular.extend(data, {_id: id});
        this.$log.debug(data);
        return this.workersDataStore.updateRowPromise(id, { $set: data} , {})
        .then((updateCount: number): any => {
            this.$log.debug("updated row count: " + updateCount);
            if (updateCount !== 1) {
                return "Error, Expected updateCount of 1, got: " + updateCount;
            }
            return this.workersService.reloadWorkers();
        });
    }

    // remove user
    removeWorker(id: any): q.Promise<any> {
        this.$log.debug("got delete request for id: " + id);
        return this.workersDataStore.deleteRowWithIDPromise(id)
        .then((deleteCount: number): any => {
            this.$log.debug("deleted row count: " + deleteCount);
            if (deleteCount !== 1) {
                return "Error, Expected deleteCount of 1, got: " + deleteCount;
            }
            return this.workersService.reloadWorkers();
        });
    }

    // add Bale Type
    addWorker() {
        let inserted: BalerWorker = {
            _id: undefined,
            username: "",
            pin: 0,
            current: false
        };
        this.workersDataStore.insertRowPromise(inserted)
        .then((): any => {
            return this.workersService.reloadWorkers();
        }).catch(function(error) {
            this.$log.error("addWorker returned error: " + error);
        }).done();
    }

    public currentWorkerChangeRequest(newCurrentID: string): q.Promise<any> {
      this.$log.debug("top of currentWorkerChangeRequest: " + newCurrentID);
      this.$log.debug(newCurrentID);
      return this.workersService.changeCurrentWorker(newCurrentID);
    }
}
