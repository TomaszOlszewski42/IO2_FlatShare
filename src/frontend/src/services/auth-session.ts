const SESSION_TOKEN_KEY = 'flatshare.session.token'
const SESSION_ID_KEY = 'flatshare.session.id'
const SESSION_TYPE_KEY = 'flatshare.session.type'
const SESSION_ROLES_KEY = 'flatshare.session.roles'

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
}

function notifyAuthChanged() {
  window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT))
}

export function getAuthChangedEventName(): string {
  return AUTH_CHANGED_EVENT
}

export function persistAuthSession({ token, sessionId, type, roles = [] }: PersistAuthSessionInput) {
  localStorage.setItem(SESSION_TOKEN_KEY, token)
  localStorage.setItem(SESSION_ID_KEY, sessionId)
  localStorage.setItem(SESSION_TYPE_KEY, type)
  localStorage.setItem(SESSION_ROLES_KEY, JSON.stringify(roles))

  notifyAuthChanged()
}

export function clearAuthSession() {
  localStorage.removeItem(SESSION_TOKEN_KEY)
  localStorage.removeItem(SESSION_ID_KEY)
  localStorage.removeItem(SESSION_TYPE_KEY)
  localStorage.removeItem(SESSION_ROLES_KEY)
  notifyAuthChanged()
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

export function readAuthSession(): AuthSession | null {
  const token = localStorage.getItem(SESSION_TOKEN_KEY)
  const sessionId = localStorage.getItem(SESSION_ID_KEY)
  const type = localStorage.getItem(SESSION_TYPE_KEY)
  const rawRoles = localStorage.getItem(SESSION_ROLES_KEY)

  if (!token || !sessionId || !type) {
    return null
  }

  return {
    token,
    sessionId,
    type,
    roles: parseSessionRoles(rawRoles),
  }
}
