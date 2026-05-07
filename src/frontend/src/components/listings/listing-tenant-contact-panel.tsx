import type { Listing } from '../../types/listing'
import { ListingMetaRow } from './listing-meta-row'
import { ListingSection } from './listing-section'

type ListingTenantContactPanelProps = {
  listing: Listing
}

export function ListingTenantContactPanel({ listing }: ListingTenantContactPanelProps) {
  const contactName = listing.contact || listing.ownerContact || 'Owner'
  const phone = listing.phone || listing.contactPhone || ''
  const email = listing.contactEmail || ''

  return (
    <ListingSection title="Interested in this offer?">
      <div class="space-y-4">
        <p class="text-sm leading-relaxed text-base-content/70">
          Contact the owner to ask about the room, arrange a visit or confirm current availability.
        </p>

        <div class="rounded-box border border-base-300/70 bg-base-100 px-4">
          <ListingMetaRow label="Contact person" value={contactName} />
          <ListingMetaRow label="Phone" value={phone || '-'} />
          <ListingMetaRow label="Email" value={email || '-'} />
        </div>

        <div class="flex flex-wrap gap-2">
          {phone ? (
            <a class="btn btn-primary btn-sm" href={`tel:${phone}`}>
              Call owner
            </a>
          ) : null}

          {email ? (
            <a class="btn btn-outline btn-sm" href={`mailto:${email}?subject=${encodeURIComponent(listing.title)}`}>
              Send email
            </a>
          ) : null}

          {!phone && !email ? (
            <p class="text-sm text-base-content/60">
              Contact details are not available for this listing yet.
            </p>
          ) : null}
        </div>
      </div>
    </ListingSection>
  )
}