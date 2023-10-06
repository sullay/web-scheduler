import { TaskList } from '../lib/taskList'
import type { Config } from '../utils/scheduler'
import type { TaskKeyType, PRIORITY_TYPE } from '../utils/task'
import type { AnyFunction } from '../utils/utils'

/**
 * 基于requestAnimationFrame的任务调度器，dom操作首选
 */
class AnimationFrameScheduler {
    private readonly taskList = new TaskList()
    private isWorking = false
    /** 谨慎设置，自定义需要参考运行设备的fps */
    private frameDuration = 5

    /**
     *  修改默认配置
     * @param options.priorityTimeoutParams 自定义超时时间
     * @param options.priorityTimeoutParams 自定义每帧占用时长（ms）
     */
    setConfig ({ priorityTimeoutParams = {}, frameDuration = 5 }: Config) {
        this.taskList.setPriorityTimeout(priorityTimeoutParams)
        this.frameDuration = frameDuration
    }

    /**
     * 执行任务循环
     * @param timestamp 进入任务调度时的时间戳
     */
    private workLoop (timestamp: number) {
        while (true) {
            // 任务已空停止运行
            if (this.taskList.isEmpty()) break
            // 耗时未到{frameDuration}继续运行，超过{frameDuration}时，判断是否有超时任务，有的话继续运行，没有则停止
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
            requestAnimationFrame(this.workLoop)
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
            requestAnimationFrame(this.workLoop)
        }
    }
}

/**
 * 基于requestAnimationFrame的任务调度器，dom操作首选
 */
export const animationFrameScheduler = new AnimationFrameScheduler()
