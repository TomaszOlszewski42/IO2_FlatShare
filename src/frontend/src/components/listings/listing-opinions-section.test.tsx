import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'preact'
import { act } from 'preact/test-utils'

import { useAuth } from '../../hooks/use-auth'
import * as opinionApi from '../../services/opinion-api'
import * as authSession from '../../services/auth-session'
import * as errorHandlerCtx from '../../services/error-handler-context'
import { ListingOpinionsSection } from './listing-opinions-section'
import type { ListingOpinion } from '../../types/opinion'

vi.mock('../../hooks/use-auth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('../../services/opinion-api', () => ({
  getListingOpinions: vi.fn(),
  addListingOpinion: vi.fn(),
}))

vi.mock('../../services/auth-session', () => ({
  readAuthSession: vi.fn(),
}))

vi.mock('../../services/error-handler-context', () => ({
  useErrorHandler: vi.fn(),
}))

// Stub out ListingSection to avoid pulling in the full component tree
vi.mock('./listing-section', () => ({
  ListingSection: ({ title, children }: { title: string; children: unknown }) => (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  ),
}))

const sampleOpinions: ListingOpinion[] = [
  {
    id: 'op-1',
    listingId: 'listing-1',
    userId: 'user-1',
    rating: 5,
    comment: 'Wonderful flat!',
    createdAt: '2026-05-01T10:00:00Z',
  },
  {
    id: 'op-2',
    listingId: 'listing-1',
    userId: 'user-2',
    rating: 3,
    comment: 'Decent location.',
    createdAt: '2026-05-02T10:00:00Z',
  },
]

function mockAsTenant() {
  vi.mocked(useAuth).mockReturnValue({
    isAuthenticated: true,
    session: { token: 'tok', sessionId: 's1', type: 'Bearer', roles: ['TENANT'], userId: 'u1' },
    hasRole: vi.fn(() => false),
    isTenant: true,
    isLandlord: false,
    isAdmin: false,
  })
}

function mockAsLandlord() {
  vi.mocked(useAuth).mockReturnValue({
    isAuthenticated: true,
    session: {
      token: 'tok',
      sessionId: 's1',
      type: 'Bearer',
      roles: ['LANDLORD'],
      userId: 'u1',
    },
    hasRole: vi.fn(() => false),
    isTenant: false,
    isLandlord: true,
    isAdmin: false,
  })
}

describe('ListingOpinionsSection', () => {
  const showToast = vi.fn()

  beforeEach(() => {
    vi.mocked(errorHandlerCtx.useErrorHandler).mockReturnValue({
      showToast,
    } as any)
    showToast.mockReset()
  })

  afterEach(() => {
    document.body.innerHTML = ''
    vi.clearAllMocks()
  })

  it('renders the section title', async () => {
    mockAsTenant()
    vi.mocked(opinionApi.getListingOpinions).mockResolvedValue([])

    const container = document.createElement('div')
    document.body.appendChild(container)

    await act(async () => {
      render(<ListingOpinionsSection listingId="listing-1" />, container)
    })

    expect(container.textContent).toContain('Opinions')
    expect(opinionApi.getListingOpinions).toHaveBeenCalledWith('listing-1', 'tok', 'Bearer')
  })

  it('does not fetch opinions if session is missing', async () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      session: null,
      hasRole: vi.fn(() => false),
      isTenant: false,
      isLandlord: false,
      isAdmin: false,
    })

    const container = document.createElement('div')
    document.body.appendChild(container)

    await act(async () => {
      render(<ListingOpinionsSection listingId="listing-1" />, container)
    })

    expect(opinionApi.getListingOpinions).not.toHaveBeenCalled()
  })

  it('shows a skeleton while opinions are loading', () => {
    mockAsTenant()
    // Never resolves during the test
    vi.mocked(opinionApi.getListingOpinions).mockReturnValue(new Promise(() => {}))

    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<ListingOpinionsSection listingId="listing-1" />, container)
    })

    expect(container.querySelector('.skeleton')).not.toBeNull()
  })

  const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0))

  it('shows an empty state message when there are no opinions', async () => {
    mockAsTenant()
    vi.mocked(opinionApi.getListingOpinions).mockResolvedValue([])

    const container = document.createElement('div')
    document.body.appendChild(container)

    await act(async () => {
      render(<ListingOpinionsSection listingId="listing-1" />, container)
    })
    
    // Wait for the useEffect promise to resolve and state to update
    await act(async () => {
      await flushPromises()
    })

    expect(container.textContent).toContain('No opinions yet')
  })

  it('renders each opinion comment after loading', async () => {
    mockAsTenant()
    vi.mocked(opinionApi.getListingOpinions).mockResolvedValue(sampleOpinions)

    const container = document.createElement('div')
    document.body.appendChild(container)

    await act(async () => {
      render(<ListingOpinionsSection listingId="listing-1" />, container)
    })

    // Wait for the useEffect promise to resolve and state to update
    await act(async () => {
      await flushPromises()
    })

    expect(container.textContent).toContain('Wonderful flat!')
    expect(container.textContent).toContain('Decent location.')
  })

  it('shows the write form for tenants', async () => {
    mockAsTenant()
    vi.mocked(opinionApi.getListingOpinions).mockResolvedValue([])

    const container = document.createElement('div')
    document.body.appendChild(container)

    await act(async () => {
      render(<ListingOpinionsSection listingId="listing-1" />, container)
    })

    expect(container.textContent).toContain('Leave your opinion')

    const submitButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Submit opinion'),
    )
    expect(submitButton).not.toBeUndefined()
  })

  it('does not show the write form for landlords', async () => {
    mockAsLandlord()
    vi.mocked(opinionApi.getListingOpinions).mockResolvedValue([])

    const container = document.createElement('div')
    document.body.appendChild(container)

    await act(async () => {
      render(<ListingOpinionsSection listingId="listing-1" />, container)
    })

    expect(container.textContent).not.toContain('Leave your opinion')
  })

  it('shows a validation error when submitting without selecting a rating', async () => {
    mockAsTenant()
    vi.mocked(opinionApi.getListingOpinions).mockResolvedValue([])
    vi.mocked(authSession.readAuthSession).mockReturnValue({
      token: 'tok',
      sessionId: 's1',
      type: 'Bearer',
      roles: ['TENANT'],
      userId: 'u1',
    })

    const container = document.createElement('div')
    document.body.appendChild(container)

    await act(async () => {
      render(<ListingOpinionsSection listingId="listing-1" />, container)
    })

    const form = container.querySelector('#add-opinion-form') as HTMLFormElement

    await act(async () => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    })

    expect(container.textContent).toContain('Please select a rating')
    expect(opinionApi.addListingOpinion).not.toHaveBeenCalled()
  })

  it('prepends the new opinion to the list after a successful submission', async () => {
    mockAsTenant()
    vi.mocked(opinionApi.getListingOpinions).mockResolvedValue([])

    const newOpinion: ListingOpinion = {
      id: 'op-new',
      listingId: 'listing-1',
      userId: 'u1',
      rating: 4,
      comment: 'Nice place',
      createdAt: '2026-05-10T09:00:00Z',
    }
    vi.mocked(opinionApi.addListingOpinion).mockResolvedValue(newOpinion)
    vi.mocked(authSession.readAuthSession).mockReturnValue({
      token: 'tok',
      sessionId: 's1',
      type: 'Bearer',
      roles: ['TENANT'],
      userId: 'u1',
    })

    const container = document.createElement('div')
    document.body.appendChild(container)

    await act(async () => {
      render(<ListingOpinionsSection listingId="listing-1" />, container)
    })

    // Select rating 4
    const ratingInputs = container.querySelectorAll<HTMLInputElement>(
      `input[name="opinion-rating-listing-1"][type="radio"]:not(.rating-hidden)`,
    )
    await act(async () => {
      ratingInputs[3]?.click() // index 3 = star 4
    })

    const form = container.querySelector('#add-opinion-form') as HTMLFormElement
    await act(async () => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    })

    expect(opinionApi.addListingOpinion).toHaveBeenCalledOnce()
    expect(container.textContent).toContain('Nice place')
    expect(showToast).toHaveBeenCalledWith('Your opinion has been submitted.', 'success')
  })
})
