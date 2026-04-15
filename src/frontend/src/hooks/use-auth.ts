import { useEffect, useState } from 'preact/hooks'
import { getAuthChangedEventName, readAuthSession, type AuthSession } from '../services/auth-session'
import { UserRole } from '../types/user'

export function useAuth() {
  const [session, setSession] = useState<AuthSession | null>(readAuthSession())

  useEffect(() => {
    const handleChange = () => {
      setSession(readAuthSession())
    }

    window.addEventListener('storage', handleChange)
    window.addEventListener(getAuthChangedEventName(), handleChange)

    return () => {
      window.removeEventListener('storage', handleChange)
      window.removeEventListener(getAuthChangedEventName(), handleChange)
    }
  }, [])

  const hasRole = (role: UserRole) => {
    return session?.roles.includes(role) ?? false
  }

  return {
    isAuthenticated: !!session,
    session,
    hasRole,
    isTenant: hasRole(UserRole.Tenant),
    isLandlord: hasRole(UserRole.Landlord),
    isAdmin: hasRole(UserRole.Admin),
  }
}
