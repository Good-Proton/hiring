import t from 'tap';
import run from '../src/run';
import Task from '../src/Task';

const queue: Task[] = [
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

t.test('run() without threads limit', async t => {
    const result = await run(queue.slice());
    const completed = result.completed;
    const performance = result.performance;

    t.pass('run() executed sucessfully');
    t.same(completed, wantedResult,
        'all tasks completed in proper order');

    t.equal(performance.max, 10,
        '`performance.max` should be `10` (equal to number of distinct `targetId`) (' + performance.max + ')');
    t.ok(performance.avg > 9,
        '`performance.avg` should be greater than `9` (~number of distinct `targetId`) (' + performance.avg + ')');
});

t.test('run() with 2 max threads', async t => {
    const result = await run(queue.slice(), 2);
    const completed = result.completed;
    const performance = result.performance;

    t.pass('run() executed sucessfully');
    t.same(completed, wantedResult,
        'all tasks completed in proper order');

    t.equal(performance.max, 2,
        '`performance.max` should be `2` (' + performance.max + ')');
    t.ok(performance.avg > 1.5,
        '`performance.avg` should be greater than `1.5` (' + performance.avg + ')');
});

t.test('run() with 3 max threads', async t => {
    const result = await run(queue.slice(), 3);
    const completed = result.completed;
    const performance = result.performance;

    t.pass('run() executed sucessfully');
    t.same(completed, wantedResult,
        'all tasks completed in proper order');

    t.equal(performance.max, 3,
        '`performance.max` should be `3` (' + performance.max + ')');
    t.ok(performance.avg > 2,
        '`performance.avg` should be greater than `2` (' + performance.avg + ')');
});

t.test('run() with 5 max threads', async t => {
    const result = await run(queue.slice(), 5);
    const completed = result.completed;
    const performance = result.performance;

    t.pass('run() executed sucessfully');
    t.same(completed, wantedResult,
        'all tasks completed in proper order');

    t.equal(performance.max, 5,
        '`performance.max` should be `5` (' + performance.max + ')');
    t.ok(performance.avg > 4,
        '`performance.avg` should be greater than `4` (' + performance.avg + ')');
});

t.test('run() with 2 threads on modifying queue', async t => {
    const q0 = ['init', 'prepare', 'work', 'finalize', 'cleanup'].map(action => ({ targetId: 0, action })) as Task[];
    const q1 = ['init', 'prepare', 'work', 'finalize', 'cleanup'].map(action => ({ targetId: 1, action })) as Task[];
    const q2 = ['init', 'prepare', 'work', 'finalize', 'cleanup'].map(action => ({ targetId: 2, action })) as Task[];
    const q3 = ['init', 'prepare', 'work', 'finalize', 'cleanup'].map(action => ({ targetId: 3, action })) as Task[];
    const q4 = ['init', 'prepare', 'work', 'finalize', 'cleanup'].map(action => ({ targetId: 4, action })) as Task[];
    const q5 = ['init', 'prepare', 'work', 'finalize', 'cleanup'].map(action => ({ targetId: 5, action })) as Task[];
    const q6 = ['init', 'prepare', 'work', 'finalize', 'cleanup'].map(action => ({ targetId: 6, action })) as Task[];
    const q7 = ['init', 'prepare', 'work', 'finalize', 'cleanup'].map(action => ({ targetId: 7, action })) as Task[];
    const q8 = ['init', 'prepare', 'work', 'finalize', 'cleanup'].map(action => ({ targetId: 8, action })) as Task[];
    const q9 = ['init', 'prepare', 'work', 'finalize', 'cleanup'].map(action => ({ targetId: 9, action })) as Task[];

    const queue = [
        ...q0, ...q1, ...q2
    ];

    q0[0]._onComplete = () => queue.push(...q3);
    q1[1]._onComplete = () => queue.push(...q4);
    q2[2]._onComplete = () => queue.push(...q5);
    q3[3]._onComplete = () => queue.push(...q6);
    q4[4]._onComplete = () => queue.push(...q7);
    q5[4]._onComplete = () => queue.push(...q8, ...q9);

    const result = await run(queue, 2);
    const completed = result.completed;
    const performance = result.performance;

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
        [Symbol.iterator]() {
            let targetId = 0;
            let completed = 0;
            return {
                next() {
                    if (completed < 2) {
                        return {
                            done: false,
                            value: {
                                targetId: targetId++,
                                action: 'init' as const,
                                _onComplete() { completed++; }
                            }
                        };
                    } else {
                        return {
                            done: true,
                            value: {
                                targetId,
                                action: 'init' as const
                            }
                        };
                    }
                }
            };
        }
    };

    const result = await run(queue, 3);
    const completed = result.completed;
    const performance = result.performance;

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
});
