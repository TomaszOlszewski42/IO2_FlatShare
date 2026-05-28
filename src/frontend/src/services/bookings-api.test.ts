import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'

import { apiRequest } from './api-client'
import {
  acceptBooking,
  cancelBooking,
  createBooking,
  getMyBookings,
  payBooking,
  rejectBooking,
} from './bookings-api'
import { BookingStatus } from '../types/booking'

vi.mock('./api-client', () => ({
  apiRequest: vi.fn(),
}))

const apiRequestMock = apiRequest as Mock

describe('bookings-api', () => {
  beforeEach(() => {
    apiRequestMock.mockReset()
  })

  it('creates a booking request and maps backend response', async () => {
    apiRequestMock.mockResolvedValue({
      BookingId: 'booking-1',
      Status: 0,
      TotalPrice: 2400,
      Currency: 'PLN',
      ResourceLink: '/api/v1/bookings/booking-1',
    })

    const result = await createBooking(
      {
        listingId: 'listing-1',
        startDate: '2099-02-01',
        endDate: '2099-03-31',
      },
      'token-1',
    )

    expect(apiRequestMock).toHaveBeenCalledWith('/bookings', {
      method: 'POST',
      body: {
        listingId: 'listing-1',
        startDate: '2099-02-01',
        endDate: '2099-03-31',
      },
      headers: {
        Authorization: 'Bearer token-1',
      },
    })

    expect(result).toEqual(
      expect.objectContaining({
        bookingId: 'booking-1',
        status: BookingStatus.PendingApproval,
        totalPrice: 2400,
        currency: 'PLN',
        resourceLink: '/api/v1/bookings/booking-1',
      }),
    )
  })

  it('loads current user bookings and normalizes status values', async () => {
    apiRequestMock.mockResolvedValue([
      {
        id: 'booking-1',
        tenantId: 'tenant-1',
        listingId: 'listing-1',
        status: 'PendingPayment',
        since: '2099-02-01',
        until: '2099-03-31',
        totalCost: 2400,
        currency: 'PLN',
        paymentId: null,
      },
    ])

    const result = await getMyBookings('token-1')

    expect(apiRequestMock).toHaveBeenCalledWith('/bookings/me', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer token-1',
      },
    })

    expect(result).toEqual([
      {
        id: 'booking-1',
        tenantId: 'tenant-1',
        listingId: 'listing-1',
        status: BookingStatus.PendingPayment,
        since: '2099-02-01',
        until: '2099-03-31',
        totalCost: 2400,
        currency: 'PLN',
        paymentId: null,
      },
    ])
  })

  it('sends accept booking request', async () => {
    apiRequestMock.mockResolvedValue(undefined)

    await acceptBooking('booking-1', 'token-1')

    expect(apiRequestMock).toHaveBeenCalledWith('/bookings/booking-1/accept', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer token-1',
      },
    })
  })

  it('sends reject booking request', async () => {
    apiRequestMock.mockResolvedValue(undefined)

    await rejectBooking('booking-1', 'token-1')

    expect(apiRequestMock).toHaveBeenCalledWith('/bookings/booking-1/reject', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer token-1',
      },
    })
  })

  it('sends cancel booking request', async () => {
    apiRequestMock.mockResolvedValue(undefined)

    await cancelBooking('booking-1', 'token-1')

    expect(apiRequestMock).toHaveBeenCalledWith('/bookings/booking-1/cancel', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer token-1',
      },
    })
  })

  it('sends pay booking request', async () => {
    apiRequestMock.mockResolvedValue(undefined)

    await payBooking('booking-1', 'token-1')

    expect(apiRequestMock).toHaveBeenCalledWith('/bookings/booking-1/pay', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer token-1',
      },
    })
  })
})