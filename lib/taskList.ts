import type { TaskKeyType, PriorityTimeoutParams } from '../utils/task'
import { MAX_LEVEL, HEAD, TAIL, PRIORITY_TYPE, DEFAULT_PRIORITY_TIMEOUT } from '../utils/task'
import { Task } from './task'
import { Node } from './node'
import { isFunction, type AnyFunction } from '../utils/utils'

/**
* 基于hash+双向跳表的任务列表，定制场景下可用于自定义任务调度器
*/
export class TaskList {
    /** 使用map可以通过key值直接定位到目标任务 */
    private readonly map = new Map<TaskKeyType, Node>()
    /** 跳表最大层级(小于等于MAX_LEVEL) */
    private maxLevel = 0
    /** 表头 */
    private readonly head = new Node(new Task(HEAD))
    /** 表尾 */
    private readonly tail = new Node(new Task(TAIL))
    /** 优先级对应超时时间 */
    private priorityTimeout = DEFAULT_PRIORITY_TIMEOUT
    /**
    * @param options.priorityTimeout 自定义优先级超时时间
    */
    constructor () {
        // 构建空跳表
        for (let i = 0; i < MAX_LEVEL; i++) {
            this.head.setNext(i, this.tail)
            this.tail.setPre(i, this.head)
        }
    }

    /**
    * 随机生成层级
    */
    static generateLevel () {
        let level = 1
        for (let i = 1; i < MAX_LEVEL; i++) {
            if (Math.random() > 0.5) level++
        }
        return level
    }

    /**
    * 重新设置优先级对应超时时间
    * @param priorityTimeoutParams 优先级对应超时时间
    */
    setPriorityTimeout (priorityTimeoutParams: PriorityTimeoutParams) {
        this.priorityTimeout = { ...this.priorityTimeout, ...priorityTimeoutParams }
    }

    /**
    * 判断某个级别是否为空
    */
    isLevelEmpty (level: number) {
        return this.head.getNext(level) === this.tail
    }

    /**
    * 判断跳表是否为空 (跳表最底层首尾相连说明跳表为空)
    */
    isEmpty () {
        return this.isLevelEmpty(0)
    }

    /**
    * 通过任务key获取任务
    * @param key 任务key值
    */
    get (key: TaskKeyType) {
        return this.map.get(key)
    }

    /**
    * 判断是否存在任务
    * @param key 任务key值
    */
    has (key: TaskKeyType) {
        return this.map.has(key)
    }

    /**
    * 获取最紧急任务的超时时间
    */
    getFirstTimeOut () {
        if (this.isEmpty()) return DEFAULT_PRIORITY_TIMEOUT[PRIORITY_TYPE.IDLE]
        const firstTask = this.head.getNext(0)?.getTask()
        if (!Task.isTask(firstTask)) throw new Error('非空跳表中不存在首个任务')
        return firstTask.getTimeout()
    }

    /**
    * 取出首个任务
    */
    shift () {
        // 任务为空
        if (this.isEmpty()) return null
        // 跳表中当前节点（初始为非head的首个节点）
        const currentNode = this.head.getNext(0)
        if (!Node.isNode(currentNode)) throw new Error('非空跳表中不存在首个任务')

        // 从跳表中删除首个任务
        for (let i = this.maxLevel - 1; i >= 0; i--) {
            const preNode = currentNode.getPre(i)
            const nextNode = currentNode.getNext(i)
            if (!Node.isNode(preNode) && !Node.isNode(nextNode)) continue
            if (!Node.isNode(preNode)) throw Error(`首个任务，第${i}层级,只存在nextNode,不存在preNode`)
            if (!Node.isNode(nextNode)) throw Error(`首个任务，第${i}层级,只存在preNode,不存在nextNode`)
            preNode.setNext(i, nextNode)
            nextNode.setPre(i, preNode)
            // 删除后判断当前层级是否为空，空则最大高度-1
            if (this.isLevelEmpty(i)) this.maxLevel--
        }
        // 删除map中的任务
        const currentTask = currentNode.getTask()
        this.map.delete(currentTask.getKey())
        return currentTask
    }

    /**
    * 添加任务，如果已经存在相同key的任务，更新任务方法，回调函数合并到callbackList，并根据超时时间移动位置
    * @param val 任务方法
    * @param options.key 任务key值
    * @param options.priority 任务优先级
    * @param options.callback 任务回调函数
    */
    put (val: AnyFunction, { key = Symbol('default'), priority = PRIORITY_TYPE.NORMAL, callback }: {
        key?: TaskKeyType
        priority?: PRIORITY_TYPE
        callback?: AnyFunction
    } = {}) {
    // 计算新任务的超时时间
        const timeout = performance.now() + this.priorityTimeout[priority]
        if (this.has(key)) {
            // 已经存在key值相同的任务

            // 获取相同key值任务
            const node = this.get(key) as Node
            // 获取key值对应的任务
            const task = node.getTask()

            // 旧任务重新赋值
            node.getTask().setVal(val)

            // 合并新旧任务回调函数
            if (isFunction(callback)) task.addCallback(callback)

            // 如果新任务更紧急，则修改过期时间，并移动位置
            if (timeout < task.getTimeout()) {
                // 赋值超时时间
                task.setTimeout(timeout)

                // 最高层级
                let level = this.maxLevel

                let nextNode = node.getNext(level - 1)
                // 计算当前任务的层级与最高层级的下一个任务
                while (!Node.isNode(nextNode)) {
                    if (level < 1) {
                        console.error('更新任务异常', key)
                        throw new Error('任务不在跳表中')
                    }
                    level--
                    nextNode = node.getNext(level - 1)
                }
                // 从跳表中删除该任务
                for (let i = level - 1; i >= 0; i--) {
                    const pre = node.getPre(i)
                    const next = node.getNext(i)
                    if (!Node.isNode(pre) || !Node.isNode(next)) {
                        console.error('更新任务异常', key)
                        throw Error(`第${i}层级,不存在nextNode或者preNode`)
                    }
                    pre.setNext(i, next)
                    next.setPre(i, pre)
                }
                // 各层级插入新的位置
                for (let i = level - 1; i >= 0; i--) {
                    let preNode = nextNode.getPre(i)
                    if (!Node.isNode(preNode)) {
                        console.error('更新任务异常', key)
                        throw Error(`第${i}层级,不存在preNode`)
                    }

                    while (preNode !== this.head && preNode.getTask().getTimeout() > task.getTimeout()) {
                        nextNode = nextNode.getPre(i)
                        if (!Node.isNode(nextNode)) {
                            console.error('更新任务异常', key)
                            throw Error(`第${i}层级,不存在nextNode`)
                        }
                        preNode = preNode.getPre(i)
                        if (!Node.isNode(preNode)) {
                            console.error('更新任务异常', key)
                            throw Error(`第${i}层级,不存在preNode`)
                        }
                    }

                    node.setNext(i, nextNode)
                    node.setPre(i, preNode)
                    nextNode.setPre(i, node)
                    preNode.setNext(i, node)
                }
            }
        } else {
            // 不存在key值相同的任务
            // 生成当前任务跳表层级
            const level = TaskList.generateLevel()
            // 创建任务
            const task = new Task(key, val, { callback, priority, timeout })
            const node = new Node(task)
            // 将新任务插入map
            this.map.set(key, node)
            // 将任务根据超时时间插入跳表，超时时间相同插入到最后
            let preNode = this.head
            for (let i = level - 1; i >= 0; i--) {
                let nextNode = preNode.getNext(i)
                if (!Node.isNode(nextNode)) {
                    console.error('新增任务异常', preNode.getTask().getKey())
                    throw new Error('不存在nextNode')
                }

                while (nextNode !== this.tail && nextNode.getTask().getTimeout() <= task.getTimeout()) {
                    const _preNode = preNode.getNext(i)
                    if (!Node.isNode(_preNode)) throw new Error('不存在preNode')
                    preNode = _preNode
                    nextNode = nextNode.getNext(i)
                    if (!Node.isNode(nextNode)) throw new Error('不存在nextNode')
                }

                node.setPre(i, preNode)
                node.setNext(i, nextNode)
                preNode.setNext(i, node)
                nextNode.setPre(i, node)
            }
            // 重新赋值跳表最大层级
            if (level > this.maxLevel) this.maxLevel = level
        }
    }
}
