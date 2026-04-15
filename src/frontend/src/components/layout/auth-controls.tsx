import { route } from 'preact-router'
import { AppButton } from '../ui/app-button'
import { clearAuthSession } from '../../services/auth-session'
import { useAuth } from '../../hooks/use-auth'

export function AuthControls() {
  const { isAuthenticated } = useAuth()

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

  return (
    <div class="flex items-center gap-2">
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