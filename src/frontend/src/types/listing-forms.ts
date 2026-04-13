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

export interface UpdateListingPayload extends Partial<CreateListingPayload> {}