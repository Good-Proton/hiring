declare module 'tsame' {
    interface TSame {
        (obj1: object, obj2: object): boolean
        strict: (obj1: object, obj2: object) => boolean
    }

    const tsame: TSame;

    export default tsame;
}