import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { z } from 'zod'
import { sessionQuery, sessionQueryKey, signIn } from './api'

const LoginSchema = z.object({ email: z.email() })

export function LoginPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const location = useLocation()
  const { data: session, isPending, error: sessionError } = useQuery(sessionQuery)
  const [email, setEmail] = useState('alex@taskflow.dev')
  const [error, setError] = useState('')
  const login = useMutation({
    mutationFn: (value: string) => Promise.resolve(signIn(value)),
    onSuccess: (value) => {
      queryClient.setQueryData(sessionQueryKey, value)
      const destination =
        (location.state as { from?: string } | null)?.from ?? '/projects'
      void navigate(destination, { replace: true })
    },
    onError: (cause: Error) => setError(cause.message),
  })

  if (isPending) return <div className="screen-state">Loading…</div>
  if (session) return <Navigate to="/projects" replace />

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsed = LoginSchema.safeParse({ email })
    if (!parsed.success) {
      setError('Enter a valid email address.')
      return
    }
    setError('')
    login.mutate(parsed.data.email)
  }

  return (
    <main className="login-page">
      <div className="login-card">
        <div className="brand-mark">T</div>
        <p className="eyebrow">YOUR TEAM, IN FLOW</p>
        <h1>Make good work happen.</h1>
        <p className="muted">
          A calm place to plan projects, move work forward, and celebrate what’s done.
        </p>
        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="email">Work email</label>
          <input
            autoComplete="email"
            id="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@company.com"
            required
            type="email"
            value={email}
          />
          {error && <p className="form-error" role="alert">{error}</p>}
          {sessionError && (
            <p className="form-error" role="alert">{sessionError.message}</p>
          )}
          <button className="button button-primary button-wide" disabled={login.isPending}>
            {login.isPending ? 'Signing in…' : 'Continue to TaskFlow'}
            <span aria-hidden="true">↗</span>
          </button>
        </form>
        <p className="demo-note">Demo workspace · any valid email works</p>
      </div>
      <div className="login-decoration" aria-hidden="true">
        <span className="orbit orbit-one" />
        <span className="orbit orbit-two" />
        <span className="orbit orbit-three" />
        <span className="sparkle">✳</span>
      </div>
    </main>
  )
}
