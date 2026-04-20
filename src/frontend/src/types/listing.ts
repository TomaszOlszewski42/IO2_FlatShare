import type { ListingStatus } from './listing-status'

export type ListingLocation = {
  city: string
  district?: string | null
  street?: string | null
  houseNumber?: string | null
  aptNumber?: string | null
  buildingNumber?: string | null
  postalCode?: string | null
}

export type ListingAttributes = {
  petsAllowed?: boolean
  nonSmokingOnly?: boolean
  preferredTenantProfile?: string | null
}

export type Listing = {
  id: string
  ownerId?: string
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
  location: ListingLocation
  attributes?: ListingAttributes
  createdAt?: string
  updatedAt?: string
}