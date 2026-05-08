import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'

import { apiRequest } from './api-client'
import { createViolationReport } from './reports-api'

vi.mock('./api-client', () => ({
  apiRequest: vi.fn(),
}))

vi.mock('./auth-session', () => ({
  readAuthSession: vi.fn(() => ({
    token: 'stored-token',
    type: 'Bearer',
  })),
}))

const apiRequestMock = apiRequest as Mock

describe('reports-api', () => {
  beforeEach(() => {
    apiRequestMock.mockReset()
  })

  it('sends listing report target type as backend enum code', async () => {
    apiRequestMock.mockResolvedValue({ id: 'report-1' })

    await createViolationReport(
      {
        type: 'LISTING',
        targetId: '11111111-1111-1111-1111-111111111111',
        reason: '  Spam  ',
        details: '  Duplicate listing  ',
      },
      'token-1',
      'Bearer',
    )

    expect(apiRequestMock).toHaveBeenCalledWith('/reports', {
      method: 'POST',
      body: {
        type: 0,
        targetId: '11111111-1111-1111-1111-111111111111',
        reason: 'Spam',
        details: 'Duplicate listing',
      },
      headers: {
        Authorization: 'Bearer token-1',
      },
    })
  })

  it('sends user report target type as backend enum code', async () => {
    apiRequestMock.mockResolvedValue({ id: 'report-2' })

    await createViolationReport(
      {
        type: 'USER',
        targetId: '22222222-2222-2222-2222-222222222222',
        reason: 'Other reason',
        details: null,
      },
      'token-2',
      'Bearer',
    )

    expect(apiRequestMock).toHaveBeenCalledWith('/reports', {
      method: 'POST',
      body: {
        type: 1,
        targetId: '22222222-2222-2222-2222-222222222222',
        reason: 'Other reason',
        details: '',
      },
      headers: {
        Authorization: 'Bearer token-2',
      },
    })
  })
})