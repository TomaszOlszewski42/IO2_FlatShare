import { refreshSession } from './auth-api'
import { ApiHttpError, isBackendUnavailableError } from './api-client'
import { clearAuthSession, persistAuthSession, readAuthSession } from './auth-session'

export type RefreshSessionState = 'no-session' | 'valid' | 'invalid' | 'backend-unavailable'

export async function refreshSessionOnAppLoad(): Promise<RefreshSessionState> {
  const session = readAuthSession()

  if (!session) {
    return 'no-session'
  }

  try {
    const refreshedSession = await refreshSession(session.sessionId, session.token, session.type)

    persistAuthSession({
      token: refreshedSession.token,
      sessionId: refreshedSession.sessionId,
      type: refreshedSession.type,
      roles: refreshedSession.roles,
    })

    return 'valid'
  } catch (error) {
    if (error instanceof ApiHttpError && (error.status === 401 || error.status === 403)) {
      clearAuthSession()
      return 'invalid'
    }

    if (isBackendUnavailableError(error)) {
      return 'backend-unavailable'
    }

    return 'backend-unavailable'
  }
}
