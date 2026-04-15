import type { ListingStatus } from '../../types/listing-status'
import { formatStatusLabel } from '../../utils/format-status-label'
import { SelectInput } from '../ui/select-input'
import { TextInput } from '../ui/text-input'
import { CreateListingButton } from './listings-action-buttons'
import { ListingsSurface } from './listings-surface'
import { RoleBoundary } from '../auth/role-boundary'
import { UserRole } from '../../types/user'

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

const statusOptions = [
  'ALL',
  'DRAFT',
  'UNDER_REVIEW',
  'AWAITING_REVIEW',
  'AWAITING_FIXES',
  'ACTIVE',
  'HIDDEN',
  'ARCHIVED',
].map((status) => ({
  value: status,
  label: status === 'ALL' ? 'Wszystkie statusy' : formatStatusLabel(status as ListingStatus),
}))

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
            <RoleBoundary 
              requiredRole={UserRole.Landlord} 
              fallback={
                <>
                  <h1 class="text-2xl font-semibold tracking-tight">Available Listings</h1>
                  <p class="text-sm text-base-content/65">Browse and find your next flat.</p>
                </>
              }
            >
              <h1 class="text-2xl font-semibold tracking-tight">Twoje ogłoszenia</h1>
              <p class="text-sm text-base-content/65">Zarządzaj publikacją i widocznością ofert.</p>
            </RoleBoundary>
          </div>
          
          <RoleBoundary requiredRole={UserRole.Landlord}>
            <CreateListingButton onClick={onCreateListing} />
          </RoleBoundary>
        </div>

        <div class="flex flex-wrap items-center gap-2 text-sm">
          <span class="badge badge-outline">Wszystkie: {totalCount}</span>
          <span class="badge badge-success badge-soft">Aktywne: {activeCount}</span>
        </div>

        <div class="grid gap-3 md:grid-cols-[2fr_1fr]">
          <TextInput
            id="listings-query"
            name="query"
            label="Szukaj"
            type="text"
            value={query}
            placeholder="Tytuł, miasto, dzielnica"
            onInput={(event) => onQueryChange((event.currentTarget as HTMLInputElement).value)}
          />

          <SelectInput
            id="listings-status"
            name="status"
            label="Status"
            value={selectedStatus}
            options={statusOptions}
            onChange={(event) =>
              onStatusChange((event.currentTarget as HTMLSelectElement).value as ListingFilterValue)
            }
          />
        </div>
      </div>
    </ListingsSurface>
  )
}