import { type PriorityTimeoutParams } from './task'

export interface BaseConfig {
    priorityTimeoutParams?: PriorityTimeoutParams
}

export interface IdleFrameConfig extends BaseConfig {}

export interface singleAnimationFrameConfig extends BaseConfig {}

export interface AnimationFrameConfig extends BaseConfig {
    frameDuration?: number
}

export interface ImmediateConfig extends BaseConfig {
    frameDuration?: number
}

/**
 * 计算设备刷新率，每一帧所用时间
 */
export async function calculateAverageFrameDuration () {
    return await new Promise<number>((resolve) => {
        let lastTimestamp: number | null = null
        let frameCount = 0
        let totalDuration = 0

        function calculateFrameDuration (timestamp: number) {
            if (lastTimestamp !== null) {
                const frameDuration = timestamp - lastTimestamp
                totalDuration += frameDuration
                frameCount++
                lastTimestamp = timestamp
            } else {
                lastTimestamp = timestamp
            }

            if (frameCount === 10) {
                resolve(totalDuration / frameCount) // 返回平均值
            }

            if (frameCount < 10) {
                requestAnimationFrame(calculateFrameDuration)
            }
        }

        requestAnimationFrame(calculateFrameDuration)
    })
}
