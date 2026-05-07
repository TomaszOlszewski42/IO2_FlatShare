import { useEffect, useState } from 'preact/hooks'

import { readAuthSession, subscribeToAuthChanges } from '../../services/auth-session'
import { getUserById } from '../../services/user-api'
import type { User } from '../../types/user'

function getFullName(user: User): string {
  const fullName = `${user.firstName} ${user.lastName}`.trim()

  return fullName || 'FlatShare user'
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

    const unsubscribe = subscribeToAuthChanges(() => {
      void loadUser()
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [])

  if (!user) {
    return null
  }

  const fullName = getFullName(user)
  const profileHref = `/users/${encodeURIComponent(user.id)}`

  return (
    <a
      class="hidden items-center gap-2 rounded-box px-2 py-1 transition hover:bg-base-200 sm:flex"
      href={profileHref}
      aria-label={`View public profile of ${fullName}`}
      title="View public profile"
    >
      <span class="badge badge-neutral badge-outline">{fullName}</span>
      <span class={`badge ${getRoleBadgeClass(user.role)}`}>{getRoleLabel(user.role)}</span>
    </a>
  )
}