import {BaleTypesDataStore} from "./BaleTypesDataStore";
import {BaleType} from "./BaleType";
import * as q from "q";

export class BaleTypesService {

    static $inject: string[] = [
        "$log",
        "BaleTypesDataStoreService",
    ];

    constructor(private $log: ng.ILogService,
                private baleTypesDataStoreService: BaleTypesDataStore) {
        $log.debug("Top of BaleTypesService constructor");
    }

    public getCurrentBaleType(): q.Promise<BaleType> {
        return this.baleTypesDataStoreService.findOnePromise({currentType: true}).then((retVal: BaleType) => {
            return retVal;
        }).catch((exception: any) => {
                this.$log.error("Really Got exception: "  + exception);
                return exception;
        });
    }

    public getMaterialList(): q.Promise<String[]> {
        return this.baleTypesDataStoreService.initializeDataStore();
    }
}
