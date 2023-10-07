import { TaskList } from '../lib/taskList'
import { type singleAnimationFrameConfig } from '../utils/scheduler'
import type { TaskKeyType, PRIORITY_TYPE } from '../utils/task'
import type { AnyFunction } from '../utils/utils'

/**
 * 基于requestAnimationFrame的任务调度器，每一个动画帧只执行一个任务，用于逐帧操作动画
 */
class SingleAnimationFrameScheduler {
    private readonly taskList = new TaskList()
    private isWorking = false

    /**
     *  修改默认配置
     * @param priorityTimeoutParams 自定义超时时间
     */
    async setConfig ({ priorityTimeoutParams = {} }: singleAnimationFrameConfig) {
        this.taskList.setPriorityTimeout(priorityTimeoutParams)
    }

    /**
     * 执行任务循环
     * @param timestamp 进入任务调度时的时间戳
     */
    private workLoop () {
        // 任务已空停止运行
        if (!this.taskList.isEmpty()) {
            const task = this.taskList.shift()
            // 执行任务以及回调函数
            task?.run()
        }

        if (this.taskList.isEmpty()) {
            // 不存在任务，停止调度
            this.isWorking = false
        } else {
            // 如果队列中存在任务，下一帧raf阶段执行
            requestAnimationFrame(this.workLoop.bind(this))
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
            requestAnimationFrame(this.workLoop.bind(this))
        }
    }
}

/**
 * 基于requestAnimationFrame的任务调度器，每一个动画帧只执行一个任务，用于逐帧操作动画
 */
export const singleAnimationFrameScheduler = new SingleAnimationFrameScheduler()
