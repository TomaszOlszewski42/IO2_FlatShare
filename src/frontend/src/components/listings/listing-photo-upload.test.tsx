import { mount } from 'enzyme'
import { describe, expect, it, vi, beforeEach } from 'vitest'
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

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(authSession.readAuthSession).mockReturnValue(mockSession as any)
    vi.mocked(listingsApi.getListingPhotoIds).mockResolvedValue(['p1', 'p2'])
  })

  it('renders correctly and fetches photos on mount', async () => {
    const wrapper = mount(<ListingPhotoUpload listingId={mockListingId} />)
    
    // Wait for useEffect
    await new Promise(resolve => setTimeout(resolve, 0))
    wrapper.update()

    expect(listingsApi.getListingPhotoIds).toHaveBeenCalledWith(mockListingId, 'abc', 'Bearer')
    expect(wrapper.find('[data-test-id="photo"]').length).toBe(2)
  })

  it('handles file upload', async () => {
    vi.mocked(listingsApi.uploadPhoto).mockResolvedValue(undefined as any)
    const onPhotosChange = vi.fn()
    const wrapper = mount(<ListingPhotoUpload listingId={mockListingId} onPhotosChange={onPhotosChange} />)
    
    await new Promise(resolve => setTimeout(resolve, 0))
    wrapper.update()

    const file = new File([''], 'test.jpg', { type: 'image/jpeg' })
    const input = wrapper.find('input[type="file"]')
    
    // Enzyme simulation might be tricky with change events on file inputs
    // but we can call the handler directly if needed or use simulate
    input.simulate('change', { target: { files: [file] } })

    expect(listingsApi.uploadPhoto).toHaveBeenCalled()
    // uploadPhoto should be called with file
    expect(listingsApi.uploadPhoto).toHaveBeenCalledWith(mockListingId, file, 'abc', 'Bearer')
  })

  it('handles photo deletion', async () => {
    vi.mocked(listingsApi.deletePhoto).mockResolvedValue(undefined as any)
    const onPhotosChange = vi.fn()
    const wrapper = mount(<ListingPhotoUpload listingId={mockListingId} onPhotosChange={onPhotosChange} />)
    
    await new Promise(resolve => setTimeout(resolve, 0))
    wrapper.update()

    const deleteBtn = wrapper.find('button[title="Usuń zdjęcie"]').first()
    deleteBtn.simulate('click')

    expect(listingsApi.deletePhoto).toHaveBeenCalledWith(mockListingId, 'p1', 'abc', 'Bearer')
  })
})
