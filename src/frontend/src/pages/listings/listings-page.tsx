import type { RoutableProps } from 'preact-router'
import { route } from 'preact-router'
import { useEffect, useMemo, useState } from 'preact/hooks'

import { ListingCard } from '../../components/listings/listing-card'
import { ListingsEmptyState } from '../../components/listings/listings-empty-state'
import { ListingsSkeleton } from '../../components/listings/listings-skeleton'
import { ListingsToolbar } from '../../components/listings/listings-toolbar'
import { getListings } from '../../services/listings-api'
import type { Listing } from '../../types/listing'
import { formatLocation } from '../../utils/format-location'
import type { ListingStatus } from '../../types/listing-status'
import { useAuth } from '../../hooks/use-auth'

type ListingFilterValue = ListingStatus | 'ALL'

export function ListingsPage(_: RoutableProps) {
  const { session, isLandlord } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [listings, setListings] = useState<Listing[]>([])
  const [query, setQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<ListingFilterValue>('ALL')

  useEffect(() => {
    if (!session) {
      return
    }

    let isMounted = true
    const ownerId = isLandlord ? session.userId : undefined

    void getListings(session.token, ownerId ? { ownerId } : undefined, session.type)
      .then((items) => {
        if (isMounted) {
          setListings(items)
        }
      })
      .catch(() => {
        if (isMounted) {
          setListings([])
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [session, isLandlord])

  const filteredListings = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return listings.filter((listing) => {
      const searchable = `${listing.title} ${formatLocation(listing.location)}`.toLowerCase()
      const statusMatches = selectedStatus === 'ALL' || listing.status === selectedStatus
      const queryMatches = !normalizedQuery || searchable.includes(normalizedQuery)

      return statusMatches && queryMatches
    })
  }, [query, selectedStatus, listings])

  const hasFilters = query.trim().length > 0
  const activeCount = listings.filter((listing) => listing.status === 'ACTIVE').length

  return (
    <section class="flex w-full flex-1 flex-col gap-5">
      <ListingsToolbar
        query={query}
        selectedStatus={selectedStatus}
        totalCount={listings.length}
        activeCount={activeCount}
        onQueryChange={setQuery}
        onStatusChange={setSelectedStatus}
        onCreateListing={() => route('/listings/create')}
      />

      {isLoading ? <ListingsSkeleton /> : null}

      {!isLoading && filteredListings.length > 0 ? (
        <div class="grid gap-4 md:grid-cols-2">
          {filteredListings.map((listing) => (
            <ListingCard
              key={listing.id}
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
