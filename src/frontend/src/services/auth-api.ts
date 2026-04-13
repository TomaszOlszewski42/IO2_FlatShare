import { apiRequest } from './api-client'

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
  role: string
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

export async function login(payload: LoginRequest): Promise<SessionResponse> {
  return apiRequest<SessionResponse>('/sessions', {
    method: 'POST',
    body: payload,
  })
}

export async function register(payload: RegisterRequest): Promise<RegisterResponse> {
  return apiRequest<RegisterResponse>('/users', {
    method: 'POST',
    body: payload,
  })
}

export async function refreshSession(
  sessionId: string,
  token: string,
  type = 'Bearer',
): Promise<SessionResponse> {
  return apiRequest<SessionResponse>(`/sessions/${sessionId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `${type} ${token}`,
    },
  })
}