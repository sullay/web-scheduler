export type AnyFunction = (...args: unknown[]) => unknown

export function isFunction (func: unknown): func is AnyFunction {
    return typeof func === 'function'
}

export function setImmediatePolyfill (callback: AnyFunction) {
    const channel = new MessageChannel()
    channel.port1.onmessage = callback
    channel.port2.postMessage(undefined)
}
