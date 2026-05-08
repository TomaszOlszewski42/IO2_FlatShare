import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'preact'
import { act } from 'preact/test-utils'

import { appConfig } from '../../config/app-config'
import { readAuthSession } from '../../services/auth-session'
import { UserRole } from '../../types/user'
import { useAuth } from '../../hooks/use-auth'
import { TopBar } from './top-bar'

vi.mock('./current-user-badge', () => ({
  CurrentUserBadge: () => <div data-test-id="current-user-badge" />,
}))

vi.mock('./auth-controls', () => ({
  AuthControls: () => <div data-test-id="auth-controls" />,
}))

vi.mock('../../services/auth-session', () => ({
  readAuthSession: vi.fn(() => null),
  getAuthChangedEventName: vi.fn(() => 'auth-changed'),
}))

vi.mock('../../hooks/use-auth', () => ({
  useAuth: vi.fn(),
}))

function mockUseAuthAsGuest() {
  vi.mocked(useAuth).mockReturnValue({
    isAuthenticated: false,
    session: null,
    hasRole: () => false,
    isTenant: false,
    isLandlord: false,
    isAdmin: false,
  })
}

function mockUseAuthAsAdmin() {
  vi.mocked(useAuth).mockReturnValue({
    isAuthenticated: true,
    session: null,
    hasRole: (role: UserRole) => role === UserRole.Admin,
    isTenant: false,
    isLandlord: false,
    isAdmin: true,
  })
}

function renderTopBar() {
  const container = document.createElement('div')
  document.body.appendChild(container)

  act(() => {
    render(<TopBar />, container)
  })

  return container
}

describe('TopBar', () => {
  beforeEach(() => {
    vi.mocked(readAuthSession).mockReturnValue(null)
    mockUseAuthAsGuest()
  })

  afterEach(() => {
    document.body.innerHTML = ''
    vi.clearAllMocks()
  })

  it('renders brand link with app name', () => {
    const container = renderTopBar()

    const brandLink = container.querySelector('a[href="/"]')

    expect(brandLink).not.toBeNull()
    expect(brandLink?.textContent).toBe(appConfig.name)
  })

  it('renders the user badge and auth controls areas', () => {
    const container = renderTopBar()

    expect(container.querySelector('[data-test-id="current-user-badge"]')).not.toBeNull()
    expect(container.querySelector('[data-test-id="auth-controls"]')).not.toBeNull()
  })

  it('does not render dashboard link for non-admin users', () => {
    const container = renderTopBar()

    expect(container.querySelector('a[href="/admin/reports"]')).toBeNull()
  })

  it('renders dashboard link for admin users', () => {
    mockUseAuthAsAdmin()

    const container = renderTopBar()

    const dashboardLink = container.querySelector('a[href="/admin/reports"]')

    expect(dashboardLink).not.toBeNull()
    expect(dashboardLink?.textContent).toBe('Dashboard')
  })
})