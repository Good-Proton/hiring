import ITask from '../src/Task';

type ITaskExt = ITask & { running?: true, completed?: true, acquired?: true };

export default ITaskExt;
