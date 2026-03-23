import { route } from 'preact-router'
import { useEffect, useState } from 'preact/hooks'

import { AppButton } from '../ui/app-button'
import { clearAuthSession, getAuthChangedEventName, readAuthSession } from '../../services/auth-session'

function isAuthenticated(): boolean {
  return Boolean(readAuthSession())
}

export function AuthControls() {
  const [authenticated, setAuthenticated] = useState<boolean>(isAuthenticated)

  useEffect(() => {
    const handleChange = () => {
      setAuthenticated(isAuthenticated())
    }

    window.addEventListener('storage', handleChange)
    window.addEventListener(getAuthChangedEventName(), handleChange)

    return () => {
      window.removeEventListener('storage', handleChange)
      window.removeEventListener(getAuthChangedEventName(), handleChange)
    }
  }, [])

  if (!authenticated) {
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

  return (
    <div class="flex items-center">
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
