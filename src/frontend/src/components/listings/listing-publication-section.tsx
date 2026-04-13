import { FormField } from '../ui/form-field'

type ListingPublicationSectionProps = {
  formData: {
    publicationStatus: 'draft' | 'active'
  }
  errors: Partial<Record<'publicationStatus', string>>
  onUpdate: <K extends keyof ListingPublicationSectionProps['formData']>(field: K, value: any) => void
}

export function ListingPublicationSection({ formData, errors, onUpdate }: ListingPublicationSectionProps) {
  return (
    <div class="space-y-6 card-body">
      <div>
        <h2 class="text-xl font-semibold">Publikacja</h2>
        <p class="text-sm text-base-content/65">Decyduj, czy ogłoszenie będzie dostępne dla lokatorów.</p>
      </div>

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
              <p class="text-sm text-base-content/70">Ogłoszenie nie będzie widoczne dla innych. Możesz go edytować i opublikować później.</p>
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
              <p class="text-sm text-base-content/70">Ogłoszenie będzie dostępne dla lokatorów od razu po utworzeniu.</p>
            </div>
          </label>
        </div>
      </FormField>

      <div class="alert alert-info text-sm">
        <svg class="h-5 w-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <span>Zawsze możesz zmienić status ogłoszenia później – opublikować szkic lub ukryć aktywne ogłoszenie.</span>
        </div>
      </div>
    </div>
  )
}
