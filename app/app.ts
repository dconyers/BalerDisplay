import { BalerCtrl } from "./balerCtrl";
import { BalerStatsPanel } from "./BalerStatsPanel/BalerStatsPanel";

angular.module("balerApp", ["modal-dialog"])
    .controller("BalerCtrl", BalerCtrl)
    .directive("balerStatsPanel", BalerStatsPanel)
;
