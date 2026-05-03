import { ListingSection } from './listing-section'
import { formatLocation } from '../../utils/format-location'
import type { ListingLocation } from '../../types/listing'

type ListingLocationSectionProps = {
  location: ListingLocation
}

export function ListingLocationSection({ location }: ListingLocationSectionProps) {
  const addressLine = formatLocation(location)
  const mapQuery = encodeURIComponent(addressLine)

  return (
    <ListingSection title="Location" className="[&_.card-body]:gap-4">
      <div class="grid gap-4 lg:grid-cols-[1fr,2fr]">
        <div class="space-y-1 text-sm">
          <p class="font-medium text-base-content">{[location.city, location.district].filter(Boolean).join(', ')}</p>
          <p class="text-base-content/70">{addressLine}</p>
        </div>
        <div class="overflow-hidden rounded-xl border border-base-300 shadow-sm">
          <iframe
            width="100%"
            height="300"
            style={{ border: 0, display: 'block' }}
            loading="lazy"
            allowFullScreen
            src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
          ></iframe>
        </div>
      </div>
    </ListingSection>
  )
}

