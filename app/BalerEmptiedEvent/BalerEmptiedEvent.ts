import {BaleType} from "../BaleTypes/BaleType";


export interface BalerEmptiedEvent {
    _id?: string;
    baleType: BaleType;
    weight: number;
    baleDate: Date;
    transmitted: boolean;
};
