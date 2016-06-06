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

    public getMaterialList(): q.Promise<String[]> {
        return this.baleTypesDataStoreService.initializeDataStore();
    }
}
