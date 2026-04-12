import type { RoutableProps } from 'preact-router'
import { route } from 'preact-router'
import { useState } from 'preact/hooks'

import { ListingCreateForm, type ListingFormData } from '../../components/listings/listing-create-form'
import { readAuthSession } from '../../services/auth-session'
import { createListing } from '../../services/listings-api'
import type { CreateListingPayload } from '../../types/listing-forms'

export function ListingCreatePage(_: RoutableProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

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
        district: (formData.district || '').trim(),
        street: (formData.street || '').trim(),
        aptNumber: (formData.buildingNumber || '').trim(),
      },
    }
  }

  async function handleSubmit(formData: ListingFormData) {
    const session = readAuthSession()

    if (!session) {
      route('/login')
      return
    }

    setIsSubmitting(true)
    try {
      const payload = mapToCreatePayload(formData)
      await createListing(payload, session.token, session.type)
      route('/listings')
    } catch (error) {
      console.error('Failed to create listing:', error)
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

        <ListingCreateForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </div>
  )
}
