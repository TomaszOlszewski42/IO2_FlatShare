import { afterEach, describe, expect, it, vi } from 'vitest'
import { render } from 'preact'
import { act } from 'preact/test-utils'

import { BookingRequestPanel } from './booking-request-panel'
import { BookingStatus } from '../../types/booking'

async function waitForAssertion(assertion: () => void) {
  const timeout = Date.now() + 1000
  let lastError: unknown

  while (Date.now() < timeout) {
    try {
      assertion()
      return
    } catch (error) {
      lastError = error

      await act(async () => {
        await new Promise((resolve) => {
          setTimeout(resolve, 10)
        })
      })
    }
  }

  throw lastError
}

describe('BookingRequestPanel', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    vi.clearAllMocks()
  })

  it('renders booking form with start and end date inputs', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <BookingRequestPanel
          listingId="listing-1"
          listingTitle="Bright room"
          price={1200}
          currency="PLN"
          availableSince="2099-01-01"
          onCreateBooking={vi.fn()}
        />,
        container,
      )
    })

    expect(container.textContent).toContain('Request booking')
    expect(container.textContent).toContain('Bright room')
    expect(container.querySelector('#booking-start-date')).not.toBeNull()
    expect(container.querySelector('#booking-end-date')).not.toBeNull()
    expect(container.textContent).toContain('Monthly price')
  })

  it('shows validation errors and does not submit empty form', async () => {
    const handleCreateBooking = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <BookingRequestPanel
          listingId="listing-1"
          listingTitle="Bright room"
          price={1200}
          currency="PLN"
          availableSince="2099-01-01"
          onCreateBooking={handleCreateBooking}
        />,
        container,
      )
    })

    const form = container.querySelector('form') as HTMLFormElement

    await act(async () => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
      await Promise.resolve()
    })

    expect(handleCreateBooking).not.toHaveBeenCalled()
    expect(container.textContent).toContain('Choose booking start date.')
    expect(container.textContent).toContain('Choose booking end date.')
  })

  it('does not submit when selected period overlaps unavailable dates', async () => {
    const handleCreateBooking = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <BookingRequestPanel
          listingId="listing-1"
          listingTitle="Bright room"
          price={1200}
          currency="PLN"
          availableSince="2099-01-01"
          unavailableRanges={[
            {
              since: '2099-03-10',
              until: '2099-03-20',
              message: 'Renovation',
            },
          ]}
          onCreateBooking={handleCreateBooking}
        />,
        container,
      )
    })

    const startDateInput = container.querySelector('#booking-start-date') as HTMLInputElement
    const endDateInput = container.querySelector('#booking-end-date') as HTMLInputElement
    const form = container.querySelector('form') as HTMLFormElement

    act(() => {
      startDateInput.value = '2099-03-01'
      startDateInput.dispatchEvent(new Event('input', { bubbles: true }))

      endDateInput.value = '2099-03-31'
      endDateInput.dispatchEvent(new Event('input', { bubbles: true }))
    })

    await act(async () => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
      await Promise.resolve()
    })

    expect(handleCreateBooking).not.toHaveBeenCalled()
    expect(container.textContent).toContain(
      'Selected period overlaps unavailable dates: 2099-03-10 - 2099-03-20.',
    )
  })

  it('submits booking payload and shows success message', async () => {
    const handleCreateBooking = vi.fn().mockResolvedValue({
      bookingId: 'booking-1',
      status: BookingStatus.PendingApproval,
      totalPrice: 2400,
      currency: 'PLN',
      resourceLink: '/api/v1/bookings/booking-1',
    })

    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <BookingRequestPanel
          listingId="listing-1"
          listingTitle="Bright room"
          price={1200}
          currency="PLN"
          availableSince="2099-01-01"
          onCreateBooking={handleCreateBooking}
        />,
        container,
      )
    })

    const startDateInput = container.querySelector('#booking-start-date') as HTMLInputElement
    const endDateInput = container.querySelector('#booking-end-date') as HTMLInputElement
    const form = container.querySelector('form') as HTMLFormElement

    act(() => {
      startDateInput.value = '2099-02-01'
      startDateInput.dispatchEvent(new Event('input', { bubbles: true }))

      endDateInput.value = '2099-03-31'
      endDateInput.dispatchEvent(new Event('input', { bubbles: true }))
    })

    await act(async () => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
      await Promise.resolve()
    })

    await waitForAssertion(() => {
      expect(handleCreateBooking).toHaveBeenCalledTimes(1)
      expect(container.textContent).toContain('Booking request sent.')
    })

    expect(handleCreateBooking).toHaveBeenCalledWith({
      listingId: 'listing-1',
      startDate: '2099-02-01',
      endDate: '2099-03-31',
    })
    expect(container.textContent).toContain('PENDING_APPROVAL')
  })
})