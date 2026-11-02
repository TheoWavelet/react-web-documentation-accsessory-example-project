import { useQuery } from '@tanstack/react-query'
import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, RouterProvider, useRouteError } from 'react-router'
import { AppShell } from './AppShell'
import { sessionQuery } from '../features/auth/api'
import { LoginPage } from '../features/auth/LoginPage'
import { RequireAuth } from '../features/auth/RequireAuth'

const BoardPage = lazy(() =>
  import('../features/board/BoardPage').then((module) => ({ default: module.BoardPage })),
)
const ProjectsPage = lazy(() =>
  import('../features/projects/ProjectsPage').then((module) => ({ default: module.ProjectsPage })),
)
const TaskDrawer = lazy(() =>
  import('../features/tasks/TaskDrawer').then((module) => ({ default: module.TaskDrawer })),
)

function RouteError() {
  const error = useRouteError()
  const message = error instanceof Error ? error.message : 'Something unexpected happened.'
  const { data: session } = useQuery(sessionQuery)
  return (
    <main className="screen-state" role="alert">
      <p className="eyebrow">OOPS, A LITTLE DETOUR</p>
      <h1>We couldn’t open that page.</h1>
      <p className="muted">{message}</p>
      <a className="button button-primary" href={session ? '/projects' : '/login'}>
        Back to TaskFlow
      </a>
    </main>
  )
}

const router = createBrowserRouter([
  { path: '/login', Component: LoginPage },
  {
    element: <RequireAuth />,
    errorElement: <RouteError />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/', element: <Navigate to="/projects" replace /> },
          {
            path: '/projects',
            element: (
              <Suspense fallback={<div className="screen-state">Loading projects…</div>}>
                <ProjectsPage />
              </Suspense>
            ),
          },
          {
            path: '/projects/:projectId',
            element: (
              <Suspense fallback={<div className="screen-state">Loading board…</div>}>
                <BoardPage />
              </Suspense>
            ),
            children: [
              {
                path: 'tasks/:taskId',
                element: (
                  <Suspense fallback={<div className="screen-state">Loading task…</div>}>
                    <TaskDrawer />
                  </Suspense>
                ),
              },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/projects" replace /> },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
