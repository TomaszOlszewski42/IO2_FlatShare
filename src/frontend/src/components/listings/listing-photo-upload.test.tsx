import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render } from 'preact'
import { act } from 'preact/test-utils'
import { ListingPhotoUpload } from './listing-photo-upload'
import * as listingsApi from '../../services/listings-api'
import * as authSession from '../../services/auth-session'

vi.mock('../../services/listings-api', () => ({
  getListingPhotoIds: vi.fn(),
  uploadPhoto: vi.fn(),
  deletePhoto: vi.fn(),
}))

vi.mock('../../services/auth-session', () => ({
  readAuthSession: vi.fn(),
}))

vi.mock('./listing-backend-photo', () => ({
  ListingBackendPhoto: () => <div data-test-id="photo" />,
}))

describe('ListingPhotoUpload', () => {
  const mockListingId = '123'
  const mockSession = { token: 'abc', type: 'Bearer' }

  const flushEffects = async () => {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(authSession.readAuthSession).mockReturnValue(mockSession as any)
    vi.mocked(listingsApi.getListingPhotoIds).mockResolvedValue(['p1', 'p2'])
    document.body.innerHTML = ''
  })

  it('renders correctly and fetches photos on mount', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<ListingPhotoUpload listingId={mockListingId} />, container)
    })

    await flushEffects()

    expect(listingsApi.getListingPhotoIds).toHaveBeenCalledWith(mockListingId, 'abc', 'Bearer')
    expect(container.querySelectorAll('[data-test-id="photo"]').length).toBe(2)
  })

  it('handles file upload', async () => {
    vi.mocked(listingsApi.uploadPhoto).mockResolvedValue(undefined as any)
    const onPhotosChange = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<ListingPhotoUpload listingId={mockListingId} onPhotosChange={onPhotosChange} />, container)
    })

    await flushEffects()

    const file = new File([''], 'test.jpg', { type: 'image/jpeg' })
    const input = container.querySelector('input[type="file"]') as HTMLInputElement

    Object.defineProperty(input, 'files', {
      value: [file],
      configurable: true,
    })

    await act(async () => {
      input.dispatchEvent(new Event('change', { bubbles: true }))
      await Promise.resolve()
    })

    expect(listingsApi.uploadPhoto).toHaveBeenCalled()
    expect(listingsApi.uploadPhoto).toHaveBeenCalledWith(mockListingId, file, 'abc', 'Bearer')
    expect(onPhotosChange).toHaveBeenCalled()
  })

  it('handles photo deletion', async () => {
    vi.mocked(listingsApi.deletePhoto).mockResolvedValue(undefined as any)
    const onPhotosChange = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<ListingPhotoUpload listingId={mockListingId} onPhotosChange={onPhotosChange} />, container)
    })

    await flushEffects()

    const deleteBtn = container.querySelector('button[title="Usuń zdjęcie"]') as HTMLButtonElement

    await act(async () => {
      deleteBtn.click()
      await Promise.resolve()
    })

    expect(listingsApi.deletePhoto).toHaveBeenCalledWith(mockListingId, 'p1', 'abc', 'Bearer')
    expect(onPhotosChange).toHaveBeenCalled()
  })
})
