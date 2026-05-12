import { apiRequest } from './api-client'
import type {
  CreateUnavailabilityPayload,
  Unavailability,
  UpdateUnavailabilityPayload,
} from '../types/unavailability'

function getAuthHeaders(token: string, type = 'Bearer'): Record<string, string> {
  return {
    Authorization: `${type} ${token}`,
  }
}

export async function getListingUnavailability(
  listingId: string,
  token: string,
  type = 'Bearer',
): Promise<Unavailability[]> {
  return apiRequest<Unavailability[]>(`/listings/${listingId}/unavailability`, {
    method: 'GET',
    headers: getAuthHeaders(token, type),
  })
}

export async function createUnavailability(
  listingId: string,
  payload: CreateUnavailabilityPayload,
  token: string,
  type = 'Bearer',
): Promise<Unavailability> {
  const backendPayload = {
    from: payload.startDate,
    to: payload.endDate,
  }

  return apiRequest<Unavailability>(`/listings/${listingId}/unavailability`, {
    method: 'POST',
    body: backendPayload,
    headers: getAuthHeaders(token, type),
  })
}

export async function updateUnavailability(
  listingId: string,
  unavailabilityId: string,
  payload: UpdateUnavailabilityPayload,
  token: string,
  type = 'Bearer',
): Promise<Unavailability> {
  return apiRequest<Unavailability>(
    `/listings/${listingId}/unavailability/${unavailabilityId}`,
    {
      method: 'PATCH',
      body: payload,
      headers: getAuthHeaders(token, type),
    },
  )
}

export async function deleteUnavailability(
  listingId: string,
  unavailabilityId: string,
  token: string,
  type = 'Bearer',
): Promise<void> {
  return apiRequest<void>(`/listings/${listingId}/unavailability/${unavailabilityId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token, type),
  })
}