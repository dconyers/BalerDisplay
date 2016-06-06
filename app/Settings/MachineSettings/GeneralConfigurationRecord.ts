
export interface GeneralConfigurationRecord {
    _id?: string;
    createdAt?: Date;
    key: string;
    value: string;
};

export const MIN_BALE_DECREASE: string = "MIN_BALE_DECREASE";
export const MIN_BALE_DECREASE_DEFAULT: string = "200";
