import type { RoutableProps } from 'preact-router'
import { route } from 'preact-router'
import { useEffect, useState } from 'preact/hooks'

import { EmptyStateContent } from '../../components/common/empty-state-content'
import { ListingDetailsHeader } from '../../components/listings/listing-details-header'
import { ListingDetailsSkeleton } from '../../components/listings/listing-details-skeleton'
import { ListingFeatureBadges } from '../../components/listings/listing-feature-badges'
import { ListingGallery } from '../../components/listings/listing-gallery'
import { ListingMetaRow } from '../../components/listings/listing-meta-row'
import { ListingLocationSection } from '../../components/listings/listing-location-section'
import { ListingParametersSection } from '../../components/listings/listing-parameters-section'
import { ListingSection } from '../../components/listings/listing-section'
import { AppButton } from '../../components/ui/app-button'
import { ListingUserAttributesSection } from '../../components/listings/listing-user-attributes-section'
import { readAuthSession } from '../../services/auth-session'
import { getListingById, getListingPhotoIds } from '../../services/listings-api'
import type { Listing } from '../../types/listing'
import { formatArea } from '../../utils/format-area'
import { formatDate } from '../../utils/format-date'
import { formatPrice } from '../../utils/format-price'
import { formatStatusLabel } from '../../utils/format-status-label'

type ListingDetailsRouteProps = RoutableProps & {
  listingId?: string
}

export function ListingDetailsPage({ listingId }: ListingDetailsRouteProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [listing, setListing] = useState<Listing | null>(null)
  const [photoIds, setPhotoIds] = useState<string[]>([])

  useEffect(() => {
    if (!listingId) {
      setIsLoading(false)
      setListing(null)
      setPhotoIds([])
      return
    }

    const session = readAuthSession()

    if (!session) {
      route('/login')
      return
    }

    let isMounted = true

    setIsLoading(true)
    void Promise.all([
      getListingById(listingId, session.token, session.type),
      getListingPhotoIds(listingId, session.token, session.type),
    ])
      .then(([item, photos]) => {
        if (isMounted) {
          setListing(item)
          setPhotoIds(photos)
        }
      })
      .catch(() => {
        if (isMounted) {
          setListing(null)
          setPhotoIds([])
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
  }, [listingId])

  if (isLoading) {
    return <ListingDetailsSkeleton />
  }

  if (!listing) {
    return (
      <section class="flex h-full w-full flex-col items-center justify-center py-12">
        <EmptyStateContent
          icon="🔍"
          titleAs="h1"
          title="Ogłoszenie nie znalezione"
          description="Przepraszamy, ale szukane przez Ciebie ogłoszenie nie istnieje lub zostało usunięte."
        >
          <AppButton onClick={() => route('/listings')}>Wróć do ogłoszeń</AppButton>
        </EmptyStateContent>
      </section>
    )
  }

  const parameterRows = [
    { label: 'Cena', value: `${formatPrice(listing.price)} / mies.`, icon: listing.currency },
    { label: 'Powierzchnia', value: listing.area ? formatArea(listing.area) : '-', icon: 'm2' },
    { label: 'Dostępne od', value: listing.availableFrom ? formatDate(listing.availableFrom) : '-' },
    { label: 'Status publikacji', value: listing.status ? formatStatusLabel(listing.status) : '-' },
  ]

  const featureRows = [
    { label: 'Umeblowane', value: Boolean(listing.furnished) },
    { label: 'Zwierzęta w mieszkaniu', value: Boolean(listing.allowPets) },
    { label: 'Palenie w mieszkaniu', value: Boolean(listing.allowSmoking) },
  ]

  return (
    <section class="flex w-full flex-1 flex-col gap-5">
      <ListingDetailsHeader
        title={listing.title}
        onBack={() => route('/listings')}
        onEdit={() => route(`/listings/${listing.id}/edit`)}
        onArchive={() => {
          // Placeholder for API action.
        }}
      />

      <div class="grid gap-4 lg:grid-cols-2">
        <ListingParametersSection rows={parameterRows} />

        <ListingSection title="Atrybuty">
          <ListingFeatureBadges features={featureRows} />
        </ListingSection>
      </div>

      <ListingGallery listingId={listing.id} photoIds={photoIds} title={listing.title} />
      <ListingUserAttributesSection attributes={listing.attributes} />

      <ListingLocationSection location={listing.location} />

      <ListingSection title="Kontakt i opis">
        <div class="space-y-3 text-sm leading-relaxed text-base-content/80">
          <p>{listing.description}</p>
          <div class="grid gap-2 md:grid-cols-2">
            <ListingMetaRow label="Kontakt" value={listing.contact || listing.ownerContact || '-'} />
            <ListingMetaRow label="Telefon" value={listing.phone || listing.contactPhone || '-'} />
            <ListingMetaRow
              label="Status"
              value={listing.status ? formatStatusLabel(listing.status) : '-'}
            />
          </div>
        </div>
      </ListingSection>
    </section>
  )
}