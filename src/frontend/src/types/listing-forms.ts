export type ListingLocationPayload = {
  city: string
  district?: string | null
  street?: string | null
  aptNumber?: string | null
}

export type ListingAttributesPayload = {
  petsAllowed: boolean
  nonSmokingOnly: boolean
  closeToShops: boolean
  profile: string
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
  attributes: ListingAttributesPayload
}

export type UpdateListingPayload = Partial<CreateListingPayload>

/**
 * Frontendowy model formularza wymagań właściciela.
 * Backend aktualnie przyjmuje te dane jako Listing.attributes.
 */
export type ListingOwnerAttributesDraft = {
  petsAllowed: boolean
  nonSmokingOnly: boolean
  preferredTenantProfile: string
}