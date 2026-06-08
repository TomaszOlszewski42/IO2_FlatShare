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
  availableSince: string
  ownerContact: string
  area: number
  availableUntil: string
  location: ListingLocationPayload
  attributes: ListingAttributesPayload
}

export type UpdateListingPayload = Partial<CreateListingPayload>

/**
 * Frontend model for the owner's requirements form.
 * Backend currently accepts this data as Listing.attributes.
 */
export type ListingOwnerAttributesDraft = {
  petsAllowed: boolean
  nonSmokingOnly: boolean
  preferredTenantProfile: string
}