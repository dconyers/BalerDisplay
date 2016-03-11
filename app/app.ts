import { BalerCtrl } from "./balerCtrl";
import { BalerStatsPanel } from "./BalerStatsPanel/BalerStatsPanel";
import {LocalizationProvider} from "./Localization/LocalizationProvider";
import {LocalizationChooser} from "./Localization/LocalizationChooser";

angular.module("balerApp", ["modal-dialog", "pascalprecht.translate"])
    .config(["$translateProvider", LocalizationProvider])
    .controller("BalerCtrl", BalerCtrl)
    .directive("balerStatsPanel", BalerStatsPanel)
    .directive("localizationChooser", LocalizationChooser)
;
