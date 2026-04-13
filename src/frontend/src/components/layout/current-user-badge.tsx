import { useEffect, useState } from 'preact/hooks'

import { getAuthChangedEventName, readAuthSession } from '../../services/auth-session'
import { getUserById } from '../../services/user-api'
import type { User } from '../../types/user'

function getFullName(user: User): string {
  return `${user.firstName} ${user.lastName}`.trim()
}

function getRoleLabel(role: string): string {
  switch (role.toUpperCase()) {
    case 'LANDLORD':
      return 'Landlord'
    case 'TENANT':
      return 'Tenant'
    case 'ADMIN':
      return 'Admin'
    default:
      return role
  }
}

function getRoleBadgeClass(role: string): string {
  switch (role.toUpperCase()) {
    case 'LANDLORD':
      return 'badge-success badge-soft'
    case 'TENANT':
      return 'badge-info badge-soft'
    case 'ADMIN':
      return 'badge-warning badge-soft'
    default:
      return 'badge-neutral badge-soft'
  }
}

export function CurrentUserBadge() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadUser = async () => {
      const session = readAuthSession()

      if (!session) {
        if (isMounted) {
          setUser(null)
        }

        return
      }

      try {
        const fetchedUser = await getUserById(session.userId, session.token, session.type)

        if (isMounted) {
          setUser(fetchedUser)
        }
      } catch {
        if (isMounted) {
          setUser(null)
        }
      }
    }

    void loadUser()

    const handleAuthChange = () => {
      void loadUser()
    }

    window.addEventListener('storage', handleAuthChange)
    window.addEventListener(getAuthChangedEventName(), handleAuthChange)

    return () => {
      isMounted = false
      window.removeEventListener('storage', handleAuthChange)
      window.removeEventListener(getAuthChangedEventName(), handleAuthChange)
    }
  }, [])

  if (!user) {
    return null
  }

  return (
    <div class="hidden items-center gap-2 sm:flex">
      <span class="badge badge-neutral badge-outline">{getFullName(user)}</span>
      <span class={`badge ${getRoleBadgeClass(user.role)}`}>{getRoleLabel(user.role)}</span>
    </div>
  )
}