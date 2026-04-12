import type { ListingStatus } from '../../types/listing-status'
import { formatStatusLabel } from '../../utils/format-status-label'
import { FormField } from '../ui/form-field'
import { CreateListingButton } from './listings-action-buttons'
import { ListingsSurface } from './listings-surface'

type ListingFilterValue = ListingStatus | 'ALL'

type ListingsToolbarProps = {
  query: string
  selectedStatus: ListingFilterValue
  totalCount: number
  activeCount: number
  onQueryChange: (value: string) => void
  onStatusChange: (value: ListingFilterValue) => void
  onCreateListing: () => void
}

export function ListingsToolbar({
  query,
  selectedStatus,
  totalCount,
  activeCount,
  onQueryChange,
  onStatusChange,
  onCreateListing,
}: ListingsToolbarProps) {
  return (
    <ListingsSurface>
      <div class="card-body gap-4">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 class="text-2xl font-semibold tracking-tight">Twoje ogłoszenia</h1>
            <p class="text-sm text-base-content/65">Zarządzaj publikacją i widocznością ofert.</p>
          </div>
          <CreateListingButton onClick={onCreateListing} />
        </div>

        <div class="flex flex-wrap items-center gap-2 text-sm">
          <span class="badge badge-outline">Wszystkie: {totalCount}</span>
          <span class="badge badge-success badge-soft">Aktywne: {activeCount}</span>
        </div>

        <div class="grid gap-3 md:grid-cols-[2fr_1fr]">
          <FormField label="Szukaj">
            <input
              class="input w-full"
              type="text"
              value={query}
              placeholder="Tytuł, miasto, dzielnica"
              onInput={(event: any) => onQueryChange(event.currentTarget.value)}
            />
          </FormField>

          <FormField label="Status">
            <select
              class="select w-full"
              value={selectedStatus}
              onChange={(event) => onStatusChange((event.currentTarget as HTMLSelectElement).value as ListingFilterValue)}
            >
              {['ALL', 'DRAFT', 'UNDER_REVIEW', 'AWAITING_REVIEW', 'AWAITING_FIXES', 'ACTIVE', 'HIDDEN', 'ARCHIVED'].map((status) => (
                <option key={status} value={status}>
                  {status === 'ALL' ? 'Wszystkie statusy' : formatStatusLabel(status as ListingStatus)}
                </option>
              ))}
            </select>
          </FormField>
        </div>
      </div>
    </ListingsSurface>
  )
}
