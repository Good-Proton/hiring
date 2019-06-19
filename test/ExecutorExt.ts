import Executor from '../src/Executor';
import ITask from '../src/Task';
import ITaskExt from './ITaskExt';
import Log from './Log';

export default class ExecutorExt extends Executor {
    constructor(testname?: string, queue?: { q: ITaskExt[] }) {
        super();

        if (testname && queue) {
            this.logger = new Log(testname, queue);
        }
    }

    public getPerformanceReport() {
        return this.performanceReport;
    }

    public getExecuteData() {
        return this.executeData;
    }

    public async executeTask(task: ITask) {
        if (this.logger) {
            process.nextTick(this.logger.record.bind(this.logger));
        }
        await super.executeTask(task);
        if (this.logger) {
            process.nextTick(this.logger.record.bind(this.logger));
        }
    }

    public start() {
        super.start();
        if (this.logger) {
            this.logger.start();
        }
    }

    public stop() {
        super.stop();
        if (this.logger) {
            this.logger.stop();
            this.logger.writeHtml();
        }
    }

    private logger: Log | undefined;
}
