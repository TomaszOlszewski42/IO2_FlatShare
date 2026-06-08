import type { JSX } from 'preact'
import { useEffect, useState } from 'preact/hooks'

import { FormErrorSummary } from '../forms/form-error-summary'
import { ListingSection } from '../listings/listing-section'
import { AppButton } from '../ui/app-button'
import { DateInput } from '../ui/date-input'
import type { BookingCreatedResponse, CreateBookingPayload } from '../../types/booking'
import { formatPrice } from '../../utils/format-price'

type BookingUnavailableRange = {
  since: string
  until: string
  message?: string | null
}

type BookingRequestPanelProps = {
  listingId: string
  listingTitle: string
  price: number
  currency: string
  availableSince?: string | null
  unavailableRanges?: BookingUnavailableRange[]
  isDisabled?: boolean
  disabledReason?: string
  onCreateBooking: (payload: CreateBookingPayload) => Promise<BookingCreatedResponse>
}

type BookingRequestFormErrors = {
  startDate?: string
  endDate?: string
}

function getTodayDateInputValue(): string {
  return new Date().toISOString().slice(0, 10)
}

function toDateInputValue(value?: string | null): string {
  return value ? value.slice(0, 10) : ''
}

function getLaterDateValue(firstDate: string, secondDate: string): string {
  if (!secondDate) {
    return firstDate
  }

  return firstDate > secondDate ? firstDate : secondDate
}

function calculateInclusiveMonthCount(startDate: string, endDate: string): number {
  if (!startDate || !endDate || endDate < startDate) {
    return 0
  }

  const [startYear, startMonth] = startDate.split('-').map(Number)
  const [endYear, endMonth] = endDate.split('-').map(Number)

  if (!startYear || !startMonth || !endYear || !endMonth) {
    return 0
  }

  return (endYear - startYear) * 12 + endMonth - startMonth + 1
}

function findOverlappingUnavailableRange(
  startDate: string,
  endDate: string,
  unavailableRanges: BookingUnavailableRange[],
): BookingUnavailableRange | null {
  if (!startDate || !endDate) {
    return null
  }

  return (
    unavailableRanges.find((range) => {
      const unavailableSince = toDateInputValue(range.since)
      const unavailableUntil = toDateInputValue(range.until)

      if (!unavailableSince || !unavailableUntil) {
        return false
      }

      return startDate <= unavailableUntil && endDate >= unavailableSince
    }) ?? null
  )
}

export function BookingRequestPanel({
  listingId,
  listingTitle,
  price,
  currency,
  availableSince,
  unavailableRanges = [],
  isDisabled = false,
  disabledReason,
  onCreateBooking,
}: BookingRequestPanelProps) {
  const availableFromDate = toDateInputValue(availableSince)
  const minimumStartDate = getLaterDateValue(getTodayDateInputValue(), availableFromDate)

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [errors, setErrors] = useState<BookingRequestFormErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [createdBooking, setCreatedBooking] = useState<BookingCreatedResponse | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const monthCount = calculateInclusiveMonthCount(startDate, endDate)
  const estimatedTotal = monthCount * price

  useEffect(() => {
    setStartDate('')
    setEndDate('')
    setErrors({})
    setSubmitError(null)
    setCreatedBooking(null)
  }, [listingId])

  function validateForm(): BookingRequestFormErrors {
    const nextErrors: BookingRequestFormErrors = {}

    if (!startDate) {
      nextErrors.startDate = 'Choose booking start date.'
    } else if (startDate < minimumStartDate) {
      nextErrors.startDate = availableFromDate
        ? `Start date cannot be earlier than ${availableFromDate}.`
        : 'Start date cannot be earlier than today.'
    }

    if (!endDate) {
      nextErrors.endDate = 'Choose booking end date.'
    } else if (startDate && endDate < startDate) {
      nextErrors.endDate = 'End date cannot be before start date.'
    }

    const overlappingRange = findOverlappingUnavailableRange(
      startDate,
      endDate,
      unavailableRanges,
    )

    if (!nextErrors.startDate && !nextErrors.endDate && overlappingRange) {
      nextErrors.endDate = `Selected period overlaps unavailable dates: ${toDateInputValue(
        overlappingRange.since,
      )} - ${toDateInputValue(overlappingRange.until)}.`
    }

    return nextErrors
  }

  async function handleSubmit(event: JSX.TargetedSubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isDisabled || isSubmitting) {
      return
    }

    const nextErrors = validateForm()
    setErrors(nextErrors)
    setSubmitError(null)
    setCreatedBooking(null)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await onCreateBooking({
        listingId,
        startDate,
        endDate,
      })

      setCreatedBooking(response)
    } catch (error) {
      const message =
        error instanceof Error && error.message.trim().length > 0
          ? error.message
          : 'Could not create booking request.'

      setSubmitError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ListingSection title="Request booking">
      <form class="flex flex-col gap-4" noValidate onSubmit={handleSubmit}>
        <p class="text-sm leading-relaxed text-base-content/70">
          Choose the rental period for <span class="font-medium">{listingTitle}</span>. The owner will
          still need to accept your request before payment.
        </p>

        {isDisabled && disabledReason ? (
          <div class="alert alert-info text-sm">
            <span>{disabledReason}</span>
          </div>
        ) : null}

        <FormErrorSummary error={submitError} />

        <div class="grid gap-4 md:grid-cols-2">
          <DateInput
            id="booking-start-date"
            name="startDate"
            label="Start date"
            value={startDate}
            min={minimumStartDate}
            required
            disabled={isDisabled || isSubmitting}
            error={errors.startDate}
            onInput={(event) => {
              const target = event.currentTarget as HTMLInputElement
              setStartDate(target.value)
              setErrors((currentErrors) => ({ ...currentErrors, startDate: undefined }))
              setCreatedBooking(null)
            }}
          />

          <DateInput
            id="booking-end-date"
            name="endDate"
            label="End date"
            value={endDate}
            min={startDate || minimumStartDate}
            required
            disabled={isDisabled || isSubmitting}
            error={errors.endDate}
            onInput={(event) => {
              const target = event.currentTarget as HTMLInputElement
              setEndDate(target.value)
              setErrors((currentErrors) => ({ ...currentErrors, endDate: undefined }))
              setCreatedBooking(null)
            }}
          />
        </div>

        <div class="rounded-box bg-base-200/50 p-4 text-sm text-base-content/75">
          <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Monthly price: <strong>{formatPrice(price)}</strong>
            </span>
            <span>
              Estimated total:{' '}
              <strong>
                {monthCount > 0 ? `${formatPrice(estimatedTotal)} for ${monthCount} month(s)` : '-'}
              </strong>
            </span>
          </div>

          {currency !== 'PLN' ? (
            <p class="mt-2 text-xs text-base-content/60">
              Currency returned by backend: {currency}
            </p>
          ) : null}
        </div>

        {unavailableRanges.length > 0 ? (
          <div class="rounded-box border border-base-300 p-4 text-sm">
            <p class="mb-2 font-medium">Unavailable periods</p>
            <ul class="flex flex-col gap-1 text-base-content/70">
              {unavailableRanges.map((range, index) => (
                <li key={`${range.since}-${range.until}-${index}`}>
                  {toDateInputValue(range.since)} - {toDateInputValue(range.until)}
                  {range.message ? ` — ${range.message}` : ''}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {createdBooking ? (
          <div class="alert alert-success text-sm">
            <div>
              <p class="font-semibold">Booking request sent.</p>
              <p>
                Status: {createdBooking.status}. Total price: {formatPrice(createdBooking.totalPrice)}.
              </p>
            </div>
          </div>
        ) : null}

        <div class="flex justify-end">
          <AppButton type="submit" loading={isSubmitting} disabled={isDisabled}>
            Send booking request
          </AppButton>
        </div>
      </form>
    </ListingSection>
  )
}