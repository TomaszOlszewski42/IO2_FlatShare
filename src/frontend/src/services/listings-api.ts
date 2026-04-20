import { apiRequest } from './api-client'
import type { CreateListingPayload, UpdateListingPayload } from '../types/listing-forms'
import type { Listing } from '../types/listing'
import type { ListingStatus } from '../types/listing-status'

export type ListingListQuery = {
  page?: number
  size?: number
  status?: ListingStatus
  city?: string
  ownerId?: string
}

type ListingDto = {
  id: string
  title: string
  description: string
  price: number
  currency: string
  status?: ListingStatus
  availableFrom?: string | null
  availableSince?: string | null
  ownerContact?: string | null
  contact?: string | null
  contactEmail?: string | null
  contactPhone?: string | null
  phone?: string | null
  area?: number | null
  rooms?: number | null
  bathrooms?: number | null
  allowPets?: boolean
  allowSmoking?: boolean
  furnished?: boolean
  location: {
    city: string
    district?: string | null
    street?: string | null
    houseNumber?: string | null
    aptNumber?: string | null
    buildingNumber?: string | null
    postalCode?: string | null
  }
  attributes?: {
    petsAllowed?: boolean
    nonSmokingOnly?: boolean
    preferredTenantProfile?: string | null
  }
  createdAt?: string
  updatedAt?: string
}

export type CreateListingResponse = {
  listingId: string
  status: string
  createdAt?: string
}

export type ListingStatusActionResponse = {
  listingId?: string
  status?: ListingStatus | string
  updatedAt?: string
}

type ListingPhotosDto = {
  listingId: string
  photos: string[]
}

function buildQueryString(params?: ListingListQuery): string {
  if (!params) {
    return ''
  }

  const searchParams = new URLSearchParams()

  if (typeof params.page === 'number') {
    searchParams.set('page', String(params.page))
  }

  if (typeof params.size === 'number') {
    searchParams.set('size', String(params.size))
  }

  if (params.status) {
    searchParams.set('status', params.status)
  }

  if (params.city) {
    searchParams.set('city', params.city)
  }

  if (params.ownerId) {
    searchParams.set('ownerId', params.ownerId)
  }

  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ''
}

function getAuthHeaders(token: string, type = 'Bearer'): Record<string, string> {
  return {
    Authorization: `${type} ${token}`,
  }
}

function mapListingDtoToListing(item: ListingDto): Listing {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    price: item.price,
    currency: item.currency,
    status: item.status,
    availableFrom: item.availableFrom ?? null,
    availableSince: item.availableSince ?? null,
    ownerContact: item.ownerContact ?? null,
    contact: item.contact ?? item.ownerContact ?? null,
    contactEmail: item.contactEmail ?? null,
    contactPhone: item.contactPhone ?? null,
    phone: item.phone ?? item.contactPhone ?? null,
    area: item.area ?? null,
    rooms: item.rooms ?? null,
    bathrooms: item.bathrooms ?? null,
    allowPets: item.allowPets,
    allowSmoking: item.allowSmoking,
    furnished: item.furnished,
    location: {
      city: item.location.city,
      district: item.location.district ?? null,
      street: item.location.street ?? null,
      houseNumber: item.location.houseNumber ?? null,
      aptNumber: item.location.aptNumber ?? null,
      buildingNumber: item.location.buildingNumber ?? item.location.aptNumber ?? null,
      postalCode: item.location.postalCode ?? null,
    },
    attributes: item.attributes
      ? {
          petsAllowed: item.attributes.petsAllowed,
          nonSmokingOnly: item.attributes.nonSmokingOnly,
          preferredTenantProfile: item.attributes.preferredTenantProfile ?? null,
        }
      : undefined,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }
}

export async function getListings(
  token: string,
  query?: ListingListQuery,
  type = 'Bearer',
): Promise<Listing[]> {
  const items = await apiRequest<ListingDto[]>(`/listings${buildQueryString(query)}`, {
    method: 'GET',
    headers: getAuthHeaders(token, type),
  })

  return items.map(mapListingDtoToListing)
}

export async function getListingById(
  listingId: string,
  token: string,
  type = 'Bearer',
): Promise<Listing> {
  const item = await apiRequest<ListingDto>(`/listings/${listingId}`, {
    method: 'GET',
    headers: getAuthHeaders(token, type),
  })

  return mapListingDtoToListing(item)
}

export async function getListingPhotoIds(
  listingId: string,
  token: string,
  type = 'Bearer',
): Promise<string[]> {
  const response = await apiRequest<ListingPhotosDto>(`/listings/${listingId}/photos`, {
    method: 'GET',
    headers: getAuthHeaders(token, type),
  })

  return response.photos ?? []
}

export async function createListing(
  payload: CreateListingPayload,
  token: string,
  type = 'Bearer',
): Promise<CreateListingResponse> {
  return apiRequest<CreateListingResponse>('/listings', {
    method: 'POST',
    body: payload,
    headers: getAuthHeaders(token, type),
  })
}

export async function updateListing(
  listingId: string,
  payload: UpdateListingPayload,
  token: string,
  type = 'Bearer',
): Promise<Listing> {
  return apiRequest<Listing>(`/listings/${listingId}`, {
    method: 'PATCH',
    body: payload,
    headers: getAuthHeaders(token, type),
  })
}

export async function hideListing(
  listingId: string,
  token: string,
  type = 'Bearer',
): Promise<ListingStatusActionResponse> {
  return apiRequest<ListingStatusActionResponse>(`/listings/${listingId}/hide`, {
    method: 'PATCH',
    headers: getAuthHeaders(token, type),
  })
}

export async function archiveListing(
  listingId: string,
  token: string,
  type = 'Bearer',
): Promise<ListingStatusActionResponse> {
  return apiRequest<ListingStatusActionResponse>(`/listings/${listingId}/archive`, {
    method: 'PATCH',
    headers: getAuthHeaders(token, type),
  })
}

export async function uploadPhoto(
  listingId: string,
  photo: File,
  token: string,
  type = 'Bearer',
): Promise<void> {
  const formData = new FormData()
  formData.append('photo', photo)

  await apiRequest(`/listings/${listingId}/photos`, {
    method: 'POST',
    body: formData,
    headers: {
      Authorization: `${type} ${token}`,
    },
  })
}

export async function deletePhoto(
  listingId: string,
  photoId: string,
  token: string,
  type = 'Bearer',
): Promise<void> {
  await apiRequest(`/listings/${listingId}/photos/${photoId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token, type),
  })
}