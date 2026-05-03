import { InfoAlert } from '../common/info-alert'
import { FormField } from '../ui/form-field'
import { ListingFormSection } from './listing-form-section'

type ListingPublicationSectionProps = {
  formData: {
    publicationStatus: 'draft' | 'active'
  }
  errors: Partial<Record<'publicationStatus', string>>
  onUpdate: <K extends keyof ListingPublicationSectionProps['formData']>(field: K, value: any) => void
}

export function ListingPublicationSection({
  formData,
  errors,
  onUpdate,
}: ListingPublicationSectionProps) {
  return (
    <ListingFormSection
      title="Publikacja"
      description="Decide if the listing will be available to tenants."
    >
      <FormField id="publicationStatus" label="Listing status" error={errors.publicationStatus}>
        <div class="flex flex-col gap-3">
          <label class="flex cursor-pointer items-center gap-3 rounded-lg border border-base-300 p-4 transition hover:bg-base-200">
            <input
              type="radio"
              name="publicationStatus"
              class="radio radio-primary"
              value="draft"
              checked={formData.publicationStatus === 'draft'}
              onChange={(e) => {
                const value = (e.currentTarget as HTMLInputElement).value as 'draft' | 'active'
                onUpdate('publicationStatus', value)
              }}
            />
            <div class="flex-1">
              <p class="font-semibold">Save as draft</p>
              <p class="text-sm text-base-content/70">
                The listing will not be visible to others. You can edit and publish it later.
              </p>
            </div>
          </label>

          <label class="flex cursor-pointer items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4 transition hover:bg-primary/10">
            <input
              type="radio"
              name="publicationStatus"
              class="radio radio-primary"
              value="active"
              checked={formData.publicationStatus === 'active'}
              onChange={(e) => {
                const value = (e.currentTarget as HTMLInputElement).value as 'draft' | 'active'
                onUpdate('publicationStatus', value)
              }}
            />
            <div class="flex-1">
              <p class="font-semibold">Opublikuj natychmiast</p>
              <p class="text-sm text-base-content/70">
                The listing will be available to tenants immediately after creation.
              </p>
            </div>
          </label>
        </div>
      </FormField>

      <InfoAlert>
        <span>
          You can always change the listing status later - publish a draft or hide an active listing.
        </span>
      </InfoAlert>
    </ListingFormSection>
  )
}