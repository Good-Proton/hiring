export default interface Task {
    targetId: number
    action: 'init' | 'prepare' | 'work' | 'finalize' | 'cleanup'
    _onComplete?: () => void
}