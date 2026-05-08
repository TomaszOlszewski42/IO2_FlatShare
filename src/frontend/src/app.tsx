import { PasswordResetRequestPage } from './pages/password-reset-request-page'
import { PasswordResetConfirmPage } from './pages/password-reset-confirm-page'
import { NoBackendPage } from './pages/no-backend-page'
import { TenantPreferencesPage } from './pages/tenant-preferences-page'
import { AppShell } from './components/layout/app-shell'
import { HomePage } from './pages/home-page'
import { LoginPage } from './pages/login-page'
import { AdminReportsPage } from './pages/admin/admin-reports-page'
import { ListingCreatePage } from './pages/listings/listing-create-page'
import { ListingEditPage } from './pages/listings/listing-edit-page'
import { ListingDetailsPage } from './pages/listings/listing-details-page'
import { ListingsPage } from './pages/listings/listings-page'
import { PublicUserProfilePage } from './pages/users/public-user-profile-page'
import { RegisterPage } from './pages/register-page'
import { readAuthSession } from './services/auth-session'
import { refreshSessionOnAppLoad } from './services/auth-bootstrap'
import { getBackendUnavailableEventName, isBackendUnavailable } from './services/backend-availability'
import { ProtectedRoute } from './components/auth/protected-route'
import { UserRole } from './types/user'
import Router from 'preact-router'
import { route } from 'preact-router'
import { useEffect } from 'preact/hooks'

export function App() {
  useEffect(() => {
    const hadSession = Boolean(readAuthSession())

    void refreshSessionOnAppLoad().then((state) => {
      if (hadSession && state === 'invalid') {
        route('/')
      }

      if (hadSession && state === 'backend-unavailable') {
        const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`
        route(`/no-backend?returnTo=${encodeURIComponent(currentPath)}`, true)
      }
    })
  }, [])

  useEffect(() => {
    const onBackendUnavailable = () => {
      const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`

      if (window.location.pathname === '/no-backend') {
        return
      }

      route(`/no-backend?returnTo=${encodeURIComponent(currentPath)}`, true)
    }

    window.addEventListener(getBackendUnavailableEventName(), onBackendUnavailable)

    if (isBackendUnavailable()) {
      onBackendUnavailable()
    }

    return () => {
      window.removeEventListener(getBackendUnavailableEventName(), onBackendUnavailable)
    }
  }, [])

  return (
    <AppShell>
      <Router>
        <HomePage path="/" />
        <ProtectedRoute path="/admin/reports" component={AdminReportsPage} requiredRole={UserRole.Admin} />
        <ProtectedRoute path="/listings" component={ListingsPage} />
        <ProtectedRoute path="/preferences" component={TenantPreferencesPage} requiredRole={UserRole.Tenant} />
        <ProtectedRoute path="/listings/create" component={ListingCreatePage} requiredRole={UserRole.Landlord} />
        <ProtectedRoute path="/listings/:listingId/edit" component={ListingEditPage} requiredRole={UserRole.Landlord} />
        <PublicUserProfilePage path="/users/:userId" />
        <ListingDetailsPage path="/listings/:listingId" />
        <LoginPage path="/login" />
        <RegisterPage path="/register" />
        <PasswordResetRequestPage path="/password-reset/request" />
        <PasswordResetConfirmPage path="/password-reset/confirm" />
        <NoBackendPage path="/no-backend" />
      </Router>
    </AppShell>
  )
}