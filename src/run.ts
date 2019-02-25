import Task from './Task';
import Executor, { CompletedTasksColleciton, PerformanceReport } from './Executor';

type Queue = Task[];

export default async function run(queue: Queue, maxThreads = 0)
    : Promise<{
        completed: CompletedTasksColleciton
        performance: PerformanceReport
    }>
{
    const executor = new Executor();
    executor.start();

    /**
     * Код надо писать сюда
     * Тут что-то делаем c queue и вызываем в правильном порядке executor.executeTask
     */

    executor.stop();
    return {
        completed: executor.executeData.completed,
        performance: executor.performanceReport,
    };
}