import {BaleType} from "./BaleType";


export interface BaleEvent {
    _id?: string;
    baleType: BaleType;
    weight: number;
    baleDate: Date;
    transmitted: boolean;
};
