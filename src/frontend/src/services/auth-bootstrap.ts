import { refreshSession } from './auth-api'
import { clearAuthSession, persistAuthSession, readAuthSession } from './auth-session'

export async function refreshSessionOnAppLoad(): Promise<boolean> {
  const session = readAuthSession()

  if (!session) {
    return false
  }

  try {
    const refreshedSession = await refreshSession(session.sessionId, session.token, session.type)

    persistAuthSession({
      token: refreshedSession.token,
      sessionId: refreshedSession.sessionId,
      type: refreshedSession.type,
    })

    return true
  } catch {
    clearAuthSession()
    return false
  }
}
