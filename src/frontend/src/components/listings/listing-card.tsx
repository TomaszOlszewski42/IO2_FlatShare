import { formatArea } from '../../utils/format-area'
import { formatDate } from '../../utils/format-date'
import { formatLocation } from '../../utils/format-location'
import { formatPrice } from '../../utils/format-price'
import type { ListingStatus } from '../../utils/format-status-label'
import { AppButton } from '../ui/app-button'
import { ListingMetaRow } from './listing-meta-row'
import { ListingStatusBadge } from './listing-status-badge'

export type ListingCardItem = {
  listingId: string
  title: string
  status: ListingStatus
  price: number
  currency: string
  area: number
  rooms: number
  availableFrom: string
  location: {
    city: string
    district?: string
    street?: string
    buildingNumber?: string
    postalCode?: string
  }
  allowPets: boolean
  allowSmoking: boolean
  furnished: boolean
}

type ListingCardProps = {
  listing: ListingCardItem
  onEdit?: (listingId: string) => void
  onViewDetails?: (listingId: string) => void
}

export function ListingCard({ listing, onEdit, onViewDetails }: ListingCardProps) {
  const featureBadges = [
    { label: 'Umeblowane', value: listing.furnished },
    { label: 'Zwierzęta', value: listing.allowPets },
    { label: 'Palenie', value: listing.allowSmoking },
  ]

  return (
    <article class="card border border-base-300 bg-base-100 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div class="card-body gap-4">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="space-y-1">
            <h2 class="card-title text-lg leading-tight">{listing.title}</h2>
            <p class="text-sm text-base-content/65">{formatLocation(listing.location)}</p>
          </div>
          <ListingStatusBadge status={listing.status} />
        </div>

        <div class="rounded-box border border-base-300/70 bg-base-100 px-4">
          <ListingMetaRow label="Cena" value={`${formatPrice(listing.price)} / mies.`} icon={listing.currency} />
          <ListingMetaRow label="Powierzchnia" value={formatArea(listing.area)} icon="m2" />
          <ListingMetaRow label="Liczba pokoi" value={String(listing.rooms)} />
          <ListingMetaRow label="Dostępne od" value={formatDate(listing.availableFrom)} />
        </div>

        <div class="flex flex-wrap gap-2">
          {featureBadges.map((feature) => (
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

        <div class="card-actions justify-between">
          <AppButton variant="ghost" className="btn-sm" onClick={() => onEdit?.(listing.listingId)}>
            Edytuj
          </AppButton>
          <AppButton variant="outline" className="btn-sm" onClick={() => onViewDetails?.(listing.listingId)}>
            Szczegóły
          </AppButton>
        </div>
      </div>
    </article>
  )
}
