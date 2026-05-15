import { useEffect, useState } from 'preact/hooks'
import { AppButton } from '../ui/app-button'
import {
  createUnavailability,
} from '../../services/unavailability-api'
import { getListingById } from '../../services/listings-api'
import { readAuthSession } from '../../services/auth-session'
import type { Unavailability } from '../../types/unavailability'
import { useErrorHandler } from '../../services/error-handler-context'

interface ListingUnavailabilityCalendarProps {
  listingId: string
}

export function ListingUnavailabilityCalendar({ listingId }: ListingUnavailabilityCalendarProps) {
  const [unavailabilities, setUnavailabilities] = useState<Unavailability[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { showToast } = useErrorHandler()

  // Form states
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)



  useEffect(() => {
    fetchUnavailabilities()
    
    // Dynamically load cally web components if not already present
    if (!window.customElements.get('calendar-range')) {
      const script = document.createElement('script')
      script.type = 'module'
      script.src = 'https://unpkg.com/cally'
      document.head.appendChild(script)
    }
  }, [listingId])

  async function fetchUnavailabilities() {
    const session = readAuthSession()
    if (!session) return

    setIsLoading(true)
    try {
      const listing = await getListingById(listingId, session.token, session.type)
      const mapped = (listing.unavailability || []).map((u, idx) => ({
        id: String(idx),
        listingId,
        startDate: u.since,
        endDate: u.until,
        reason: u.message,
      }))
      setUnavailabilities(mapped)
    } catch (error: any) {
      if (error?.status !== 405 && error?.status !== 404) {
        console.error('Failed to fetch unavailabilities:', error)
        showToast('Failed to load unavailability calendar.', 'error')
      }
    } finally {
      setIsLoading(false)
    }
  }

  async function handleAddOrUpdate(e: Event) {
    e.preventDefault()

    if (!startDate || !endDate) {
      showToast('Please provide both start and end dates.', 'error')
      return
    }

    if (new Date(startDate) > new Date(endDate)) {
      showToast('Start date must be before end date.', 'error')
      return
    }

    const session = readAuthSession()
    if (!session) return

    setIsSubmitting(true)

    try {
      await createUnavailability(
        listingId,
        { startDate, endDate, reason },
        session.token,
        session.type
      )
      showToast('Unavailability added successfully.', 'success')
      
      setStartDate('')
      setEndDate('')
      setReason('')
      await fetchUnavailabilities()
    } catch (error: any) {
      console.error('Failed to save unavailability:', error)
      if (error?.status === 405) {
        showToast('Operation not supported by backend yet.', 'warning')
      } else if (error?.status === 400) {
        showToast('Validation error: Please ensure the dates are correct.', 'error')
      } else {
        showToast('Failed to save unavailability.', 'error')
      }
    } finally {
      setIsSubmitting(false)
    }
  }



  return (
    <div class="card bg-base-100 shadow-sm border border-base-200 mt-8">
      <div class="card-body">
        <h2 class="card-title text-xl mb-4">Unavailability Calendar</h2>
        <p class="text-sm text-base-content/70 mb-4">
          Mark specific dates when your listing is unavailable (e.g. for maintenance or personal use).
        </p>

        <form onSubmit={handleAddOrUpdate} class="bg-base-200 p-4 rounded-lg mb-6">
          <h3 class="font-medium mb-3">Add Unavailability</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text">Select Date Range</span>
              </label>
              <div class="bg-base-100 p-2 rounded-box border border-base-300 w-fit">
                {/* @ts-ignore */}
                <calendar-range 
                  class="cally" 
                  value={startDate && endDate ? `${startDate}/${endDate}` : ''}
                  onChange={(e: Event) => {
                    const val = (e.target as HTMLInputElement).value;
                    if (val && val.includes('/')) {
                      const [start, end] = val.split('/');
                      setStartDate(start);
                      setEndDate(end);
                    } else {
                      setStartDate(val);
                      setEndDate('');
                    }
                  }}
                >
                  <svg aria-label="Previous" slot="previous" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
                  <svg aria-label="Next" slot="next" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                  {/* @ts-ignore */}
                  <calendar-month></calendar-month>
                {/* @ts-ignore */}
                </calendar-range>
              </div>
              <div class="text-xs text-base-content/60 mt-2">
                Selected: {startDate || '-'} to {endDate || '-'}
              </div>
            </div>
            
            <div class="form-control flex flex-col gap-4">
              <div>
                <label class="label">
                  <span class="label-text">Reason (Optional)</span>
                </label>
                <input
                  type="text"
                  class="input input-bordered w-full"
                  value={reason}
                  onInput={(e) => setReason(e.currentTarget.value)}
                  placeholder="e.g. Maintenance"
                />
              </div>
            </div>
          </div>
          <div class="flex gap-2">
            <AppButton type="submit" loading={isSubmitting} variant="primary">
              Add Dates
            </AppButton>
          </div>
        </form>

        {isLoading ? (
          <div class="flex justify-center p-4">
            <span class="loading loading-spinner text-primary"></span>
          </div>
        ) : unavailabilities.length === 0 ? (
          <div class="text-center p-6 text-base-content/50 border border-dashed rounded-lg">
            No unavailabilities scheduled.
          </div>
        ) : (
          <div class="overflow-x-auto">
            <table class="table w-full">
              <thead>
                <tr>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {unavailabilities.map((item) => (
                  <tr key={item.id}>
                    <td>{new Date(item.startDate).toLocaleDateString()}</td>
                    <td>{new Date(item.endDate).toLocaleDateString()}</td>
                    <td>{item.reason || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
