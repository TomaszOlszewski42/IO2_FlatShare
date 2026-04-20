import type { ListingAttributes } from '../../types/listing'
import {
  formatPetsAllowedPresentation,
  formatPreferredTenantProfileLabel,
  formatSmokingRequirementPresentation,
} from '../../utils/listing-user-attributes'
import { ListingSection } from './listing-section'

type ListingUserAttributesSectionProps = {
  attributes?: ListingAttributes
}

export function ListingUserAttributesSection({ attributes }: ListingUserAttributesSectionProps) {
  const petsPresentation = formatPetsAllowedPresentation(attributes?.petsAllowed)
  const smokingPresentation = formatSmokingRequirementPresentation(attributes?.nonSmokingOnly)
  const preferredTenantProfile = formatPreferredTenantProfileLabel(attributes?.preferredTenantProfile)

  const hasAnyAttribute =
    typeof attributes?.petsAllowed === 'boolean' ||
    typeof attributes?.nonSmokingOnly === 'boolean' ||
    Boolean(preferredTenantProfile)

  return (
    <ListingSection title="Wymagania wobec lokatora">
      {!hasAnyAttribute ? (
        <div class="rounded-box border border-dashed border-base-300 bg-base-100 px-4 py-4 text-sm text-base-content/70">
          Właściciel nie określił jeszcze wymagań wobec lokatora.
        </div>
      ) : (
        <div class="rounded-box border border-base-300/70 bg-base-100 px-4">
          <div class="flex items-center justify-between border-b border-base-300/70 py-3 text-sm">
            <span class="text-base-content/70">Akceptowane zwierzęta</span>
            <span class={`font-medium ${petsPresentation.tone}`}>{petsPresentation.label}</span>
          </div>

          <div class="flex items-center justify-between border-b border-base-300/70 py-3 text-sm">
            <span class="text-base-content/70">Palenie</span>
            <span class={`font-medium ${smokingPresentation.tone}`}>{smokingPresentation.label}</span>
          </div>

          <div class="flex items-center justify-between py-3 text-sm">
            <span class="text-base-content/70">Preferowany profil lokatora</span>
            <span class="font-medium text-base-content">{preferredTenantProfile || 'Nie określono'}</span>
          </div>
        </div>
      )}
    </ListingSection>
  )
}