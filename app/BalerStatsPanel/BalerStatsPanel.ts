"use strict";

import { BalerCtrl } from "../balerCtrl";


export function BalerStatsPanel() {
    return {
            restrict: "E",
            templateUrl: "./BalerStatsPanel/BalerStatsPanel.html",
            controller: BalerCtrl,
            controllerAs: "BalerCtrl"
    };
};
