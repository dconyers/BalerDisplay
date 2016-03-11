"use strict";

import { ITranslateProvider, ITranslateService } from "angular-translate";
import * as en_us from "./en_us";
import * as es_us from "./es_us";
import "angular-translate-handler-log";

export const LocalizationProvider = (provider: ITranslateProvider): any => {
    return provider
        .preferredLanguage("en_us")
        .useSanitizeValueStrategy("escape")
        .translations("en_us", en_us)
        .translations("es_us", es_us)
        .useMissingTranslationHandlerLog()
        .fallbackLanguage("en_us");
        ;
};
