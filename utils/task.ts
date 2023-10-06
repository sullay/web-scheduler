import type { Node } from '../lib/node'

// 跳表层级
export const MAX_LEVEL = 16
export const HEAD = Symbol('HEAD')
export const TAIL = Symbol('TAIL')

/**
 * 优先级枚举
 */
export enum PRIORITY_TYPE { IMMEDIATE = 'immediate', IDLE = 'idle', HIGH = 'high', NORMAL = 'normal', LOW = 'low' }

/**
 * 默认各优先级超时使劲啊
 */
export const DEFAULT_PRIORITY_TIMEOUT = {
    [PRIORITY_TYPE.IMMEDIATE]: -1 as const,
    [PRIORITY_TYPE.HIGH]: 250,
    [PRIORITY_TYPE.NORMAL]: 1000,
    [PRIORITY_TYPE.LOW]: 5000,
    [PRIORITY_TYPE.IDLE]: 1073741823 as const
}

export type TaskKeyType = number | string | symbol

export type NodePre = Array<undefined | null | Node>

export type NodeNext = NodePre

export interface PriorityTimeoutParams { [PRIORITY_TYPE.HIGH]?: number, [PRIORITY_TYPE.NORMAL]?: number, [PRIORITY_TYPE.LOW]?: number }
