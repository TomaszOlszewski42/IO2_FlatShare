import type { ListingStatus } from '../../types/listing-status'
import { UserRole } from '../../types/user'
import { formatStatusLabel } from '../../utils/format-status-label'
import { RoleBoundary } from '../auth/role-boundary'
import { CheckboxInput } from '../ui/checkbox-input'
import { NumberInput } from '../ui/number-input'
import { SelectInput } from '../ui/select-input'
import { TextInput } from '../ui/text-input'
import { CreateListingButton } from './listings-action-buttons'
import { ListingsSurface } from './listings-surface'

type ListingFilterValue = ListingStatus | 'ALL'
type PriceFilterValue = number | ''
type ListingSortValue = 'NEWEST' | 'PRICE_ASC' | 'PRICE_DESC'

type TenantFeatureFilters = {
  petsAllowed: boolean
  furnished: boolean
  nonSmoking: boolean
}

type TenantFeatureFilterKey = keyof TenantFeatureFilters

type ListingsToolbarProps = {
  query: string
  selectedStatus: ListingFilterValue
  priceMin?: PriceFilterValue
  priceMax?: PriceFilterValue
  selectedSort?: ListingSortValue
  featureFilters?: TenantFeatureFilters
  totalCount: number
  activeCount: number
  onQueryChange: (value: string) => void
  onStatusChange: (value: ListingFilterValue) => void
  onPriceMinChange?: (value: PriceFilterValue) => void
  onPriceMaxChange?: (value: PriceFilterValue) => void
  onSortChange?: (value: ListingSortValue) => void
  onFeatureFiltersChange?: (value: TenantFeatureFilters) => void
  onCreateListing: () => void
}

const emptyFeatureFilters: TenantFeatureFilters = {
  petsAllowed: false,
  furnished: false,
  nonSmoking: false,
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
  label: status === 'ALL' ? 'All statuses' : formatStatusLabel(status as ListingStatus),
}))

const sortOptions = [
  { value: 'NEWEST', label: 'Newest first' },
  { value: 'PRICE_ASC', label: 'Cheapest first' },
  { value: 'PRICE_DESC', label: 'Most expensive first' },
]

function readPriceInput(value: string): PriceFilterValue {
  if (!value) {
    return ''
  }

  const parsedValue = Number(value)

  return Number.isFinite(parsedValue) ? parsedValue : ''
}

export function ListingsToolbar({
  query,
  selectedStatus,
  priceMin = '',
  priceMax = '',
  selectedSort = 'NEWEST',
  featureFilters = emptyFeatureFilters,
  totalCount,
  activeCount,
  onQueryChange,
  onStatusChange,
  onPriceMinChange = () => {},
  onPriceMaxChange = () => {},
  onSortChange = () => {},
  onFeatureFiltersChange = () => {},
  onCreateListing,
}: ListingsToolbarProps) {
  const updateFeatureFilter = (key: TenantFeatureFilterKey, value: boolean) => {
    onFeatureFiltersChange({
      ...featureFilters,
      [key]: value,
    })
  }

  return (
    <ListingsSurface>
      <div class="card-body gap-4">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <RoleBoundary
              requiredRole={[UserRole.Landlord, UserRole.Admin]}
              fallback={
                <>
                  <h1 class="text-2xl font-semibold tracking-tight">Find a room</h1>
                  <p class="text-sm text-base-content/65">
                    Browse available listings and find a place that matches your needs.
                  </p>
                </>
              }
            >
              <h1 class="text-2xl font-semibold tracking-tight">Your listings</h1>
              <p class="text-sm text-base-content/65">
                Manage publication and visibility of your offers.
              </p>
            </RoleBoundary>
          </div>

          <RoleBoundary requiredRole={UserRole.Landlord}>
            <CreateListingButton onClick={onCreateListing} />
          </RoleBoundary>
        </div>

        <div class="flex flex-wrap items-center gap-2 text-sm">
          <RoleBoundary
            requiredRole={[UserRole.Landlord, UserRole.Admin]}
            fallback={<span class="badge badge-success badge-soft">Available offers: {totalCount}</span>}
          >
            <span class="badge badge-outline">Total: {totalCount}</span>
            <span class="badge badge-success badge-soft">Active: {activeCount}</span>
          </RoleBoundary>
        </div>

        <div class="grid gap-3 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <TextInput
            id="listings-query"
            name="query"
            label="Search"
            type="text"
            value={query}
            placeholder="Search by title, city or district"
            onInput={(event) => onQueryChange((event.currentTarget as HTMLInputElement).value)}
          />

          <RoleBoundary
            requiredRole={[UserRole.Landlord, UserRole.Admin]}
            fallback={
              <>
                <NumberInput
                  id="listings-price-min"
                  name="priceMin"
                  label="Price from"
                  value={priceMin}
                  min={0}
                  step={50}
                  placeholder="Min"
                  onInput={(event) =>
                    onPriceMinChange(readPriceInput((event.currentTarget as HTMLInputElement).value))
                  }
                />

                <NumberInput
                  id="listings-price-max"
                  name="priceMax"
                  label="Price to"
                  value={priceMax}
                  min={0}
                  step={50}
                  placeholder="Max"
                  onInput={(event) =>
                    onPriceMaxChange(readPriceInput((event.currentTarget as HTMLInputElement).value))
                  }
                />

                <SelectInput
                  id="listings-sort"
                  name="sort"
                  label="Sort"
                  value={selectedSort}
                  options={sortOptions}
                  onChange={(event) =>
                    onSortChange((event.currentTarget as HTMLSelectElement).value as ListingSortValue)
                  }
                />
              </>
            }
          >
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
          </RoleBoundary>
        </div>

        <RoleBoundary
          requiredRole={[UserRole.Landlord, UserRole.Admin]}
          fallback={
            <div class="rounded-box border border-base-300 bg-base-200/40 px-4 py-3">
              <p class="mb-2 text-sm font-medium">Quick filters</p>

              <div class="grid gap-2 sm:grid-cols-3">
                <CheckboxInput
                  id="listings-filter-pets"
                  name="petsAllowed"
                  label="Pets allowed"
                  checked={featureFilters.petsAllowed}
                  onChange={(event) =>
                    updateFeatureFilter('petsAllowed', (event.currentTarget as HTMLInputElement).checked)
                  }
                />

                <CheckboxInput
                  id="listings-filter-furnished"
                  name="furnished"
                  label="Furnished"
                  checked={featureFilters.furnished}
                  onChange={(event) =>
                    updateFeatureFilter('furnished', (event.currentTarget as HTMLInputElement).checked)
                  }
                />

                <CheckboxInput
                  id="listings-filter-non-smoking"
                  name="nonSmoking"
                  label="Non-smoking"
                  checked={featureFilters.nonSmoking}
                  onChange={(event) =>
                    updateFeatureFilter('nonSmoking', (event.currentTarget as HTMLInputElement).checked)
                  }
                />
              </div>
            </div>
          }
        >
          {null}
        </RoleBoundary>
      </div>
    </ListingsSurface>
  )
}