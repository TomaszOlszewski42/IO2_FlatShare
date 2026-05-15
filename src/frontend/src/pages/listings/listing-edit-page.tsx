import type { RoutableProps } from 'preact-router'
import { route } from 'preact-router'
import { useEffect, useState } from 'preact/hooks'

import { ListingEditForm } from '../../components/listings/listing-edit-form'
import { ListingPhotoUpload } from '../../components/listings/listing-photo-upload'
import { ListingUnavailabilityCalendar } from '../../components/listings/listing-unavailability-calendar'
import { ListingFormShell } from '../../components/listings/listing-form-shell'
import type { ListingFormData } from '../../components/listings/listing-create-form'
import { AppButton } from '../../components/ui/app-button'
import { usePageErrorHandler } from '../../hooks/use-page-error-handler'
import { readAuthSession } from '../../services/auth-session'
import { getListingById, updateListing } from '../../services/listings-api'
import type { UpdateListingPayload } from '../../types/listing-forms'
import type { Listing } from '../../types/listing'

type ListingEditPageProps = RoutableProps & {
  listingId?: string
}

function trimToEmpty(value?: string | null): string {
  return (value || '').trim()
}

function normalizeTenantProfile(value: string): string {
  const normalizedValue = value.trim()

  return normalizedValue.length > 0 ? normalizedValue : 'none'
}

function buildOwnerContactValue(contact: string, phone?: string): string {
  const contactName = contact.trim()
  const normalizedPhone = trimToEmpty(phone)

  if (!normalizedPhone) {
    return contactName
  }

  return `${contactName}\nPhone: ${normalizedPhone}`
}

function readPreferredTenantProfile(listing: Listing): string {
  const attributes = listing.attributes as
    | {
        preferredTenantProfile?: string | null
        profile?: string | null
      }
    | undefined

  return attributes?.preferredTenantProfile ?? attributes?.profile ?? ''
}

export function ListingEditPage({ listingId }: ListingEditPageProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'photos' | 'unavailability'>('basic')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [initialData, setInitialData] = useState<ListingFormData | null>(null)
  const [listing, setListing] = useState<Listing | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const {
    errorMessage,
    fieldErrors,
    clearErrors,
    handleError,
  } = usePageErrorHandler()

  useEffect(() => {
    if (!listingId) {
      setLoadError('Missing listing ID.')
      setIsLoading(false)
      return
    }

    const currentListingId = listingId
    let isMounted = true

    async function fetchListing() {
      const session = readAuthSession()

      if (!session) {
        route('/login')
        return
      }

      try {
        const listing = await getListingById(currentListingId, session.token, session.type)

        if (!isMounted) {
          return
        }

        setListing(listing)
        setInitialData(mapListingToFormData(listing))
        setLoadError(null)
      } catch (error) {
        console.error('Failed to fetch listing:', error)

        if (!isMounted) {
          return
        }

        setLoadError('Failed to fetch listing data.')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void fetchListing()

    return () => {
      isMounted = false
    }
  }, [listingId])

  function mapListingToFormData(listing: Listing): ListingFormData {
    return {
      title: listing.title,
      description: listing.description,
      pricePerMonth: listing.price,
      areaSqm: listing.area ?? 0,
      rooms: listing.rooms ?? 1,
      bathrooms: listing.bathrooms ?? 1,
      availableFrom: listing.availableFrom?.split('T')[0] || new Date().toISOString().split('T')[0],
      city: listing.location.city,
      district: listing.location.district ?? undefined,
      street: listing.location.street ?? undefined,
      buildingNumber:
        listing.location.buildingNumber ??
        listing.location.houseNumber ??
        listing.location.aptNumber ??
        undefined,
      postalCode: listing.location.postalCode ?? '',
      contact: listing.contact ?? listing.ownerContact ?? '',
      phone: listing.phone ?? listing.contactPhone ?? '',
      allowPets: Boolean(listing.allowPets),
      allowSmoking: Boolean(listing.allowSmoking),
      furnished: Boolean(listing.furnished),
      petsAllowed: listing.attributes?.petsAllowed ?? false,
      nonSmokingOnly: listing.attributes?.nonSmokingOnly ?? false,
      preferredTenantProfile: readPreferredTenantProfile(listing),
      publicationStatus: 'active',
    }
  }

  function mapToUpdatePayload(formData: ListingFormData): UpdateListingPayload {
    return {
      title: formData.title.trim(),
      description: formData.description.trim(),
      price: formData.pricePerMonth,
      currency: 'PLN',
      availableFrom: formData.availableFrom,
      ownerContact: buildOwnerContactValue(formData.contact, formData.phone),
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

    if (!listingId) {
      setLoadError('Missing listing ID.')
      return
    }

    const currentListingId = listingId

    setIsSubmitting(true)
    clearErrors()

    try {
      const payload = mapToUpdatePayload(formData)

      await updateListing(currentListingId, payload, session.token, session.type)
      route(`/listings/${currentListingId}`)
    } catch (error) {
      console.error('Failed to update listing:', error)
      handleError(error, 'Failed to save changes. Check form errors.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div class="flex w-full flex-1 items-center justify-center">
        <span class="loading loading-spinner loading-lg text-primary" />
      </div>
    )
  }

  if (loadError || !initialData || !listingId) {
    return (
      <div class="flex w-full flex-1 flex-col items-center justify-center px-4 py-12">
        <div class="alert alert-error max-w-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{loadError || 'An unexpected error occurred.'}</span>
        </div>

        <AppButton
          className="mt-4"
          onClick={() => {
            route('/listings')
          }}
        >
          Back to listings
        </AppButton>
      </div>
    )
  }

  return (
    <div class="flex w-full flex-1 flex-col py-6">
      <div class="container mx-auto max-w-3xl px-4">
        <div class="mb-6">
          <div class="flex items-center gap-3 mb-2">
            <h1 class="text-3xl font-bold">Edit listing</h1>
            {listing?.status && (
              <span class={`badge ${listing.status === 'ACTIVE' ? 'badge-success' : 'badge-neutral'}`}>
                {listing.status}
              </span>
            )}
          </div>
          <p class="text-base-content/70">Update the details of your apartment.</p>
        </div>

        <div role="tablist" class="tabs tabs-bordered mb-8">
          <a
            role="tab"
            class={`tab tab-lg ${activeTab === 'basic' ? 'tab-active font-semibold' : ''}`}
            onClick={() => setActiveTab('basic')}
          >
            Basic Info
          </a>
          <a
            role="tab"
            class={`tab tab-lg ${activeTab === 'photos' ? 'tab-active font-semibold' : ''}`}
            onClick={() => setActiveTab('photos')}
          >
            Photos
          </a>
          <a
            role="tab"
            class={`tab tab-lg ${activeTab === 'unavailability' ? 'tab-active font-semibold' : ''}`}
            onClick={() => setActiveTab('unavailability')}
          >
            Unavailability
          </a>
        </div>

        {errorMessage ? <div class="alert alert-error mb-6 text-sm">{errorMessage}</div> : null}

        {activeTab === 'basic' && (
          <div class="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <ListingEditForm
              listingId={listingId}
              initialData={initialData}
              fieldErrors={fieldErrors}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          </div>
        )}

        {activeTab === 'photos' && (
          <div class="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <ListingFormShell>
              <ListingPhotoUpload listingId={listingId} />
            </ListingFormShell>
          </div>
        )}

        {activeTab === 'unavailability' && (
          <div class="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <ListingFormShell>
              <ListingUnavailabilityCalendar listingId={listingId} />
            </ListingFormShell>
          </div>
        )}
      </div>
    </div>
  )
}