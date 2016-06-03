import {BaleType} from "../BaleTypes/BaleType";
import {BalerWorker} from "../Settings/WorkerSettings/BalerWorker";


export interface BalerEmptiedEvent {
    _id?: string;
    createdAt?: Date;
    baleID: number;
    baleType: BaleType;
    weight: number;
    baleDate: Date;
    transmitted: boolean;
    photoPath: string;
    worker: BalerWorker;
};
