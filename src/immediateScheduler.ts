import { TaskList } from '../lib/taskList'
import { calculateAverageFrameDuration, type ImmediateConfig } from '../utils/scheduler'
import type { TaskKeyType, PRIORITY_TYPE } from '../utils/task'
import { setImmediatePolyfill, type AnyFunction } from '../utils/utils'

/**
 * 基于setImmediate的任务调度器, 适合用于操作 DOM 元素以及执行其他 JavaScript 功能
 */
class ImmediateScheduler {
    private readonly taskList = new TaskList()
    private isWorking = false
    /** 谨慎设置，自定义需要参考运行设备的fps(默认值为设备刷新率时长的一半) */
    private frameDuration = 5

    /**
     *  修改默认配置
     * @param priorityTimeoutParams 自定义超时时间
     * @param frameDuration 自定义每帧占用时长（ms）
     */
    async setConfig ({ priorityTimeoutParams = {}, frameDuration }: ImmediateConfig) {
        this.taskList.setPriorityTimeout(priorityTimeoutParams)
        if (typeof frameDuration === 'number' && frameDuration > 0) this.frameDuration = frameDuration
    }

    /**
     * 执行任务循环
     * @param timestamp 进入任务调度时的时间戳
     */
    private workLoop (timestamp: number) {
        while (true) {
            // 任务已空停止运行
            if (this.taskList.isEmpty()) break
            // setImmediate占用时长超过{frameDuration}，并且没有没有超时任务则停止运行
            if (performance.now() - timestamp > this.frameDuration &&
                this.taskList.getFirstTimeOut() > performance.now()) {
                break
            }

            const task = this.taskList.shift()
            // 执行任务以及回调函数
            task?.run()
        }
        if (this.taskList.isEmpty()) {
            // 不存在任务，停止调度
            this.isWorking = false
        } else {
            // 如果队列中存在任务，下一帧raf阶段执行
            setImmediatePolyfill(this.workLoop.bind(this, performance.now()))
        }
    }

    /**
    * 添加任务，如果已经存在相同key的任务，更新任务方法，回调函数合并到callbackList，并根据超时时间移动位置。
    * @param val 任务方法
    * @param options.key 任务key值
    * @param options.priority 任务优先级
    * @param options.callback 任务回调函数
    */
    pushTask (val: AnyFunction, options?: { key?: TaskKeyType, priority?: PRIORITY_TYPE, callback?: AnyFunction }) {
        // 插入任务
        this.taskList.put(val, options)
        // 如果任务调度未启动，启动调度，并在下一帧raf阶段执行。
        if (!this.isWorking) {
            this.isWorking = true
            setImmediatePolyfill(this.workLoop.bind(this, performance.now()))
        }
    }
}

/**
 * 基于setImmediate的任务调度器, 适合用于操作 DOM 元素以及执行其他 JavaScript 功能
 */
export const immediateScheduler = new ImmediateScheduler()

calculateAverageFrameDuration().then(frameDuration => {
    immediateScheduler.setConfig({ frameDuration: Math.floor(frameDuration / 2) })
})
