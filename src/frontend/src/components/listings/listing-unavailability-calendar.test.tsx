import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render } from 'preact'
import { act } from 'preact/test-utils'
import { ListingUnavailabilityCalendar } from './listing-unavailability-calendar'
import * as unavailabilityApi from '../../services/unavailability-api'
import * as authSession from '../../services/auth-session'
import * as errorHandlerContext from '../../services/error-handler-context'

import * as listingsApi from '../../services/listings-api'

vi.mock('../../services/unavailability-api', () => ({
  createUnavailability: vi.fn(),
}))

vi.mock('../../services/listings-api', () => ({
  getListingById: vi.fn(),
}))

vi.mock('../../services/auth-session', () => ({
  readAuthSession: vi.fn(),
}))

vi.mock('../../services/error-handler-context', () => ({
  useErrorHandler: vi.fn(),
}))

describe('ListingUnavailabilityCalendar', () => {
  const mockListingId = 'listing-123'
  const mockSession = { token: 'abc', type: 'Bearer' }
  const mockShowToast = vi.fn()

  const flushEffects = async () => {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })
  }

  const renderComponent = (container: HTMLElement) => {
    act(() => {
      render(<ListingUnavailabilityCalendar listingId={mockListingId} />, container)
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(authSession.readAuthSession).mockReturnValue(mockSession as any)
    vi.mocked(errorHandlerContext.useErrorHandler).mockReturnValue({
      showToast: mockShowToast,
      toasts: [],
      removeToast: vi.fn(),
      showError: vi.fn(),
      getFieldErrors: vi.fn(),
      clearFieldErrors: vi.fn(),
      setFieldErrors: vi.fn(),
    })

    // Override global confirm to return true for deletes
    global.confirm = vi.fn().mockReturnValue(true)
    document.body.innerHTML = ''
  })

  it('renders and fetches unavailabilities on mount', async () => {
    vi.mocked(listingsApi.getListingById).mockResolvedValue({
      id: mockListingId,
      title: 'test',
      description: 'test',
      price: 100,
      currency: 'PLN',
      location: { city: 'test' },
      unavailability: [
        { since: '2026-06-01T00:00:00Z', until: '2026-06-10T00:00:00Z', message: 'Test Reason' },
      ],
    } as any)

    const container = document.createElement('div')
    document.body.appendChild(container)

    renderComponent(container)
    await flushEffects()

    expect(listingsApi.getListingById).toHaveBeenCalledWith(mockListingId, 'abc', 'Bearer')
    expect(container.textContent).toContain('Test Reason')
    expect(container.textContent).toContain('Unavailability Calendar')
  })

  it('displays a message when no unavailabilities are present', async () => {
    vi.mocked(listingsApi.getListingById).mockResolvedValue({
      unavailability: []
    } as any)

    const container = document.createElement('div')
    document.body.appendChild(container)

    renderComponent(container)
    await flushEffects()

    expect(container.textContent).toContain('No unavailabilities scheduled.')
  })

  it('handles form submission to add unavailability', async () => {
    vi.mocked(listingsApi.getListingById).mockResolvedValue({
      unavailability: []
    } as any)
    vi.mocked(unavailabilityApi.createUnavailability).mockResolvedValue({
      id: 'new-u',
      listingId: mockListingId,
      startDate: '2026-07-01T00:00:00Z',
      endDate: '2026-07-05T00:00:00Z',
      reason: 'Holiday',
    })

    const container = document.createElement('div')
    document.body.appendChild(container)

    renderComponent(container)
    await flushEffects()

    // Simulate calendar range change
    const calendarRange = container.querySelector('calendar-range') as HTMLElement
    await act(async () => {
      const event = new Event('change')
      Object.defineProperty(event, 'target', { value: { value: '2026-07-01/2026-07-05' } })
      calendarRange.dispatchEvent(event)
    })

    // Simulate reason input
    const reasonInput = container.querySelector('input[placeholder="e.g. Maintenance"]') as HTMLInputElement
    await act(async () => {
      reasonInput.value = 'Holiday'
      reasonInput.dispatchEvent(new Event('input', { bubbles: true }))
    })

    // Simulate form submit
    const form = container.querySelector('form') as HTMLFormElement
    await act(async () => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    })
    await flushEffects()

    expect(unavailabilityApi.createUnavailability).toHaveBeenCalledWith(
      mockListingId,
      { startDate: '2026-07-01', endDate: '2026-07-05', reason: 'Holiday' },
      'abc',
      'Bearer'
    )
    expect(mockShowToast).toHaveBeenCalledWith('Unavailability added successfully.', 'success')
  })

  })
})
