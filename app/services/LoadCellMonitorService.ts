
export class LoadCellMonitorService {

    static $inject: string[] = [
        "$log",
        "$interval"
    ];

    constructor(private $log: ng.ILogService, private $interval: ng.IIntervalService) {
        $log.debug("LoadCellMonitorService Constructor");
        this.$interval(() => this.doStuff(), 1000);
    }

    private doStuff(): void {
        this.$log.debug("doing Stuff");
    }
}
