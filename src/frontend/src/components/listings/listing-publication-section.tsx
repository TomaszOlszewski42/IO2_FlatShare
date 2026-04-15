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
      description="Decyduj, czy ogłoszenie będzie dostępne dla lokatorów."
    >
      <FormField id="publicationStatus" label="Status ogłoszenia" error={errors.publicationStatus}>
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
              <p class="font-semibold">Zapisz jako szkic</p>
              <p class="text-sm text-base-content/70">
                Ogłoszenie nie będzie widoczne dla innych. Możesz go edytować i opublikować później.
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
                Ogłoszenie będzie dostępne dla lokatorów od razu po utworzeniu.
              </p>
            </div>
          </label>
        </div>
      </FormField>

      <InfoAlert>
        <span>
          Zawsze możesz zmienić status ogłoszenia później - opublikować szkic lub ukryć aktywne ogłoszenie.
        </span>
      </InfoAlert>
    </ListingFormSection>
  )
}