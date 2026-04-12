import { TextInput } from '../ui/text-input'
import { FormField } from '../ui/form-field'
import type { JSX } from 'preact'

type ListingBasicInfoSectionProps = {
  formData: {
    title: string
    description: string
  }
  errors: Partial<Record<'title' | 'description', string>>
  onUpdate: <K extends 'title' | 'description'>(field: K, value: string) => void
}

export function ListingBasicInfoSection({ formData, errors, onUpdate }: ListingBasicInfoSectionProps) {
  return (
    <div class="space-y-6 card-body">
      <div>
        <h2 class="text-xl font-semibold">Informacje podstawowe</h2>
        <p class="text-sm text-base-content/65">Tytuł i opis ogłoszenia.</p>
      </div>

      <TextInput
        id="title"
        name="title"
        label="Tytuł ogłoszenia"
        placeholder="np. Przytulny pokój w centrum miasta"
        required
        value={formData.title}
        error={errors.title}
        onInput={(e) => {
          const target = e.currentTarget as HTMLInputElement
          onUpdate('title', target.value)
        }}
      />

      <FormField id="description" label="Opis ogłoszenia" error={errors.description}>
        <textarea
          id="description"
          name="description"
          class={`textarea w-full min-h-[150px] ${errors.description ? 'textarea-error' : ''}`}
          placeholder="Opisz szczegóły mieszkania, wyposażenie, cechy lokalizacji oraz zasady wynajmu..."
          required
          value={formData.description}
          onInput={(e) => {
            const target = e.currentTarget as HTMLTextAreaElement
            onUpdate('description', target.value)
          }}
        />
      </FormField>

      <div class="text-xs text-base-content/60">
        <p>💡 Wskazówka: Im szczegółowszy opis, tym więcej zainteresowanych potencjalnych najemców.</p>
      </div>
    </div>
  )
}
