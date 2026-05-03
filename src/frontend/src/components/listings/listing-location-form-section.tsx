import { InfoAlert } from '../common/info-alert'
import { TextInput } from '../ui/text-input'
import { ListingFormSection } from './listing-form-section'

type ListingLocationFormSectionProps = {
  formData: {
    city: string
    district?: string
    street?: string
    buildingNumber?: string
    postalCode?: string
  }
  errors: Partial<
    Record<'city' | 'district' | 'street' | 'buildingNumber' | 'postalCode', string>
  >
  onUpdate: <K extends keyof ListingLocationFormSectionProps['formData']>(
    field: K,
    value: string
  ) => void
}

export function ListingLocationFormSection({
  formData,
  errors,
  onUpdate,
}: ListingLocationFormSectionProps) {
  return (
    <ListingFormSection
      title="Location"
      description="Detailed address of the apartment."
    >
      <TextInput
        id="city"
        name="city"
        label="City/Gmina"
        placeholder="np. Warsaw"
        required
        value={formData.city}
        error={errors.city}
        onInput={(e) => {
          const target = e.currentTarget as HTMLInputElement
          onUpdate('city', target.value)
        }}
      />

      <TextInput
        id="district"
        name="district"
        label="District (optional)"
        placeholder="e.g. City Center"
        value={formData.district || ''}
        error={errors.district}
        onInput={(e) => {
          const target = e.currentTarget as HTMLInputElement
          onUpdate('district', target.value)
        }}
      />

      <TextInput
        id="street"
        name="street"
        label="Street (optional)"
        placeholder="e.g. Marszalkowska St."
        value={formData.street || ''}
        error={errors.street}
        onInput={(e) => {
          const target = e.currentTarget as HTMLInputElement
          onUpdate('street', target.value)
        }}
      />

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TextInput
          id="buildingNumber"
          name="buildingNumber"
          label="Building number (optional)"
          placeholder="np. 42"
          value={formData.buildingNumber || ''}
          error={errors.buildingNumber}
          onInput={(e) => {
            const target = e.currentTarget as HTMLInputElement
            onUpdate('buildingNumber', target.value)
          }}
        />

        <TextInput
          id="postalCode"
          name="postalCode"
          label="Postal code (optional)"
          placeholder="np. 00-001"
          value={formData.postalCode || ''}
          error={errors.postalCode}
          onInput={(e) => {
            const target = e.currentTarget as HTMLInputElement
            onUpdate('postalCode', target.value)
          }}
        />
      </div>

      <InfoAlert>
        <span>Provide as exact an address as possible. This helps potential tenants in their rental decision.</span>
      </InfoAlert>
    </ListingFormSection>
  )
}