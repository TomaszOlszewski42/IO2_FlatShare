import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { apiRequest } from './api-client'
import { 
  publishListing, 
  submitListing, 
  requestFixesListing,
  archiveListing,
  hideListing
} from './listings-api'

vi.mock('./api-client', () => ({
  apiRequest: vi.fn(),
}))

const apiRequestMock = apiRequest as Mock

describe('listings-api', () => {
  beforeEach(() => {
    apiRequestMock.mockReset()
  })

  describe('publishListing', () => {
    it('makes a PATCH request to publish a listing', async () => {
      apiRequestMock.mockResolvedValue({ listingId: '1', status: 'ACTIVE' })

      await publishListing('1', 'token-1')

      expect(apiRequestMock).toHaveBeenCalledWith('/listings/1/publish', {
        method: 'PATCH',
        headers: {
          Authorization: 'Bearer token-1',
        },
      })
    })
  })

  describe('submitListing', () => {
    it('makes a PATCH request to submit a listing', async () => {
      apiRequestMock.mockResolvedValue({ listingId: '1', status: 'AWAITING_REVIEW' })

      await submitListing('1', 'token-1')

      expect(apiRequestMock).toHaveBeenCalledWith('/listings/1/submit', {
        method: 'PATCH',
        headers: {
          Authorization: 'Bearer token-1',
        },
      })
    })
  })

  describe('requestFixesListing', () => {
    it('makes a PATCH request to request fixes for a listing', async () => {
      apiRequestMock.mockResolvedValue({ listingId: '1', status: 'AWAITING_FIXES' })

      await requestFixesListing('1', 'token-1')

      expect(apiRequestMock).toHaveBeenCalledWith('/listings/1/request-fixes', {
        method: 'PATCH',
        headers: {
          Authorization: 'Bearer token-1',
        },
      })
    })
  })

  describe('archiveListing', () => {
    it('makes a PATCH request to archive a listing', async () => {
      apiRequestMock.mockResolvedValue({ listingId: '1', status: 'ARCHIVED' })

      await archiveListing('1', 'token-1')

      expect(apiRequestMock).toHaveBeenCalledWith('/listings/1/archive', {
        method: 'PATCH',
        headers: {
          Authorization: 'Bearer token-1',
        },
      })
    })
  })

  describe('hideListing', () => {
    it('makes a PATCH request to hide a listing', async () => {
      apiRequestMock.mockResolvedValue({ listingId: '1', status: 'HIDDEN' })

      await hideListing('1', 'token-1')

      expect(apiRequestMock).toHaveBeenCalledWith('/listings/1/hide', {
        method: 'PATCH',
        headers: {
          Authorization: 'Bearer token-1',
        },
      })
    })
  })
})
