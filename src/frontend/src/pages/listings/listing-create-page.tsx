import type { RoutableProps } from 'preact-router'
import { route } from 'preact-router'
import { useState } from 'preact/hooks'

import {
  ListingCreateForm,
  createInitialListingFormData,
  type ListingFormData,
} from '../../components/listings/listing-create-form'
import { readAuthSession } from '../../services/auth-session'
import {
  clearListingCreateDraft,
  readListingCreateDraft,
  saveListingCreateDraft,
} from '../../services/listing-create-draft'
import { ApiHttpError } from '../../services/api-client'
import { createListing } from '../../services/listings-api'
import type { CreateListingPayload } from '../../types/listing-forms'

function trimToNull(value?: string): string | null {
  const normalizedValue = (value || '').trim()
  return normalizedValue.length > 0 ? normalizedValue : null
}

function getCreateListingErrorMessage(error: unknown): string {
  if (error instanceof ApiHttpError) {
    if (
      typeof error.body === 'object' &&
      error.body !== null &&
      'message' in error.body &&
      typeof (error.body as { message?: unknown }).message === 'string'
    ) {
      return (error.body as { message: string }).message
    }

    if (error.status === 400) {
      return 'Backend odrzucił dane ogłoszenia. Sprawdź wymagane pola formularza.'
    }
  }

  return 'Nie udało się utworzyć ogłoszenia. Spróbuj ponownie.'
}

export function ListingCreatePage(_: RoutableProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [initialValues] = useState<ListingFormData>(() => ({
    ...createInitialListingFormData(),
    ...(readListingCreateDraft() || {}),
  }))
  const [hasRecoveredDraft] = useState<boolean>(() => Boolean(readListingCreateDraft()))

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
        district: trimToNull(formData.district),
        street: trimToNull(formData.street),
        aptNumber: trimToNull(formData.buildingNumber),
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
    setErrorMessage(null)

    try {
      const payload = mapToCreatePayload(formData)

      await createListing(payload, session.token, session.type)
      clearListingCreateDraft()

      /**
       * Uwaga:
       * publicationStatus nadal jest tylko stanem UI.
       * Aktualny backend nie przyjmuje go w POST /listings.
       * Owner attributes też zostają na razie tylko po stronie frontendu.
       */
      route('/listings')
    } catch (error) {
      console.error('Failed to create listing:', error)
      setErrorMessage(getCreateListingErrorMessage(error))
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
          onChange={saveListingCreateDraft}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  )
}