import { Fragment } from 'preact'
import type { JSX } from 'preact'
import { useEffect, useState } from 'preact/hooks'

import { AppButton } from '../ui/app-button'
import { ListingBasicInfoSection } from './listing-basic-info-section'
import { ListingContactSection } from './listing-contact-section'
import { ListingFormShell } from './listing-form-shell'
import { ListingLocationFormSection } from './listing-location-form-section'
import { ListingPhotoUpload } from './listing-photo-upload'
import { ListingPricingSection } from './listing-pricing-section'
import { ListingPublicationSection } from './listing-publication-section'
import { ListingTenantRequirementsSection } from './listing-tenant-requirements-section'
import type { FormFieldErrors } from '../../services/form-error-mapper'
import type { ListingFormData } from './listing-create-form'

type ListingEditFormProps = {
  listingId: string
  initialData: ListingFormData
  onSubmit: (data: ListingFormData) => Promise<void>
  isSubmitting?: boolean
  fieldErrors?: FormFieldErrors
}

type ListingFormErrors = Partial<Record<keyof ListingFormData, string>>

const EMPTY_FIELD_ERRORS: FormFieldErrors = {}

const FIELD_NAME_ALIASES: Record<keyof ListingFormData, string[]> = {
  title: ['title'],
  description: ['description'],
  pricePerMonth: ['price', 'pricePerMonth'],
  areaSqm: ['area', 'areaSqm'],
  rooms: ['rooms'],
  bathrooms: ['bathrooms'],
  availableFrom: ['availableFrom', 'availableSince'],
  city: ['location.city', 'city'],
  district: ['location.district', 'district'],
  street: ['location.street', 'street'],
  buildingNumber: ['location.aptNumber', 'location.buildingNumber', 'aptNumber', 'buildingNumber'],
  postalCode: ['location.postalCode', 'postalCode'],
  contact: ['ownerContact', 'contact'],
  phone: ['phone', 'contactPhone'],
  allowPets: ['allowPets'],
  allowSmoking: ['allowSmoking'],
  furnished: ['furnished'],
  petsAllowed: ['attributes.petsAllowed', 'petsAllowed'],
  nonSmokingOnly: ['attributes.nonSmokingOnly', 'nonSmokingOnly'],
  preferredTenantProfile: [
    'attributes.profile',
    'attributes.preferredTenantProfile',
    'profile',
    'preferredTenantProfile',
  ],
  publicationStatus: ['publicationStatus', 'status'],
}

function normalizeFieldName(fieldName: string): string {
  return fieldName
    .replace(/^\$\./, '')
    .replace(/\[\d+\]/g, '')
    .trim()
    .toLowerCase()
}

function getLastFieldSegment(fieldName: string): string {
  const normalizedFieldName = normalizeFieldName(fieldName)
  const segments = normalizedFieldName.split('.')

  return segments[segments.length - 1] ?? normalizedFieldName
}

function isSameFieldName(serverFieldName: string, alias: string): boolean {
  const normalizedServerFieldName = normalizeFieldName(serverFieldName)
  const normalizedAlias = normalizeFieldName(alias)

  return (
    normalizedServerFieldName === normalizedAlias ||
    getLastFieldSegment(normalizedServerFieldName) === getLastFieldSegment(normalizedAlias)
  )
}

function uniqueMessages(messages: string[]): string[] {
  return Array.from(new Set(messages.filter((message) => message.trim().length > 0)))
}

function getExternalFieldErrors(
  fieldErrors: FormFieldErrors,
  fieldName: keyof ListingFormData,
  hiddenExternalFields: Set<keyof ListingFormData>,
): string[] {
  if (hiddenExternalFields.has(fieldName)) {
    return []
  }

  const aliases = FIELD_NAME_ALIASES[fieldName]
  const messages: string[] = []

  for (const [serverFieldName, serverMessages] of Object.entries(fieldErrors)) {
    if (aliases.some((alias) => isSameFieldName(serverFieldName, alias))) {
      messages.push(...serverMessages)
    }
  }

  return uniqueMessages(messages)
}

function isKnownFieldError(serverFieldName: string): boolean {
  return Object.values(FIELD_NAME_ALIASES).some((aliases) =>
    aliases.some((alias) => isSameFieldName(serverFieldName, alias)),
  )
}

function getUnboundFieldErrors(fieldErrors: FormFieldErrors): string[] {
  const messages: string[] = []

  for (const [serverFieldName, serverMessages] of Object.entries(fieldErrors)) {
    const normalizedFieldName = normalizeFieldName(serverFieldName)

    if (normalizedFieldName === 'general') {
      messages.push(...serverMessages)
      continue
    }

    if (!isKnownFieldError(serverFieldName)) {
      messages.push(...serverMessages)
    }
  }

  return uniqueMessages(messages)
}

function joinFieldErrors(messages: string[]): string | undefined {
  const unique = uniqueMessages(messages)

  return unique.length > 0 ? unique.join(' ') : undefined
}

export function ListingEditForm({
  listingId,
  initialData,
  onSubmit,
  isSubmitting = false,
  fieldErrors = EMPTY_FIELD_ERRORS,
}: ListingEditFormProps) {
  const [formData, setFormData] = useState<ListingFormData>(initialData)
  const [errors, setErrors] = useState<ListingFormErrors>({})
  const [hiddenExternalFields, setHiddenExternalFields] = useState<Set<keyof ListingFormData>>(() => new Set())

  useEffect(() => {
    setFormData(initialData)
    setErrors({})
    setHiddenExternalFields(new Set())
  }, [initialData])

  useEffect(() => {
    setHiddenExternalFields(new Set())
  }, [fieldErrors])

  function getInputError(field: keyof ListingFormData): string | undefined {
    return joinFieldErrors([
      ...getExternalFieldErrors(fieldErrors, field, hiddenExternalFields),
      ...(errors[field] ? [errors[field]] : []),
    ])
  }

  function buildInputErrors(): ListingFormErrors {
    return {
      title: getInputError('title'),
      description: getInputError('description'),
      pricePerMonth: getInputError('pricePerMonth'),
      areaSqm: getInputError('areaSqm'),
      rooms: getInputError('rooms'),
      bathrooms: getInputError('bathrooms'),
      availableFrom: getInputError('availableFrom'),
      city: getInputError('city'),
      district: getInputError('district'),
      street: getInputError('street'),
      buildingNumber: getInputError('buildingNumber'),
      postalCode: getInputError('postalCode'),
      contact: getInputError('contact'),
      phone: getInputError('phone'),
      allowPets: getInputError('allowPets'),
      allowSmoking: getInputError('allowSmoking'),
      furnished: getInputError('furnished'),
      petsAllowed: getInputError('petsAllowed'),
      nonSmokingOnly: getInputError('nonSmokingOnly'),
      preferredTenantProfile: getInputError('preferredTenantProfile'),
      publicationStatus: getInputError('publicationStatus'),
    }
  }

  function updateField<K extends keyof ListingFormData>(field: K, value: ListingFormData[K]) {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    if (errors[field]) {
      setErrors((prev) => {
        const nextErrors = { ...prev }
        delete nextErrors[field]
        return nextErrors
      })
    }

    setHiddenExternalFields((prev) => {
      if (prev.has(field)) {
        return prev
      }

      const nextHiddenFields = new Set(prev)
      nextHiddenFields.add(field)
      return nextHiddenFields
    })
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
    const newErrors: ListingFormErrors = {}

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

  const inputErrors = buildInputErrors()
  const unboundFieldErrors = getUnboundFieldErrors(fieldErrors)

  const sections = [
    <ListingBasicInfoSection formData={formData} errors={inputErrors} onUpdate={updateField} />,
    <ListingPricingSection formData={formData} errors={inputErrors} onUpdate={updateField} />,
    <ListingLocationFormSection formData={formData} errors={inputErrors} onUpdate={updateField} />,
    <ListingContactSection formData={formData} errors={inputErrors} onUpdate={updateField} />,
    <ListingTenantRequirementsSection
      formData={{
        petsAllowed: formData.petsAllowed,
        nonSmokingOnly: formData.nonSmokingOnly,
        preferredTenantProfile: formData.preferredTenantProfile,
      }}
      errors={{
        petsAllowed: inputErrors.petsAllowed,
        nonSmokingOnly: inputErrors.nonSmokingOnly,
        preferredTenantProfile: inputErrors.preferredTenantProfile,
      }}
      disabled={isSubmitting}
      onUpdate={handleTenantRequirementsUpdate}
    />,
    <ListingPublicationSection formData={formData} errors={inputErrors} onUpdate={updateField} />,
  ]

  return (
    <div class="space-y-6">
      <form onSubmit={handleSubmit} class="space-y-6">
        <ListingFormShell>
          {unboundFieldErrors.length > 0 ? (
            <>
              <div class="alert alert-error text-sm">
                <div>
                  <p class="font-semibold">Niektóre dane ogłoszenia wymagają poprawy:</p>
                  <ul class="mt-1 list-disc pl-5">
                    {unboundFieldErrors.map((message) => (
                      <li key={message}>{message}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div class="my-4 border-t border-base-300" />
            </>
          ) : null}

          {sections.map((section, index) => (
            <Fragment key={index}>
              {index > 0 ? <div class="my-4 border-t border-base-300" /> : null}
              {section}
            </Fragment>
          ))}
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