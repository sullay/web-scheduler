import { TaskList } from '../lib/taskList'
import { Task } from '../lib/task'
import { PRIORITY_TYPE } from '../utils/task'

describe('Task Class', () => {
    it('should create a Task instance', () => {
        const task = new Task('testKey', () => { })
        expect(task).toBeInstanceOf(Task)
    })

    it('should set and get timeout correctly', () => {
        const task = new Task('testKey', () => { }, {
            timeout: 2000
        })
        task.setTimeout(3000)
        expect(task.getTimeout()).toBe(3000)
    })

    it('should add and run callbacks', () => {
        const task = new Task('testKey', () => { })
        const callback1 = jest.fn()
        const callback2 = jest.fn()

        task.addCallback(callback1)
        task.addCallback(callback2)

        task.run()

        expect(callback1).toHaveBeenCalled()
        expect(callback2).toHaveBeenCalled()
    })

    // 添加更多测试用例以覆盖其他功能
})

describe('TaskList Class', () => {
    it('should create a TaskList instance', () => {
        const taskList = new TaskList()
        expect(taskList).toBeInstanceOf(TaskList)
    })

    it('should add and get tasks from the list', () => {
        const taskList = new TaskList()

        taskList.put(() => { }, { key: 'testKey' })

        expect(taskList.has('testKey')).toBe(true)
        expect(taskList.get('testKey')).toBeDefined()
    })

    it('should shift tasks from the list', () => {
        const taskList = new TaskList()
        taskList.put(() => { }, { key: 'testKey' })

        const shiftedTask = taskList.shift()

        expect(shiftedTask).toBeInstanceOf(Task)
        expect(taskList.has('testKey')).toBe(false)
    })

    it('should handle priority correctly', () => {
        const taskList = new TaskList()
        taskList.put(() => { }, { key: 'testKey1', priority: PRIORITY_TYPE.NORMAL })
        taskList.put(() => { }, { key: 'testKey2', priority: PRIORITY_TYPE.HIGH })

        const firstTimeout = taskList.getFirstTimeOut()
        taskList.shift()

        expect(taskList.getFirstTimeOut()).toBeGreaterThan(firstTimeout)
    })
})
