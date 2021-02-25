import ITask from '../src/Task';
import ITaskExt from './ITaskExt';

export const distinctTargetIdsCount = 12;

export const queue: ITask[] = [
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
    { targetId: 9, action: 'finalize' }, { targetId: 9, action: 'cleanup' }, { targetId: 1, action: 'cleanup' },
    { targetId: 10, action: 'init' }, { targetId: 10, action: 'prepare' }, { targetId: 10, action: 'work' },
    { targetId: 10, action: 'finalize' }, { targetId: 10, action: 'cleanup' }, { targetId: 11, action: 'init' },
    { targetId: 11, action: 'prepare' }, { targetId: 11, action: 'work' }, { targetId: 11, action: 'finalize' },
    { targetId: 11, action: 'cleanup' }
];

export const wantedResult = {
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
    10: [{ targetId: 10, action: 'init' }, { targetId: 10, action: 'prepare' }, { targetId: 10, action: 'work' },
    { targetId: 10, action: 'finalize' }, { targetId: 10, action: 'cleanup' }],
    11: [{ targetId: 11, action: 'init' }, { targetId: 11, action: 'prepare' }, { targetId: 11, action: 'work' },
    { targetId: 11, action: 'finalize' }, { targetId: 11, action: 'cleanup' }],
};

export function getQueue(maxThreads = 0) {
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
        [Symbol.asyncIterator]() {
            let i = 0;
            return {
                async next() {
                    while (q[i] && (q[i].completed || q[i].acquired)) {
                        i++;
                    }
                    if (i < q.length) {
                        if (i && i % maxThreads === 0) {
                            await new Promise(r => setTimeout(r, 100));
                        }
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
