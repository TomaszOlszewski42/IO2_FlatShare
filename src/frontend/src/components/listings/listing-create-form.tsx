import { Fragment } from 'preact'
import { useState } from 'preact/hooks'
import type { JSX } from 'preact'

import { AppButton } from '../ui/app-button'
import { ListingBasicInfoSection } from './listing-basic-info-section'
import { ListingContactSection } from './listing-contact-section'
import { ListingFormShell } from './listing-form-shell'
import { ListingLocationFormSection } from './listing-location-form-section'
import { ListingPricingSection } from './listing-pricing-section'
import { ListingPublicationSection } from './listing-publication-section'
import { ListingTenantRequirementsSection } from './listing-tenant-requirements-section'

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
  petsAllowed: boolean
  nonSmokingOnly: boolean
  preferredTenantProfile: string
  publicationStatus: 'draft' | 'active'
}

type ListingCreateFormProps = {
  initialValues?: Partial<ListingFormData>
  onSubmit: (data: ListingFormData) => Promise<void>
  onChange?: (data: ListingFormData) => void
  isSubmitting?: boolean
}

export function createInitialListingFormData(): ListingFormData {
  return {
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
    petsAllowed: false,
    nonSmokingOnly: false,
    preferredTenantProfile: '',
    publicationStatus: 'draft',
  }
}

function mergeWithInitialValues(initialValues?: Partial<ListingFormData>): ListingFormData {
  return {
    ...createInitialListingFormData(),
    ...(initialValues || {}),
  }
}

export function ListingCreateForm({
  initialValues,
  onSubmit,
  onChange,
  isSubmitting = false,
}: ListingCreateFormProps) {
  const [formData, setFormData] = useState<ListingFormData>(() => mergeWithInitialValues(initialValues))
  const [errors, setErrors] = useState<Partial<Record<keyof ListingFormData, string>>>({})

  function updateField<K extends keyof ListingFormData>(field: K, value: ListingFormData[K]) {
    setFormData((prev) => {
      const nextFormData = {
        ...prev,
        [field]: value,
      }

      onChange?.(nextFormData)
      return nextFormData
    })

    if (errors[field]) {
      setErrors((prev) => {
        const nextErrors = { ...prev }
        delete nextErrors[field]
        return nextErrors
      })
    }
  }

  function handleTenantRequirementsUpdate(field: 'petsAllowed' | 'nonSmokingOnly', value: boolean): void
  function handleTenantRequirementsUpdate(field: 'preferredTenantProfile', value: string): void
  function handleTenantRequirementsUpdate(
    field: 'petsAllowed' | 'nonSmokingOnly' | 'preferredTenantProfile',
    value: boolean | string,
  ) {
    if (field === 'preferredTenantProfile') {
      updateField('preferredTenantProfile', value as string)
      return
    }

    if (field === 'petsAllowed') {
      updateField('petsAllowed', value as boolean)
      return
    }

    updateField('nonSmokingOnly', value as boolean)
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

    void onSubmit(formData)
  }

  const sections = [
    <ListingBasicInfoSection formData={formData} errors={errors} onUpdate={updateField} />,
    <ListingPricingSection formData={formData} errors={errors} onUpdate={updateField} />,
    <ListingLocationFormSection formData={formData} errors={errors} onUpdate={updateField} />,
    <ListingContactSection formData={formData} errors={errors} onUpdate={updateField} />,
    <ListingTenantRequirementsSection
      formData={{
        petsAllowed: formData.petsAllowed,
        nonSmokingOnly: formData.nonSmokingOnly,
        preferredTenantProfile: formData.preferredTenantProfile,
      }}
      errors={{
        petsAllowed: errors.petsAllowed,
        nonSmokingOnly: errors.nonSmokingOnly,
        preferredTenantProfile: errors.preferredTenantProfile,
      }}
      disabled={isSubmitting}
      onUpdate={handleTenantRequirementsUpdate}
    />,
    <ListingPublicationSection formData={formData} errors={errors} onUpdate={updateField} />,
  ]

  return (
    <form onSubmit={handleSubmit} class="space-y-6">
      <ListingFormShell>
        {sections.map((section, index) => (
          <Fragment key={index}>
            {index > 0 ? <div class="my-4 border-t border-base-300" /> : null}
            {section}
          </Fragment>
        ))}
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