import {
  createId,
  readDatabase,
  updateDatabase,
  type Task,
} from '../../shared/lib/demo-db'
import { boardKeys } from '../board/api'

export type TaskInput = Pick<Task, 'title' | 'description' | 'assigneeId'>

export function createTask(projectId: string, input: TaskInput) {
  const task: Task = {
    id: createId(),
    projectId,
    title: input.title,
    description: input.description,
    status: 'todo',
    position:
      Math.max(
        0,
        ...readDatabase().tasks
          .filter((item) => item.projectId === projectId && item.status === 'todo')
          .map((item) => item.position),
      ) + 1,
    assigneeId: input.assigneeId,
  }
  updateDatabase((database) => ({
    ...database,
    tasks: [task, ...database.tasks],
  }))
  return task
}

export function updateTask(taskId: string, input: TaskInput) {
  let updated: Task | undefined
  updateDatabase((database) => ({
    ...database,
    tasks: database.tasks.map((task) => {
      if (task.id !== taskId) return task
      updated = { ...task, ...input }
      return updated
    }),
  }))
  if (!updated) throw new Error('This task no longer exists.')
  return updated
}

export const taskQueryKey = (projectId: string) => boardKeys.board(projectId)
