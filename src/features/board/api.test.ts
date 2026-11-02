import { beforeEach, describe, expect, it } from 'vitest'
import { readDatabase } from '../../shared/lib/demo-db'
import { moveTask } from './api'

describe('board API', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('moves a task and saves the new column and position', () => {
    const task = readDatabase().tasks[0]
    expect(task).toBeDefined()
    if (!task) throw new Error('Expected the demo board to include a task.')

    const moved = moveTask({ id: task.id, status: 'done', position: 4 })
    const persisted = readDatabase().tasks.find((item) => item.id === task.id)

    expect(moved.status).toBe('done')
    expect(moved.position).toBe(4)
    expect(persisted).toEqual(moved)
  })

  it('reports an attempt to move a task that does not exist', () => {
    expect(() =>
      moveTask({ id: 'missing', status: 'done', position: 0 }),
    ).toThrow('This task no longer exists')
  })
})
