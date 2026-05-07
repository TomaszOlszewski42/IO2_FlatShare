import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'preact'
import { act } from 'preact/test-utils'

import { useAuth } from '../../hooks/use-auth'
import { ApiHttpError } from '../../services/api-client'
import { readAuthSession } from '../../services/auth-session'
import { getUserById } from '../../services/user-api'
import { UserRole } from '../../types/user'
import { PublicUserProfilePage } from './public-user-profile-page'

const routeMock = vi.fn()

vi.mock('preact-router', () => ({
  route: (...args: unknown[]) => routeMock(...args),
}))

vi.mock('../../services/user-api', () => ({
  getUserById: vi.fn(),
}))

vi.mock('../../services/auth-session', () => ({
  readAuthSession: vi.fn(),
}))

vi.mock('../../services/error-handler-context', () => ({
  useErrorHandler: () => ({
    showToast: vi.fn(),
  }),
}))

vi.mock('../../hooks/use-auth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('../../components/users/public-user-profile-card', () => ({
  PublicUserProfileCard: ({ user }: { user: { firstName: string; lastName: string } }) => (
    <article>Profile card for {`${user.firstName} ${user.lastName}`.trim()}</article>
  ),
}))

vi.mock('../../components/reports/report-violation-dialog', () => ({
  ReportViolationDialog: ({
    isOpen,
    targetId,
    targetType,
    targetLabel,
  }: {
    isOpen: boolean
    targetId: string
    targetType: string
    targetLabel: string
  }) =>
    isOpen ? (
      <div>
        Report dialog for {targetType} {targetId} {targetLabel}
      </div>
    ) : null,
}))

const anonymousAuthState = {
  isAuthenticated: false,
  session: null,
  hasRole: () => false,
  isTenant: false,
  isLandlord: false,
  isAdmin: false,
}

const tenantSession = {
  token: 'token-1',
  sessionId: 'session-1',
  type: 'Bearer',
  roles: [UserRole.Tenant],
  userId: 'user-1',
}

async function waitForCondition(condition: () => boolean) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (condition()) {
      return
    }

    await act(async () => {
      await new Promise((resolve) => {
        window.setTimeout(resolve, 0)
      })
    })
  }
}

async function renderPublicUserProfilePage(userId = 'user-2') {
  const container = document.createElement('div')
  document.body.appendChild(container)

  await act(async () => {
    render(<PublicUserProfilePage userId={userId} />, container)
  })

  return container
}

async function renderPublicUserProfilePageWithoutUserId() {
  const container = document.createElement('div')
  document.body.appendChild(container)

  await act(async () => {
    render(<PublicUserProfilePage />, container)
  })

  return container
}

describe('PublicUserProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuth).mockReturnValue(anonymousAuthState)
    vi.mocked(readAuthSession).mockReturnValue(null)
    window.history.pushState({}, '', '/users/user-2')
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('loads and renders a public user profile', async () => {
    vi.mocked(getUserById).mockResolvedValue({
      id: 'user-2',
      firstName: 'Anna',
      lastName: 'Nowak',
      email: 'anna.nowak@example.com',
      role: UserRole.Landlord,
    })

    const container = await renderPublicUserProfilePage()

    await waitForCondition(() => container.textContent?.includes('Profile card for Anna Nowak') ?? false)

    expect(getUserById).toHaveBeenCalledWith('user-2')
    expect(container.textContent).toContain('Profile card for Anna Nowak')
    expect(container.textContent).toContain('Report user')
  })

  it('shows readable error when profile does not exist', async () => {
    vi.mocked(getUserById).mockRejectedValue(
      new ApiHttpError(404, 'Request failed with status 404', null),
    )

    const container = await renderPublicUserProfilePage()

    await waitForCondition(() => container.textContent?.includes('User profile not found') ?? false)

    expect(getUserById).toHaveBeenCalledWith('user-2')
    expect(container.textContent).toContain('User profile not found')
    expect(container.textContent).toContain('This user profile does not exist or is no longer available.')
    expect(container.textContent).toContain('Back to listings')
  })

  it('shows error when user id is missing', async () => {
    const container = await renderPublicUserProfilePageWithoutUserId()

    await waitForCondition(() => container.textContent?.includes('Missing user profile id.') ?? false)

    expect(getUserById).not.toHaveBeenCalled()
    expect(container.textContent).toContain('User profile not found')
    expect(container.textContent).toContain('Missing user profile id.')
  })

  it('redirects anonymous user to login before opening report dialog', async () => {
    vi.mocked(readAuthSession).mockReturnValue(null)

    vi.mocked(getUserById).mockResolvedValue({
      id: 'user-2',
      firstName: 'Anna',
      lastName: 'Nowak',
      email: 'anna.nowak@example.com',
      role: UserRole.Landlord,
    })

    const container = await renderPublicUserProfilePage()

    await waitForCondition(() => container.textContent?.includes('Report user') ?? false)

    const reportButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Report user',
    )

    expect(reportButton).not.toBeUndefined()

    act(() => {
      reportButton?.click()
    })

    expect(routeMock).toHaveBeenCalledWith('/login?returnTo=%2Fusers%2Fuser-2')
    expect(container.textContent).not.toContain('Report dialog')
  })

  it('opens report dialog for authenticated user viewing someone else profile', async () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      session: tenantSession,
      hasRole: (role) => role === UserRole.Tenant,
      isTenant: true,
      isLandlord: false,
      isAdmin: false,
    })

    vi.mocked(readAuthSession).mockReturnValue(tenantSession)

    vi.mocked(getUserById).mockResolvedValue({
      id: 'user-2',
      firstName: 'Anna',
      lastName: 'Nowak',
      email: 'anna.nowak@example.com',
      role: UserRole.Landlord,
    })

    const container = await renderPublicUserProfilePage()

    await waitForCondition(() => container.textContent?.includes('Report user') ?? false)

    const reportButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Report user',
    )

    expect(reportButton).not.toBeUndefined()

    act(() => {
      reportButton?.click()
    })

    expect(container.textContent).toContain('Report dialog for USER user-2 Anna Nowak')
    expect(routeMock).not.toHaveBeenCalled()
  })

  it('does not allow reporting own profile', async () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      session: {
        ...tenantSession,
        userId: 'user-2',
      },
      hasRole: (role) => role === UserRole.Tenant,
      isTenant: true,
      isLandlord: false,
      isAdmin: false,
    })

    vi.mocked(readAuthSession).mockReturnValue({
      ...tenantSession,
      userId: 'user-2',
    })

    vi.mocked(getUserById).mockResolvedValue({
      id: 'user-2',
      firstName: 'Anna',
      lastName: 'Nowak',
      email: 'anna.nowak@example.com',
      role: UserRole.Tenant,
    })

    const container = await renderPublicUserProfilePage()

    await waitForCondition(() => container.textContent?.includes('This is your public profile') ?? false)

    expect(container.textContent).toContain('Profile card for Anna Nowak')
    expect(container.textContent).toContain('This is your public profile')
    expect(container.textContent).not.toContain('Report user')
    expect(container.textContent).not.toContain('Report dialog')
  })
})