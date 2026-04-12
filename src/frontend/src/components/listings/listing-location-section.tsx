import { ListingSection } from './listing-section'
import { formatLocation } from '../../utils/format-location'
import type { ListingLocation } from '../../types/listing'

type ListingLocationSectionProps = {
  location: ListingLocation
}

export function ListingLocationSection({ location }: ListingLocationSectionProps) {
  const addressLine = formatLocation(location)

  return (
    <ListingSection title="Lokalizacja" className="[&_.card-body]:gap-4">
      <div class="space-y-1 text-sm">
        <p class="font-medium text-base-content">{[location.city, location.district].filter(Boolean).join(', ')}</p>
        <p class="text-base-content/70">{addressLine}</p>
      </div>
    </ListingSection>
  )
}
