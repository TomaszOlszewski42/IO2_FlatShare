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
      title="Basic information"
      description="Title and description of the listing."
    >
      <TextInput
        id="title"
        name="title"
        label="Listing title"
        placeholder="e.g. Cozy room in the city center"
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
        label="Listing description"
        placeholder="Describe the details of the apartment, equipment, location features, and rental rules..."
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
        <p> Tip: The more detailed the description, the more interested potential tenants.</p>
      </div>
    </ListingFormSection>
  )
}