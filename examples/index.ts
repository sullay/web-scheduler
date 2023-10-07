import {
    animationFrameScheduler,
    singleAnimationFrameScheduler,
    idleFrameScheduler,
    immediateScheduler,
    PRIORITY_TYPE
} from 'web-scheduler'

const circle = document.querySelector('.circle') as HTMLElement;


circle.onclick = ()=>{
    for(let i=0; i< 1000; i++){
        singleAnimationFrameScheduler.pushTask(()=>{
            console.log(i)
            circle.style.width = `${i}px`
            circle.style.height = `${i}px`
        })
    }
}

// circle.onclick = () => {
//     for (let i = 0; i < 2000; i++) {
//         animationFrameScheduler.pushTask(() => {
//             console.log(i)
//             circle.style.width = `${~~i/2}px`
//             circle.style.height = `${~~i/2}px`
//         },{ priority: PRIORITY_TYPE.LOW })
//     }
// }

// circle.onclick = () => {
//     for (let i = 0; i < 2000; i++) {
//         idleFrameScheduler.pushTask(() => {
//             console.log(i)
//             circle.style.width = `${~~i/2}px`
//             circle.style.height = `${~~i/2}px`
//         },{ priority: PRIORITY_TYPE.IDLE })
//     }
// }

// circle.onclick = () => {
//     for (let i = 0; i < 2000; i++) {
//         immediateScheduler.pushTask(() => {
//             console.log(i)
//             circle.style.width = `${~~i / 2}px`
//             circle.style.height = `${~~i / 2}px`
//         })
//     }
// }