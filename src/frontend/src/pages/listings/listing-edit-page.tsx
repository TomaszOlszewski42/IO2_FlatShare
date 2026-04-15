import type { RoutableProps } from 'preact-router'
import { route } from 'preact-router'
import { useState, useEffect } from 'preact/hooks'

import { ListingEditForm } from '../../components/listings/listing-edit-form'
import type { ListingFormData } from '../../components/listings/listing-create-form'
import { readAuthSession } from '../../services/auth-session'
import { getListingById, updateListing } from '../../services/listings-api'
import type { UpdateListingPayload } from '../../types/listing-forms'
import type { Listing } from '../../types/listing'

type ListingEditPageProps = RoutableProps & {
  listingId?: string
}

export function ListingEditPage({ listingId }: ListingEditPageProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [initialData, setInitialData] = useState<ListingFormData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!listingId) {
      setError('Brak identyfikatora ogłoszenia')
      setIsLoading(false)
      return
    }

    const fetchListing = async () => {
      const session = readAuthSession()
      if (!session) {
        route('/login')
        return
      }

      try {
        const listing = await getListingById(listingId, session.token, session.type)
        setInitialData(mapListingToFormData(listing))
      } catch (err) {
        console.error('Failed to fetch listing:', err)
        setError('Nie udało się pobrać danych ogłoszenia')
      } finally {
        setIsLoading(false)
      }
    }

    fetchListing()
  }, [listingId])

  function mapListingToFormData(listing: Listing): ListingFormData {
    return {
      title: listing.title,
      description: listing.description,
      pricePerMonth: listing.price,
      areaSqm: listing.area,
      rooms: 1, // Assuming defaults if not in Listing type yet
      bathrooms: 1,
      availableFrom: listing.availableFrom?.split('T')[0] || new Date().toISOString().split('T')[0],
      city: listing.location.city,
      district: listing.location.district,
      street: listing.location.street,
      buildingNumber: listing.location.aptNumber,
      postalCode: '',
      contact: listing.contact,
      phone: '',
      allowPets: false,
      allowSmoking: false,
      furnished: false,
      publicationStatus: 'active', // Defaulting for edit
    }
  }

  function mapToUpdatePayload(formData: ListingFormData): UpdateListingPayload {
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
    if (!session || !listingId) return

    setIsSubmitting(true)
    try {
      const payload = mapToUpdatePayload(formData)
      await updateListing(listingId, payload, session.token, session.type)
      route(`/listings/${listingId}`)
    } catch (error) {
      console.error('Failed to update listing:', error)
      setError('Nie udało się zapisać zmian')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div class="flex w-full flex-1 items-center justify-center">
        <span class="loading loading-spinner loading-lg text-primary"></span>
      </div>
    )
  }

  if (error || !initialData || !listingId) {
    return (
      <div class="flex w-full flex-1 flex-col items-center justify-center py-12 px-4">
        <div class="alert alert-error max-w-md">
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>{error || 'Wystąpił nieoczekiwany błąd'}</span>
        </div>
        <AppButton class="mt-4" onClick={() => route('/listings')}>Powrót do ogłoszeń</AppButton>
      </div>
    )
  }

  return (
    <div class="flex w-full flex-1 flex-col py-6">
      <div class="container mx-auto max-w-3xl px-4">
        <div class="mb-6">
          <h1 class="mb-2 text-3xl font-bold">Edycja ogłoszenia</h1>
          <p class="text-base-content/70">Zaktualizuj szczegóły swojego mieszkania.</p>
        </div>

        <ListingEditForm 
          listingId={listingId}
          initialData={initialData} 
          onSubmit={handleSubmit} 
          isSubmitting={isSubmitting} 
        />
      </div>
    </div>
  )
}
