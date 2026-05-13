import { useEffect, useState } from 'preact/hooks'
import { AppButton } from '../ui/app-button'
import {
  getListingUnavailability,
  createUnavailability,
  updateUnavailability,
  deleteUnavailability,
} from '../../services/unavailability-api'
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

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null)

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
      const data = await getListingUnavailability(listingId, session.token, session.type)
      setUnavailabilities(data)
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
      if (editingId) {
        await updateUnavailability(
          listingId,
          editingId,
          { startDate, endDate, reason },
          session.token,
          session.type
        )
        showToast('Unavailability updated successfully.', 'success')
        setEditingId(null)
      } else {
        await createUnavailability(
          listingId,
          { startDate, endDate, reason },
          session.token,
          session.type
        )
        showToast('Unavailability added successfully.', 'success')
      }
      
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

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this unavailability?')) return

    const session = readAuthSession()
    if (!session) return

    try {
      await deleteUnavailability(listingId, id, session.token, session.type)
      showToast('Unavailability removed.', 'success')
      await fetchUnavailabilities()
    } catch (error: any) {
      console.error('Failed to delete unavailability:', error)
      if (error?.status === 405 || error?.status === 404) {
        showToast('Delete not supported by backend yet.', 'warning')
      } else {
        showToast('Failed to remove unavailability.', 'error')
      }
    }
  }

  function handleEditClick(item: Unavailability) {
    setEditingId(item.id)
    setStartDate(item.startDate.split('T')[0])
    setEndDate(item.endDate.split('T')[0])
    setReason(item.reason || '')
  }

  function cancelEdit() {
    setEditingId(null)
    setStartDate('')
    setEndDate('')
    setReason('')
  }

  return (
    <div class="card bg-base-100 shadow-sm border border-base-200 mt-8">
      <div class="card-body">
        <h2 class="card-title text-xl mb-4">Unavailability Calendar</h2>
        <p class="text-sm text-base-content/70 mb-4">
          Mark specific dates when your listing is unavailable (e.g. for maintenance or personal use).
        </p>

        <form onSubmit={handleAddOrUpdate} class="bg-base-200 p-4 rounded-lg mb-6">
          <h3 class="font-medium mb-3">{editingId ? 'Edit Unavailability' : 'Add Unavailability'}</h3>
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
              {editingId ? 'Save Changes' : 'Add Dates'}
            </AppButton>
            {editingId && (
              <AppButton type="button" variant="outline" onClick={cancelEdit} disabled={isSubmitting}>
                Cancel
              </AppButton>
            )}
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
                  <th class="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {unavailabilities.map((item) => (
                  <tr key={item.id} class={editingId === item.id ? 'bg-base-200' : ''}>
                    <td>{new Date(item.startDate).toLocaleDateString()}</td>
                    <td>{new Date(item.endDate).toLocaleDateString()}</td>
                    <td>{item.reason || '-'}</td>
                    <td class="text-right">
                      <div class="flex justify-end gap-2">
                        <button
                          type="button"
                          class="btn btn-sm btn-ghost"
                          onClick={() => handleEditClick(item)}
                          disabled={editingId === item.id}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          class="btn btn-sm btn-ghost text-error"
                          onClick={() => handleDelete(item.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
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
