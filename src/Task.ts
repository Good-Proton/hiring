export type ActionType = 'init' | 'prepare' | 'work' | 'finalize' | 'cleanup';

export default interface ITask {
    targetId: number
    action: ActionType
    _onComplete?: () => void
}
