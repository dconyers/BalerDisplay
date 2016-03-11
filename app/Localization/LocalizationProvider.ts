"use strict";

import { ITranslateProvider, ITranslateService } from "angular-translate";
import * as en_us from "./en_us";


export const LocalizationProvider = (provider: ITranslateProvider): any => {
    return provider
        .preferredLanguage("en_us")
        .useSanitizeValueStrategy("escape")
        .translations("en_us", en_us)
        ;
};
