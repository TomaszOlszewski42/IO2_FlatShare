export type ListingLocationPayload = {
  city: string
  district?: string | null
  street?: string | null
  aptNumber?: string | null
}

export type CreateListingPayload = {
  title: string
  description: string
  price: number
  currency: string
  availableFrom: string
  ownerContact: string
  area: number
  availableSince: string
  location: ListingLocationPayload
}

export type UpdateListingPayload = Partial<CreateListingPayload>

/**
 * Frontend-only draft pod sprint 3.
 * Tych pól na razie nie wysyłamy do backendu, dopóki API ich nie obsłuży.
 */
export type ListingOwnerAttributesDraft = {
  petsAllowed: boolean
  nonSmokingOnly: boolean
  preferredTenantProfile: string
}