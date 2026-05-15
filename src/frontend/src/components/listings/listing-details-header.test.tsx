import { afterEach, describe, expect, it, vi } from 'vitest'
import { render } from 'preact'
import { act } from 'preact/test-utils'

import { useAuth } from '../../hooks/use-auth'
import { ListingDetailsHeader } from './listing-details-header'
import { UserRole } from '../../types/user'

vi.mock('../../hooks/use-auth', () => ({
  useAuth: vi.fn(),
}))

function mockAuth({
  roles = [UserRole.Tenant],
  userId = 'user-1',
}: {
  roles?: UserRole[]
  userId?: string
} = {}) {
  vi.mocked(useAuth).mockReturnValue({
    isAuthenticated: true,
    session: {
      token: 'token',
      sessionId: 'session-1',
      type: 'Bearer',
      roles,
      userId,
    },
    hasRole: vi.fn((role: UserRole) => roles.includes(role)),
    isTenant: roles.includes(UserRole.Tenant),
    isLandlord: roles.includes(UserRole.Landlord),
    isAdmin: roles.includes(UserRole.Admin),
  })
}

describe('ListingDetailsHeader', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    vi.clearAllMocks()
  })

  const defaultProps = {
    title: 'Test Listing',
    onBack: vi.fn(),
    onEdit: vi.fn(),
    onArchive: vi.fn(),
    onHide: vi.fn(),
    onSubmitForReview: vi.fn(),
    onPublish: vi.fn(),
    onRequestFixes: vi.fn(),
    onReportViolation: vi.fn(),
  }

  it('renders title and back button', () => {
    mockAuth()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<ListingDetailsHeader {...defaultProps} />, container)
    })

    expect(container.textContent).toContain('Test Listing')
    expect(container.textContent).toContain('Back to list')
  })

  it('shows Submit for review for landlord owner with DRAFT status', () => {
    mockAuth({ roles: [UserRole.Landlord], userId: 'owner-1' })
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ListingDetailsHeader 
          {...defaultProps} 
          status="DRAFT" 
          isOwner={true} 
        />, 
        container
      )
    })

    expect(container.textContent).toContain('Submit for review')
  })

  it('shows Publish and Request fixes for admin with AWAITING_REVIEW status', () => {
    mockAuth({ roles: [UserRole.Admin] })
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ListingDetailsHeader 
          {...defaultProps} 
          status="AWAITING_REVIEW" 
        />, 
        container
      )
    })

    expect(container.textContent).toContain('Publish')
    expect(container.textContent).toContain('Request fixes')
  })

  it('shows Hide and Archive for landlord owner with ACTIVE status', () => {
    mockAuth({ roles: [UserRole.Landlord], userId: 'owner-1' })
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ListingDetailsHeader 
          {...defaultProps} 
          status="ACTIVE" 
          isOwner={true} 
        />, 
        container
      )
    })

    expect(container.textContent).toContain('Hide')
    expect(container.textContent).toContain('Archive')
  })

  it('shows Report violation for tenant', () => {
    mockAuth({ roles: [UserRole.Tenant] })
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<ListingDetailsHeader {...defaultProps} />, container)
    })

    expect(container.textContent).toContain('Report violation')
  })

  it('calls onSubmitForReview when button is clicked', () => {
    mockAuth({ roles: [UserRole.Landlord], userId: 'owner-1' })
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ListingDetailsHeader 
          {...defaultProps} 
          status="DRAFT" 
          isOwner={true} 
        />, 
        container
      )
    })

    const button = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent === 'Submit for review'
    )
    
    act(() => {
      button?.click()
    })

    expect(defaultProps.onSubmitForReview).toHaveBeenCalledTimes(1)
  })

  it('calls onPublish when button is clicked', () => {
    mockAuth({ roles: [UserRole.Admin] })
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ListingDetailsHeader 
          {...defaultProps} 
          status="AWAITING_REVIEW" 
        />, 
        container
      )
    })

    const button = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent === 'Publish'
    )
    
    act(() => {
      button?.click()
    })

    expect(defaultProps.onPublish).toHaveBeenCalledTimes(1)
  })

  it('shows Archive for admin with ACTIVE status', () => {
    mockAuth({ roles: [UserRole.Admin] })
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ListingDetailsHeader 
          {...defaultProps} 
          status="ACTIVE" 
        />, 
        container
      )
    })

    expect(container.textContent).not.toContain('Hide')
    expect(container.textContent).toContain('Archive')
  })

  it('shows Unhide for admin with HIDDEN status', () => {
    mockAuth({ roles: [UserRole.Admin] })
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ListingDetailsHeader 
          {...defaultProps} 
          status="HIDDEN" 
        />, 
        container
      )
    })

    expect(container.textContent).toContain('Unhide')
    expect(container.textContent).toContain('Archive')
  })

  it('shows Restore for admin with ARCHIVED status', () => {
    mockAuth({ roles: [UserRole.Admin] })
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ListingDetailsHeader 
          {...defaultProps} 
          status="ARCHIVED" 
        />, 
        container
      )
    })

    expect(container.textContent).toContain('Restore')
    expect(container.textContent).not.toContain('Archive')
  })

  it('shows Unmoderate for admin with HIDDEN_BY_MODERATION status', () => {
    mockAuth({ roles: [UserRole.Admin] })
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ListingDetailsHeader 
          {...defaultProps} 
          status="HIDDEN_BY_MODERATION" 
        />, 
        container
      )
    })

    expect(container.textContent).toContain('Unmoderate')
    expect(container.textContent).toContain('Archive')
  })
})
