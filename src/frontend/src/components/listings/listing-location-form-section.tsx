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
      title="Lokalizacja"
      description="Szczegółowy adres mieszkania."
    >
      <TextInput
        id="city"
        name="city"
        label="Miasto/Gmina"
        placeholder="np. Warszawa"
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
        label="Dzielnica (opcjonalnie)"
        placeholder="np. Śródmieście"
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
        label="Ulica (opcjonalnie)"
        placeholder="np. ul. Marszałkowska"
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
          label="Numer budynku (opcjonalnie)"
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
          label="Kod pocztowy (opcjonalnie)"
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
        <span>Podaj możliwie dokładny adres. Pomaga to potencjalnym najemcom w decyzji o wynajmie.</span>
      </InfoAlert>
    </ListingFormSection>
  )
}