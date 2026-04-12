import { formatArea } from '../../utils/format-area'
import { formatDate } from '../../utils/format-date'
import { formatLocation } from '../../utils/format-location'
import { formatPrice } from '../../utils/format-price'
import type { Listing } from '../../types/listing'
import { AppButton } from '../ui/app-button'
import { ListingMetaRow } from './listing-meta-row'
import { ListingStatusBadge } from './listing-status-badge'

type ListingCardProps = {
  listing: Listing
  onEdit?: (listingId: string) => void
  onViewDetails?: (listingId: string) => void
}

export function ListingCard({ listing, onEdit, onViewDetails }: ListingCardProps) {
  const featureBadges = [
    { label: 'Umeblowane', value: Boolean(listing.furnished) },
    { label: 'Zwierzęta', value: Boolean(listing.allowPets) },
    { label: 'Palenie', value: Boolean(listing.allowSmoking) },
  ]

  return (
    <article class="card border border-base-300 bg-base-100 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div class="card-body gap-4">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="space-y-1">
            <h2 class="card-title text-lg leading-tight">{listing.title}</h2>
            <p class="text-sm text-base-content/65">{formatLocation(listing.location)}</p>
          </div>
          {listing.status ? <ListingStatusBadge status={listing.status} /> : null}
        </div>

        <div class="rounded-box border border-base-300/70 bg-base-100 px-4">
          <ListingMetaRow label="Cena" value={`${formatPrice(listing.price)} / mies.`} icon={listing.currency} />
          <ListingMetaRow label="Powierzchnia" value={listing.area ? formatArea(listing.area) : '-'} icon="m2" />
          <ListingMetaRow label="Liczba pokoi" value={listing.rooms ? String(listing.rooms) : '-'} />
          <ListingMetaRow label="Dostępne od" value={listing.availableFrom ? formatDate(listing.availableFrom) : '-'} />
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
          <AppButton variant="ghost" className="btn-sm" onClick={() => onEdit?.(listing.id)}>
            Edytuj
          </AppButton>
          <AppButton variant="outline" className="btn-sm" onClick={() => onViewDetails?.(listing.id)}>
            Szczegóły
          </AppButton>
        </div>
      </div>
    </article>
  )
}
