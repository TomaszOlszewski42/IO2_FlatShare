import type { ListingStatus } from './listing-status'

export interface ListingFormValues {
  title: string
  description: string
  price: number | ''
  currency: string
  availableFrom: string
  contactEmail: string
  contactPhone: string
  city: string
  district: string
  street: string
  houseNumber: string
  petsAllowed: boolean
  nonSmokingOnly: boolean
  preferredTenantProfile: string
  status?: ListingStatus
}

export interface CreateListingPayload {
  title: string
  description: string
  price: number
  currency?: string
  availableFrom?: string | null
  contactEmail?: string | null
  contactPhone?: string | null
  location: {
    city: string
    district?: string | null
    street?: string | null
    houseNumber?: string | null
  }
  attributes?: {
    petsAllowed?: boolean
    nonSmokingOnly?: boolean
    preferredTenantProfile?: string | null
  }
  status?: ListingStatus
}

export interface UpdateListingPayload extends Partial<CreateListingPayload> {}