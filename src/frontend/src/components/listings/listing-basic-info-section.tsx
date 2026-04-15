import { ListingFormSection } from './listing-form-section'
import { TextInput } from '../ui/text-input'
import { TextArea } from '../ui/text-area'

type ListingBasicInfoSectionProps = {
  formData: {
    title: string
    description: string
  }
  errors: Partial<Record<'title' | 'description', string>>
  onUpdate: <K extends 'title' | 'description'>(field: K, value: string) => void
}

export function ListingBasicInfoSection({
  formData,
  errors,
  onUpdate,
}: ListingBasicInfoSectionProps) {
  return (
    <ListingFormSection
      title="Informacje podstawowe"
      description="Tytuł i opis ogłoszenia."
    >
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

      <TextArea
        id="description"
        name="description"
        label="Opis ogłoszenia"
        placeholder="Opisz szczegóły mieszkania, wyposażenie, cechy lokalizacji oraz zasady wynajmu..."
        rows={6}
        required
        value={formData.description}
        error={errors.description}
        onInput={(e) => {
          const target = e.currentTarget as HTMLTextAreaElement
          onUpdate('description', target.value)
        }}
      />

      <div class="text-xs text-base-content/60">
        <p> Wskazówka: Im szczegółowszy opis, tym więcej zainteresowanych potencjalnych najemców.</p>
      </div>
    </ListingFormSection>
  )
}