import { queryOptions } from '@tanstack/react-query'
import { z } from 'zod'
import {
  readDatabase,
  StatusSchema,
  TaskSchema,
  updateDatabase,
  type Status,
  type Task,
} from '../../shared/lib/demo-db'

export { StatusSchema, TaskSchema }
export type { Status, Task }

export const boardKeys = {
  board: (projectId: string) => ['board', projectId] as const,
}

export const boardQuery = (projectId: string) =>
  queryOptions<Task[], Error>({
    queryKey: boardKeys.board(projectId),
    queryFn: () => readDatabase().tasks.filter((task) => task.projectId === projectId),
  })

const MoveSchema = z.object({
  id: z.string(),
  status: StatusSchema,
  position: z.number(),
})
export type Move = z.infer<typeof MoveSchema>

export function moveTask(input: Move) {
  const move = MoveSchema.parse(input)
  let updated: Task | undefined
  updateDatabase((database) => ({
    ...database,
    tasks: database.tasks.map((task) => {
      if (task.id !== move.id) return task
      updated = { ...task, status: move.status, position: move.position }
      return updated
    }),
  }))
  if (!updated) throw new Error('This task no longer exists.')
  return updated
}
