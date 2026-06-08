import { apiRequest } from './api-client'
import type { CreateListingPayload, UpdateListingPayload } from '../types/listing-forms'
import type { Listing } from '../types/listing'
import type { ListingStatus } from '../types/listing-status'

export type ListingListQuery = {
  page?: number
  size?: number
  status?: ListingStatus
  city?: string
  district?: string
  street?: string
  aptNumber?: string
  ownerId?: string
  minPrice?: number
  maxPrice?: number
  petsAllowed?: boolean
  nonSmokingOnly?: boolean
  closeToShops?: boolean
  minArea?: number
  maxArea?: number
  startDate?: string
}

type ListingDto = {
  id: string
  listingId?: string
  ownerId?: string | null
  OwnerId?: string | null
  title: string
  description: string
  price: number
  currency: string
  status?: ListingStatus | string | number | null
  Status?: ListingStatus | string | number | null
  availableSince?: string | null
  availableUntil?: string | null
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
    profile?: string | null
    closeToShops?: boolean
  }
  unavailability?: {
    since: string
    until: string
    message: string
  }[]
  createdAt?: string
  updatedAt?: string
  matchScore?: number
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

type OwnerContactParts = {
  name: string | null
  phone: string | null
}

const listingStatusByBackendNumber: Record<number, ListingStatus> = {
  0: 'ACTIVE',
  1: 'HIDDEN',
  2: 'ARCHIVED',
  3: 'AWAITING_REVIEW',
  4: 'AWAITING_FIXES',
  5: 'HIDDEN_BY_MODERATION',
}

function normalizeListingStatus(
  status: ListingStatus | string | number | null | undefined,
): ListingStatus | undefined {
  if (typeof status === 'number') {
    return listingStatusByBackendNumber[status]
  }

  if (typeof status !== 'string') {
    return undefined
  }

  const normalizedStatus = status.trim().toUpperCase()

  switch (normalizedStatus) {
    case 'DRAFT':
    case 'UNDER_REVIEW':
    case 'AWAITING_REVIEW':
    case 'AWAITING_FIXES':
    case 'ACTIVE':
    case 'HIDDEN':
    case 'ARCHIVED':
    case 'HIDDEN_BY_MODERATION':
      return normalizedStatus

    default:
      return undefined
  }
}

function splitOwnerContact(value?: string | null): OwnerContactParts {
  const rawValue = (value ?? '').trim()

  if (!rawValue) {
    return {
      name: null,
      phone: null,
    }
  }

  const lines = rawValue
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  const phoneLineIndex = lines.findIndex((line) => /^(phone|tel\.?|telefon):/i.test(line))

  if (phoneLineIndex === -1) {
    return {
      name: rawValue,
      phone: null,
    }
  }

  const phone = lines[phoneLineIndex]
    .replace(/^(phone|tel\.?|telefon):\s*/i, '')
    .trim()

  const name = lines
    .filter((_, index) => index !== phoneLineIndex)
    .join(' ')
    .trim()

  return {
    name: name || rawValue,
    phone: phone || null,
  }
}

function buildQueryString(params?: ListingListQuery): string {
  if (!params) {
    return ''
  }

  const searchParams = new URLSearchParams()

  if (typeof params.page === 'number') {
    searchParams.set('Page', String(params.page))
  }

  if (typeof params.size === 'number') {
    searchParams.set('Size', String(params.size))
  }

  if (params.status) {
    searchParams.set('Status', params.status)
  }

  if (params.city) {
    searchParams.set('City', params.city)
  }

  if (params.district) {
    searchParams.set('District', params.district)
  }

  if (params.street) {
    searchParams.set('Street', params.street)
  }

  if (params.aptNumber) {
    searchParams.set('AptNumber', params.aptNumber)
  }

  if (params.ownerId) {
    searchParams.set('OwnerId', params.ownerId)
  }

  if (params.minPrice !== undefined && params.minPrice !== null) {
    searchParams.set('MinPrice', String(params.minPrice))
  }

  if (params.maxPrice !== undefined && params.maxPrice !== null) {
    searchParams.set('MaxPrice', String(params.maxPrice))
  }

  if (params.petsAllowed !== undefined) {
    searchParams.set('PetsAllowed', String(params.petsAllowed))
  }

  if (params.nonSmokingOnly !== undefined) {
    searchParams.set('NonSmokingOnly', String(params.nonSmokingOnly))
  }

  if (params.closeToShops !== undefined) {
    searchParams.set('CloseToShops', String(params.closeToShops))
  }

  if (params.minArea !== undefined) {
    searchParams.set('MinArea', String(params.minArea))
  }

  if (params.maxArea !== undefined) {
    searchParams.set('MaxArea', String(params.maxArea))
  }

  if (params.startDate) {
    searchParams.set('StartDate', params.startDate)
  }

  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ''
}

function getAuthHeaders(token: string, type = 'Bearer'): Record<string, string> {
  return {
    Authorization: `${type} ${token}`,
  }
}

function mapListingDtoToListing(item: ListingDto, fallbackOwnerId?: string): Listing {
  const ownerContactParts = splitOwnerContact(item.ownerContact)
  const resolvedContact = item.contact ?? ownerContactParts.name ?? item.ownerContact ?? null
  const resolvedPhone = item.phone ?? item.contactPhone ?? ownerContactParts.phone ?? null
  const id = item.id ?? item.listingId

  return {
    id: id,
    ownerId: item.ownerId ?? item.OwnerId ?? fallbackOwnerId,
    title: item.title,
    description: item.description,
    price: item.price,
    currency: item.currency,
    status: normalizeListingStatus(item.status ?? item.Status),
    availableSince: item.availableSince ?? null,
    availableUntil: item.availableUntil ?? null,
    ownerContact: ownerContactParts.name ?? item.ownerContact ?? null,
    contact: resolvedContact,
    contactEmail: item.contactEmail ?? null,
    contactPhone: item.contactPhone ?? resolvedPhone,
    phone: item.phone ?? resolvedPhone,
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
          preferredTenantProfile:
            item.attributes.preferredTenantProfile ?? item.attributes.profile ?? null,
        }
      : undefined,
    unavailability: item.unavailability,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }
}

export async function getListings(
  token: string,
  query?: ListingListQuery,
  type = 'Bearer',
  isRelevancySort = false,
): Promise<Listing[]> {
  const path = isRelevancySort ? '/matches' : '/listings'
  const items = await apiRequest<any>(`${path}${buildQueryString(query)}`, {
    method: 'GET',
    headers: getAuthHeaders(token, type),
  })

  const results = Array.isArray(items) ? items : items?.content ?? []

  return results.map((item: any) => {
    const listingDto = item.listing || item.Listing || item
    return mapListingDtoToListing(listingDto, query?.ownerId)
  })
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
): Promise<Listing | null> {
  const item = await apiRequest<ListingDto | null>(`/listings/${listingId}`, {
    method: 'PATCH',
    body: payload,
    headers: getAuthHeaders(token, type),
  })

  if (!item) {
    return null
  }

  return mapListingDtoToListing(item)
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

export async function publishListing(
  listingId: string,
  token: string,
  type = 'Bearer',
): Promise<ListingStatusActionResponse> {
  return apiRequest<ListingStatusActionResponse>(`/listings/${listingId}/publish`, {
    method: 'PATCH',
    headers: getAuthHeaders(token, type),
  })
}

export async function submitListing(
  listingId: string,
  token: string,
  type = 'Bearer',
): Promise<ListingStatusActionResponse> {
  return apiRequest<ListingStatusActionResponse>(`/listings/${listingId}/submit`, {
    method: 'PATCH',
    headers: getAuthHeaders(token, type),
  })
}

export async function requestFixesListing(
  listingId: string,
  token: string,
  type = 'Bearer',
): Promise<ListingStatusActionResponse> {
  return apiRequest<ListingStatusActionResponse>(`/listings/${listingId}/request-fixes`, {
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