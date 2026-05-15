import type { RoutableProps } from 'preact-router'
import { route } from 'preact-router'
import { useEffect, useMemo, useRef, useState } from 'preact/hooks'

import { InfoAlert } from '../../components/common/info-alert'
import { ListingCard } from '../../components/listings/listing-card'
import { ListingsEmptyState } from '../../components/listings/listings-empty-state'
import { ListingsPagination } from '../../components/listings/listings-pagination'
import { ListingsResultsSummary } from '../../components/listings/listings-results-summary'
import { ListingsSkeleton } from '../../components/listings/listings-skeleton'
import { ListingsToolbar } from '../../components/listings/listings-toolbar'
import { useAuth } from '../../hooks/use-auth'
import { getListings } from '../../services/listings-api'
import type { Listing } from '../../types/listing'
import type { ListingStatus } from '../../types/listing-status'
import { formatLocation } from '../../utils/format-location'
import { getPageFromSearch, withPageInSearch } from '../../utils/page-query'
import { getPaginatedItems } from '../../utils/pagination'

type ListingFilterValue = ListingStatus | 'ALL'
type PriceFilterValue = number | ''
type ListingSortValue = 'NEWEST' | 'PRICE_ASC' | 'PRICE_DESC'

type TenantFeatureFilters = {
  petsAllowed: boolean
  furnished: boolean
  nonSmoking: boolean
}

const LISTINGS_PER_PAGE = 6

const emptyFeatureFilters: TenantFeatureFilters = {
  petsAllowed: false,
  furnished: false,
  nonSmoking: false,
}

function getInitialPage(): number {
  if (typeof window === 'undefined') {
    return 1
  }

  return getPageFromSearch(window.location.search)
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

function isHiddenByModeration(listing: Listing): boolean {
  return listing.status === 'HIDDEN_BY_MODERATION'
}

function isHiddenFromListingsTab(listing: Listing): boolean {
  return (
    listing.status === 'HIDDEN' ||
    listing.status === 'ARCHIVED' ||
    listing.status === 'HIDDEN_BY_MODERATION'
  )
}

function isActiveListing(listing: Listing): boolean {
  return !listing.status || listing.status === 'ACTIVE'
}

function shouldShowListingInListingsTab(listing: Listing, isLandlord: boolean): boolean {
  if (isHiddenByModeration(listing)) {
    return false
  }

  if (isLandlord) {
    return true
  }

  return !isHiddenFromListingsTab(listing)
}

function getReadableListingsError(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message.trim()
  }

  return 'Failed to load listings.'
}

export function ListingsPage(_: RoutableProps) {
  const { session, isLandlord } = useAuth()
  const resultsTopRef = useRef<HTMLDivElement>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [listings, setListings] = useState<Listing[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<ListingFilterValue>('ALL')
  const [priceMin, setPriceMin] = useState<PriceFilterValue>('')
  const [priceMax, setPriceMax] = useState<PriceFilterValue>('')
  const [selectedSort, setSelectedSort] = useState<ListingSortValue>('NEWEST')
  const [featureFilters, setFeatureFilters] = useState<TenantFeatureFilters>(emptyFeatureFilters)
  const [currentPage, setCurrentPage] = useState(getInitialPage)

  useEffect(() => {
    if (!session) {
      return
    }

    let isMounted = true

    setIsLoading(true)
    setLoadError(null)

    const queryParams = isLandlord ? { ownerId: session.userId } : undefined

    void getListings(session.token, queryParams, session.type)
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
  }, [session, isLandlord])

  useEffect(() => {
    if (!isLandlord) {
      setSelectedStatus('ALL')
    }
  }, [isLandlord])

  useEffect(() => {
    setCurrentPage(1)
  }, [query, selectedStatus, priceMin, priceMax, selectedSort, featureFilters])

  const visibleListings = useMemo(() => {
    return listings.filter((listing) => shouldShowListingInListingsTab(listing, isLandlord))
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

  const pagination = useMemo(
    () => getPaginatedItems(sortedListings, currentPage, LISTINGS_PER_PAGE),
    [currentPage, sortedListings],
  )

  useEffect(() => {
    if (isLoading) {
      return
    }

    if (currentPage !== pagination.currentPage) {
      setCurrentPage(pagination.currentPage)
    }
  }, [currentPage, isLoading, pagination.currentPage])

  useEffect(() => {
    if (isLoading || typeof window === 'undefined') {
      return
    }

    const nextSearch = withPageInSearch(window.location.search, pagination.currentPage)
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`
    const nextUrl = `${window.location.pathname}${nextSearch}${window.location.hash}`

    if (currentUrl !== nextUrl) {
      window.history.replaceState(window.history.state, '', nextUrl)
    }
  }, [isLoading, pagination.currentPage])

  const hasFeatureFilters = Object.values(featureFilters).some(Boolean)

  const hasFilters =
    query.trim().length > 0 ||
    priceMin !== '' ||
    priceMax !== '' ||
    selectedSort !== 'NEWEST' ||
    hasFeatureFilters ||
    (isLandlord && selectedStatus !== 'ALL')

  const activeCount = visibleListings.filter(isActiveListing).length

  const scrollToResultsTop = () => {
    if (!resultsTopRef.current) {
      return
    }

    resultsTopRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)

    if (page !== pagination.currentPage) {
      window.requestAnimationFrame(scrollToResultsTop)
    }
  }

  const clearFilters = () => {
    setQuery('')
    setSelectedStatus('ALL')
    setPriceMin('')
    setPriceMax('')
    setSelectedSort('NEWEST')
    setFeatureFilters(emptyFeatureFilters)
    setCurrentPage(1)
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

      <div ref={resultsTopRef} />

      {!isLoading ? (
        <ListingsResultsSummary
          visibleCount={sortedListings.length}
          totalCount={visibleListings.length}
          hasFilters={hasFilters}
          isLandlord={isLandlord}
          pageStart={pagination.pageStart}
          pageEnd={pagination.pageEnd}
          onClearFilters={clearFilters}
        />
      ) : null}

      {!isLoading && sortedListings.length > 0 ? (
        <div class="grid gap-4 md:grid-cols-2">
          {pagination.items.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onEdit={(listingId) => route(`/listings/${listingId}/edit`)}
              onViewDetails={(listingId) => route(`/listings/${listingId}`)}
            />
          ))}
        </div>
      ) : null}

      {!isLoading && sortedListings.length > 0 ? (
        <ListingsPagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
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