export type AnyFunction = (...args: unknown[]) => unknown

export function isFunction (func: unknown): func is AnyFunction {
    return typeof func === 'function'
}
