import { useMutation, useQueryClient } from '@tanstack/react-query'
import { boardKeys, moveTask, type Move, type Task } from './api'

export function useMoveTask(projectId: string) {
  const queryClient = useQueryClient()
  const queryKey = boardKeys.board(projectId)

  return useMutation<Task, Error, Move, { previous: Task[] | undefined }>({
    mutationFn: (move) => Promise.resolve(moveTask(move)),
    onMutate: async (move) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<Task[]>(queryKey)
      queryClient.setQueryData<Task[]>(queryKey, (tasks) =>
        tasks?.map((task) =>
          task.id === move.id
            ? { ...task, status: move.status, position: move.position }
            : task,
        ),
      )
      return { previous }
    },
    onError: (_error, _move, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  })
}
