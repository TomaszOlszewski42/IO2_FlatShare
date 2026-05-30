import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'preact'
import { act } from 'preact/test-utils'

import { BookingsPage } from './bookings-page'
import { useAuth } from '../../hooks/use-auth'
import {
  acceptBooking,
  cancelBooking,
  getMyBookings,
  payBooking,
  rejectBooking,
} from '../../services/bookings-api'
import { BookingStatus, type Booking } from '../../types/booking'
import { UserRole } from '../../types/user'

const mocks = vi.hoisted(() => ({
  route: vi.fn(),
  showToast: vi.fn(),
}))

vi.mock('preact-router', async () => {
  const actual = (await vi.importActual('preact-router')) as Record<string, unknown>

  return {
    ...actual,
    route: mocks.route,
  }
})

vi.mock('../../hooks/use-auth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('../../services/error-handler-context', () => ({
  useErrorHandler: () => ({
    showToast: mocks.showToast,
  }),
}))

vi.mock('../../services/bookings-api', () => ({
  getMyBookings: vi.fn(),
  acceptBooking: vi.fn(),
  rejectBooking: vi.fn(),
  cancelBooking: vi.fn(),
  payBooking: vi.fn(),
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

const pendingPaymentBooking: Booking = {
  id: 'booking-1',
  tenantId: 'tenant-1',
  listingId: 'listing-1',
  status: BookingStatus.PendingPayment,
  since: '2099-02-01',
  until: '2099-03-31',
  totalCost: 2400,
  currency: 'PLN',
  paymentId: null,
}

const pendingApprovalBooking: Booking = {
  id: 'booking-2',
  tenantId: 'tenant-1',
  listingId: 'listing-2',
  status: BookingStatus.PendingApproval,
  since: '2099-04-01',
  until: '2099-05-31',
  totalCost: 2600,
  currency: 'PLN',
  paymentId: null,
}

function mockUseAuthAsTenant() {
  vi.mocked(useAuth).mockReturnValue({
    isAuthenticated: true,
    session: tenantSession,
    hasRole: (role) => role === UserRole.Tenant,
    isTenant: true,
    isLandlord: false,
    isAdmin: false,
  })
}

function mockUseAuthAsLandlord() {
  vi.mocked(useAuth).mockReturnValue({
    isAuthenticated: true,
    session: landlordSession,
    hasRole: (role) => role === UserRole.Landlord,
    isTenant: false,
    isLandlord: true,
    isAdmin: false,
  })
}

async function waitForCondition(condition: () => boolean) {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    if (condition()) {
      return
    }

    await act(async () => {
      await new Promise((resolve) => {
        window.setTimeout(resolve, 0)
      })
    })
  }

  throw new Error('Condition was not met in time.')
}

async function renderBookingsPage() {
  const container = document.createElement('div')
  document.body.appendChild(container)

  await act(async () => {
    render(<BookingsPage />, container)
  })

  return container
}

describe('BookingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuthAsTenant()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    document.body.innerHTML = ''
  })

  it('renders empty state when user has no bookings', async () => {
    vi.mocked(getMyBookings).mockResolvedValue([])

    const container = await renderBookingsPage()

    await waitForCondition(() => container.textContent?.includes('No bookings yet') ?? false)

    expect(getMyBookings).toHaveBeenCalledWith('tenant-token', 'Bearer')
    expect(container.textContent).toContain('When you request a room booking, it will appear here.')
    expect(container.textContent).toContain('Go to listings')
  })

  it('renders tenant booking actions for pending payment booking', async () => {
    vi.mocked(getMyBookings).mockResolvedValue([pendingPaymentBooking])

    const container = await renderBookingsPage()

    await waitForCondition(() => container.textContent?.includes('Pending payment') ?? false)

    expect(container.textContent).toContain('Booking #booking-')
    expect(container.textContent).toContain('Pending payment')
    expect(container.textContent).toContain('Pay')
    expect(container.textContent).toContain('Cancel')
  })

  it('allows tenant to pay pending payment booking', async () => {
    vi.mocked(getMyBookings).mockResolvedValue([pendingPaymentBooking])
    vi.mocked(payBooking).mockResolvedValue(undefined)

    const container = await renderBookingsPage()

    await waitForCondition(() => container.textContent?.includes('Pay') ?? false)

    const payButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Pay',
    )

    expect(payButton).not.toBeUndefined()

    await act(async () => {
      payButton?.click()
      await Promise.resolve()
    })

    await waitForCondition(() => vi.mocked(payBooking).mock.calls.length === 1)

    expect(payBooking).toHaveBeenCalledWith(
      'booking-1',
      {
        paymentMethod: 0,
        returnUrl: `${window.location.origin}/bookings`,
        cancelUrl: `${window.location.origin}/bookings`,
      },
      'tenant-token',
      'Bearer',
    )
    expect(mocks.showToast).toHaveBeenCalledWith('Booking paid and confirmed.', 'success')
  })

  it('allows tenant to cancel cancellable booking', async () => {
    vi.mocked(getMyBookings).mockResolvedValue([pendingPaymentBooking])
    vi.mocked(cancelBooking).mockResolvedValue(undefined)

    const container = await renderBookingsPage()

    await waitForCondition(() => container.textContent?.includes('Cancel') ?? false)

    const cancelButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Cancel',
    )

    expect(cancelButton).not.toBeUndefined()

    await act(async () => {
      cancelButton?.click()
      await Promise.resolve()
    })

    // Dialog should now be open
    await waitForCondition(() => container.querySelector('[role="dialog"]') !== null)

    const reasonInput = container.querySelector('textarea') as HTMLTextAreaElement
    expect(reasonInput).not.toBeNull()

    // Fill in the reason
    await act(async () => {
      reasonInput.value = 'Changed plans'
      reasonInput.dispatchEvent(new Event('input', { bubbles: true }))
      await Promise.resolve()
    })

    // Click the dialog confirm button (should be the last button in the dialog)
    const dialogButtons = Array.from(container.querySelectorAll('[role="dialog"] button'))
    const confirmButton = dialogButtons[dialogButtons.length - 1] as HTMLButtonElement

    await act(async () => {
      confirmButton.click()
      await Promise.resolve()
    })

    await waitForCondition(() => vi.mocked(cancelBooking).mock.calls.length === 1)

    expect(cancelBooking).toHaveBeenCalledWith(
      'booking-1',
      { reason: 'Changed plans' },
      'tenant-token',
      'Bearer',
    )
    expect(mocks.showToast).toHaveBeenCalledWith('Booking cancelled.', 'success')
  })

  it('renders landlord decision actions for pending approval booking', async () => {
    mockUseAuthAsLandlord()
    vi.mocked(getMyBookings).mockResolvedValue([pendingApprovalBooking])

    const container = await renderBookingsPage()

    await waitForCondition(() => container.textContent?.includes('Pending approval') ?? false)

    expect(getMyBookings).toHaveBeenCalledWith('landlord-token', 'Bearer')
    expect(container.textContent).toContain('Accept')
    expect(container.textContent).toContain('Reject')
  })

  it('allows landlord to accept pending approval booking', async () => {
    mockUseAuthAsLandlord()
    vi.mocked(getMyBookings).mockResolvedValue([pendingApprovalBooking])
    vi.mocked(acceptBooking).mockResolvedValue(undefined)

    const container = await renderBookingsPage()

    await waitForCondition(() => container.textContent?.includes('Accept') ?? false)

    const acceptButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Accept',
    )

    expect(acceptButton).not.toBeUndefined()

    await act(async () => {
      acceptButton?.click()
      await Promise.resolve()
    })

    await waitForCondition(() => vi.mocked(acceptBooking).mock.calls.length === 1)

    expect(acceptBooking).toHaveBeenCalledWith('booking-2', 'landlord-token', 'Bearer')
    expect(mocks.showToast).toHaveBeenCalledWith('Booking request accepted.', 'success')
  })

  it('allows landlord to reject pending approval booking', async () => {
    mockUseAuthAsLandlord()
    vi.mocked(getMyBookings).mockResolvedValue([pendingApprovalBooking])
    vi.mocked(rejectBooking).mockResolvedValue(undefined)

    const container = await renderBookingsPage()

    await waitForCondition(() => container.textContent?.includes('Reject') ?? false)

    const rejectButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Reject',
    )

    expect(rejectButton).not.toBeUndefined()

    await act(async () => {
      rejectButton?.click()
      await Promise.resolve()
    })

    // Dialog should now be open
    await waitForCondition(() => container.querySelector('[role="dialog"]') !== null)

    const reasonInput = container.querySelector('textarea') as HTMLTextAreaElement
    expect(reasonInput).not.toBeNull()

    // Fill in the reason
    await act(async () => {
      reasonInput.value = 'Not suitable'
      reasonInput.dispatchEvent(new Event('input', { bubbles: true }))
      await Promise.resolve()
    })

    // Click the dialog confirm button (should be the last button in the dialog)
    const dialogButtons = Array.from(container.querySelectorAll('[role="dialog"] button'))
    const confirmButton = dialogButtons[dialogButtons.length - 1] as HTMLButtonElement

    await act(async () => {
      confirmButton.click()
      await Promise.resolve()
    })

    await waitForCondition(() => vi.mocked(rejectBooking).mock.calls.length === 1)

    expect(rejectBooking).toHaveBeenCalledWith(
      'booking-2',
      { reason: 'Not suitable' },
      'landlord-token',
      'Bearer',
    )
    expect(mocks.showToast).toHaveBeenCalledWith('Booking request rejected.', 'success')
  })
})