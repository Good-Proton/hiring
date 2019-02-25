import Task from './Task';

export interface TaskCollection {
    [targetId: string]: Task
}

export interface CompletedTasksColleciton {
    [targetId: string]: Task[]
}

export interface PerformanceReport {
    min: number
    max: number
    avg: number
}

export default class Executor {
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
        }
    }

    start() {
        this.executeData.running = {};
        this.executeData.completed = {};
        this.executeData.performanceData.length = 0;
        this.performanceReport.min = 0;
        this.performanceReport.max = 0;
        this.performanceReport.avg = 0;

        this.interval = setInterval(() => this.recordPerformance.bind(this), 10);
    }

    stop() {
        if(this.interval) {
            clearInterval(this.interval);
            this.interval = undefined;
        }
        if(this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = undefined;
        }

        this.performanceReport.min =
            this.executeData.performanceData.reduce((min: number, record: { running: Task[] }) => {
                if(record.running.length < min) {
                    return record.running.length;
                }
                return min;
            }, Number.MAX_SAFE_INTEGER);

        this.performanceReport.max =
            this.executeData.performanceData.reduce((max: number, record: { running: Task[] }) => {
                if(record.running.length > max) {
                    return record.running.length;
                }
                return max;
            }, 0);

        this.performanceReport.avg =
            this.executeData.performanceData.reduce((avg: number, record: { running: Task[] }, index: number) => {
                return (avg * index + record.running.length) / (index + 1);
            }, 0);
    }

    async executeTask(task: Task) {
        const running = this.executeData.running;
        const completed = this.executeData.completed;
        const targetId = task.targetId;

        if(running[targetId]) {
            throw new Error(`cannot execute task ${targetId}:` +
                `${task.action}: task with the same targetId=${targetId} is running`);
        }

        running[targetId] = task;
        this.deferRecordPerformance();

        /* console.log(`${Object.keys(running).length} tasks running:`,
            Object.keys(running).reduce((records: string[], targetId: string) => {
                const task = running[targetId];
                records.push(`${task.targetId}:${task.action}`);
                return records;
            }, [])
        ); */

        switch(task.action) {
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
        if(!completed[targetId]) {
            completed[targetId] = [];
        }
        completed[targetId].push(task);

        /* console.log(`${Object.keys(running).length} tasks running:`,
            Object.keys(running).reduce((records: string[], targetId: string) => {
                const task = running[targetId];
                records.push(`${task.targetId}:${task.action}`);
                return records;
            }, [])
        ); */
    }

    readonly executeData: {
        running: TaskCollection
        completed: CompletedTasksColleciton
        performanceData: {
            running: Task[]
        }[]
    }

    readonly performanceReport: PerformanceReport

    private recordPerformance() {
        this.executeData.performanceData.push({
            running: Object.keys(this.executeData.running)
                .map((targetId: string) => this.executeData.running[targetId])
        });
    }

    private deferRecordPerformance() {
        if(this.timeout) {
            clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(this.recordPerformance.bind(this), 0);
    }

    private interval?: NodeJS.Timeout;
    private timeout?: NodeJS.Timeout;
}

async function sleep(ms: number = 0) {
    return new Promise<void>(r => setTimeout(() => r(), ms));
}