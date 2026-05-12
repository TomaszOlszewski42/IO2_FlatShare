import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render } from 'preact'
import { act } from 'preact/test-utils'
import { ListingEditPage } from './listing-edit-page'
import * as listingsApi from '../../services/listings-api'
import * as authSession from '../../services/auth-session'

vi.mock('../../services/listings-api', () => ({
  getListingById: vi.fn(),
  updateListing: vi.fn(),
}))

vi.mock('../../services/auth-session', () => ({
  readAuthSession: vi.fn(),
}))

vi.mock('../../components/listings/listing-edit-form', () => ({
  ListingEditForm: () => <div data-testid="listing-edit-form" />
}))

vi.mock('../../components/listings/listing-photo-upload', () => ({
  ListingPhotoUpload: () => <div data-testid="listing-photo-upload" />
}))

vi.mock('../../components/listings/listing-unavailability-calendar', () => ({
  ListingUnavailabilityCalendar: () => <div data-testid="listing-unavailability-calendar" />
}))

describe('ListingEditPage', () => {
  const mockListingId = '123'
  const mockSession = { token: 'abc', type: 'Bearer', userId: 'owner-123' }

  const flushEffects = async () => {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(authSession.readAuthSession).mockReturnValue(mockSession as any)
    vi.mocked(listingsApi.getListingById).mockResolvedValue({
      id: mockListingId,
      title: 'Test Listing',
      price: 1000,
      location: { city: 'Warsaw' },
      attributes: {},
    } as any)
    document.body.innerHTML = ''
  })

  it('renders Basic Info tab by default', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<ListingEditPage listingId={mockListingId} />, container)
    })
    await flushEffects()

    expect(container.querySelector('[data-testid="listing-edit-form"]')).not.toBeNull()
    expect(container.querySelector('[data-testid="listing-photo-upload"]')).toBeNull()
    expect(container.querySelector('[data-testid="listing-unavailability-calendar"]')).toBeNull()
  })

  it('switches to Photos tab when clicked', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<ListingEditPage listingId={mockListingId} />, container)
    })
    await flushEffects()

    const photosTab = Array.from(container.querySelectorAll('a[role="tab"]')).find(
      (el) => el.textContent === 'Photos'
    ) as HTMLElement

    await act(async () => {
      photosTab.click()
    })
    await flushEffects()

    expect(container.querySelector('[data-testid="listing-edit-form"]')).toBeNull()
    expect(container.querySelector('[data-testid="listing-photo-upload"]')).not.toBeNull()
    expect(container.querySelector('[data-testid="listing-unavailability-calendar"]')).toBeNull()
  })

  it('switches to Unavailability tab when clicked', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<ListingEditPage listingId={mockListingId} />, container)
    })
    await flushEffects()

    const unavailabilityTab = Array.from(container.querySelectorAll('a[role="tab"]')).find(
      (el) => el.textContent === 'Unavailability'
    ) as HTMLElement

    await act(async () => {
      unavailabilityTab.click()
    })
    await flushEffects()

    expect(container.querySelector('[data-testid="listing-edit-form"]')).toBeNull()
    expect(container.querySelector('[data-testid="listing-photo-upload"]')).toBeNull()
    expect(container.querySelector('[data-testid="listing-unavailability-calendar"]')).not.toBeNull()
  })
})
