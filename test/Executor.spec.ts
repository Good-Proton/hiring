import t from 'tap';
import ITask from '../src/Task';
import ExecutorExt from './ExecutorExt';

t.test('Executor.executeTask()', async t => {
    const executor = new ExecutorExt();
    executor.start();

    const init0Task: ITask = { targetId: 0, action: 'init' };
    const init0Promise = executor.executeTask(init0Task);
    t.equal(executor.getExecuteData().running[0], init0Task,
        '`executor.executeTask(init0Task)` places task into `executor.executeData.running`');
    
    await init0Promise;
    t.same(executor.getExecuteData().running, { },
        'after execution of all tasks `executor.executeData.running` is empty');
    t.same(executor.getExecuteData().completed, { [init0Task.targetId]: [init0Task] },
        'executed `init0Task` is placed into `executor.executeData.completed`');
    
    const init2Task: ITask = { targetId: 2, action: 'init' };
    const init3Task: ITask = { targetId: 3, action: 'init' };
    const init2Promise = executor.executeTask(init2Task);
    try {
        await executor.executeTask(init3Task);
        t.pass('simultaneous execution of two tasks with different `targetId` should not throw');
    } catch(e) {
        t.fail('simultaneous execution of two tasks with different `targetId` should not throw');
    } finally {
        await init2Promise;
    }
    
    const init1Task: ITask = { targetId: 1, action: 'init' };
    const prepare1Task: ITask = { targetId: 1, action: 'prepare' };
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
    const executor = new ExecutorExt();
    executor.start();

    const init0Task: ITask = { targetId: 0, action: 'init' };
    const init1Task: ITask = { targetId: 1, action: 'init' };
    const init2Task: ITask = { targetId: 2, action: 'init' };
    const init3Task: ITask = { targetId: 3, action: 'init' };

    await Promise.all([
        executor.executeTask(init0Task),
        executor.executeTask(init1Task),
        executor.executeTask(init2Task),
        executor.executeTask(init3Task)
    ]);
    
    executor.stop();

    t.ok(executor.getPerformanceReport().min >= 3 && executor.getPerformanceReport().min <= 4,
        '`executor.performanceReport.min` is between `3` and `4` (' + executor.getPerformanceReport().min + ')');
    t.equal(executor.getPerformanceReport().max, 4,
        '`executor.performanceReport.max` `4` (' + executor.getPerformanceReport().max + ')');
    t.ok(executor.getPerformanceReport().avg >= 3 && executor.getPerformanceReport().avg <= 4,
        '`executor.performanceReport.avg` is between `3` and `4` (' + executor.getPerformanceReport().avg + ')');
});

t.test('Executor.performanceReport for 3 simultaneous tasks + 2 simulataneous tasks after', async t => {
    const executor = new ExecutorExt();
    executor.start();

    const init0Task: ITask = { targetId: 0, action: 'init' };
    const init1Task: ITask = { targetId: 1, action: 'init' };
    const init2Task: ITask = { targetId: 2, action: 'init' };
    const init3Task: ITask = { targetId: 3, action: 'init' };
    const init4Task: ITask = { targetId: 4, action: 'init' };

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

    t.equal(executor.getPerformanceReport().min, 2,
        '`executor.performanceReport.min` is `2` (' + executor.getPerformanceReport().min + ')');
    t.equal(executor.getPerformanceReport().max, 3,
        '`executor.performanceReport.max` `3` (' + executor.getPerformanceReport().max + ')');
    t.ok(executor.getPerformanceReport().avg >= 2 && executor.getPerformanceReport().avg <= 3,
        '`executor.performanceReport.avg` is between `2` and `3` (' + executor.getPerformanceReport().avg + ')');
});
