import type { ListingImage } from './listing-image'
import type { ListingStatus } from './listing-status'
import type { Unavailability } from './unavailability'

export interface ListingLocation {
  city: string
  district?: string | null
  street?: string | null
  houseNumber?: string | null
  aptNumber?: string | null
  buildingNumber?: string | null
  postalCode?: string | null
}

export interface ListingAttributes {
  petsAllowed?: boolean
  nonSmokingOnly?: boolean
  preferredTenantProfile?: string | null
}

export interface Listing {
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
  images?: ListingImage[]
  unavailability?: Unavailability[]
  createdAt?: string
  updatedAt?: string
}