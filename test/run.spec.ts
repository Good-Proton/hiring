import t from 'tap';
import run from '../src/run';
import ITask, { ActionType } from '../src/Task';
import { distinctTargetIdsCount, getQueue, wantedResult } from './data';
import ExecutorExt from './ExecutorExt';
import ITaskExt from './ITaskExt';

t.test('run() without threads limit', async t => {
    const queue = getQueue();
    const executor = new ExecutorExt(t.name, queue);
    executor.start();
    await run(executor, queue);
    executor.stop();
    const completed = executor.getExecuteData().completed;
    const performance = executor.getPerformanceReport();

    t.pass('run() executed sucessfully');
    t.same(completed, wantedResult,
        'all tasks completed in proper order');

    t.equal(performance.max, distinctTargetIdsCount,
        '`performance.max` should be `' + distinctTargetIdsCount +
        '` (equal to number of distinct `targetId`) (' + performance.max + ')');
    t.ok(performance.avg > distinctTargetIdsCount - 3.5,
        '`performance.avg` should be greater than `' + (distinctTargetIdsCount - 3.5) +
        '` (~number of distinct `targetId`) (' + performance.avg + ')');
});

t.test('run() with 2 max threads', async t => {
    const queue = getQueue();
    const executor = new ExecutorExt(t.name, queue);
    executor.start();
    await run(executor, queue, 2);
    executor.stop();
    const completed = executor.getExecuteData().completed;
    const performance = executor.getPerformanceReport();

    t.pass('run() executed sucessfully');
    t.same(completed, wantedResult,
        'all tasks completed in proper order');

    t.equal(performance.max, 2,
        '`performance.max` should be `2` (' + performance.max + ')');
    t.ok(performance.avg > 1.5,
        '`performance.avg` should be greater than `1.5` (' + performance.avg + ')');
});

t.test('run() with 3 max threads', async t => {
    const queue = getQueue();
    const executor = new ExecutorExt(t.name, queue);
    executor.start();
    await run(executor, queue, 3);
    executor.stop();
    const completed = executor.getExecuteData().completed;
    const performance = executor.getPerformanceReport();

    t.pass('run() executed sucessfully');
    t.same(completed, wantedResult,
        'all tasks completed in proper order');

    t.equal(performance.max, 3,
        '`performance.max` should be `3` (' + performance.max + ')');
    t.ok(performance.avg > 2,
        '`performance.avg` should be greater than `2` (' + performance.avg + ')');
});

t.test('run() with 5 max threads', async t => {
    const queue = getQueue();
    const executor = new ExecutorExt(t.name, queue);
    executor.start();
    await run(executor, queue, 5);
    executor.stop();
    const completed = executor.getExecuteData().completed;
    const performance = executor.getPerformanceReport();

    t.pass('run() executed sucessfully');
    t.same(completed, wantedResult,
        'all tasks completed in proper order');

    t.equal(performance.max, 5,
        '`performance.max` should be `5` (' + performance.max + ')');
    t.ok(performance.avg > 3.8,
        '`performance.avg` should be greater than `3.8` (' + performance.avg + ')');
});

t.test('run() with 2 threads on modifying queue', async t => {
    const tasks: ITaskExt[][] = [];
    for (const i of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]) {
        tasks[i] = [];
        for (const action of ['init', 'prepare', 'work', 'finalize', 'cleanup']) {
            tasks[i].push({
                targetId: i,
                action: action as ActionType,
                _onExecute() {
                    this.running = true;
                },
                _onComplete() {
                    delete this.running;
                    this.completed = true;
                }
            });
        }
    }

    const q = [...tasks[0]];

    tasks[0][4]._onComplete = () => {
        q.push(...tasks[1], ...tasks[2], ...tasks[3]);
        delete tasks[0][4].running;
        tasks[0][4].completed = true;
    };
    tasks[1][1]._onComplete = () => {
        q.push(...tasks[4]);
        delete tasks[1][1].running;
        tasks[1][1].completed = true;
    };
    tasks[2][2]._onComplete = () => {
        q.push(...tasks[5]);
        delete tasks[2][2].running;
        tasks[2][2].completed = true;
    };
    tasks[3][3]._onComplete = () => {
        q.push(...tasks[6]);
        delete tasks[3][3].running;
        tasks[3][3].completed = true;
    };
    tasks[4][4]._onComplete = () => {
        q.push(...tasks[7]);
        delete tasks[4][4].running;
        tasks[4][4].completed = true;
    };
    tasks[5][4]._onComplete = () => {
        q.push(...tasks[8]);
        delete tasks[5][4].running;
        tasks[5][4].completed = true;
    };
    tasks[8][4]._onComplete = () => {
        q.push(...tasks[9], ...tasks[10], ...tasks[11]);
        delete tasks[8][4].running;
        tasks[8][4].completed = true;
    };

    const queue = {
        [Symbol.asyncIterator]() {
            let i = 0;
            return {
                async next() {
                    while (q[i] && (q[i].completed || q[i].acquired)) {
                        i++;
                    }
                    if (i < q.length) {
                        const value = q[i++];
                        if (value) {
                            value.acquired = true;
                        }
                        return {
                            done: false,
                            value
                        };
                    } else {
                        return {
                            done: true,
                            value: undefined as unknown as ITaskExt
                        };
                    }
                }
            };
        },
        q
    };

    const executor = new ExecutorExt(t.name, queue);
    executor.start();
    await run(executor, queue, 2);
    executor.stop();
    const completed = executor.getExecuteData().completed;
    const performance = executor.getPerformanceReport();

    t.pass('run() executed sucessfully');
    t.match(completed, wantedResult,
        'all tasks completed in proper order');

    t.equal(performance.max, 2,
        '`performance.max` should be `2` (' + performance.max + ')');
    t.ok(performance.avg > 1.5,
        '`performance.avg` should be greater than `1.5` (' + performance.avg + ')');
});

t.test('run() with 3 threads on infinite queue', async t => {
    const queue = {
        [Symbol.asyncIterator]() {
            return {
                async next() {
                    const completedCount = queue.q.reduce((count, t) => {
                        return count + (t.completed ? 1 : 0);
                    }, 0);

                    const queuedCount = queue.q.length - completedCount;

                    if (completedCount < 20 || queuedCount >= 5) {
                        const task: ITaskExt = {
                            targetId: queue.q.length,
                            action: 'init',
                            acquired: true,
                            _onExecute() {
                                task.running = true;
                            },
                            _onComplete() {
                                delete task.running;
                                task.completed = true;
                            }
                        };
                        task.acquired = true;
                        queue.q.push(task);
                        return {
                            done: false,
                            value: task
                        };
                    } else {
                        return {
                            done: true,
                            value: undefined as unknown as ITask
                        };
                    }
                }
            };
        },
        q: [] as ITaskExt[]
    };

    const executor = new ExecutorExt(t.name, queue);
    executor.start();
    await run(executor, queue, 3);
    executor.stop();
    const completed = executor.getExecuteData().completed;
    const performance = executor.getPerformanceReport();

    t.pass('run() executed sucessfully');
    t.match(completed,
        {
            0: [{ targetId: 0, action: 'init' }],
            1: [{ targetId: 1, action: 'init' }],
            2: [{ targetId: 2, action: 'init' }],
            3: [{ targetId: 3, action: 'init' }],
            4: [{ targetId: 4, action: 'init' }],
            5: [{ targetId: 5, action: 'init' }],
            6: [{ targetId: 6, action: 'init' }],
            7: [{ targetId: 7, action: 'init' }],
            8: [{ targetId: 8, action: 'init' }],
            9: [{ targetId: 9, action: 'init' }],
            10: [{ targetId: 10, action: 'init' }],
            11: [{ targetId: 11, action: 'init' }],
            12: [{ targetId: 12, action: 'init' }],
            13: [{ targetId: 13, action: 'init' }],
            14: [{ targetId: 14, action: 'init' }],
            15: [{ targetId: 15, action: 'init' }],
            16: [{ targetId: 16, action: 'init' }],
            17: [{ targetId: 17, action: 'init' }],
            18: [{ targetId: 18, action: 'init' }],
            19: [{ targetId: 19, action: 'init' }],
        },
        'all tasks completed in proper order');

    t.equal(performance.max, 3,
        '`performance.max` should be `3` (' + performance.max + ')');
    
    t.ok(performance.avg > 2.5,
        '`performance.avg` should be greater than `2.5` (' + performance.avg + ')');
    
    if (Object.keys(completed).length > 25) {
        t.todo(`too much precache ${Object.keys(completed).length - 3}`);
    }
});
