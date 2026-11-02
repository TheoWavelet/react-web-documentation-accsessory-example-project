import { useQuery } from '@tanstack/react-query'
import { Navigate, Outlet, useLocation } from 'react-router'
import { sessionQuery } from './api'

export function RequireAuth() {
  const { data: session, isPending, error } = useQuery(sessionQuery)
  const location = useLocation()

  if (isPending) return <div className="screen-state">Loading your workspace…</div>
  if (error) {
    return (
      <div className="screen-state" role="alert">
        {error.message}
      </div>
    )
  }
  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}
