import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'preact'
import { act } from 'preact/test-utils'

import { readAuthSession, subscribeToAuthChanges } from '../../services/auth-session'
import { getUserById } from '../../services/user-api'
import { UserRole } from '../../types/user'
import { CurrentUserBadge } from './current-user-badge'

vi.mock('../../services/auth-session', () => ({
  readAuthSession: vi.fn(),
  subscribeToAuthChanges: vi.fn(() => () => undefined),
}))

vi.mock('../../services/user-api', () => ({
  getUserById: vi.fn(),
}))

async function renderCurrentUserBadge() {
  const container = document.createElement('div')
  document.body.appendChild(container)

  await act(async () => {
    render(<CurrentUserBadge />, container)
    await Promise.resolve()
  })

  return container
}

describe('CurrentUserBadge', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders nothing when user is not authenticated', async () => {
    vi.mocked(readAuthSession).mockReturnValue(null)

    const container = await renderCurrentUserBadge()

    expect(container.textContent).toBe('')
    expect(getUserById).not.toHaveBeenCalled()
  })

  it('loads current user and renders a link to public profile', async () => {
    vi.mocked(readAuthSession).mockReturnValue({
      token: 'token-1',
      sessionId: 'session-1',
      type: 'Bearer',
      roles: [UserRole.Tenant],
      userId: 'user-1',
    })

    vi.mocked(getUserById).mockResolvedValue({
      id: 'user-1',
      firstName: 'Anna',
      lastName: 'Nowak',
      email: 'anna.nowak@example.com',
      role: UserRole.Tenant,
    })

    const container = await renderCurrentUserBadge()

    expect(getUserById).toHaveBeenCalledWith('user-1', 'token-1', 'Bearer')

    const profileLink = container.querySelector('a[href="/users/user-1"]')

    expect(profileLink).not.toBeNull()
    expect(profileLink?.textContent).toContain('Anna Nowak')
    expect(profileLink?.textContent).toContain('Tenant')
  })

  it('subscribes to auth changes', async () => {
    vi.mocked(readAuthSession).mockReturnValue(null)

    await renderCurrentUserBadge()

    expect(subscribeToAuthChanges).toHaveBeenCalledTimes(1)
  })
})