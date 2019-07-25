import { IExecutor } from './Executor';
import ITask from './Task';

export default async function run(executor: IExecutor, queue: Iterable<ITask>, maxThreads = 0) {
    maxThreads = Math.max(0, maxThreads);
    /**
     * Решение было тут!
     */
}
