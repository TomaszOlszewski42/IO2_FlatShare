import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'

import { apiRequest } from './api-client'
import { addListingOpinion, getListingOpinions } from './opinion-api'

vi.mock('./api-client', () => ({
  apiRequest: vi.fn(),
}))

const apiRequestMock = apiRequest as Mock

describe('opinion-api', () => {
  beforeEach(() => {
    apiRequestMock.mockReset()
  })

  describe('getListingOpinions', () => {
    it('makes an authenticated GET request to the opinions endpoint', async () => {
      apiRequestMock.mockResolvedValue([])

      await getListingOpinions('listing-1', 'token-1')

      expect(apiRequestMock).toHaveBeenCalledWith('/listings/listing-1/opinions', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer token-1',
        },
      })
    })

    it('returns the array returned by apiRequest', async () => {
      const mockOpinions = [
        {
          id: 'op-1',
          listingId: 'listing-1',
          userId: 'user-1',
          rating: 4,
          comment: 'Great place',
          createdAt: '2026-05-01T10:00:00Z',
        },
      ]
      apiRequestMock.mockResolvedValue(mockOpinions)

      const result = await getListingOpinions('listing-1')

      expect(result).toEqual(mockOpinions)
    })
  })

  describe('addListingOpinion', () => {
    it('makes an authenticated POST request with the opinion payload', async () => {
      const createdOpinion = {
        id: 'op-2',
        listingId: 'listing-1',
        userId: 'user-2',
        rating: 5,
        comment: 'Perfect',
        createdAt: '2026-05-02T12:00:00Z',
      }
      apiRequestMock.mockResolvedValue(createdOpinion)

      await addListingOpinion(
        'listing-1',
        { listingId: 'listing-1', rating: 5, comment: 'Perfect' },
        'my-token',
      )

      expect(apiRequestMock).toHaveBeenCalledWith('/listings/listing-1/opinions', {
        method: 'POST',
        body: { listingId: 'listing-1', rating: 5, comment: 'Perfect' },
        headers: { Authorization: 'Bearer my-token' },
      })
    })

    it('forwards a custom token type in the Authorization header', async () => {
      apiRequestMock.mockResolvedValue({})

      await addListingOpinion(
        'listing-2',
        { listingId: 'listing-2', rating: 3, comment: '' },
        'custom-token',
        'Token',
      )

      expect(apiRequestMock).toHaveBeenCalledWith(
        '/listings/listing-2/opinions',
        expect.objectContaining({
          headers: { Authorization: 'Token custom-token' },
        }),
      )
    })

    it('returns the created opinion returned by apiRequest', async () => {
      const created = {
        id: 'op-3',
        listingId: 'listing-3',
        userId: 'user-3',
        rating: 2,
        comment: 'Not great',
        createdAt: '2026-05-03T08:00:00Z',
      }
      apiRequestMock.mockResolvedValue(created)

      const result = await addListingOpinion(
        'listing-3',
        { listingId: 'listing-3', rating: 2, comment: 'Not great' },
        'tok',
      )

      expect(result).toEqual(created)
    })
  })
})
