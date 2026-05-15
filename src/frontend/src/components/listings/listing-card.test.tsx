import { afterEach, describe, expect, it, vi } from 'vitest'
import { render } from 'preact'
import { act } from 'preact/test-utils'

import { useAuth } from '../../hooks/use-auth'
import type { Listing } from '../../types/listing'
import { ListingCard } from './listing-card'

vi.mock('../../hooks/use-auth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('./listing-card-photo', () => ({
  ListingCardPhoto: ({ title }: { title: string }) => (
    <div data-testid="listing-photo">Photo for {title}</div>
  ),
}))

const baseListing: Listing = {
  id: 'listing-1',
  ownerId: 'owner-1',
  title: 'Bright room near the center',
  description: 'Cozy room in a well-connected location.',
  price: 1500,
  currency: 'PLN',
  status: 'ACTIVE',
  availableFrom: '2025-05-01',
  area: 18,
  rooms: 2,
  bathrooms: 1,
  furnished: true,
  allowPets: false,
  allowSmoking: false,
  location: {
    city: 'Warsaw',
    district: 'Mokotow',
    street: 'Pulawska',
    buildingNumber: '10',
    postalCode: '00-001',
  },
  attributes: {
    petsAllowed: false,
    nonSmokingOnly: true,
    preferredTenantProfile: 'student',
  },
}

function mockAuth({
  userId = 'tenant-1',
  isLandlord = false,
}: {
  userId?: string
  isLandlord?: boolean
}) {
  vi.mocked(useAuth).mockReturnValue({
    isAuthenticated: true,
    session: {
      token: 'token',
      sessionId: 'session-1',
      type: 'Bearer',
      roles: isLandlord ? ['LANDLORD'] : ['TENANT'],
      userId,
    },
    hasRole: vi.fn(() => false),
    isTenant: !isLandlord,
    isLandlord,
    isAdmin: false,
  })
}

describe('ListingCard', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    vi.clearAllMocks()
  })

  it('renders tenant-facing listing information', () => {
    mockAuth({ isLandlord: false })

    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<ListingCard listing={baseListing} />, container)
    })

    expect(container.textContent).toContain('Photo for Bright room near the center')
    expect(container.textContent).toContain('Bright room near the center')
    expect(container.textContent).toContain('Warsaw')
    expect(container.textContent).toContain('Mokotow')
    expect(container.textContent).toContain('per month')
    expect(container.textContent).toContain('Area')
    expect(container.textContent).toContain('18 m2')
    expect(container.textContent).toContain('Rooms')
    expect(container.textContent).toContain('2 rooms')
    expect(container.textContent).toContain('Bathrooms')
    expect(container.textContent).toContain('1 bathroom')
    expect(container.textContent).toContain('Availability')
    expect(container.textContent).toContain('Available from')
  })

  it('renders owner public profile link when owner id is available', () => {
    mockAuth({ isLandlord: false })

    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<ListingCard listing={baseListing} />, container)
    })

    const profileLink = Array.from(container.querySelectorAll('a')).find(
      (link) => link.textContent === 'Owner profile',
    )

    expect(profileLink).not.toBeUndefined()
    expect(profileLink?.getAttribute('href')).toBe('/users/owner-1')
  })

  it('does not render owner public profile link when owner id is missing', () => {
    mockAuth({ isLandlord: false })

    const listingWithoutOwnerId: Listing = {
      ...baseListing,
      ownerId: undefined,
    }

    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<ListingCard listing={listingWithoutOwnerId} />, container)
    })

    expect(container.textContent).not.toContain('Owner profile')
    expect(container.querySelector('a[href^="/users/"]')).toBeNull()
  })

  it('hides publication status for tenant', () => {
    mockAuth({ isLandlord: false })

    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<ListingCard listing={baseListing} />, container)
    })

    expect(container.textContent).not.toContain('Active')
  })

  it('renders listing feature and tenant requirement badges', () => {
    mockAuth({ isLandlord: false })

    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<ListingCard listing={baseListing} />, container)
    })

    expect(container.textContent).toContain('Furnished')
    expect(container.textContent).toContain('Pets')
    expect(container.textContent).toContain('Smoking')
    expect(container.textContent).toContain('No pets')
    expect(container.textContent).toContain('Non-smokers only')
    expect(container.textContent).toContain('Student')
  })

  it('allows tenant to open offer details', () => {
    mockAuth({ isLandlord: false })

    const onViewDetails = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<ListingCard listing={baseListing} onViewDetails={onViewDetails} />, container)
    })

    const viewOfferButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'View offer',
    ) as HTMLButtonElement

    expect(viewOfferButton).not.toBeUndefined()

    act(() => {
      viewOfferButton.click()
    })

    expect(onViewDetails).toHaveBeenCalledTimes(1)
    expect(onViewDetails).toHaveBeenCalledWith('listing-1')
  })

  it('shows edit action and status for landlord who owns the listing', () => {
    mockAuth({ userId: 'owner-1', isLandlord: true })

    const onEdit = vi.fn()
    const onViewDetails = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ListingCard
          listing={baseListing}
          onEdit={onEdit}
          onViewDetails={onViewDetails}
        />,
        container,
      )
    })

    expect(container.textContent).toContain('Active')
    expect(container.textContent).toContain('Your public profile')

    const profileLink = container.querySelector('a[href="/users/owner-1"]')
    expect(profileLink).not.toBeNull()

    const editButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Edit',
    ) as HTMLButtonElement

    const detailsButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Details',
    ) as HTMLButtonElement

    expect(editButton).not.toBeUndefined()
    expect(detailsButton).not.toBeUndefined()

    act(() => {
      editButton.click()
    })

    act(() => {
      detailsButton.click()
    })

    expect(onEdit).toHaveBeenCalledTimes(1)
    expect(onEdit).toHaveBeenCalledWith('listing-1')
    expect(onViewDetails).toHaveBeenCalledTimes(1)
    expect(onViewDetails).toHaveBeenCalledWith('listing-1')
  })

  it('hides edit action for landlord who does not own the listing', () => {
    mockAuth({ userId: 'other-owner', isLandlord: true })

    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<ListingCard listing={baseListing} />, container)
    })

    expect(container.textContent).not.toContain('Edit')
  })

  it('hides edit action for tenant even if ownerId matches', () => {
    mockAuth({ userId: 'owner-1', isLandlord: false })

    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<ListingCard listing={baseListing} />, container)
    })

    expect(container.textContent).not.toContain('Edit')
  })

  it('shows status and Details button for admin', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      session: {
        token: 'token',
        sessionId: 'session-1',
        type: 'Bearer',
        roles: ['ADMIN'],
        userId: 'admin-1',
      },
      hasRole: vi.fn((role) => role === 'ADMIN'),
      isTenant: false,
      isLandlord: false,
      isAdmin: true,
    } as any)

    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<ListingCard listing={baseListing} />, container)
    })

    expect(container.textContent).toContain('Active')
    expect(container.textContent).toContain('Details')
  })
})