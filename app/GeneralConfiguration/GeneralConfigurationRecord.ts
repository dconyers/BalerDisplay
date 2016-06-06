
export interface GeneralConfigurationRecord {
    _id?: string;
    createdAt?: Date;
    key: string;
    value: string;
};

export const MIN_BALE_DECREASE: string = "MIN_BALE_DECREASE";
export const MIN_BALE_DECREASE_DEFAULT: string = "200";

export const CUSTOMER_ID: string = "CUSTOMER_NAME";
export const CUSTOMER_ID_DEFAULT: string = "Customer_ID";

export const BALER_ID: string = "BALER_ID";
export const BALER_ID_DEFAULT: string = "Baler_ID";
