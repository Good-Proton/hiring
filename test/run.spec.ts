import t from 'tap';
import run from '../src/run';
import ITask, { ActionType } from '../src/Task';
import ExecutorExt from './ExecutorExt';
import ITaskExt from './ITaskExt';

const queue: ITask[] = [
    { targetId: 4, action: 'init' }, { targetId: 0, action: 'init' }, { targetId: 1, action: 'init' },
    { targetId: 6, action: 'init' }, { targetId: 1, action: 'prepare' }, { targetId: 8, action: 'init' },
    { targetId: 6, action: 'prepare' }, { targetId: 2, action: 'init' }, { targetId: 0, action: 'prepare' },
    { targetId: 5, action: 'init' }, { targetId: 3, action: 'init' }, { targetId: 7, action: 'init' },
    { targetId: 7, action: 'prepare' }, { targetId: 3, action: 'prepare' }, { targetId: 0, action: 'work' },
    { targetId: 8, action: 'prepare' }, { targetId: 3, action: 'work' }, { targetId: 4, action: 'prepare' },
    { targetId: 9, action: 'init' }, { targetId: 2, action: 'prepare' },
    { targetId: 5, action: 'prepare' }, { targetId: 0, action: 'finalize' }, { targetId: 2, action: 'work' },
    { targetId: 8, action: 'work' }, { targetId: 8, action: 'finalize' }, { targetId: 4, action: 'work' },
    { targetId: 8, action: 'cleanup' }, { targetId: 9, action: 'prepare' }, { targetId: 0, action: 'cleanup' },
    { targetId: 5, action: 'work' }, { targetId: 1, action: 'work' }, { targetId: 5, action: 'finalize' },
    { targetId: 1, action: 'finalize' }, { targetId: 3, action: 'finalize' }, { targetId: 7, action: 'work' },
    { targetId: 2, action: 'finalize' }, { targetId: 6, action: 'work' }, { targetId: 2, action: 'cleanup' },
    { targetId: 3, action: 'cleanup' }, { targetId: 6, action: 'finalize' }, { targetId: 4, action: 'finalize' },
    { targetId: 7, action: 'finalize' }, { targetId: 4, action: 'cleanup' }, { targetId: 5, action: 'cleanup' },
    { targetId: 6, action: 'cleanup' }, { targetId: 7, action: 'cleanup' }, { targetId: 9, action: 'work' },
    { targetId: 9, action: 'finalize' }, { targetId: 9, action: 'cleanup' }, { targetId: 1, action: 'cleanup' }
];

const wantedResult = {
    0: [{ targetId: 0, action: 'init' }, { targetId: 0, action: 'prepare' }, { targetId: 0, action: 'work' },
    { targetId: 0, action: 'finalize' }, { targetId: 0, action: 'cleanup' }],
    1: [{ targetId: 1, action: 'init' }, { targetId: 1, action: 'prepare' }, { targetId: 1, action: 'work' },
    { targetId: 1, action: 'finalize' }, { targetId: 1, action: 'cleanup' }],
    2: [{ targetId: 2, action: 'init' }, { targetId: 2, action: 'prepare' }, { targetId: 2, action: 'work' },
    { targetId: 2, action: 'finalize' }, { targetId: 2, action: 'cleanup' }],
    3: [{ targetId: 3, action: 'init' }, { targetId: 3, action: 'prepare' }, { targetId: 3, action: 'work' },
    { targetId: 3, action: 'finalize' }, { targetId: 3, action: 'cleanup' }],
    4: [{ targetId: 4, action: 'init' }, { targetId: 4, action: 'prepare' }, { targetId: 4, action: 'work' },
    { targetId: 4, action: 'finalize' }, { targetId: 4, action: 'cleanup' }],
    5: [{ targetId: 5, action: 'init' }, { targetId: 5, action: 'prepare' }, { targetId: 5, action: 'work' },
    { targetId: 5, action: 'finalize' }, { targetId: 5, action: 'cleanup' }],
    6: [{ targetId: 6, action: 'init' }, { targetId: 6, action: 'prepare' }, { targetId: 6, action: 'work' },
    { targetId: 6, action: 'finalize' }, { targetId: 6, action: 'cleanup' }],
    7: [{ targetId: 7, action: 'init' }, { targetId: 7, action: 'prepare' }, { targetId: 7, action: 'work' },
    { targetId: 7, action: 'finalize' }, { targetId: 7, action: 'cleanup' }],
    8: [{ targetId: 8, action: 'init' }, { targetId: 8, action: 'prepare' }, { targetId: 8, action: 'work' },
    { targetId: 8, action: 'finalize' }, { targetId: 8, action: 'cleanup' }],
    9: [{ targetId: 9, action: 'init' }, { targetId: 9, action: 'prepare' }, { targetId: 9, action: 'work' },
    { targetId: 9, action: 'finalize' }, { targetId: 9, action: 'cleanup' }],
};

let real = 0;
let ideal = 0;

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

    t.equal(performance.max, 10,
        '`performance.max` should be `10` (equal to number of distinct `targetId`) (' + performance.max + ')');
    t.ok(performance.avg > 9,
        '`performance.avg` should be greater than `9` (~number of distinct `targetId`) (' + performance.avg + ')');
    
    real += performance.avg;
    ideal += 10;
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
    
    real += performance.avg;
    ideal += 2;
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
    
    real += performance.avg;
    ideal += 3;
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
    t.ok(performance.avg > 4,
        '`performance.avg` should be greater than `4` (' + performance.avg + ')');
    
    real += performance.avg;
    ideal += 5;
});

t.test('run() with 2 threads on modifying queue', async t => {
    const tasks: ITaskExt[][] = [];
    for (const i of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]) {
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
        q.push(...tasks[9]);
        delete tasks[8][4].running;
        tasks[8][4].completed = true;
    };

    const queue = {
        [Symbol.iterator]() {
            let i = 0;
            return {
                next() {
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
    
    real += performance.avg;
    ideal += 2;
});

t.test('run() with 3 threads on infinite queue', async t => {
    const queue = {
        [Symbol.iterator]() {
            return {
                next() {
                    const completedCount = queue.q.reduce((count, t) => {
                        return count + (t.completed ? 1 : 0);
                    }, 0);

                    if (completedCount < 2) {
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
            2: [{ targetId: 2, action: 'init' }]
        },
        'all tasks completed in proper order');

    t.equal(performance.max, 3,
        '`performance.max` should be `3` (' + performance.max + ')');
    
    real += performance.avg;
    ideal += 3;
});

t.test(`performance score`, async t => {
    t.pass((real / ideal * 100).toFixed(2));
});

function getQueue() {
    const q = queue.map(t => {
        const item: ITaskExt = { ...t };
        item._onExecute = () => item.running = true;
        item._onComplete = () => {
            delete item.running;
            item.completed = true;
        };
        return item;
    });

    return {
        [Symbol.iterator]() {
            let i = 0;
            return {
                next() {
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
}
