import { type PriorityTimeoutParams } from './task'

export interface BaseConfig {
    priorityTimeoutParams?: PriorityTimeoutParams
}

export interface IdleFrameConfig extends BaseConfig {}

export interface AnimationFrameConfig extends BaseConfig {
    frameDuration?: number
}
