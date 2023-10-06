import type { TaskKeyType } from '../utils/task'
import { PRIORITY_TYPE, DEFAULT_PRIORITY_TIMEOUT } from '../utils/task'
import { isFunction, type AnyFunction } from '../utils/utils'

/**
* 任务类
*/
export class Task {
    /** 回调函数列表 */
    private readonly callbackList: AnyFunction[] = []
    private readonly priority: PRIORITY_TYPE
    private timeout: number
    /**
    *
    * @param key 任务key值
    * @param val 任务方法
    * @param options.callback 回调函数
    * @param options.priority 任务优先级（仅作为标识，实际使用timeout）
    * @param options.timeout 任务超时时间 (已超时任务会尽快执行，过多的超时任务可能会导致fps下降)
    */
    constructor (
        private readonly key: TaskKeyType,
        private val: AnyFunction = () => { },
        options: {
            callback?: AnyFunction
            priority?: PRIORITY_TYPE
            timeout?: number
        } = {}
    ) {
        if (isFunction(options.callback)) this.addCallback(options.callback)
        this.priority = options.priority ?? PRIORITY_TYPE.IDLE
        this.timeout = options.timeout ?? DEFAULT_PRIORITY_TIMEOUT[PRIORITY_TYPE.IDLE]
    }

    /**
     * 判断是否为Task实例
     * @param task Task实例
     */
    static isTask (task: unknown): task is Task {
        return task instanceof this
    }

    /**
    * 获取超时时间
    */
    getTimeout () {
        return this.timeout
    }

    /**
    * 设置超时时间
    * @param timeout 超时时间
    */
    setTimeout (timeout: number) {
        this.timeout = timeout
    }

    /**
    * 获取当前任务的key值
    */
    getKey () {
        return this.key
    }

    /**
    * 重新设置任务方法
    * @param val 任务方法
    */
    setVal (val: AnyFunction) {
        this.val = val
    }

    /**
    * 新增回掉函数
    * @param callback 任务回调函数
    */
    addCallback (callback: AnyFunction) {
        this.callbackList.push(callback)
    }

    /**
    * 执行任务
    */
    run () {
        this.val()
        this.callbackList.forEach(callback => callback())
    }
}
