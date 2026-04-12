const API_BASE = '/api/v1'

type ApiFieldError = {
  field: string
  message: string
}

type ApiErrorResponse = {
  status: number
  error: string
  message?: string
  fieldErrors?: ApiFieldError[]
}

export class ApiHttpError extends Error {
  status: number
  response?: ApiErrorResponse

  constructor(message: string, status: number, response?: ApiErrorResponse) {
    super(message)
    this.name = 'ApiHttpError'
    this.status = status
    this.response = response
  }
}

export type LoginRequest = {
  email: string
  password: string
}

export type SessionResponse = {
  token: string
  sessionId: string
  type: string
  expiresIn: number
  roles: string[]
}

export type RegisterRequest = {
  firstName: string
  lastName: string
  email: string
  password: string
}

export type RegisterResponse = {
  message: string
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
    ...init,
  })

  if (!response.ok) {
    let errorBody: ApiErrorResponse | undefined

    try {
      errorBody = (await response.json()) as ApiErrorResponse
    } catch {
      errorBody = undefined
    }

    throw new ApiHttpError(
      errorBody?.message ?? `Request failed with status ${response.status}`,
      response.status,
      errorBody,
    )
  }

  return (await response.json()) as T
}

export async function login(requestBody: LoginRequest): Promise<SessionResponse> {
  return request<SessionResponse>('/sessions', {
    method: 'POST',
    body: JSON.stringify(requestBody),
  })
}

export async function register(requestBody: RegisterRequest): Promise<RegisterResponse> {
  return request<RegisterResponse>('/users', {
    method: 'POST',
    body: JSON.stringify(requestBody),
  })
}

export async function refreshSession(sessionId: string, token: string, type = 'Bearer'): Promise<SessionResponse> {
  return request<SessionResponse>(`/sessions/${sessionId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `${type} ${token}`,
    },
  })
}
