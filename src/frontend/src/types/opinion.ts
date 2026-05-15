export type ListingOpinion = {
  id: string
  listingId: string
  userId: string
  rating: number
  comment: string
  createdAt: string
}

export type AddOpinionPayload = {
  listingId: string
  rating: number
  comment: string
}
