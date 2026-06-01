import { apiRequest } from './api-client'
import {
  BookingStatus,
  type CancelBookingPayload,
  type Booking,
  type BookingCreatedResponse,
  type PayBookingPayload,
  type CreateBookingPayload,
  type RejectBookingPayload,
  type PaymentResponse,
} from '../types/booking'

type BackendBookingStatus = BookingStatus | string | number | null | undefined

type BackendBookingDto = {
  id?: string
  bookingId?: string
  tenantId?: string
  listingId?: string
  status?: BackendBookingStatus
  since?: string
  until?: string
  startDate?: string
  endDate?: string
  totalCost?: number
  totalPrice?: number
  currency?: string
  paymentId?: string | null
}

type BackendBookingCreatedResponse = {
  bookingId?: string
  BookingId?: string
  status?: BackendBookingStatus
  Status?: BackendBookingStatus
  createdAt?: string
  CreatedAt?: string
  totalPrice?: number
  TotalPrice?: number
  currency?: string
  Currency?: string
  resourceLink?: string
  ResourceLink?: string
}

const bookingStatusByBackendNumber: Record<number, BookingStatus> = {
  0: BookingStatus.PendingApproval,
  1: BookingStatus.Expired,
  2: BookingStatus.Rejected,
  3: BookingStatus.Confirmed,
  4: BookingStatus.PaymentFailed,
  5: BookingStatus.PendingPayment,
  6: BookingStatus.Cancelled,
}

function getAuthHeaders(token: string, type = 'Bearer'): Record<string, string> {
  return {
    Authorization: `${type} ${token}`,
  }
}

function normalizeBookingStatus(status: BackendBookingStatus): BookingStatus {
  if (typeof status === 'number') {
    return bookingStatusByBackendNumber[status] ?? BookingStatus.PendingApproval
  }

  if (typeof status !== 'string') {
    return BookingStatus.PendingApproval
  }

  const normalizedStatus = status
    .trim()
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toUpperCase()

  switch (normalizedStatus) {
    case BookingStatus.PendingApproval:
    case BookingStatus.PendingPayment:
    case BookingStatus.Confirmed:
    case BookingStatus.Rejected:
    case BookingStatus.Expired:
    case BookingStatus.PaymentFailed:
    case BookingStatus.Cancelled:
      return normalizedStatus

    default:
      return BookingStatus.PendingApproval
  }
}

function mapBookingDtoToBooking(item: BackendBookingDto): Booking {
  return {
    id: item.id ?? item.bookingId ?? '',
    tenantId: item.tenantId ?? '',
    listingId: item.listingId ?? '',
    status: normalizeBookingStatus(item.status),
    since: item.since ?? item.startDate ?? '',
    until: item.until ?? item.endDate ?? '',
    totalCost: item.totalCost ?? item.totalPrice ?? 0,
    currency: item.currency ?? 'PLN',
    paymentId: item.paymentId ?? null,
  }
}

function mapCreatedResponse(response: BackendBookingCreatedResponse): BookingCreatedResponse {
  return {
    bookingId: response.bookingId ?? response.BookingId ?? '',
    status: normalizeBookingStatus(response.status ?? response.Status),
    createdAt: response.createdAt ?? response.CreatedAt,
    totalPrice: response.totalPrice ?? response.TotalPrice ?? 0,
    currency: response.currency ?? response.Currency ?? 'PLN',
    resourceLink: response.resourceLink ?? response.ResourceLink,
  }
}

export async function createBooking(
  payload: CreateBookingPayload,
  token: string,
  type = 'Bearer',
): Promise<BookingCreatedResponse> {
  const response = await apiRequest<BackendBookingCreatedResponse>('/bookings', {
    method: 'POST',
    body: {
      listingId: payload.listingId,
      startDate: payload.startDate,
      endDate: payload.endDate,
    },
    headers: getAuthHeaders(token, type),
  })

  return mapCreatedResponse(response)
}

export async function getBookingById(
  bookingId: string,
  token: string,
  type = 'Bearer',
): Promise<Booking> {
  const response = await apiRequest<BackendBookingDto>(`/bookings/${bookingId}`, {
    method: 'GET',
    headers: getAuthHeaders(token, type),
  })

  return mapBookingDtoToBooking(response)
}

export async function getMyBookings(token: string, type = 'Bearer'): Promise<Booking[]> {
  const response = await apiRequest<BackendBookingDto[]>('/bookings/me', {
    method: 'GET',
    headers: getAuthHeaders(token, type),
  })

  return response.map(mapBookingDtoToBooking)
}

export async function cancelBooking(
  bookingId: string,
  payload: CancelBookingPayload,
  token: string,
  type = 'Bearer',
): Promise<void> {
  await apiRequest<void>(`/bookings/${bookingId}/cancel`, {
    method: 'POST',
    body: {
      reason: payload.reason.trim(),
    },
    headers: getAuthHeaders(token, type),
  })
}

export async function payBooking(
  bookingId: string,
  payload: PayBookingPayload,
  token: string,
  type = 'Bearer',
): Promise<PaymentResponse> {
  const response = await apiRequest<PaymentResponse>(`/bookings/${bookingId}/pay`, {
    method: 'POST',
    body: {
      paymentMethod: payload.paymentMethod,
      returnUrl: payload.returnUrl,
      cancelUrl: payload.cancelUrl,
    },
    headers: getAuthHeaders(token, type),
  })

  return response
}

export async function acceptBooking(
  bookingId: string,
  token: string,
  type = 'Bearer',
): Promise<void> {
  await apiRequest<void>(`/bookings/${bookingId}/accept`, {
    method: 'POST',
    headers: getAuthHeaders(token, type),
  })
}

export async function rejectBooking(
  bookingId: string,
  payload: RejectBookingPayload,
  token: string,
  type = 'Bearer',
): Promise<void> {
  await apiRequest<void>(`/bookings/${bookingId}/reject`, {
    method: 'POST',
    body: {
      reason: payload.reason.trim(),
    },
    headers: getAuthHeaders(token, type),
  })
}