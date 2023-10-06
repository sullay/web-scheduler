import type { NodeNext, NodePre } from '../utils/task'
import { MAX_LEVEL } from '../utils/task'
import { type Task } from './task'

/**
 * 跳表节点类，用于包装单个任务，并携带任务实例在条表中移动
 */
export class Node {
    /** 跳表各层级后一个节点 */
    private next: NodeNext
    /** 跳表各层级前一个节点 */
    private pre: NodePre
    /**
    * @param task 任务实例
    */
    constructor (private readonly task: Task) {
        this.next = new Array(MAX_LEVEL).fill(null)
        this.pre = new Array(MAX_LEVEL).fill(null)
    }

    /**
     * 判断是否为Node实例
     * @param node Node实例
     */
    static isNode (node: unknown): node is Node {
        return node instanceof this
    }

    /**
    * 获取当前节点对应的任务
    */
    getTask () {
        return this.task
    }

    /**
    * 根据层级获取下一个任务
    * @param level 层级
    */
    getNext (level: number) {
        return this.next[level]
    }

    /**
    * 根据层级设置下一个节点
    * @param level 层级
    * @param node 节点
    */
    setNext (level: number, node: Node) {
        this.next[level] = node
    }

    /**
    * 根据层级获取上一个任务
    * @param level 层级
    */
    getPre (level: number) {
        return this.pre[level]
    }

    /**
    * 根据层级设置上一个节点
    * @param level 层级
    * @param node 节点
    */
    setPre (level: number, node: Node) {
        this.pre[level] = node
    }
}
