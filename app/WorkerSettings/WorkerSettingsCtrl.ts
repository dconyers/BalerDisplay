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

    workers: Array<BalerWorker> = [];
    currentWorker: BalerWorker = undefined;

    constructor(private $scope,
                private $log: ng.ILogService,
                private $filter,
                private $http,
                private $q,
                private workersDataStore: WorkersDataStore,
                private workersService: WorkersService,
                private workerSelectorService: WorkerSelectorService) {
                  this.reloadWorkers();
    }


    reloadWorkers(): void {
        this.$log.debug("top of reloadWorkers");
        this.workersDataStore.initializeDataStore()
            .then((return_val: Array<BalerWorker>): void => {
                return this.$q((resolve): void => {
                    this.workers = return_val;
                    this.$log.debug("workers updated");
                    resolve();
                    this.$scope.$apply();
                });
            }).catch(function(error) {
                this.$log.error("Got error from find_synch: " + error);
            }).done();

        this.workersService.getCurrentWorker()
            .then((worker: BalerWorker) => {
                this.$log.debug("getCurrentWorker promise returned: " + worker);
                this.$log.debug(worker);
                this.currentWorker = worker;
                this.$scope.$apply();
            }).done();

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
            return true;
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
            return this.reloadWorkers();
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
            return this.reloadWorkers();
        }).catch(function(error) {
            this.$log.error("addWorker returned error: " + error);
        }).done();
    }

    public currentWorkerChangeRequest(newCurrentID: string): q.Promise<any> {
        this.$log.debug("top of currentWorkerChangeRequest: " + newCurrentID);
        this.$log.debug(newCurrentID);
      return this.workersService.getCurrentWorker().then((currentWorker: BalerWorker) => {
          this.$log.debug("currentWorkerChangeRequest::got current bale type: " + currentWorker.username);
          this.workersDataStore.updateRowPromise(currentWorker._id, { $set: { current: false } }, {});
          this.$log.debug("currentWorkerChangeRequest::done uploading old row");
      }).then(() => {
        this.$log.debug("currentWorkerChangeRequest::uploading new row");
        return this.workersDataStore.updateRowPromise(newCurrentID, { $set: { current: true } }, {});
      }).then(() => {
          this.reloadWorkers();
      }).catch((exception: any) => {
        this.$log.error("balerCtrl::currentWorkerChangeRequest Got exception" + exception);
        return exception;
      });
    }



}
