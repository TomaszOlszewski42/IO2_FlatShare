import { useState } from 'preact/hooks'
import type { JSX } from 'preact'

import { AppButton } from '../ui/app-button'
import { ListingFormShell } from './listing-form-shell'
import { ListingBasicInfoSection } from './listing-basic-info-section'
import { ListingPricingSection } from './listing-pricing-section'
import { ListingContactSection } from './listing-contact-section'
import { ListingPublicationSection } from './listing-publication-section'
import { TextInput } from '../ui/text-input'

export type ListingFormData = {
  title: string
  description: string
  pricePerMonth: number
  areaSqm: number
  rooms: number
  bathrooms: number
  availableFrom: string
  city: string
  district?: string
  street?: string
  buildingNumber?: string
  postalCode?: string
  contact: string
  phone?: string
  allowPets: boolean
  allowSmoking: boolean
  furnished: boolean
  publicationStatus: 'draft' | 'active'
}

type ListingCreateFormProps = {
  onSubmit: (data: ListingFormData) => Promise<void>
  isSubmitting?: boolean
}

const initialFormData: ListingFormData = {
  title: '',
  description: '',
  pricePerMonth: 0,
  areaSqm: 0,
  rooms: 1,
  bathrooms: 1,
  availableFrom: new Date().toISOString().split('T')[0],
  city: '',
  district: '',
  street: '',
  buildingNumber: '',
  postalCode: '',
  contact: '',
  phone: '',
  allowPets: false,
  allowSmoking: false,
  furnished: false,
  publicationStatus: 'draft',
}

export function ListingCreateForm({ onSubmit, isSubmitting = false }: ListingCreateFormProps) {
  const [formData, setFormData] = useState<ListingFormData>(initialFormData)
  const [errors, setErrors] = useState<Partial<Record<keyof ListingFormData, string>>>({})

  function updateField<K extends keyof ListingFormData>(field: K, value: ListingFormData[K]) {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    // Clear error for this field when user starts editing
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
          {isSubmitting ? 'Tworzenie...' : 'Utwórz ogłoszenie'}
        </AppButton>
        <AppButton type="button" variant="outline" disabled={isSubmitting} onClick={() => window.history.back()}>
          Anuluj
        </AppButton>
      </div>
    </form>
  )
}

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

      <div class="alert alert-info text-sm">
        <svg class="h-5 w-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <span>Podaj możliwie dokładny adres. Pomaga to potencjalnym najemcom w decyzji o wynajmie.</span>
        </div>
      </div>
    </div>
  )
}
