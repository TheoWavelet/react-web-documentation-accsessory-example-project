import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { DATABASE_KEY } from '../../shared/lib/demo-db'
import { boardKeys } from './api'

export function useBoardEvents(projectId: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === DATABASE_KEY || event.key === null) {
        void queryClient.invalidateQueries({
          queryKey: boardKeys.board(projectId),
        })
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [projectId, queryClient])
}
