const SESSION_TOKEN_KEY = 'flatshare.session.token'
const SESSION_ID_KEY = 'flatshare.session.id'
const SESSION_TYPE_KEY = 'flatshare.session.type'

const AUTH_CHANGED_EVENT = 'flatshare-auth-changed'

type PersistAuthSessionInput = {
  token: string
  sessionId: string
  type: string
}

export type AuthSession = {
  token: string
  sessionId: string
  type: string
}

function notifyAuthChanged() {
  window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT))
}

export function getAuthChangedEventName(): string {
  return AUTH_CHANGED_EVENT
}

export function persistAuthSession({ token, sessionId, type }: PersistAuthSessionInput) {
  localStorage.setItem(SESSION_TOKEN_KEY, token)
  localStorage.setItem(SESSION_ID_KEY, sessionId)
  localStorage.setItem(SESSION_TYPE_KEY, type)

  notifyAuthChanged()
}

export function clearAuthSession() {
  localStorage.removeItem(SESSION_TOKEN_KEY)
  localStorage.removeItem(SESSION_ID_KEY)
  localStorage.removeItem(SESSION_TYPE_KEY)
  notifyAuthChanged()
}

export function readAuthSession(): AuthSession | null {
  const token = localStorage.getItem(SESSION_TOKEN_KEY)
  const sessionId = localStorage.getItem(SESSION_ID_KEY)
  const type = localStorage.getItem(SESSION_TYPE_KEY)

  if (!token || !sessionId || !type) {
    return null
  }

  return {
    token,
    sessionId,
    type,
  }
}
