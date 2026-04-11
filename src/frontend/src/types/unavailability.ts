export interface Unavailability {
  id: string
  listingId: string
  startDate: string
  endDate: string
  reason?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface CreateUnavailabilityPayload {
  startDate: string
  endDate: string
  reason?: string
}

export interface UpdateUnavailabilityPayload {
  startDate?: string
  endDate?: string
  reason?: string
}