import { markBackendAvailable, markBackendUnavailable } from './backend-availability'
import { clearAuthSession, persistAuthSession, readAuthSession } from './auth-session'

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

export class BackendUnavailableError extends Error {
  readonly cause: unknown

  constructor(message: string, cause: unknown) {
    super(message)
    this.name = 'BackendUnavailableError'
    this.cause = cause
  }
}

const API_BASE = '/api/v1'
const OUTAGE_STATUS_CODES = new Set([502, 503, 504])

function redirectToLogin() {
  if (window.location.pathname === '/login') {
    return
  }

  window.location.assign('/login')
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  headers?: Record<string, string>
  skipTokenRefresh?: boolean
}

type InternalRequestState = {
  didRetryAfterRefresh: boolean
}

type SessionResponseLike = {
  token?: string
  sessionId?: string
  type?: string
  roles?: string[]
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
  internalState: InternalRequestState = { didRetryAfterRefresh: false },
): Promise<T> {
  let response: Response

  try {
    response = await fetch(`${API_BASE}${path}`, {
      method: options.method ?? 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers ?? {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    })
  } catch (error) {
    markBackendUnavailable()
    throw new BackendUnavailableError('Cannot connect to backend service.', error)
  }

  if (!OUTAGE_STATUS_CODES.has(response.status)) {
    markBackendAvailable()
  }

  let responseBody: unknown = null

  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    responseBody = await response.json()
  }

  if (!response.ok) {
    if (response.status === 401) {
      const canRefreshToken =
        !options.skipTokenRefresh &&
        typeof options.headers?.Authorization === 'string' &&
        !internalState.didRetryAfterRefresh

      if (canRefreshToken) {
        const refreshed = await refreshSessionAndPersist()

        if (refreshed) {
          return apiRequest<T>(path, options, { didRetryAfterRefresh: true })
        }
      }

      clearAuthSession()
      redirectToLogin()
      throw new ApiHttpError(401, 'Request failed with status 401', responseBody)
    }

    if (OUTAGE_STATUS_CODES.has(response.status)) {
      markBackendUnavailable()
      throw new BackendUnavailableError('Backend service is temporarily unavailable.', null)
    }

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

async function refreshSessionAndPersist(): Promise<boolean> {
  const session = readAuthSession()

  if (!session) {
    return false
  }

  let response: Response

  try {
    response = await fetch(`${API_BASE}/sessions/${session.sessionId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${session.type} ${session.token}`,
      },
    })
  } catch (error) {
    markBackendUnavailable()
    throw new BackendUnavailableError('Cannot connect to backend service.', error)
  }

  if (OUTAGE_STATUS_CODES.has(response.status)) {
    markBackendUnavailable()
    throw new BackendUnavailableError('Backend service is temporarily unavailable.', null)
  }

  if (!response.ok) {
    return false
  }

  const refreshedSession = (await response.json()) as SessionResponseLike

  if (
    typeof refreshedSession.token !== 'string' ||
    typeof refreshedSession.sessionId !== 'string' ||
    typeof refreshedSession.type !== 'string'
  ) {
    return false
  }

  persistAuthSession({
    token: refreshedSession.token,
    sessionId: refreshedSession.sessionId,
    type: refreshedSession.type,
    roles: Array.isArray(refreshedSession.roles)
      ? refreshedSession.roles.filter((role): role is string => typeof role === 'string')
      : [],
  })

  return true
}

export function isBackendUnavailableError(error: unknown): error is BackendUnavailableError {
  return error instanceof BackendUnavailableError
}