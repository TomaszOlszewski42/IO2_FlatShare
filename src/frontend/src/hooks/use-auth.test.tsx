import { expect, it, describe, vi, beforeEach } from 'vitest'
import { useAuth } from './use-auth'
import * as authSession from '../services/auth-session'
import { UserRole } from '../types/user'
import * as preactHooks from 'preact/hooks'

vi.mock('../services/auth-session', async () => {
  const actual = await vi.importActual('../services/auth-session') as any
  return {
    ...actual,
    readAuthSession: vi.fn(),
  }
})

vi.mock('preact/hooks', async () => {
  const actual = await vi.importActual('preact/hooks') as any
  return {
    ...actual,
    useState: vi.fn((initialValue) => [initialValue, vi.fn()]),
    useEffect: vi.fn(),
  }
})

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return unauthenticated state when no session exists', () => {
    vi.mocked(authSession.readAuthSession).mockReturnValue(null)
    vi.mocked(preactHooks.useState).mockReturnValue([null, vi.fn()])

    const auth = useAuth()

    expect(auth.isAuthenticated).toBe(false)
    expect(auth.isTenant).toBe(false)
    expect(auth.isLandlord).toBe(false)
  })

  it('should return tenant state when session has tenant role', () => {
    const session = {
      token: 'token',
      sessionId: 'id',
      type: 'type',
      roles: [UserRole.Tenant],
      userId: 'user-1',
    }
    vi.mocked(authSession.readAuthSession).mockReturnValue(session)
    vi.mocked(preactHooks.useState).mockReturnValue([session, vi.fn()])

    const auth = useAuth()

    expect(auth.isAuthenticated).toBe(true)
    expect(auth.isTenant).toBe(true)
    expect(auth.isLandlord).toBe(false)
  })

  it('should return landlord state when session has landlord role', () => {
    const session = {
      token: 'token',
      sessionId: 'id',
      type: 'type',
      roles: [UserRole.Landlord],
      userId: 'user-1',
    }
    vi.mocked(authSession.readAuthSession).mockReturnValue(session)
    vi.mocked(preactHooks.useState).mockReturnValue([session, vi.fn()])

    const auth = useAuth()

    expect(auth.isAuthenticated).toBe(true)
    expect(auth.isTenant).toBe(false)
    expect(auth.isLandlord).toBe(true)
  })
})
