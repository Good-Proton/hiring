import t from 'tap';
import Executor from '../src/Executor';
import Task from '../src/Task';

t.test('Executor.executeTask()', async t => {
    const executor = new Executor();
    executor.start()

    const init0Task: Task = { targetId: 0, action: 'init' };
    const init0Promise = executor.executeTask(init0Task);
    t.equal(executor.executeData.running[0], init0Task,
        '`executor.executeTask(init0Task)` places task into `executor.executeData.running`');
    
    await init0Promise;
    t.same(executor.executeData.running, {},
        'after execution of all tasks `executor.executeData.running` is empty');
    t.same(executor.executeData.completed, { [init0Task.targetId]: [init0Task] },
        'executed `init0Task` is placed into `executor.executeData.completed`');
    
    const init2Task: Task = { targetId: 2, action: 'init' };
    const init3Task: Task = { targetId: 3, action: 'init' };
    const init2Promise = executor.executeTask(init2Task);
    try {
        await executor.executeTask(init3Task);
        t.pass('simultaneous execution of two tasks with different `targetId` should not throw');
    } catch(e) {
        t.fail('simultaneous execution of two tasks with different `targetId` should not throw');
    } finally {
        await init2Promise;
    }
    
    const init1Task: Task = { targetId: 1, action: 'init' };
    const prepare1Task: Task = { targetId: 1, action: 'prepare' };
    const init1Promise = executor.executeTask(init1Task);
    try {
        await executor.executeTask(prepare1Task);
        t.fail('simultaneous execution of two tasks with the same `targetId` should throw');
    } catch(e) {
        t.pass('simultaneous execution of two tasks with the same `targetId` should throw');
    } finally {
        await init1Promise;
    }

    executor.stop();
});

t.test('Executor.performanceReport for 4 simultaneous tasks', async t => {
    const executor = new Executor();
    executor.start()

    const init0Task: Task = { targetId: 0, action: 'init' };
    const init1Task: Task = { targetId: 1, action: 'init' };
    const init2Task: Task = { targetId: 2, action: 'init' };
    const init3Task: Task = { targetId: 3, action: 'init' };

    await Promise.all([
        executor.executeTask(init0Task),
        executor.executeTask(init1Task),
        executor.executeTask(init2Task),
        executor.executeTask(init3Task)
    ]);
    
    executor.stop();

    t.ok(executor.performanceReport.min >= 3 && executor.performanceReport.min <= 4,
        '`executor.performanceReport.min` is between `3` and `4` (' + executor.performanceReport.min + ')');
    t.equal(executor.performanceReport.max, 4,
        '`executor.performanceReport.max` `4` (' + executor.performanceReport.max + ')');
    t.ok(executor.performanceReport.avg >= 3 && executor.performanceReport.avg <= 4,
        '`executor.performanceReport.avg` is between `3` and `4` (' + executor.performanceReport.avg + ')');
});

t.test('Executor.performanceReport for 3 simultaneous tasks + 2 simulataneous tasks after', async t => {
    const executor = new Executor();
    executor.start()

    const init0Task: Task = { targetId: 0, action: 'init' };
    const init1Task: Task = { targetId: 1, action: 'init' };
    const init2Task: Task = { targetId: 2, action: 'init' };
    const init3Task: Task = { targetId: 3, action: 'init' };
    const init4Task: Task = { targetId: 4, action: 'init' };

    await Promise.all([
        executor.executeTask(init0Task),
        executor.executeTask(init1Task),
        executor.executeTask(init2Task)
    ]);
    await Promise.all([
        executor.executeTask(init3Task),
        executor.executeTask(init4Task)
    ]);

    executor.stop();

    t.equal(executor.performanceReport.min, 2,
        '`executor.performanceReport.min` is `2` (' + executor.performanceReport.min + ')');
    t.equal(executor.performanceReport.max, 3,
        '`executor.performanceReport.max` `3` (' + executor.performanceReport.max + ')');
    t.ok(executor.performanceReport.avg >= 2 && executor.performanceReport.avg <= 3,
        '`executor.performanceReport.avg` is between `2` and `3` (' + executor.performanceReport.avg + ')');
});