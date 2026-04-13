const SESSION_TOKEN_KEY = 'flatshare.session.token'
const SESSION_ID_KEY = 'flatshare.session.id'
const SESSION_TYPE_KEY = 'flatshare.session.type'
const SESSION_ROLES_KEY = 'flatshare.session.roles'
const SESSION_USER_ID_KEY = 'flatshare.session.user-id'

const AUTH_CHANGED_EVENT = 'flatshare-auth-changed'

type PersistAuthSessionInput = {
  token: string
  sessionId: string
  type: string
  roles?: string[]
}

export type AuthSession = {
  token: string
  sessionId: string
  type: string
  roles: string[]
  userId: string
}

function decodeBase64Url(value: string): string | null {
  try {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
    return atob(padded)
  } catch {
    return null
  }
}

function readJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split('.')

  if (parts.length < 2) {
    return null
  }

  const payload = decodeBase64Url(parts[1])

  if (!payload) {
    return null
  }

  try {
    return JSON.parse(payload) as Record<string, unknown>
  } catch {
    return null
  }
}

function readClaim(payload: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = payload[key]

    if (typeof value === 'string' && value.trim().length > 0) {
      return value
    }
  }

  return null
}

function getUserIdFromToken(token: string): string | null {
  const payload = readJwtPayload(token)

  if (!payload) {
    return null
  }

  return readClaim(payload, ['sub', 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'])
}

function parseSessionRoles(rawRoles: string | null): string[] {
  if (!rawRoles) {
    return []
  }

  try {
    const parsed = JSON.parse(rawRoles)

    if (Array.isArray(parsed) && parsed.every((role) => typeof role === 'string')) {
      return parsed
    }
  } catch {
    return []
  }

  return []
}

export function getAuthSessionUserId(session: AuthSession): string | null {
  return session.userId || null
}

export function getAuthSessionRoles(session: AuthSession): string[] {
  return session.roles
}

function notifyAuthChanged() {
  window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT))
}

export function getAuthChangedEventName(): string {
  return AUTH_CHANGED_EVENT
}

export function persistAuthSession({ token, sessionId, type, roles = [] }: PersistAuthSessionInput) {
  const userId = getUserIdFromToken(token)

  localStorage.setItem(SESSION_TOKEN_KEY, token)
  localStorage.setItem(SESSION_ID_KEY, sessionId)
  localStorage.setItem(SESSION_TYPE_KEY, type)
  localStorage.setItem(SESSION_ROLES_KEY, JSON.stringify(roles))

  if (userId) {
    localStorage.setItem(SESSION_USER_ID_KEY, userId)
  } else {
    localStorage.removeItem(SESSION_USER_ID_KEY)
  }

  notifyAuthChanged()
}

export function clearAuthSession() {
  localStorage.removeItem(SESSION_TOKEN_KEY)
  localStorage.removeItem(SESSION_ID_KEY)
  localStorage.removeItem(SESSION_TYPE_KEY)
  localStorage.removeItem(SESSION_ROLES_KEY)
  localStorage.removeItem(SESSION_USER_ID_KEY)
  notifyAuthChanged()
}

export function readAuthSession(): AuthSession | null {
  const token = localStorage.getItem(SESSION_TOKEN_KEY)
  const sessionId = localStorage.getItem(SESSION_ID_KEY)
  const type = localStorage.getItem(SESSION_TYPE_KEY)
  const rawRoles = localStorage.getItem(SESSION_ROLES_KEY)
  const storedUserId = localStorage.getItem(SESSION_USER_ID_KEY)

  if (!token || !sessionId || !type) {
    return null
  }

  const userId = storedUserId ?? getUserIdFromToken(token)

  if (!userId) {
    return null
  }

  if (!storedUserId) {
    localStorage.setItem(SESSION_USER_ID_KEY, userId)
  }

  return {
    token,
    sessionId,
    type,
    roles: parseSessionRoles(rawRoles),
    userId,
  }
}
