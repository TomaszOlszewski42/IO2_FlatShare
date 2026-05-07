import { useAuth } from '../../hooks/use-auth'
import type { Listing } from '../../types/listing'
import { formatArea } from '../../utils/format-area'
import { formatDate } from '../../utils/format-date'
import { formatLocation } from '../../utils/format-location'
import { formatPrice } from '../../utils/format-price'
import { AppButton } from '../ui/app-button'
import { ListingCardPhoto } from './listing-card-photo'
import { ListingFeatureBadges } from './listing-feature-badges'
import { ListingStatusBadge } from './listing-status-badge'
import { ListingUserAttributesBadges } from './listing-user-attributes-badges'

type ListingCardProps = {
  listing: Listing
  onEdit?: (listingId: string) => void
  onViewDetails?: (listingId: string) => void
}

function formatRooms(value?: number | null): string {
  if (!value) {
    return 'Rooms not specified'
  }

  return value === 1 ? '1 room' : `${value} rooms`
}

function formatBathrooms(value?: number | null): string {
  if (!value) {
    return 'Bathrooms not specified'
  }

  return value === 1 ? '1 bathroom' : `${value} bathrooms`
}

function formatAvailability(listing: Listing): string {
  if (listing.availableFrom) {
    return `Available from ${formatDate(listing.availableFrom)}`
  }

  if (listing.availableSince) {
    return `Available since ${formatDate(listing.availableSince)}`
  }

  return 'Availability not specified'
}

function formatDescription(description: string): string {
  const trimmed = description.trim()

  if (trimmed.length <= 140) {
    return trimmed
  }

  return `${trimmed.slice(0, 140)}...`
}

export function ListingCard({ listing, onEdit, onViewDetails }: ListingCardProps) {
  const { session, isLandlord } = useAuth()
  const isOwner = session?.userId === listing.ownerId
  const canEdit = isLandlord && isOwner
  const shouldShowStatus = isLandlord && Boolean(listing.status)

  const featureBadges = [
    { label: 'Furnished', value: Boolean(listing.furnished) },
    { label: 'Pets', value: Boolean(listing.allowPets) },
    { label: 'Smoking', value: Boolean(listing.allowSmoking) },
  ]

  return (
    <article class="card h-full overflow-hidden border border-base-300 bg-base-100 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <ListingCardPhoto listingId={listing.id} title={listing.title} />

      <div class="card-body gap-4">
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0 space-y-1">
            <h2 class="card-title text-lg leading-tight">{listing.title}</h2>
            <p class="text-sm text-base-content/65">{formatLocation(listing.location)}</p>
          </div>

          <div class="flex shrink-0 flex-col items-end gap-2 text-right">
            <span class="text-lg font-semibold text-primary">{formatPrice(listing.price)}</span>
            <span class="text-xs text-base-content/60">per month</span>
            {shouldShowStatus && listing.status ? <ListingStatusBadge status={listing.status} /> : null}
          </div>
        </div>

        <p class="min-h-10 text-sm leading-relaxed text-base-content/70">
          {formatDescription(listing.description)}
        </p>

        <div class="grid gap-2 text-sm sm:grid-cols-2">
          <div class="rounded-box border border-base-300/70 bg-base-200/40 px-3 py-2">
            <span class="block text-xs text-base-content/55">Area</span>
            <span class="font-medium">{listing.area ? formatArea(listing.area) : 'Not specified'}</span>
          </div>

          <div class="rounded-box border border-base-300/70 bg-base-200/40 px-3 py-2">
            <span class="block text-xs text-base-content/55">Rooms</span>
            <span class="font-medium">{formatRooms(listing.rooms)}</span>
          </div>

          <div class="rounded-box border border-base-300/70 bg-base-200/40 px-3 py-2">
            <span class="block text-xs text-base-content/55">Bathrooms</span>
            <span class="font-medium">{formatBathrooms(listing.bathrooms)}</span>
          </div>

          <div class="rounded-box border border-base-300/70 bg-base-200/40 px-3 py-2">
            <span class="block text-xs text-base-content/55">Availability</span>
            <span class="font-medium">{formatAvailability(listing)}</span>
          </div>
        </div>

        <div class="space-y-2">
          <ListingFeatureBadges features={featureBadges} />
          <ListingUserAttributesBadges attributes={listing.attributes} />
        </div>

        <div class="card-actions mt-auto justify-end gap-2">
          {canEdit ? (
            <AppButton variant="ghost" className="btn-sm" onClick={() => onEdit?.(listing.id)}>
              Edit
            </AppButton>
          ) : null}

          <AppButton variant="outline" className="btn-sm" onClick={() => onViewDetails?.(listing.id)}>
            {isLandlord ? 'Details' : 'View offer'}
          </AppButton>
        </div>
      </div>
    </article>
  )
}