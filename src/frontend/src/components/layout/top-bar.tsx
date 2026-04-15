import { appConfig } from '../../config/app-config'
import { CurrentUserBadge } from './current-user-badge'
import { AuthControls } from './auth-controls'
import { RoleBoundary } from '../auth/role-boundary'
import { UserRole } from '../../types/user'

export function TopBar() {
  return (
    <header class="border-b border-base-300/70 bg-base-100/85 shadow-sm backdrop-blur">
      <div class="navbar mx-auto w-full max-w-6xl px-4 md:px-6">
        <div class="navbar-start">
          <a class="link link-hover text-lg font-semibold tracking-tight no-underline" href="/">
            {appConfig.name}
          </a>
          
          <nav class="ml-8 hidden md:flex gap-4">
            <a href="/listings" class="link link-hover text-sm font-medium">
              Browse
            </a>
            <RoleBoundary requiredRole={UserRole.Landlord}>
              <a href="/listings/create" class="link link-hover text-sm font-medium">
                Create Listing
              </a>
            </RoleBoundary>
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
