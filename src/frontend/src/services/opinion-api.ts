import { apiRequest } from './api-client'
import type { AddOpinionPayload, ListingOpinion } from '../types/opinion'

function getAuthHeaders(token: string, type = 'Bearer'): Record<string, string> {
  return {
    Authorization: `${type} ${token}`,
  }
}

export async function getListingOpinions(
  listingId: string,
  token: string,
  type = 'Bearer',
): Promise<ListingOpinion[]> {
  return apiRequest<ListingOpinion[]>(`/listings/${listingId}/opinions`, {
    method: 'GET',
    headers: getAuthHeaders(token, type),
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
