import ITask from './Task';

export interface ITaskCollection {
    [targetId: string]: ITask
}

export interface ICompletedTasksCollection {
    [targetId: string]: ITask[]
}

export interface IExecutor {
    executeTask(task: ITask): Promise<void>
    start(): void
    stop(): void
}

export default class Executor implements IExecutor {
    constructor() {
        this.executeData = {
            running: {},
            completed: {},
            performanceData: []
        };

        this.performanceReport = {
            min: 0,
            max: 0,
            avg: 0
        };
    }

    public start() {
        this.executeData.running = {};
        this.executeData.completed = {};
        this.executeData.performanceData.length = 0;
        this.performanceReport.min = 0;
        this.performanceReport.max = 0;
        this.performanceReport.avg = 0;

        const now = process.hrtime.bigint();
        this.startedAt = now;
        this.prevPerformanceRecordedAt = now;
        this.recordPerformanceInterval = setInterval(() => this.recordPerformance(true), 10);
    }

    public stop() {
        // istanbul ignore if
        if (this.recordPerformanceInterval) {
            clearInterval(this.recordPerformanceInterval);
            this.recordPerformanceInterval = undefined;
        }

        const totalTime = Number(process.hrtime.bigint() - this.startedAt);

        this.performanceReport.min =
            this.executeData.performanceData
                .filter(record => !record.excludeFromMin)
                .reduce((min, record) => {
                    if (record.running.length < min) {
                        return record.running.length;
                    }
                    return min;
                }, Number.MAX_SAFE_INTEGER);

        this.performanceReport.max =
            this.executeData.performanceData.reduce((max, record) => {
                if (record.running.length > max) {
                    return record.running.length;
                }
                return max;
            }, 0);

        this.performanceReport.avg =
            this.executeData.performanceData.reduce((avg: number, record) => {
                return avg + record.running.length * record.time / totalTime;
            }, 0);
    }

    public async executeTask(task: ITask) {
        const running = this.executeData.running;
        const completed = this.executeData.completed;
        const targetId = task.targetId;

        if (running[targetId]) {
            throw new Error(`cannot execute task ${targetId}:` +
                `${task.action}: task with the same targetId=${targetId} is running`);
        }

        this.recordPerformance(true);

        running[targetId] = task;
        if (task._onExecute) {
            task._onExecute();
        }

        this.recordPerformance(true);

        switch (task.action) {
            case 'init': {
                await sleep(10 * (1 + targetId / 10));
                this.recordPerformance(false);
                await sleep(30 * (1 + targetId / 10));
                break;
            }
            case 'prepare': {
                await sleep(30 * (1 + targetId / 10));
                this.recordPerformance(false);
                await sleep(70 * (1 + targetId / 10));
                break;
            }
            case 'work': {
                await sleep(50 * (1 + targetId / 10));
                this.recordPerformance(false);
                await sleep(150 * (1 + targetId / 10));
                break;
            }
            case 'finalize': {
                await sleep(30 * (1 + targetId / 10));
                this.recordPerformance(false);
                await sleep(70 * (1 + targetId / 10));
                break;
            }
            default: {
                await sleep(25);
                this.recordPerformance(false);
                await sleep(25);
                break;
            }
        }

        this.recordPerformance(true);

        delete running[targetId];

        if (task._onComplete) {
            task._onComplete();
        }

        this.recordPerformance(true);

        if (!completed[targetId]) {
            completed[targetId] = [];
        }
        completed[targetId].push({ targetId: task.targetId, action: task.action });

        this.recordPerformance(true);
    }

    private recordPerformance(excludeFromMin: boolean) {
        const now = process.hrtime.bigint();
        const time = Number(now - this.prevPerformanceRecordedAt);
        this.prevPerformanceRecordedAt = now;
        this.executeData.performanceData.push({
            excludeFromMin,
            running: Object.values(this.executeData.running),
            time
        });
    }

    protected performanceReport: {
        min: number
        max: number
        avg: number
    };

    protected executeData: {
        running: ITaskCollection
        completed: ICompletedTasksCollection
        performanceData: Array<{
            excludeFromMin: boolean
            running: ITask[]
            time: number
        }>
    };

    private startedAt = BigInt(0);
    private prevPerformanceRecordedAt = BigInt(0);
    private recordPerformanceInterval?: NodeJS.Timeout;
}

async function sleep(ms: number) {
    ms = Math.max(0, ms);
    // ms += (Math.random() - 0.5) * ms / 10;
    return new Promise<void>(r => setTimeout(() => r(), ms));
}
