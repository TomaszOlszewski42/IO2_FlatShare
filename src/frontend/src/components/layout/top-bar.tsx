import { useEffect, useState } from 'preact/hooks'

import { appConfig } from '../../config/app-config'
import { CurrentUserBadge } from './current-user-badge'
import { AuthControls } from './auth-controls'
import { RoleBoundary } from '../auth/role-boundary'
import { UserRole } from '../../types/user'
import { getAuthChangedEventName, readAuthSession } from '../../services/auth-session'

function isAuthenticated(): boolean {
  return Boolean(readAuthSession())
}

function isTenant(): boolean {
  const session = readAuthSession()

  if (!session) {
    return false
  }

  return session.roles.includes('TENANT')
}

function isBookingUser(): boolean {
  const session = readAuthSession()

  if (!session) {
    return false
  }

  return session.roles.includes('TENANT') || session.roles.includes('LANDLORD')
}

export function TopBar() {
  const [authenticated, setAuthenticated] = useState<boolean>(isAuthenticated)
  const [tenant, setTenant] = useState<boolean>(isTenant)
  const [bookingUser, setBookingUser] = useState<boolean>(isBookingUser)

  useEffect(() => {
    const handleChange = () => {
      setAuthenticated(isAuthenticated())
      setTenant(isTenant())
      setBookingUser(isBookingUser())
    }

    window.addEventListener('storage', handleChange)
    window.addEventListener(getAuthChangedEventName(), handleChange)

    return () => {
      window.removeEventListener('storage', handleChange)
      window.removeEventListener(getAuthChangedEventName(), handleChange)
    }
  }, [])

  return (
    <header class="border-b border-base-300/70 bg-base-100/85 shadow-sm backdrop-blur">
      <div class="navbar mx-auto w-full max-w-6xl px-4 md:px-6">
        <div class="navbar-start gap-6">
          <a class="link link-hover text-lg font-semibold tracking-tight no-underline" href="/">
            {appConfig.name}
          </a>

          <nav class="hidden items-center gap-4 md:flex">
            <a class="link link-hover text-sm" href="/listings">
              Listings
            </a>

            {bookingUser ? (
              <a class="link link-hover text-sm" href="/bookings">
                Bookings
              </a>
            ) : null}

            <RoleBoundary requiredRole={UserRole.Admin}>
              <a class="link link-hover text-sm" href="/admin/reports">
                Dashboard
              </a>
            </RoleBoundary>

            <RoleBoundary requiredRole={UserRole.Landlord}>
              <a class="link link-hover text-sm" href="/listings/create">
                Create listing
              </a>
            </RoleBoundary>

            {authenticated && tenant ? (
              <a class="link link-hover text-sm" href="/preferences">
                Preferences
              </a>
            ) : null}
          </nav>
        </div>

        <div class="navbar-end gap-3">
          <CurrentUserBadge />
          <AuthControls />
        </div>
      </div>
    </header>
  )
}