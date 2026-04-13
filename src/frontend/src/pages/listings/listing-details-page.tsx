import type { RoutableProps } from 'preact-router'
import { route } from 'preact-router'
import { useEffect, useState } from 'preact/hooks'

import { ListingDetailsHeader } from '../../components/listings/listing-details-header'
import { ListingDetailsSkeleton } from '../../components/listings/listing-details-skeleton'
import { ListingMetaRow } from '../../components/listings/listing-meta-row'
import { ListingLocationSection } from '../../components/listings/listing-location-section'
import { ListingSection } from '../../components/listings/listing-section'
import { readAuthSession } from '../../services/auth-session'
import { getListingById } from '../../services/listings-api'
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

  useEffect(() => {
    if (!listingId) {
      setIsLoading(false)
      setListing(null)
      return
    }

    const session = readAuthSession()

    if (!session) {
      route('/login')
      return
    }

    let isMounted = true

    setIsLoading(true)
    void getListingById(listingId, session.token, session.type)
      .then((item) => {
        if (isMounted) {
          setListing(item)
        }
      })
      .catch(() => {
        if (isMounted) {
          setListing(null)
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
      <section class="flex h-full w-full flex-col items-center justify-center gap-6 py-12">
        <div class="space-y-3 text-center">
          <div class="text-6xl">🔍</div>
          <h1 class="text-2xl font-bold">Ogłoszenie nie znalezione</h1>
          <p class="text-base-content/70">Przepraszamy, ale szukane przez Ciebie ogłoszenie nie istnieje lub zostało usunięte.</p>
        </div>
        <button class="btn btn-primary" onClick={() => route('/listings')}>Wróć do ogłoszeń</button>
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
    { label: 'Zwierzęta', value: Boolean(listing.allowPets) },
    { label: 'Palenie', value: Boolean(listing.allowSmoking) },
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
        <ListingSection title="Parametry">
          <div class="rounded-box border border-base-300/70 bg-base-100 px-4">
            {parameterRows.map((row) => (
              <ListingMetaRow key={row.label} label={row.label} value={row.value} icon={row.icon} />
            ))}
          </div>
        </ListingSection>

        <ListingSection title="Atrybuty">
          <div class="flex flex-wrap gap-2">
            {featureRows.map((feature) => (
              <span
                key={feature.label}
                class="badge badge-outline badge-sm gap-1.5 bg-base-100 text-base-content"
              >
                <span class={feature.value ? 'text-success' : 'text-error'} aria-hidden="true">
                  {feature.value ? '✓' : '✕'}
                </span>
                <span>{feature.label}</span>
              </span>
            ))}
          </div>
        </ListingSection>
      </div>

      <ListingLocationSection location={listing.location} />

      <ListingSection title="Kontakt i opis">
        <div class="space-y-3 text-sm leading-relaxed text-base-content/80">
          <p>{listing.description}</p>
          <div class="grid gap-2 md:grid-cols-2">
            <ListingMetaRow label="Kontakt" value={listing.contact || listing.ownerContact || '-'} />
            <ListingMetaRow label="Telefon" value={listing.phone || listing.contactPhone || '-'} />
            <ListingMetaRow label="Status" value={listing.status ? formatStatusLabel(listing.status) : '-'} />
          </div>
        </div>
      </ListingSection>
    </section>
  )
}
