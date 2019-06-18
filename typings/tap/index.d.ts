declare module 'tap' {
    export class Test {
        constructor(options?: Options.Test)
        name: string
        tearDown(fn: (a: any) => any): void
        setTimeout(n: number): void
        endAll(): void
        threw(er: Error, extra?: Error, proxy?: Test): void
        pragma(set: Options.Pragma): void
        plan(n: number, comment?: string): void
        test(name: string, extra?: Options.Test, cb?: (t: Test) => Promise<any> | void): TestPromise
        test(name: string, cb?: (t: Test) => Promise<any> | void): TestPromise
        todo(name: string, extra?: Options.Test, cb?: (t: Test) => Promise<any> | void): TestPromise
        todo(name: string, cb?: (t: Test) => Promise<any> | void): TestPromise
        skip(name: string, extra?: Options.Test, cb?: (t: Test) => Promise<any> | void): TestPromise
        skip(name: string, cb?: (t: Test) => Promise<any> | void): TestPromise
        only(name: string, extra?: Options.Test, cb?: (t: Test) => Promise<any> | void): TestPromise
        only(name: string, cb?: (t: Test) => Promise<any> | void): TestPromise
        current(): Test
        stdin(name: string, extra?: Options.Bag): TestPromise
        spawn(cmd: string, args: string, options?: Options.Bag, name?: string, extra?: Options.Spawn): TestPromise
        done(): void
        passing(): boolean
        pass(message?: string, extra?: Options.Assert): boolean
        fail(message?: string, extra?: Options.Assert): boolean
        addAssert(name: string, length: number, fn: (...args: any[]) => boolean): boolean
        comment(message: string, ...args: any[]): void
        bailout(message?: string): void
        beforeEach(fn: (cb: () => any) => Promise<any> | void): void
        afterEach(fn: (cb: () => any) => Promise<any> | void): void

        // Assertions
        ok: Assertions.Basic
        true: Assertions.Basic
        assert: Assertions.Basic

        notOk: Assertions.Basic
        false: Assertions.Basic
        assertNot: Assertions.Basic

        error: Assertions.Basic
        ifErr: Assertions.Basic
        ifError: Assertions.Basic

        throws: Assertions.Throws
        throw: Assertions.Throws

        doesNotThrow: Assertions.DoesNotThrow
        notThrow: Assertions.DoesNotThrow

        equal: Assertions.Equal
        equals: Assertions.Equal
        isEqual: Assertions.Equal
        is: Assertions.Equal
        strictEqual: Assertions.Equal
        strictEquals: Assertions.Equal
        strictIs: Assertions.Equal
        isStrict: Assertions.Equal
        isStrictly: Assertions.Equal

        notEqual: Assertions.NotEqual
        notEquals: Assertions.NotEqual
        inequal: Assertions.NotEqual
        notStrictEqual: Assertions.NotEqual
        notStrictEquals: Assertions.NotEqual
        isNotEqual: Assertions.NotEqual
        isNot: Assertions.NotEqual
        doesNotEqual: Assertions.NotEqual
        isInequal: Assertions.NotEqual

        same: Assertions.Equal
        equivalent: Assertions.Equal
        looseEqual: Assertions.Equal
        looseEquals: Assertions.Equal
        deepEqual: Assertions.Equal
        deepEquals: Assertions.Equal
        isLoose: Assertions.Equal
        looseIs: Assertions.Equal

        notSame: Assertions.NotEqual
        inequivalent: Assertions.NotEqual
        looseInequal: Assertions.NotEqual
        notDeep: Assertions.NotEqual
        deepInequal: Assertions.NotEqual
        notLoose: Assertions.NotEqual
        looseNot: Assertions.NotEqual

        strictSame: Assertions.Equal
        strictEquivalent: Assertions.Equal
        strictDeepEqual: Assertions.Equal
        sameStrict: Assertions.Equal
        deepIs: Assertions.Equal
        isDeeply: Assertions.Equal
        isDeep: Assertions.Equal
        strictDeepEquals: Assertions.Equal

        strictNotSame: Assertions.NotEqual
        strictInequivalent: Assertions.NotEqual
        strictDeepInequal: Assertions.NotEqual
        notSameStrict: Assertions.NotEqual
        deepNot: Assertions.NotEqual
        notDeeply: Assertions.NotEqual
        strictDeepInequals: Assertions.NotEqual
        notStrictSame: Assertions.NotEqual

        match: Assertions.Match
        has: Assertions.Match
        hasFields: Assertions.Match
        matches: Assertions.Match
        similar: Assertions.Match
        like: Assertions.Match
        isLike: Assertions.Match
        includes: Assertions.Match
        include: Assertions.Match
        contains: Assertions.Match

        notMatch: Assertions.Match
        dissimilar: Assertions.Match
        unsimilar: Assertions.Match
        notSimilar: Assertions.Match
        unlike: Assertions.Match
        isUnlike: Assertions.Match
        notLike: Assertions.Match
        isNotLike: Assertions.Match
        doesNotHave: Assertions.Match
        isNotSimilar: Assertions.Match
        isDissimilar: Assertions.Match

        type: Assertions.Type
        isa: Assertions.Type
        isA: Assertions.Type

        rejects: Assertions.Rejects
        resolves: Assertions.Resolves
        resolveMatch: Assertions.ResolveMatch
    }

    export namespace Assertions {
        type AsyncFn = ((...args: any[]) => Promise<any>) | Promise<any>
        type ExpectedError = (new (...args: any[]) => Error) | Pattern
        type Pattern = RegExp | string | object

        export type Basic =
            (obj: any, message?: string, extra?: Options.Assert) => boolean

        export type Throws =
            (fn?: Function, expectedError?: ExpectedError, message?: string, extra?: Options.Assert) => boolean

        export type DoesNotThrow =
            (fn?: Function, message?: string, extra?: Options.Assert) => boolean

        export type Equal =
            (found: any, wanted: any, message?: string, extra?: Options.Assert) => boolean

        export type NotEqual =
            (found: any, notWanted: any, message?: string, extra?: Options.Assert) => boolean

        export type Match =
            (found: any, pattern: Pattern, message?: string, extra?: Options.Assert) => boolean

        export type Type =
            (found: any, type: string | (new (...args: any[]) => any), message?: string, extra?: Options.Assert) => boolean

        export type Resolves =
            (fn: AsyncFn, message?: string, extra?: Options.Assert) => Promise<any>

        export type ResolveMatch =
            (fn: AsyncFn, pattern: Pattern | any, message?: string, extra?: Options.Assert) => Promise<any>

        export type Rejects =
            (fn: AsyncFn, expectedError?: ExpectedError, message?: string, extra?: Options.Assert) => Promise<any>
    }

    export namespace Options {
        export interface Bag {
            [propName: string]: any
        }

        export interface Pragma {
            [propName: string]: boolean
        }

        export interface Assert extends Bag {
            todo?: boolean | string,
            skip?: boolean | string
        }

        export interface Spawn extends Assert {
            bail?: boolean,
            timeout?: number
        }

        export interface Test extends Assert {
            name?: string,
            timeout?: number,
            bail?: boolean,
            autoend?: boolean,
            silent?: boolean
        }
    }

    // Super minimal description of returned Promise (which are really Bluebird promises)
    export interface TestPromise {
        [propName: string]: any
        then(fn: (t: Test) => any): Promise<any>
        catch(fn: (err: Error) => any): Promise<any>
    }

    export interface Mocha {
        it: (name?: string, fn?: (a: any) => any) => void
        describe: (name?: string, fn?: (a: any) => any) => void
        global: () => void
        before(name: string, cb?: (t: Test) => Promise<any> | void, options?: Options.Test): TestPromise
        before(cb: (t: Test) => Promise<any> | void): TestPromise
    }

    export interface Tap extends Test {
        Test: {
            new(options?: Options.Test): Test
            prototype: Test
        }
        mocha: Mocha
        // mochaGlobals: () => void
    }

    var tap: Tap

    export default tap
}

// declare class Test implements Test {
//     constructor(options?: Options.Test)
// }

// // Little hack to simulate the Test class on the tap export
// declare interface TestConstructor {
//     new(options?: Options.Test): Test
//     prototype: Test
// }