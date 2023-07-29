import { IExecutor } from './Executor';
import ITask from './Task';

export default async function run(executor: IExecutor, queue: AsyncIterable<ITask>, maxThreads = 0) {
    maxThreads = Math.max(0, maxThreads);
    
    interface runningTasksSet {
        [index: string]: Array<{task: ITask, index: number}>
    }
    
    interface waitingTasksSet {
        [index: string]: Array<{task: ITask, index: number}>
    }

    let result: Promise<void>[] = [];
    let runningTasks: runningTasksSet = {};
    let waitingTasks: waitingTasksSet = {};
    let busyThreads: number[] = []; // в массиве хранятся Id задач, которые выполняются. Длина массива - число занятых потоков.
    const start: any = new Date();


    async function promiseRaceIndex(promisesArray: Promise<void>[]): Promise<number> {
        return new Promise((resolve, reject) => {
            promisesArray.forEach((promise, index) => {
                Promise.resolve(promise)
                .then(() => {
                    resolve(index);
                })
                .catch(reject);
            });
        });
    }

    async function loopQueue(queue: AsyncIterable<ITask>): Promise<void[] | null> {
        let index: number = 0;
        for await (let task of queue) {
            const id = task.targetId;
    
            if (maxThreads === 0) { // потоки неограничены 
                if ( !Array.isArray(runningTasks[id]) ) { // если инициализировался, как массив и имеет нулевую длину или не инициализировался
                    runningTasks[id] = [{task, index}]; // создаём массив с задачей в соответствующем поле объекта IDs
                    const taskResponse = executor.executeTask(task); // получаем промис с результатом выполнения
                    result[index] = taskResponse; // записываем промис в файл вывода
                    const currentTask = {...task};
                    taskResponse.then(() => { // когда промис с задачей зарезолвится
                        runningTasks[currentTask.targetId].shift(); // удаляем задачу из IDs
                    });
                } else { // если задача с таким targetId уже выполняется, надо добавить её в очередь в данный поток
                    const lastTaskInQueueIndex = runningTasks[id][runningTasks[id].length - 1].index; // получаем индекс последней задачи в очереди с данным Id
                    const lastTaskInQueue = result[lastTaskInQueueIndex]; // получаем последнюю задачу в очереди с данным Id
                    
                    runningTasks[id].push({task, index}); // записываем задачу в массив в соответствующем поле объекта IDs
                    const nextTask: Promise<void> = new Promise((resolve) => { // создаём промис со следующей задачей в очереди с данным Id
                        const response = lastTaskInQueue.then(() => { // когда последняя задача с данным Id выполнится, запускаем
                            return executor.executeTask(task); // следующую задачу с этим Id
                        });
                        response.then(() => { // когда эта задача (которая на самом деле следующая) выполнится
                            runningTasks[task.targetId].shift(); // убираем её из IDs
                        });
                        resolve(response);
                    });
                    result[index] = nextTask; // добавляем следующую задачу в очереди в выходной файл result
                }
            } else { // число потоков ограничено
                if (busyThreads.includes(id)) { // сейчас исполняется задача с данным Id
                    if (Array.isArray(runningTasks[id]) && runningTasks[id].length !== 0) { // если задача с данным Id в runningTasks
                        const lastTaskInQueueIndex = runningTasks[id][runningTasks[id].length - 1].index; // получаем индекс последней задачи в очереди с данным Id
                        const lastTaskInQueue = result[lastTaskInQueueIndex]; // получаем последнюю задачу в очереди с данным Id
                        
                        runningTasks[id].push({task, index}); // записываем задачу в массив в соответствующем поле объекта IDs
                        const nextTask: Promise<void> = new Promise((resolve) => { // создаём промис со следующей задачей в очереди с данным Id
                            const response = lastTaskInQueue.then(() => { // когда последняя задача с данным Id выполнится, запускаем
                                return executor.executeTask(task); // следующую задачу с этим Id
                            });
                            response.then(() => { // когда эта задача (которая на самом деле следующая) выполнится
                                runningTasks[id].shift(); // убираем её из IDs
                                if (runningTasks[id].length === 0) {
                                    delete runningTasks[id];
                                    const threadIndex = busyThreads.findIndex(el => el === id);
                                    busyThreads.splice(threadIndex, 1); // освобождаем поток
                                }
                            });
                            resolve(response);
                        });
                        result[index] = nextTask; // добавляем следующую задачу в очереди в выходной файл result
                    } else { // если задача с данным Id НЕ в runningTasks, значит, она в waitingTasks - да они тоже исполняются
                        const lastTaskInQueueIndex = waitingTasks[id][waitingTasks[id].length - 1].index; // получаем индекс последней задачи в очереди с данным Id
                        const lastTaskInQueue = result[lastTaskInQueueIndex]; // получаем последнюю задачу в очереди с данным Id
                        
                        waitingTasks[id].push({task, index}); // записываем задачу в массив в соответствующем поле объекта IDs
                        const nextTask: Promise<void> = new Promise((resolve) => { // создаём промис со следующей задачей в очереди с данным Id
                            const response = lastTaskInQueue.then(() => { // когда последняя задача с данным Id выполнится, запускаем
                                return executor.executeTask(task); // следующую задачу с этим Id
                            });
                            response.then(() => { // когда эта задача (которая на самом деле следующая) выполнится
                                waitingTasks[id].shift(); // убираем её из IDs
                                if (waitingTasks[id].length === 0) {
                                    delete waitingTasks[id];
                                    const threadIndex = busyThreads.findIndex(el => el === id);
                                    busyThreads.splice(threadIndex, 1); // освобождаем поток
                                }
                            });
                            resolve(response);
                        });
                        result[index] = nextTask; // добавляем следующую задачу в очереди в выходной файл result
                    }
                } else { // если задача с таким Id не исполняется сейчас
                    if (maxThreads - busyThreads.length > 0) { // есть свободные потоки
                        runningTasks[id] = [{task, index}]; // создаём массив с задачей в соответствующем поле объекта IDs
                        const taskResponse = executor.executeTask(task); // получаем промис с результатом выполнения
                        result[index] = taskResponse; // записываем промис в файл вывода
                        busyThreads.push(id); // занимаем поток
    
                        taskResponse.then(() => { // когда промис с задачей зарезолвится
                            runningTasks[id].shift(); // удаляем задачу из IDs
                            if (runningTasks[id].length === 0) {
                                const threadIndex = busyThreads.findIndex(el => el === id);
                                busyThreads.splice(threadIndex, 1); // освобождаем поток
                                delete runningTasks[id];
                            }
                        });
                    } else { // нет свободных потоков 
                        if ( Array.isArray(waitingTasks[id]) && waitingTasks[id].length !== 0) { // задача с таким Id есть в waitingTasks
                            const lastTaskInQueueIndex = waitingTasks[id][waitingTasks[id].length - 1].index; // получаем индекс последней задачи в очереди с данным Id
                            const lastTaskInQueue = result[lastTaskInQueueIndex]; // получаем последнюю задачу в очереди с данным Id
                            
                            waitingTasks[id].push({task, index}); // записываем задачу в массив в соответствующем поле объекта IDs
                            const nextTask: Promise<void> = new Promise((resolve) => { // создаём промис со следующей задачей в очереди с данным Id
                                const response = lastTaskInQueue.then(() => { // когда последняя задача с данным Id выполнится, запускаем
                                    return executor.executeTask(task); // следующую задачу с этим Id
                                });
                                response.then(() => { // когда эта задача (которая на самом деле следующая) выполнится
                                    waitingTasks[id].shift(); // убираем её из IDs
                                if (waitingTasks[id].length === 0) {
                                    delete waitingTasks[id];
                                    const threadIndex = busyThreads.findIndex(el => el === id);
                                    busyThreads.splice(threadIndex, 1); // освобождаем поток
                                }
                                });
                                resolve(response);
                            });
                            result[index] = nextTask; // добавляем следующую задачу в очереди в выходной файл result
                        } else { // задачи с таким Id нет в waitingTasks
                            waitingTasks[id] = [{task, index}];
                            let copyResult = [...result];
                            while(maxThreads - busyThreads.length === 0) { // выполняем пока нет свободных потоков
                                const fastestTaskIndex = await promiseRaceIndex(copyResult); // индекс выполненной задачи
                                if (maxThreads - busyThreads.length === 0) { // если поток не освободился
                                    copyResult.splice(fastestTaskIndex, 1); // удаляем из copyResult выполненную задачу и ждём дальше    
                                } else { // если поток освободился
                                    const taskResponse = executor.executeTask(task); // получаем промис с результатом выполнения
                                    result[index] = taskResponse; // записываем промис в файл вывода
                                    busyThreads.push(id); // занимаем поток
    
                                    taskResponse.then(() => { // когда промис с задачей зарезолвится
                                        waitingTasks[id].shift(); // удаляем задачу из IDs
                                        if (waitingTasks[id].length === 0) {
                                            const threadIndex = busyThreads.findIndex(el => el === id);
                                            busyThreads.splice(threadIndex, 1); // освобождаем поток
                                            delete waitingTasks[id];
                                        }
                                    });
                                    break;
                                }
                            }
                        }
                    }
                }
            }
            index++;
        }
        if (index === 0) { // если queue пустой, то возвращаем null - это позволит выйти из рекурсии
            return null;
        }

        return new Promise(resolve => {
            Promise.all(result).then(async (result) => {
                const innerResult = await loopQueue(queue); // если вернули НЕ null, то снова запускаем loopQueue
                if (innerResult !== null) { 
                    resolve([...result, ...innerResult]);    
                }
                resolve(result);
            });
        });
    }

    return loopQueue(queue);
}
