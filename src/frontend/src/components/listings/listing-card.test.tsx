import { afterEach, describe, expect, it, vi } from 'vitest'
import { render } from 'preact'
import { act } from 'preact/test-utils'

import { useAuth } from '../../hooks/use-auth'
import type { Listing } from '../../types/listing'
import { ListingCard } from './listing-card'

vi.mock('../../hooks/use-auth', () => ({
  useAuth: vi.fn(),
}))

const baseListing: Listing = {
  id: 'listing-1',
  ownerId: 'owner-1',
  title: 'Jasny pokój blisko centrum',
  description: 'Przytulny pokój w dobrze skomunikowanej lokalizacji.',
  price: 1500,
  currency: 'PLN',
  status: 'ACTIVE',
  availableFrom: '2025-05-01',
  area: 18,
  rooms: 2,
  furnished: true,
  allowPets: false,
  allowSmoking: false,
  location: {
    city: 'Warszawa',
    district: 'Mokotów',
    street: 'Puławska',
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

  it('renders key listing information', () => {
    mockAuth({ isLandlord: false })

    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<ListingCard listing={baseListing} />, container)
    })

    expect(container.textContent).toContain('Jasny pokój blisko centrum')
    expect(container.textContent).toContain('Warszawa')
    expect(container.textContent).toContain('Mokotów')
    expect(container.textContent).toContain('Cena')
    expect(container.textContent).toContain('/ mies.')
    expect(container.textContent).toContain('Powierzchnia')
    expect(container.textContent).toContain('18 m2')
    expect(container.textContent).toContain('Liczba pokoi')
    expect(container.textContent).toContain('2')
    expect(container.textContent).toContain('Aktywne')
  })

  it('renders listing feature and tenant requirement badges', () => {
    mockAuth({ isLandlord: false })

    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<ListingCard listing={baseListing} />, container)
    })

    expect(container.textContent).toContain('Umeblowane')
    expect(container.textContent).toContain('Zwierzęta')
    expect(container.textContent).toContain('Palenie')
    expect(container.textContent).toContain('Bez zwierząt')
    expect(container.textContent).toContain('Tylko niepalący')
    expect(container.textContent).toContain('Student')
  })

  it('always allows opening listing details', () => {
    mockAuth({ isLandlord: false })

    const onViewDetails = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<ListingCard listing={baseListing} onViewDetails={onViewDetails} />, container)
    })

    const detailsButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Szczegóły',
    ) as HTMLButtonElement

    act(() => {
      detailsButton.click()
    })

    expect(onViewDetails).toHaveBeenCalledTimes(1)
    expect(onViewDetails).toHaveBeenCalledWith('listing-1')
  })

  it('shows edit action for landlord who owns the listing', () => {
    mockAuth({ userId: 'owner-1', isLandlord: true })

    const onEdit = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<ListingCard listing={baseListing} onEdit={onEdit} />, container)
    })

    const editButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Edytuj',
    ) as HTMLButtonElement

    expect(editButton).not.toBeUndefined()

    act(() => {
      editButton.click()
    })

    expect(onEdit).toHaveBeenCalledTimes(1)
    expect(onEdit).toHaveBeenCalledWith('listing-1')
  })

  it('hides edit action for landlord who does not own the listing', () => {
    mockAuth({ userId: 'other-owner', isLandlord: true })

    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<ListingCard listing={baseListing} />, container)
    })

    expect(container.textContent).not.toContain('Edytuj')
  })

  it('hides edit action for tenant even if ownerId matches', () => {
    mockAuth({ userId: 'owner-1', isLandlord: false })

    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<ListingCard listing={baseListing} />, container)
    })

    expect(container.textContent).not.toContain('Edytuj')
  })
})