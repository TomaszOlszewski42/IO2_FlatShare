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
  availableFrom: string
  ownerContact: string
  area: number
  availableSince: string
  location: {
    city: string
    district: string
    street: string
    aptNumber: string
  }
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

export async function getListings(
  token: string,
  query?: ListingListQuery,
  type = 'Bearer',
): Promise<Listing[]> {
  const items = await apiRequest<ListingDto[]>(`/listings${buildQueryString(query)}`, {
    method: 'GET',
    headers: getAuthHeaders(token, type),
  })

  return items.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    price: item.price,
    currency: item.currency,
    availableFrom: item.availableFrom,
    availableSince: item.availableSince,
    ownerContact: item.ownerContact,
    contact: item.ownerContact,
    area: item.area,
    location: {
      city: item.location.city,
      district: item.location.district,
      street: item.location.street,
      aptNumber: item.location.aptNumber,
      buildingNumber: item.location.aptNumber,
    },
  }))
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

  return {
    id: item.id,
    title: item.title,
    description: item.description,
    price: item.price,
    currency: item.currency,
    availableFrom: item.availableFrom,
    availableSince: item.availableSince,
    ownerContact: item.ownerContact,
    contact: item.ownerContact,
    area: item.area,
    location: {
      city: item.location.city,
      district: item.location.district,
      street: item.location.street,
      aptNumber: item.location.aptNumber,
      buildingNumber: item.location.aptNumber,
    },
  }
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