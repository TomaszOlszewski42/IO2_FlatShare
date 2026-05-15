import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render } from 'preact'
import { act } from 'preact/test-utils'
import { ListingsPage } from './listings-page'
import * as listingsApi from '../../services/listings-api'
import * as useAuthHook from '../../hooks/use-auth'

vi.mock('../../services/listings-api', () => ({
  getListings: vi.fn(),
}))

vi.mock('../../hooks/use-auth', () => ({
  useAuth: vi.fn(),
}))

// Mock out the heavy components
vi.mock('../../components/listings/listing-card', () => ({ ListingCard: () => <div /> }))
vi.mock('../../components/listings/listings-empty-state', () => ({ ListingsEmptyState: () => <div /> }))
vi.mock('../../components/listings/listings-pagination', () => ({ ListingsPagination: () => <div /> }))
vi.mock('../../components/listings/listings-results-summary', () => ({ ListingsResultsSummary: () => <div /> }))
vi.mock('../../components/listings/listings-skeleton', () => ({ ListingsSkeleton: () => <div /> }))
vi.mock('../../components/listings/listings-toolbar', () => ({ ListingsToolbar: () => <div /> }))
vi.mock('../../components/common/info-alert', () => ({ InfoAlert: () => <div /> }))

describe('ListingsPage', () => {
  const flushEffects = async () => {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(listingsApi.getListings).mockResolvedValue([])
    document.body.innerHTML = ''
    
    // Mock window locations and scroll
    window.HTMLElement.prototype.scrollIntoView = vi.fn()
  })

  it('fetches listings with ownerId if user is landlord', async () => {
    vi.mocked(useAuthHook.useAuth).mockReturnValue({
      session: { token: 'abc', type: 'Bearer', userId: 'owner-123' },
      isLandlord: true,
    } as any)

    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<ListingsPage />, container)
    })
    await flushEffects()

    expect(listingsApi.getListings).toHaveBeenCalledWith('abc', { ownerId: 'owner-123' }, 'Bearer')
  })

  it('fetches listings without ownerId if user is not landlord', async () => {
    vi.mocked(useAuthHook.useAuth).mockReturnValue({
      session: { token: 'xyz', type: 'Bearer', userId: 'tenant-456' },
      isLandlord: false,
    } as any)

    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<ListingsPage />, container)
    })
    await flushEffects()

    expect(listingsApi.getListings).toHaveBeenCalledWith('xyz', undefined, 'Bearer')
  })

  it('fetches listings without ownerId if user is admin', async () => {
    vi.mocked(useAuthHook.useAuth).mockReturnValue({
      session: { token: 'admin-token', type: 'Bearer', userId: 'admin-123' },
      isLandlord: false,
      isAdmin: true,
    } as any)

    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<ListingsPage />, container)
    })
    await flushEffects()

    expect(listingsApi.getListings).toHaveBeenCalledWith('admin-token', undefined, 'Bearer')
  })
})
