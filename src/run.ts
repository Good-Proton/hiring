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
     * Тут что-то вызываем в правильном порядке executor.executeTask для тасков из очереди queue
     */

    executor.stop();
    return {
        completed: executor.executeData.completed,
        performance: executor.performanceReport,
    };
}