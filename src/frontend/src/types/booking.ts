export const BookingStatus = {
  PendingApproval: 'PENDING_APPROVAL',
  PendingPayment: 'PENDING_PAYMENT',
  Confirmed: 'CONFIRMED',
  Rejected: 'REJECTED',
  Expired: 'EXPIRED',
  PaymentFailed: 'PAYMENT_FAILED',
  Cancelled: 'CANCELLED',
} as const

export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus]

export type CreateBookingPayload = {
  listingId: string
  startDate: string
  endDate: string
}

export type BookingCreatedResponse = {
  bookingId: string
  status: BookingStatus
  createdAt?: string
  totalPrice: number
  currency: string
  resourceLink?: string
}

export type Booking = {
  id: string
  tenantId: string
  listingId: string
  status: BookingStatus
  since: string
  until: string
  totalCost: number
  currency: string
  paymentId?: string | null
}