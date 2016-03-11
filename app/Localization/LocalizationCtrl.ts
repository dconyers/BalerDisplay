"use strict";

export function LocalizationCtrl($translate) {
    this.$inject = ["$translateProvider"];
    this.selectLanguage = function(language: String) {
        console.log("selectLanguage called with " + language);
        $translate.use(language);
    };
};
