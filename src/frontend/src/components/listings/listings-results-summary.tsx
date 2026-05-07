import { AppButton } from '../ui/app-button'
import { ListingsSurface } from './listings-surface'

type ListingsResultsSummaryProps = {
  visibleCount: number
  totalCount: number
  hasFilters: boolean
  isLandlord: boolean
  pageStart?: number
  pageEnd?: number
  onClearFilters: () => void
}

function getItemLabel(count: number, isLandlord: boolean): string {
  if (isLandlord) {
    return count === 1 ? 'listing' : 'listings'
  }

  return count === 1 ? 'offer' : 'offers'
}

function getSummaryText({
  visibleCount,
  totalCount,
  hasFilters,
  isLandlord,
  pageStart,
  pageEnd,
}: Omit<ListingsResultsSummaryProps, 'onClearFilters'>): string {
  const itemLabel = getItemLabel(visibleCount, isLandlord)
  const hasPageRange = visibleCount > 0 && pageStart !== undefined && pageEnd !== undefined

  if (hasPageRange) {
    return `Showing ${pageStart}-${pageEnd} of ${visibleCount} ${itemLabel}`
  }

  if (hasFilters) {
    return `Showing ${visibleCount} of ${totalCount} ${getItemLabel(totalCount, isLandlord)}`
  }

  return `${totalCount} ${getItemLabel(totalCount, isLandlord)} available`
}

export function ListingsResultsSummary({
  visibleCount,
  totalCount,
  hasFilters,
  isLandlord,
  pageStart,
  pageEnd,
  onClearFilters,
}: ListingsResultsSummaryProps) {
  const itemLabel = getItemLabel(visibleCount, isLandlord)
  const summaryText = getSummaryText({
    visibleCount,
    totalCount,
    hasFilters,
    isLandlord,
    pageStart,
    pageEnd,
  })

  return (
    <ListingsSurface translucent>
      <div class="card-body flex-row flex-wrap items-center justify-between gap-3 py-4">
        <div>
          <p class="font-medium">{summaryText}</p>

          <p class="text-sm text-base-content/60">
            {hasFilters
              ? `Filtered from ${totalCount} ${getItemLabel(totalCount, isLandlord)}.`
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
          <span class="badge badge-outline">
            {visibleCount} {itemLabel}
          </span>
        )}
      </div>
    </ListingsSurface>
  )
}