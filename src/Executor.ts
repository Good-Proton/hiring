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
    }

    public stop() {
        // istanbul ignore if
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = undefined;
        }

        this.performanceReport.min =
            this.executeData.performanceData.reduce((min: number, record: { running: ITask[] }) => {
                if (record.running.length < min) {
                    return record.running.length;
                }
                return min;
            }, Number.MAX_SAFE_INTEGER);

        this.performanceReport.max =
            this.executeData.performanceData.reduce((max: number, record: { running: ITask[] }) => {
                if (record.running.length > max) {
                    return record.running.length;
                }
                return max;
            }, 0);

        this.performanceReport.avg =
            this.executeData.performanceData.reduce((avg: number, record: { running: ITask[] }, index: number) => {
                return (avg * index + record.running.length) / (index + 1);
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

        running[targetId] = task;
        if (task._onExecute) {
            task._onExecute();
        }
        this.deferRecordPerformance();

        switch (task.action) {
            case 'init': {
                await sleep(100);
                break;
            }
            case 'prepare': {
                await sleep(75);
                break;
            }
            case 'work': {
                await sleep(500);
                break;
            }
            case 'finalize': {
                await sleep(250);
                break;
            }
            default: {
                await sleep(75);
                break;
            }
        }

        delete running[targetId];
        if (task._onComplete) {
            task._onComplete();
        }
        if (!completed[targetId]) {
            completed[targetId] = [];
        }
        completed[targetId].push({ targetId: task.targetId, action: task.action });
    }

    private recordPerformance() {
        this.executeData.performanceData.push({
            running: Object.keys(this.executeData.running)
                .map((targetId: string) => this.executeData.running[targetId])
        });
    }

    private deferRecordPerformance() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(this.recordPerformance.bind(this), 0);
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
            running: ITask[]
        }>
    };

    private timeout?: NodeJS.Timeout;
}

async function sleep(ms: number) {
    ms = Math.max(0, ms);
    // ms += (Math.random() - 0.5) * ms / 10;
    return new Promise<void>(r => setTimeout(() => r(), ms));
}
