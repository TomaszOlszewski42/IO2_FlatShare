import type { RoutableProps } from 'preact-router'
import { route } from 'preact-router'
import { useState } from 'preact/hooks'

import {
  ListingCreateForm,
  createInitialListingFormData,
  type ListingFormData,
} from '../../components/listings/listing-create-form'
import { usePageErrorHandler } from '../../hooks/use-page-error-handler'
import { readAuthSession } from '../../services/auth-session'
import {
  clearListingCreateDraft,
  readListingCreateDraft,
  saveListingCreateDraft,
} from '../../services/listing-create-draft'
import { createListing } from '../../services/listings-api'
import type { CreateListingPayload } from '../../types/listing-forms'

function trimToEmpty(value?: string): string {
  return (value || '').trim()
}

function normalizeTenantProfile(value: string): string {
  const normalizedValue = value.trim()

  return normalizedValue.length > 0 ? normalizedValue : 'none'
}

export function ListingCreatePage(_: RoutableProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [initialValues] = useState<ListingFormData>(() => ({
    ...createInitialListingFormData(),
    ...(readListingCreateDraft() || {}),
  }))
  const [hasRecoveredDraft] = useState<boolean>(() => Boolean(readListingCreateDraft()))

  const {
    errorMessage,
    fieldErrors,
    clearErrors,
    handleError,
  } = usePageErrorHandler()

  function mapToCreatePayload(formData: ListingFormData): CreateListingPayload {
    return {
      title: formData.title.trim(),
      description: formData.description.trim(),
      price: formData.pricePerMonth,
      currency: 'PLN',
      availableFrom: formData.availableFrom,
      ownerContact: formData.contact.trim(),
      area: formData.areaSqm,
      availableSince: formData.availableFrom,
      location: {
        city: formData.city.trim(),
        district: trimToEmpty(formData.district),
        street: trimToEmpty(formData.street),
        aptNumber: trimToEmpty(formData.buildingNumber),
      },
      attributes: {
        petsAllowed: formData.petsAllowed,
        nonSmokingOnly: formData.nonSmokingOnly,
        closeToShops: false,
        profile: normalizeTenantProfile(formData.preferredTenantProfile),
      },
    }
  }

  async function handleSubmit(formData: ListingFormData) {
    const session = readAuthSession()

    if (!session) {
      route('/login')
      return
    }

    if (!session.roles.includes('LANDLORD')) {
      route('/listings')
      return
    }

    setIsSubmitting(true)
    clearErrors()

    try {
      const payload = mapToCreatePayload(formData)

      await createListing(payload, session.token, session.type)
      clearListingCreateDraft()
      route('/listings')
    } catch (error) {
      console.error('Failed to create listing:', error)
      handleError(error, 'Nie udało się utworzyć ogłoszenia. Sprawdź błędy w formularzu.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div class="flex w-full flex-1 flex-col py-6">
      <div class="container mx-auto max-w-3xl px-4">
        <div class="mb-6">
          <h1 class="mb-2 text-3xl font-bold">Tworzenie ogłoszenia</h1>
          <p class="text-base-content/70">Podziel się szczegółami swojego mieszkania z potencjalnymi lokatorami.</p>
        </div>

        {hasRecoveredDraft ? (
          <div class="alert alert-info mb-6 text-sm">
            <span>Przywrócono lokalny szkic formularza z poprzedniej sesji.</span>
          </div>
        ) : null}

        {errorMessage ? <div class="alert alert-error mb-6 text-sm">{errorMessage}</div> : null}

        <ListingCreateForm
          initialValues={initialValues}
          isSubmitting={isSubmitting}
          fieldErrors={fieldErrors}
          onChange={saveListingCreateDraft}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  )
}