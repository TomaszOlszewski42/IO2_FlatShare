import { route } from 'preact-router'

import { AppButton } from '../ui/app-button'
import { clearAuthSession } from '../../services/auth-session'
import { useAuth } from '../../hooks/use-auth'

export function AuthControls() {
  const { isAuthenticated, session } = useAuth()

  if (!isAuthenticated) {
    return (
      <nav class="flex items-center gap-2">
        <a class="btn btn-ghost btn-sm" href="/login">
          Log in
        </a>
        <a class="btn btn-primary btn-sm" href="/register">
          Register
        </a>
      </nav>
    )
  }

  const profileHref = session?.userId ? `/users/${encodeURIComponent(session.userId)}` : ''

  return (
    <div class="flex items-center gap-2">
      {profileHref ? (
        <a class="btn btn-outline btn-sm sm:hidden" href={profileHref}>
          Profile
        </a>
      ) : null}

      <AppButton
        variant="ghost"
        className="btn-sm"
        onClick={() => {
          clearAuthSession()
          route('/')
        }}
      >
        Log out
      </AppButton>
    </div>
  )
}