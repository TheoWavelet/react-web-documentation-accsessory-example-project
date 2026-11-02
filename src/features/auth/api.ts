import { queryOptions } from '@tanstack/react-query'
import { z } from 'zod'

const DemoSessionSchema = z.object({
  email: z.email(),
})
export type DemoSession = z.infer<typeof DemoSessionSchema>

const SESSION_KEY = 'taskflow-demo-session'
export const sessionQueryKey = ['session'] as const

export const sessionQuery = queryOptions<DemoSession | null, Error>({
  queryKey: sessionQueryKey,
  queryFn: (): DemoSession | null => {
    const saved = localStorage.getItem(SESSION_KEY)
    if (!saved) return null

    let value: unknown
    try {
      value = JSON.parse(saved)
    } catch (error) {
      throw new Error('The saved demo session is invalid. Sign in again to continue.', {
        cause: error,
      })
    }
    return DemoSessionSchema.parse(value)
  },
})

export function signIn(email: string) {
  const session = DemoSessionSchema.parse({ email })
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return session
}

export function signOut() {
  localStorage.removeItem(SESSION_KEY)
}
