import t from 'tap';
import run from '../src/run';
import { distinctTargetIdsCount, getQueue } from './data';
import ExecutorExt from './ExecutorExt';

const repeats = 10;

t.test(`performance score`, async t => {
    let totalReal = 0;
    let totalIdeal = 0;

    const limits = [0, 2, 3, 4, 6];

    for (const limit of limits) {
        const real: number[] = [];
        const ideal = (limit || distinctTargetIdsCount);

        for (let i = 0; i < repeats; ++i) {
            const queue = getQueue();
            const executor = new ExecutorExt();
            executor.start();
            await run(executor, queue, limit);
            executor.stop();

            real.push(executor.getPerformanceReport().avg);
        }

        const avg = real.reduce((sum, v) => sum + v, 0) / real.length;
        const sigma = Math.sqrt(real.reduce((dsum, v) => dsum + Math.pow(v - avg, 2), 0) / real.length);
        const score = (avg / ideal * 100).toFixed(2);
        t.pass(`run() ${limit > 0
            ? `with ${limit} threads`
            : 'without threads limit'
            } score: ${score} (${avg.toFixed(2)}±${(sigma / avg * 100).toFixed(2)}%)`);
        
        totalReal += avg;
        totalIdeal += ideal;
    }
    t.pass(`overall score: ${(totalReal / totalIdeal * 100).toFixed(2)}`);
});
