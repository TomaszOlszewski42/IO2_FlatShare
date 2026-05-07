import { AppButton } from '../ui/app-button'
import { ListingsSurface } from './listings-surface'

type ListingsResultsSummaryProps = {
  visibleCount: number
  totalCount: number
  hasFilters: boolean
  isLandlord: boolean
  onClearFilters: () => void
}

function getItemLabel(count: number, isLandlord: boolean): string {
  if (isLandlord) {
    return count === 1 ? 'listing' : 'listings'
  }

  return count === 1 ? 'offer' : 'offers'
}

export function ListingsResultsSummary({
  visibleCount,
  totalCount,
  hasFilters,
  isLandlord,
  onClearFilters,
}: ListingsResultsSummaryProps) {
  const itemLabel = getItemLabel(visibleCount, isLandlord)

  return (
    <ListingsSurface translucent>
      <div class="card-body flex-row flex-wrap items-center justify-between gap-3 py-4">
        <div>
          <p class="font-medium">
            {hasFilters
              ? `Showing ${visibleCount} of ${totalCount} ${getItemLabel(totalCount, isLandlord)}`
              : `${totalCount} ${getItemLabel(totalCount, isLandlord)} available`}
          </p>

          <p class="text-sm text-base-content/60">
            {hasFilters
              ? 'Results are narrowed down by your current filters.'
              : isLandlord
                ? 'Use filters to manage your listings faster.'
                : 'Use filters to quickly find the best matching room.'}
          </p>
        </div>

        {hasFilters ? (
          <AppButton variant="ghost" className="btn-sm" onClick={onClearFilters}>
            Clear filters
          </AppButton>
        ) : (
          <span class="badge badge-outline">{visibleCount} {itemLabel}</span>
        )}
      </div>
    </ListingsSurface>
  )
}