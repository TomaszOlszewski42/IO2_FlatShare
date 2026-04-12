import { AppShell } from './components/layout/app-shell'
import { HomePage } from './pages/home-page'
import { LoginPage } from './pages/login-page'
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
        <LoginPage path="/login" />
        <RegisterPage path="/register" />
      </Router>
    </AppShell>
  )
}
