import { apiRequest } from './api-client'

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

function getAuthHeaders(token: string, type = 'Bearer'): Record<string, string> {
  return {
    Authorization: `${type} ${token}`,
  }
}

export async function getListingOpinions(listingId: string): Promise<ListingOpinion[]> {
  return apiRequest<ListingOpinion[]>(`/listings/${listingId}/opinions`, {
    method: 'GET',
  })
}

export async function addListingOpinion(
  listingId: string,
  payload: AddOpinionPayload,
  token: string,
  type = 'Bearer',
): Promise<ListingOpinion> {
  return apiRequest<ListingOpinion>(`/listings/${listingId}/opinions`, {
    method: 'POST',
    body: payload,
    headers: getAuthHeaders(token, type),
  })
}
