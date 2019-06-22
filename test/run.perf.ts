import t from 'tap';
import run from '../src/run';
import { distinctTargetIdsCount, getQueue } from './data';
import ExecutorExt from './ExecutorExt';

const repeats = 5;

t.test(`performance score`, async t => {
    let totalReal = 0;
    let totalIdeal = 0;

    const limits = [0, 2, 3, 4, 6];

    for (const limit of limits) {
        let real = 0;
        const ideal = (limit || distinctTargetIdsCount) * repeats;

        for (let i = 0; i < repeats; ++i) {
            const queue = getQueue();
            const executor = new ExecutorExt();
            executor.start();
            await run(executor, queue, limit);
            executor.stop();

            real += executor.getPerformanceReport().avg;
        }

        const score = (real / ideal * 100).toFixed(2);
        t.pass(`run() ${limit > 0 ? `with ${limit} threads` : 'without threads limit'} score: ${score}`);
        totalReal += real;
        totalIdeal += ideal;
    }
    t.pass(`overall score: ${(totalReal / totalIdeal * 100).toFixed(2)}`);
});
