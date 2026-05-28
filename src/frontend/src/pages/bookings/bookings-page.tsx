import type { RoutableProps } from 'preact-router'
import { route } from 'preact-router'
import { useEffect, useMemo, useState } from 'preact/hooks'

import { EmptyStateContent } from '../../components/common/empty-state-content'
import { AppButton } from '../../components/ui/app-button'
import { useAuth } from '../../hooks/use-auth'
import {
  acceptBooking,
  cancelBooking,
  getMyBookings,
  payBooking,
  rejectBooking,
} from '../../services/bookings-api'
import { useErrorHandler } from '../../services/error-handler-context'
import { BookingStatus, type Booking } from '../../types/booking'
import { formatDate } from '../../utils/format-date'
import { formatPrice } from '../../utils/format-price'

type BookingAction = 'accept' | 'reject' | 'cancel' | 'pay'

function getBookingStatusLabel(status: BookingStatus): string {
  switch (status) {
    case BookingStatus.PendingApproval:
      return 'Pending approval'
    case BookingStatus.PendingPayment:
      return 'Pending payment'
    case BookingStatus.Confirmed:
      return 'Confirmed'
    case BookingStatus.Rejected:
      return 'Rejected'
    case BookingStatus.Expired:
      return 'Expired'
    case BookingStatus.PaymentFailed:
      return 'Payment failed'
    case BookingStatus.Cancelled:
      return 'Cancelled'
    default:
      return status
  }
}

function getBookingStatusBadgeClass(status: BookingStatus): string {
  switch (status) {
    case BookingStatus.PendingApproval:
      return 'badge-warning'
    case BookingStatus.PendingPayment:
      return 'badge-info'
    case BookingStatus.Confirmed:
      return 'badge-success'
    case BookingStatus.Rejected:
    case BookingStatus.Cancelled:
    case BookingStatus.Expired:
    case BookingStatus.PaymentFailed:
      return 'badge-error'
    default:
      return 'badge-ghost'
  }
}

function getShortId(id: string): string {
  if (!id) {
    return '-'
  }

  return id.length > 8 ? id.slice(0, 8) : id
}

function getReadableBookingsError(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message.trim()
  }

  return 'Failed to load bookings.'
}

function canTenantCancel(booking: Booking): boolean {
  return (
    booking.status === BookingStatus.PendingApproval ||
    booking.status === BookingStatus.PendingPayment ||
    booking.status === BookingStatus.PaymentFailed
  )
}

function canTenantPay(booking: Booking): boolean {
  return booking.status === BookingStatus.PendingPayment
}

function canLandlordDecide(booking: Booking): boolean {
  return booking.status === BookingStatus.PendingApproval
}

export function BookingsPage(_: RoutableProps) {
  const { session, isTenant, isLandlord } = useAuth()
  const { showToast } = useErrorHandler()

  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [pendingActionKey, setPendingActionKey] = useState<string | null>(null)

  const sortedBookings = useMemo(() => {
    return [...bookings].sort((first, second) => {
      const firstTime = new Date(first.since).getTime()
      const secondTime = new Date(second.since).getTime()

      return secondTime - firstTime
    })
  }, [bookings])

  async function loadBookings() {
    if (!session) {
      return
    }

    setIsLoading(true)
    setLoadError(null)

    try {
      const items = await getMyBookings(session.token, session.type)
      setBookings(items)
    } catch (error) {
      console.error('Failed to load bookings:', error)
      setBookings([])
      setLoadError(getReadableBookingsError(error))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!session) {
      return
    }

    void loadBookings()
  }, [session?.token, session?.type])

  async function handleBookingAction(bookingId: string, action: BookingAction) {
    if (!session) {
      route('/login')
      return
    }

    const actionKey = `${bookingId}-${action}`
    setPendingActionKey(actionKey)

    try {
      if (action === 'accept') {
        await acceptBooking(bookingId, session.token, session.type)
        showToast('Booking request accepted.', 'success')
      }

      if (action === 'reject') {
        await rejectBooking(bookingId, session.token, session.type)
        showToast('Booking request rejected.', 'success')
      }

      if (action === 'cancel') {
        await cancelBooking(bookingId, session.token, session.type)
        showToast('Booking cancelled.', 'success')
      }

      if (action === 'pay') {
        await payBooking(bookingId, session.token, session.type)
        showToast('Booking paid and confirmed.', 'success')
      }

      await loadBookings()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Booking action failed.'
      showToast(message, 'error')
    } finally {
      setPendingActionKey(null)
    }
  }

  const pageDescription = isLandlord
    ? 'Review booking requests for your listings and decide whether to accept or reject them.'
    : 'Track your booking requests, payments and confirmed rentals.'

  return (
    <section class="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
      <div class="flex flex-col gap-2">
        <p class="text-sm font-semibold uppercase tracking-wide text-primary">Rentals</p>
        <div class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 class="text-3xl font-bold tracking-tight">Bookings</h1>
            <p class="mt-2 max-w-2xl text-sm text-base-content/70">{pageDescription}</p>
          </div>

          <AppButton variant="outline" onClick={() => void loadBookings()} disabled={isLoading}>
            Refresh
          </AppButton>
        </div>
      </div>

      {loadError ? (
        <div class="alert alert-error text-sm">
          <span>{loadError}</span>
        </div>
      ) : null}

      {isLoading ? (
        <div class="grid gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} class="rounded-box border border-base-300 bg-base-100 p-5 shadow-sm">
              <div class="skeleton mb-4 h-5 w-40" />
              <div class="grid gap-3 md:grid-cols-4">
                <div class="skeleton h-4 w-full" />
                <div class="skeleton h-4 w-full" />
                <div class="skeleton h-4 w-full" />
                <div class="skeleton h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : sortedBookings.length === 0 ? (
        <div class="rounded-box border border-dashed border-base-300 bg-base-100 px-6 py-12">
          <EmptyStateContent
            icon="📅"
            title="No bookings yet"
            description={
              isTenant
                ? 'When you request a room booking, it will appear here.'
                : 'When tenants request bookings for your listings, they will appear here.'
            }
          >
            <AppButton onClick={() => route('/listings')}>Go to listings</AppButton>
          </EmptyStateContent>
        </div>
      ) : (
        <div class="grid gap-4">
          {sortedBookings.map((booking) => {
            const acceptActionKey = `${booking.id}-accept`
            const rejectActionKey = `${booking.id}-reject`
            const cancelActionKey = `${booking.id}-cancel`
            const payActionKey = `${booking.id}-pay`

            return (
              <article
                key={booking.id}
                class="rounded-box border border-base-300 bg-base-100 p-5 shadow-sm"
              >
                <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div class="flex flex-col gap-3">
                    <div class="flex flex-wrap items-center gap-2">
                      <h2 class="text-lg font-semibold">Booking #{getShortId(booking.id)}</h2>
                      <span
                        class={`badge ${getBookingStatusBadgeClass(booking.status)}`.trim()}
                      >
                        {getBookingStatusLabel(booking.status)}
                      </span>
                    </div>

                    <div class="grid gap-3 text-sm text-base-content/75 sm:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <p class="text-xs font-semibold uppercase tracking-wide text-base-content/50">
                          Listing
                        </p>
                        <a
                          href={`/listings/${booking.listingId}`}
                          class="link link-primary font-medium"
                        >
                          #{getShortId(booking.listingId)}
                        </a>
                      </div>

                      <div>
                        <p class="text-xs font-semibold uppercase tracking-wide text-base-content/50">
                          Period
                        </p>
                        <p>
                          {formatDate(booking.since)} - {formatDate(booking.until)}
                        </p>
                      </div>

                      <div>
                        <p class="text-xs font-semibold uppercase tracking-wide text-base-content/50">
                          Total cost
                        </p>
                        <p>
                          {formatPrice(booking.totalCost)}
                          {booking.currency !== 'PLN' ? ` ${booking.currency}` : ''}
                        </p>
                      </div>

                      <div>
                        <p class="text-xs font-semibold uppercase tracking-wide text-base-content/50">
                          Payment
                        </p>
                        <p>{booking.paymentId ? `#${getShortId(booking.paymentId)}` : '-'}</p>
                      </div>
                    </div>
                  </div>

                  <div class="flex flex-wrap gap-2 lg:justify-end">
                    {isLandlord && canLandlordDecide(booking) ? (
                      <>
                        <AppButton
                          variant="success"
                          loading={pendingActionKey === acceptActionKey}
                          onClick={() => void handleBookingAction(booking.id, 'accept')}
                        >
                          Accept
                        </AppButton>

                        <AppButton
                          variant="warning"
                          loading={pendingActionKey === rejectActionKey}
                          onClick={() => void handleBookingAction(booking.id, 'reject')}
                        >
                          Reject
                        </AppButton>
                      </>
                    ) : null}

                    {isTenant && canTenantPay(booking) ? (
                      <AppButton
                        variant="success"
                        loading={pendingActionKey === payActionKey}
                        onClick={() => void handleBookingAction(booking.id, 'pay')}
                      >
                        Pay
                      </AppButton>
                    ) : null}

                    {isTenant && canTenantCancel(booking) ? (
                      <AppButton
                        variant="outline"
                        loading={pendingActionKey === cancelActionKey}
                        onClick={() => void handleBookingAction(booking.id, 'cancel')}
                      >
                        Cancel
                      </AppButton>
                    ) : null}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}