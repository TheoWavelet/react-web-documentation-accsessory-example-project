export class HttpError extends Error {
  readonly status: number

  constructor(
    message: string,
    status: number,
  ) {
    super(message)
    this.name = 'HttpError'
    this.status = status
  }
}

export async function http<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const baseUrl = import.meta.env.VITE_API_URL
  if (!baseUrl) {
    throw new Error('VITE_API_URL is required to use the remote API.')
  }

  const response = await fetch(new URL(path, baseUrl), {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    throw new HttpError(
      `The request failed with status ${response.status}.`,
      response.status,
    )
  }
  return (await response.json()) as T
}
