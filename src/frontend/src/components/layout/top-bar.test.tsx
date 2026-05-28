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

const tenantSession = {
  token: 'tenant-token',
  sessionId: 'tenant-session',
  type: 'Bearer',
  roles: [UserRole.Tenant],
  userId: 'tenant-1',
}

const landlordSession = {
  token: 'landlord-token',
  sessionId: 'landlord-session',
  type: 'Bearer',
  roles: [UserRole.Landlord],
  userId: 'landlord-1',
}

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

function mockUseAuthAsLandlord() {
  vi.mocked(useAuth).mockReturnValue({
    isAuthenticated: true,
    session: landlordSession,
    hasRole: (role: UserRole) => role === UserRole.Landlord,
    isTenant: false,
    isLandlord: true,
    isAdmin: false,
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

  it('does not render bookings link for guests', () => {
    const container = renderTopBar()

    expect(container.querySelector('a[href="/bookings"]')).toBeNull()
  })

  it('renders bookings link for tenant users', () => {
    vi.mocked(readAuthSession).mockReturnValue(tenantSession)

    const container = renderTopBar()

    const bookingsLink = container.querySelector('a[href="/bookings"]')

    expect(bookingsLink).not.toBeNull()
    expect(bookingsLink?.textContent).toBe('Bookings')
  })

  it('renders bookings link for landlord users', () => {
    vi.mocked(readAuthSession).mockReturnValue(landlordSession)
    mockUseAuthAsLandlord()

    const container = renderTopBar()

    const bookingsLink = container.querySelector('a[href="/bookings"]')

    expect(bookingsLink).not.toBeNull()
    expect(bookingsLink?.textContent).toBe('Bookings')
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