import type { ListingImage } from './listing-image'
import type { ListingStatus } from './listing-status'
import type { Unavailability } from './unavailability'

export interface ListingLocation {
  city: string
  district?: string | null
  street?: string | null
  houseNumber?: string | null
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
  currency?: string
  status: ListingStatus
  availableFrom?: string | null
  contactEmail?: string | null
  contactPhone?: string | null
  location: ListingLocation
  attributes?: ListingAttributes
  images?: ListingImage[]
  unavailability?: Unavailability[]
  createdAt?: string
  updatedAt?: string
}