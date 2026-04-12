import { TextInput } from '../ui/text-input'
import { FormField } from '../ui/form-field'
import type { JSX } from 'preact'

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
      | 'allowSmoking',
      string
    >
  >
  onUpdate: <K extends keyof ListingPricingSectionProps['formData']>(field: K, value: any) => void
}

export function ListingPricingSection({ formData, errors, onUpdate }: ListingPricingSectionProps) {
  return (
    <div class="space-y-6 card-body">
      <div>
        <h2 class="text-xl font-semibold">Cena i szczegóły</h2>
        <p class="text-sm text-base-content/65">Informacje o cenie i charakterystyce mieszkania.</p>
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TextInput
          id="pricePerMonth"
          name="pricePerMonth"
          label="Cena za miesiąc (PLN)"
          type="text"
          placeholder="3000"
          required
          value={String(formData.pricePerMonth) || ''}
          error={errors.pricePerMonth}
          onInput={(e) => {
            const value = parseFloat((e.currentTarget as HTMLInputElement).value) || 0
            onUpdate('pricePerMonth', value)
          }}
        />

        <TextInput
          id="areaSqm"
          name="areaSqm"
          label="Powierzchnia (m²)"
          type="text"
          placeholder="50"
          required
          value={String(formData.areaSqm) || ''}
          error={errors.areaSqm}
          onInput={(e) => {
            const value = parseFloat((e.currentTarget as HTMLInputElement).value) || 0
            onUpdate('areaSqm', value)
          }}
        />
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField id="rooms" label="Liczba pokoi" error={errors.rooms}>
          <input
            id="rooms"
            name="rooms"
            class={`input w-full ${errors.rooms ? 'input-error' : 'input-bordered'}`}
            type="number"
            min="1"
            required
            value={formData.rooms}
            onInput={(e) => {
              const value = parseInt((e.currentTarget as HTMLInputElement).value) || 1
              onUpdate('rooms', value)
            }}
          />
        </FormField>

        <FormField id="bathrooms" label="Liczba łazienek" error={errors.bathrooms}>
          <input
            id="bathrooms"
            name="bathrooms"
            class={`input w-full ${errors.bathrooms ? 'input-error' : 'input-bordered'}`}
            type="number"
            min="1"
            required
            value={formData.bathrooms}
            onInput={(e) => {
              const value = parseInt((e.currentTarget as HTMLInputElement).value) || 1
              onUpdate('bathrooms', value)
            }}
          />
        </FormField>
      </div>

      <FormField id="availableFrom" label="Dostępne od" error={errors.availableFrom}>
        <input
          id="availableFrom"
          name="availableFrom"
          class={`input w-full ${errors.availableFrom ? 'input-error' : 'input-bordered'}`}
          type="date"
          required
          value={formData.availableFrom}
          onInput={(e) => {
            const value = (e.currentTarget as HTMLInputElement).value
            onUpdate('availableFrom', value)
          }}
        />
      </FormField>

      <div class="divider" />

      <div class="space-y-3">
        <h3 class="font-semibold">Cechy mieszkania</h3>

        <div class="flex flex-col gap-3">
          <label class="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              class="checkbox checkbox-primary"
              checked={formData.furnished}
              onChange={(e) => {
                const value = (e.currentTarget as HTMLInputElement).checked
                onUpdate('furnished', value)
              }}
            />
            <span>Umeblowane</span>
          </label>

          <label class="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              class="checkbox checkbox-primary"
              checked={formData.allowPets}
              onChange={(e) => {
                const value = (e.currentTarget as HTMLInputElement).checked
                onUpdate('allowPets', value)
              }}
            />
            <span>Zwierzęta dozwolone</span>
          </label>

          <label class="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              class="checkbox checkbox-primary"
              checked={formData.allowSmoking}
              onChange={(e) => {
                const value = (e.currentTarget as HTMLInputElement).checked
                onUpdate('allowSmoking', value)
              }}
            />
            <span>Palenie dozwolone</span>
          </label>
        </div>
      </div>
    </div>
  )
}
