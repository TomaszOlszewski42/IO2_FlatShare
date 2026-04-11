export class ApiHttpError extends Error {
  readonly status: number
  readonly body: unknown

  constructor(status: number, message: string, body: unknown) {
    super(message)
    this.name = 'ApiHttpError'
    this.status = status
    this.body = body
  }
}

const API_BASE = '/api/v1'

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  headers?: Record<string, string>
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  let responseBody: unknown = null

  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    responseBody = await response.json()
  }

  if (!response.ok) {
    const message =
      typeof responseBody === 'object' &&
      responseBody !== null &&
      'message' in responseBody &&
      typeof (responseBody as { message?: unknown }).message === 'string'
        ? (responseBody as { message: string }).message
        : `Request failed with status ${response.status}`

    throw new ApiHttpError(response.status, message, responseBody)
  }

  return responseBody as T
}