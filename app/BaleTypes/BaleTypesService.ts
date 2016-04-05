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
        $log.debug("Top of BaleTypsService constructor");
    }

    public getCurrentBaleType(): q.Promise<BaleType> {
        // return this.baleTypesDataStoreService.findOne({currentType: true});

        return q.Promise<BaleType>((resolve, reject) => {
            let baleType: BaleType = {material: "Doug", type: "Doug", gui: "Doug", min: 1, max: 13, currentType: false };
            resolve(baleType);
        });
    }

    public getMaterialList(): q.Promise<String[]> {
        // return q.Promise<String[]>((resolve, reject) => {
        //     resolve(["a", "b", "c"]);
        // });

        return this.baleTypesDataStoreService.initializeDataStore();

    }
}
