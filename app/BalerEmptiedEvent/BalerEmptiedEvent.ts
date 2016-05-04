import {BaleType} from "../BaleTypes/BaleType";


export interface BalerEmptiedEvent {
    _id?: string;
    createdAt?: Date;
    baleType: BaleType;
    weight: number;
    baleDate: Date;
    transmitted: boolean;
};
