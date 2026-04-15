import { useState } from 'preact/hooks'
import type { JSX } from 'preact'

import { AppButton } from '../ui/app-button'
import { ListingFormShell } from './listing-form-shell'
import { ListingBasicInfoSection } from './listing-basic-info-section'
import { ListingPricingSection } from './listing-pricing-section'
import { ListingContactSection } from './listing-contact-section'
import { ListingPublicationSection } from './listing-publication-section'
import { ListingPhotoUpload } from './listing-photo-upload'
import { TextInput } from '../ui/text-input'
import type { ListingFormData } from './listing-create-form'

type ListingEditFormProps = {
  listingId: string
  initialData: ListingFormData
  onSubmit: (data: ListingFormData) => Promise<void>
  isSubmitting?: boolean
}

export function ListingEditForm({ listingId, initialData, onSubmit, isSubmitting = false }: ListingEditFormProps) {
  const [formData, setFormData] = useState<ListingFormData>(initialData)
  const [errors, setErrors] = useState<Partial<Record<keyof ListingFormData, string>>>({})

  function updateField<K extends keyof ListingFormData>(field: K, value: ListingFormData[K]) {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  function validateForm(): boolean {
    const newErrors: Partial<Record<keyof ListingFormData, string>> = {}

    if (!formData.title.trim()) newErrors.title = 'Tytuł jest wymagany'
    if (!formData.description.trim()) newErrors.description = 'Opis jest wymagany'
    if (formData.pricePerMonth <= 0) newErrors.pricePerMonth = 'Cena musi być większa niż 0'
    if (formData.areaSqm <= 0) newErrors.areaSqm = 'Powierzchnia musi być większa niż 0'
    if (formData.rooms < 1) newErrors.rooms = 'Co najmniej 1 pokój'
    if (formData.bathrooms < 1) newErrors.bathrooms = 'Co najmniej 1 łazienka'
    if (!formData.city.trim()) newErrors.city = 'Miasto/Gmina jest wymagane'
    if (!formData.contact.trim()) newErrors.contact = 'Dane kontaktowe są wymagane'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleSubmit(event: JSX.TargetedSubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    onSubmit(formData)
  }

  return (
    <div class="space-y-6">
      <form onSubmit={handleSubmit} class="space-y-6">
        <ListingFormShell>
          <ListingBasicInfoSection formData={formData} errors={errors} onUpdate={updateField} />

          <div class="my-4 border-t border-base-300" />

          <ListingPricingSection formData={formData} errors={errors} onUpdate={updateField} />

          <div class="my-4 border-t border-base-300" />

          <ListingLocationFormSection formData={formData} errors={errors} onUpdate={updateField} />

          <div class="my-4 border-t border-base-300" />

          <ListingContactSection formData={formData} errors={errors} onUpdate={updateField} />

          <div class="my-4 border-t border-base-300" />

          <ListingPublicationSection formData={formData} errors={errors} onUpdate={updateField} />
        </ListingFormShell>

        <div class="flex flex-wrap gap-3 pt-6">
          <AppButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Zapisywanie...' : 'Zapisz zmiany'}
          </AppButton>
          <AppButton type="button" variant="outline" disabled={isSubmitting} onClick={() => window.history.back()}>
            Anuluj
          </AppButton>
        </div>
      </form>

      <div class="my-8 border-t border-base-300" />

      <ListingFormShell>
        <ListingPhotoUpload listingId={listingId} />
      </ListingFormShell>
    </div>
  )
}

// Reusing this from ListingCreateForm as it was defined there locally
function ListingLocationFormSection({ formData, errors, onUpdate }: any) {
  return (
    <div class="space-y-6 card-body">
      <div>
        <h2 class="text-xl font-semibold">Lokalizacja</h2>
        <p class="text-sm text-base-content/65">Szczegółowy adres mieszkania.</p>
      </div>

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
    </div>
  )
}
