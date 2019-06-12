import Executor, { ICompletedTasksCollection, IPerformanceReport } from './Executor';
import ITask from './Task';

export default async function run(queue: Iterable<ITask>, maxThreads = 0): Promise<{
    completed: ICompletedTasksCollection
    performance: IPerformanceReport
}> {
    maxThreads = Math.max(0, maxThreads);
    const executor = new Executor();
    executor.start();

    /**
     * Код надо писать сюда
     * Тут что-то вызываем в правильном порядке executor.executeTask для тасков из очереди queue
     */

    executor.stop();
    return {
        completed: executor.executeData.completed,
        performance: executor.performanceReport,
    };
}
