import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'preact'
import { act } from 'preact/test-utils'

import { clearAuthSession } from '../../services/auth-session'
import { useAuth } from '../../hooks/use-auth'
import { UserRole } from '../../types/user'
import { AuthControls } from './auth-controls'

const routeMock = vi.fn()

vi.mock('preact-router', () => ({
  route: (...args: unknown[]) => routeMock(...args),
}))

vi.mock('../../services/auth-session', () => ({
  clearAuthSession: vi.fn(),
}))

vi.mock('../../hooks/use-auth', () => ({
  useAuth: vi.fn(),
}))

function renderAuthControls() {
  const container = document.createElement('div')
  document.body.appendChild(container)

  act(() => {
    render(<AuthControls />, container)
  })

  return container
}

describe('AuthControls', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders login and register links when user is not authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      session: null,
      hasRole: () => false,
      isTenant: false,
      isLandlord: false,
      isAdmin: false,
    })

    const container = renderAuthControls()

    expect(container.textContent).toContain('Log in')
    expect(container.textContent).toContain('Register')
    expect(container.querySelector('a[href="/login"]')).not.toBeNull()
    expect(container.querySelector('a[href="/register"]')).not.toBeNull()
    expect(container.textContent).not.toContain('Log out')
  })

  it('renders profile link and logout button when user is authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      session: {
        token: 'token-1',
        sessionId: 'session-1',
        type: 'Bearer',
        roles: [UserRole.Tenant],
        userId: 'user-1',
      },
      hasRole: (role) => role === UserRole.Tenant,
      isTenant: true,
      isLandlord: false,
      isAdmin: false,
    })

    const container = renderAuthControls()

    expect(container.textContent).toContain('Profile')
    expect(container.textContent).toContain('Log out')
    expect(container.querySelector('a[href="/users/user-1"]')).not.toBeNull()
  })

  it('logs user out and redirects to home page', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      session: {
        token: 'token-1',
        sessionId: 'session-1',
        type: 'Bearer',
        roles: [UserRole.Landlord],
        userId: 'user-1',
      },
      hasRole: (role) => role === UserRole.Landlord,
      isTenant: false,
      isLandlord: true,
      isAdmin: false,
    })

    const container = renderAuthControls()
    const logoutButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Log out',
    )

    expect(logoutButton).not.toBeUndefined()

    act(() => {
      logoutButton?.click()
    })

    expect(clearAuthSession).toHaveBeenCalledTimes(1)
    expect(routeMock).toHaveBeenCalledWith('/')
  })

  it('does not render profile link when authenticated session has no user id', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      session: null,
      hasRole: () => false,
      isTenant: false,
      isLandlord: false,
      isAdmin: false,
    })

    const container = renderAuthControls()

    expect(container.textContent).toContain('Log out')
    expect(container.textContent).not.toContain('Profile')
    expect(container.querySelector('a[href^="/users/"]')).toBeNull()
  })
})