import type { RoutableProps } from 'preact-router'
import { route } from 'preact-router'
import { useEffect, useMemo, useState } from 'preact/hooks'

import { ListingCard } from '../../components/listings/listing-card'
import { ListingsEmptyState } from '../../components/listings/listings-empty-state'
import { ListingsSkeleton } from '../../components/listings/listings-skeleton'
import { ListingsToolbar } from '../../components/listings/listings-toolbar'
import { mockListings } from '../../data/mock-listings'
import { formatLocation } from '../../utils/format-location'
import type { ListingStatus } from '../../utils/format-status-label'

type ListingFilterValue = ListingStatus | 'ALL'

export function ListingsPage(_: RoutableProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<ListingFilterValue>('ALL')

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setIsLoading(false)
    }, 650)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [])

  const filteredListings = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return mockListings.filter((listing) => {
      const searchable = `${listing.title} ${formatLocation(listing.location)}`.toLowerCase()
      const statusMatches = selectedStatus === 'ALL' || listing.status === selectedStatus
      const queryMatches = !normalizedQuery || searchable.includes(normalizedQuery)

      return statusMatches && queryMatches
    })
  }, [query, selectedStatus])

  const hasFilters = query.trim().length > 0

  return (
    <section class="flex w-full flex-1 flex-col gap-5">
      <ListingsToolbar
        query={query}
        selectedStatus={selectedStatus}
        totalCount={mockListings.length}
        activeCount={mockListings.filter((listing) => listing.status === 'ACTIVE').length}
        onQueryChange={setQuery}
        onStatusChange={setSelectedStatus}
        onCreateListing={() => route('/listings/create')}
      />

      {isLoading ? <ListingsSkeleton /> : null}

      {!isLoading && filteredListings.length > 0 ? (
        <div class="grid gap-4 md:grid-cols-2">
          {filteredListings.map((listing) => (
            <ListingCard
              key={listing.listingId}
              listing={listing}
              onEdit={(listingId) => route(`/listings/${listingId}/edit`)}
              onViewDetails={(listingId) => route(`/listings/${listingId}`)}
            />
          ))}
        </div>
      ) : null}

      {!isLoading && filteredListings.length === 0 ? (
        <ListingsEmptyState
          hasFilters={hasFilters}
          onClearFilters={() => {
            setQuery('')
            setSelectedStatus('ALL')
          }}
          onCreateListing={() => route('/listings/create')}
        />
      ) : null}
    </section>
  )
}
