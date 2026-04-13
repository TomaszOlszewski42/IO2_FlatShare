import { PasswordResetRequestPage } from './pages/password-reset-request-page'
import { PasswordResetConfirmPage } from './pages/password-reset-confirm-page'
import { AppShell } from './components/layout/app-shell'
import { HomePage } from './pages/home-page'
import { LoginPage } from './pages/login-page'
import { ListingCreatePage } from './pages/listings/listing-create-page'
import { ListingDetailsPage } from './pages/listings/listing-details-page'
import { ListingsPage } from './pages/listings/listings-page'
import { RegisterPage } from './pages/register-page'
import { readAuthSession } from './services/auth-session'
import { refreshSessionOnAppLoad } from './services/auth-bootstrap'
import Router from 'preact-router'
import { route } from 'preact-router'
import { useEffect } from 'preact/hooks'

export function App() {
  useEffect(() => {
    const hadSession = Boolean(readAuthSession())

    void refreshSessionOnAppLoad().then((isValid) => {
      if (hadSession && !isValid) {
        route('/login')
      }
    })
  }, [])

  return (
    <AppShell>
      <Router>
        <HomePage path="/" />
        <ListingsPage path="/listings" />
        <ListingCreatePage path="/listings/create" />
        <ListingDetailsPage path="/listings/:listingId" />
        <LoginPage path="/login" />
        <RegisterPage path="/register" />
        <PasswordResetRequestPage path="/password-reset/request" />
        <PasswordResetConfirmPage path="/password-reset/confirm" />
      </Router>
    </AppShell>
  )
}
