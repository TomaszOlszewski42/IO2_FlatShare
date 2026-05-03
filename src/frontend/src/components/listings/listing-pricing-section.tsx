import { CheckboxInput } from '../ui/checkbox-input'
import { DateInput } from '../ui/date-input'
import { NumberInput } from '../ui/number-input'
import { ListingFormSection } from './listing-form-section'

type ListingPricingSectionProps = {
  formData: {
    pricePerMonth: number
    areaSqm: number
    rooms: number
    bathrooms: number
    availableFrom: string
    furnished: boolean
    allowPets: boolean
    allowSmoking: boolean
  }
  errors: Partial<
    Record<
      | 'pricePerMonth'
      | 'areaSqm'
      | 'rooms'
      | 'bathrooms'
      | 'availableFrom'
      | 'furnished'
      | 'allowPets'
      | 'allowSmoking'
      ,
      string
    >
  >
  onUpdate: <K extends keyof ListingPricingSectionProps['formData']>(field: K, value: any) => void
}

export function ListingPricingSection({
  formData,
  errors,
  onUpdate,
}: ListingPricingSectionProps) {
  return (
    <ListingFormSection
      title="Price and details"
      description="Information about the price and characteristics of the apartment."
    >
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <NumberInput
          id="pricePerMonth"
          name="pricePerMonth"
          label="Price per month (PLN)"
          placeholder="3000"
          min={0}
          step={0.01}
          required
          value={formData.pricePerMonth || ''}
          error={errors.pricePerMonth}
          onInput={(e) => {
            const value = parseFloat((e.currentTarget as HTMLInputElement).value) || 0
            onUpdate('pricePerMonth', value)
          }}
        />

        <NumberInput
          id="areaSqm"
          name="areaSqm"
          label="Area (m²)"
          placeholder="50"
          min={0}
          step={0.01}
          required
          value={formData.areaSqm || ''}
          error={errors.areaSqm}
          onInput={(e) => {
            const value = parseFloat((e.currentTarget as HTMLInputElement).value) || 0
            onUpdate('areaSqm', value)
          }}
        />
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <NumberInput
          id="rooms"
          name="rooms"
          label="Number of rooms"
          min={1}
          step={1}
          required
          value={formData.rooms}
          error={errors.rooms}
          onInput={(e) => {
            const value = parseInt((e.currentTarget as HTMLInputElement).value) || 1
            onUpdate('rooms', value)
          }}
        />

        <NumberInput
          id="bathrooms"
          name="bathrooms"
          label="Number of bathrooms"
          min={1}
          step={1}
          required
          value={formData.bathrooms}
          error={errors.bathrooms}
          onInput={(e) => {
            const value = parseInt((e.currentTarget as HTMLInputElement).value) || 1
            onUpdate('bathrooms', value)
          }}
        />
      </div>

      <DateInput
        id="availableFrom"
        name="availableFrom"
        label="Available from"
        required
        value={formData.availableFrom}
        error={errors.availableFrom}
        onInput={(e) => {
          const value = (e.currentTarget as HTMLInputElement).value
          onUpdate('availableFrom', value)
        }}
      />

      <div class="divider" />

      <div class="space-y-3">
        <h3 class="font-semibold">Apartment features</h3>

        <div class="flex flex-col gap-3">
          <CheckboxInput
            id="furnished"
            name="furnished"
            label="Furnished"
            checked={formData.furnished}
            error={errors.furnished}
            onChange={(e) => {
              const value = (e.currentTarget as HTMLInputElement).checked
              onUpdate('furnished', value)
            }}
          />

          <CheckboxInput
            id="allowPets"
            name="allowPets"
            label="Pets allowed"
            checked={formData.allowPets}
            error={errors.allowPets}
            onChange={(e) => {
              const value = (e.currentTarget as HTMLInputElement).checked
              onUpdate('allowPets', value)
            }}
          />

          <CheckboxInput
            id="allowSmoking"
            name="allowSmoking"
            label="Smoking allowed"
            checked={formData.allowSmoking}
            error={errors.allowSmoking}
            onChange={(e) => {
              const value = (e.currentTarget as HTMLInputElement).checked
              onUpdate('allowSmoking', value)
            }}
          />
        </div>
      </div>
    </ListingFormSection>
  )
}