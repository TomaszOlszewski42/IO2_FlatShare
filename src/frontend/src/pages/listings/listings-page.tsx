import type { RoutableProps } from 'preact-router'
import { route } from 'preact-router'
import { useEffect, useMemo, useState } from 'preact/hooks'

import { InfoAlert } from '../../components/common/info-alert'
import { ListingCard } from '../../components/listings/listing-card'
import { ListingsEmptyState } from '../../components/listings/listings-empty-state'
import { ListingsResultsSummary } from '../../components/listings/listings-results-summary'
import { ListingsSkeleton } from '../../components/listings/listings-skeleton'
import { ListingsToolbar } from '../../components/listings/listings-toolbar'
import { useAuth } from '../../hooks/use-auth'
import { getListings } from '../../services/listings-api'
import type { Listing } from '../../types/listing'
import type { ListingStatus } from '../../types/listing-status'
import { formatLocation } from '../../utils/format-location'

type ListingFilterValue = ListingStatus | 'ALL'
type PriceFilterValue = number | ''
type ListingSortValue = 'NEWEST' | 'PRICE_ASC' | 'PRICE_DESC'

type TenantFeatureFilters = {
  petsAllowed: boolean
  furnished: boolean
  nonSmoking: boolean
}

const emptyFeatureFilters: TenantFeatureFilters = {
  petsAllowed: false,
  furnished: false,
  nonSmoking: false,
}

function getListingCreatedAtTime(listing: Listing): number {
  if (!listing.createdAt) {
    return 0
  }

  const time = new Date(listing.createdAt).getTime()

  return Number.isFinite(time) ? time : 0
}

function isPetsAllowed(listing: Listing): boolean {
  return Boolean(listing.allowPets || listing.attributes?.petsAllowed)
}

function isNonSmokingListing(listing: Listing): boolean {
  return listing.allowSmoking === false || Boolean(listing.attributes?.nonSmokingOnly)
}

function getReadableListingsError(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message.trim()
  }

  return 'Failed to load listings.'
}

export function ListingsPage(_: RoutableProps) {
  const { session, isLandlord } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [listings, setListings] = useState<Listing[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<ListingFilterValue>('ALL')
  const [priceMin, setPriceMin] = useState<PriceFilterValue>('')
  const [priceMax, setPriceMax] = useState<PriceFilterValue>('')
  const [selectedSort, setSelectedSort] = useState<ListingSortValue>('NEWEST')
  const [featureFilters, setFeatureFilters] = useState<TenantFeatureFilters>(emptyFeatureFilters)

  useEffect(() => {
    if (!session) {
      return
    }

    let isMounted = true

    setIsLoading(true)
    setLoadError(null)

    /*
      Backend currently returns 500 for:
      /api/v1/listings?OwnerId=<id>

      Until the backend endpoint is fixed, do not send OwnerId from the frontend.
      The backend ListingDto also does not return ownerId yet, so the frontend cannot
      reliably filter "my listings" locally without backend support.
    */
    void getListings(session.token, undefined, session.type)
      .then((items) => {
        if (isMounted) {
          setListings(items)
        }
      })
      .catch((error) => {
        console.error('Failed to load listings:', error)

        if (isMounted) {
          setListings([])
          setLoadError(getReadableListingsError(error))
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
  }, [session])

  useEffect(() => {
    if (!isLandlord) {
      setSelectedStatus('ALL')
    }
  }, [isLandlord])

  const visibleListings = useMemo(() => {
    if (isLandlord) {
      return listings
    }

    return listings.filter((listing) => !listing.status || listing.status === 'ACTIVE')
  }, [isLandlord, listings])

  const filteredListings = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return visibleListings.filter((listing) => {
      const searchable = `${listing.title} ${formatLocation(listing.location)}`.toLowerCase()
      const statusMatches =
        !isLandlord || selectedStatus === 'ALL' || listing.status === selectedStatus
      const queryMatches = !normalizedQuery || searchable.includes(normalizedQuery)
      const minPriceMatches = priceMin === '' || listing.price >= priceMin
      const maxPriceMatches = priceMax === '' || listing.price <= priceMax
      const petsMatch = !featureFilters.petsAllowed || isPetsAllowed(listing)
      const furnishedMatch = !featureFilters.furnished || Boolean(listing.furnished)
      const nonSmokingMatch = !featureFilters.nonSmoking || isNonSmokingListing(listing)

      return (
        statusMatches &&
        queryMatches &&
        minPriceMatches &&
        maxPriceMatches &&
        petsMatch &&
        furnishedMatch &&
        nonSmokingMatch
      )
    })
  }, [query, selectedStatus, visibleListings, isLandlord, priceMin, priceMax, featureFilters])

  const sortedListings = useMemo(() => {
    const items = [...filteredListings]

    if (selectedSort === 'PRICE_ASC') {
      return items.sort((first, second) => first.price - second.price)
    }

    if (selectedSort === 'PRICE_DESC') {
      return items.sort((first, second) => second.price - first.price)
    }

    return items.sort(
      (first, second) => getListingCreatedAtTime(second) - getListingCreatedAtTime(first),
    )
  }, [filteredListings, selectedSort])

  const hasFeatureFilters = Object.values(featureFilters).some(Boolean)

  const hasFilters =
    query.trim().length > 0 ||
    priceMin !== '' ||
    priceMax !== '' ||
    selectedSort !== 'NEWEST' ||
    hasFeatureFilters ||
    (isLandlord && selectedStatus !== 'ALL')

  const activeCount = visibleListings.filter(
    (listing) => !listing.status || listing.status === 'ACTIVE',
  ).length

  const clearFilters = () => {
    setQuery('')
    setSelectedStatus('ALL')
    setPriceMin('')
    setPriceMax('')
    setSelectedSort('NEWEST')
    setFeatureFilters(emptyFeatureFilters)
  }

  return (
    <section class="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-5 px-4 py-6 md:px-6 md:py-8">
      <ListingsToolbar
        query={query}
        selectedStatus={selectedStatus}
        priceMin={priceMin}
        priceMax={priceMax}
        selectedSort={selectedSort}
        featureFilters={featureFilters}
        totalCount={visibleListings.length}
        activeCount={activeCount}
        onQueryChange={setQuery}
        onStatusChange={setSelectedStatus}
        onPriceMinChange={setPriceMin}
        onPriceMaxChange={setPriceMax}
        onSortChange={setSelectedSort}
        onFeatureFiltersChange={setFeatureFilters}
        onCreateListing={() => route('/listings/create')}
      />

      {loadError ? (
        <InfoAlert
          title="Listings could not be loaded"
          message={loadError}
          variant="error"
        />
      ) : null}

      {isLoading ? <ListingsSkeleton /> : null}

      {!isLoading ? (
        <ListingsResultsSummary
          visibleCount={sortedListings.length}
          totalCount={visibleListings.length}
          hasFilters={hasFilters}
          isLandlord={isLandlord}
          onClearFilters={clearFilters}
        />
      ) : null}

      {!isLoading && sortedListings.length > 0 ? (
        <div class="grid gap-4 md:grid-cols-2">
          {sortedListings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onEdit={(listingId) => route(`/listings/${listingId}/edit`)}
              onViewDetails={(listingId) => route(`/listings/${listingId}`)}
            />
          ))}
        </div>
      ) : null}

      {!isLoading && sortedListings.length === 0 ? (
        <ListingsEmptyState
          hasFilters={hasFilters}
          onClearFilters={clearFilters}
          onCreateListing={() => route('/listings/create')}
        />
      ) : null}
    </section>
  )
}