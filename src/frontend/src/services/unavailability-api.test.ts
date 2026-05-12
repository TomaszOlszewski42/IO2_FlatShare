import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'

import { apiRequest } from './api-client'
import {
  createUnavailability,
  deleteUnavailability,
  getListingUnavailability,
  updateUnavailability,
} from './unavailability-api'

vi.mock('./api-client', () => ({
  apiRequest: vi.fn(),
}))

const apiRequestMock = apiRequest as Mock

describe('unavailability-api', () => {
  beforeEach(() => {
    apiRequestMock.mockReset()
  })

  describe('getListingUnavailability', () => {
    it('makes a GET request to fetch unavailabilities', async () => {
      apiRequestMock.mockResolvedValue([])

      await getListingUnavailability('listing-1', 'token-1')

      expect(apiRequestMock).toHaveBeenCalledWith('/listings/listing-1/unavailability', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer token-1',
        },
      })
    })
  })

  describe('createUnavailability', () => {
    it('maps startDate and endDate to from and to in the backend payload', async () => {
      apiRequestMock.mockResolvedValue({ id: 'u-1' })

      await createUnavailability(
        'listing-1',
        {
          startDate: '2026-06-01',
          endDate: '2026-06-10',
          reason: 'Maintenance',
        },
        'token-1',
      )

      expect(apiRequestMock).toHaveBeenCalledWith('/listings/listing-1/unavailability', {
        method: 'POST',
        body: {
          from: '2026-06-01',
          to: '2026-06-10',
        },
        headers: {
          Authorization: 'Bearer token-1',
        },
      })
    })
  })

  describe('updateUnavailability', () => {
    it('makes a PATCH request to update unavailability', async () => {
      apiRequestMock.mockResolvedValue({ id: 'u-1' })

      await updateUnavailability(
        'listing-1',
        'u-1',
        {
          reason: 'Other reason',
        },
        'token-1',
      )

      expect(apiRequestMock).toHaveBeenCalledWith('/listings/listing-1/unavailability/u-1', {
        method: 'PATCH',
        body: {
          reason: 'Other reason',
        },
        headers: {
          Authorization: 'Bearer token-1',
        },
      })
    })
  })

  describe('deleteUnavailability', () => {
    it('makes a DELETE request to remove unavailability', async () => {
      apiRequestMock.mockResolvedValue(undefined)

      await deleteUnavailability('listing-1', 'u-1', 'token-1')

      expect(apiRequestMock).toHaveBeenCalledWith('/listings/listing-1/unavailability/u-1', {
        method: 'DELETE',
        headers: {
          Authorization: 'Bearer token-1',
        },
      })
    })
  })
})
