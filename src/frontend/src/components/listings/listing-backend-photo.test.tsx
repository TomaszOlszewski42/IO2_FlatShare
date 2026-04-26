import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'preact'
import { act } from 'preact/test-utils'

import { readAuthSession } from '../../services/auth-session'
import { ListingBackendPhoto } from './listing-backend-photo'

vi.mock('../../services/auth-session', () => ({
  readAuthSession: vi.fn(),
}))

async function waitForAssertion(assertion: () => void) {
  const timeout = Date.now() + 1000
  let lastError: unknown

  while (Date.now() < timeout) {
    try {
      assertion()
      return
    } catch (error) {
      lastError = error

      await act(async () => {
        await new Promise((resolve) => {
          setTimeout(resolve, 10)
        })
      })
    }
  }

  throw lastError
}

describe('ListingBackendPhoto', () => {
  const createObjectURL = vi.fn(() => 'blob:listing-photo')
  const revokeObjectURL = vi.fn()
  const fetchMock = vi.fn()

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)

    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      writable: true,
      value: createObjectURL,
    })

    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      writable: true,
      value: revokeObjectURL,
    })
  })

  afterEach(() => {
    document.body.innerHTML = ''
    vi.clearAllMocks()
    vi.unstubAllGlobals()
  })

  it('shows loading placeholder before request resolves', () => {
    vi.mocked(readAuthSession).mockReturnValue({
      token: 'access-token',
      sessionId: 'session-1',
      type: 'Bearer',
      roles: ['LANDLORD'],
      userId: 'user-1',
    })

    fetchMock.mockReturnValue(new Promise(() => undefined))

    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ListingBackendPhoto
          listingId="listing-1"
          photoId="photo-1"
          alt="Zdjęcie pokoju"
          loadingClassName="custom-loading"
        />,
        container,
      )
    })

    const loading = container.querySelector('.custom-loading')

    expect(loading).not.toBeNull()
    expect(loading?.getAttribute('aria-hidden')).toBe('true')
  })

  it('renders error state when auth session is missing', async () => {
    vi.mocked(readAuthSession).mockReturnValue(null)

    const container = document.createElement('div')
    document.body.appendChild(container)

    await act(async () => {
      render(
        <ListingBackendPhoto
          listingId="listing-1"
          photoId="photo-1"
          alt="Zdjęcie pokoju"
          errorClassName="custom-error"
        />,
        container,
      )
    })

    await waitForAssertion(() => {
      const error = container.querySelector('.custom-error')

      expect(error).not.toBeNull()
      expect(error?.textContent).toBe('Nie udalo sie zaladowac zdjecia')
    })

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('fetches photo with auth header and renders image after successful response', async () => {
    vi.mocked(readAuthSession).mockReturnValue({
      token: 'access-token',
      sessionId: 'session-1',
      type: 'Bearer',
      roles: ['LANDLORD'],
      userId: 'user-1',
    })

    const blob = new Blob(['photo'], { type: 'image/png' })

    fetchMock.mockResolvedValue({
      ok: true,
      blob: vi.fn().mockResolvedValue(blob),
    } as unknown as Response)

    const container = document.createElement('div')
    document.body.appendChild(container)

    await act(async () => {
      render(
        <ListingBackendPhoto
          listingId="listing-1"
          photoId="photo-1"
          alt="Zdjęcie pokoju"
          className="photo-class"
        />,
        container,
      )
    })

    await waitForAssertion(() => {
      expect(createObjectURL).toHaveBeenCalledTimes(1)
    })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/listings/listing-1/photos/photo-1',
      expect.objectContaining({
        method: 'GET',
        headers: {
          Authorization: 'Bearer access-token',
        },
      }),
    )

    expect(createObjectURL).toHaveBeenCalledWith(blob)

    const image = container.querySelector('img') as HTMLImageElement

    expect(image).not.toBeNull()
    expect(image.src).toBe('blob:listing-photo')
    expect(image.alt).toBe('Zdjęcie pokoju')
    expect(image.getAttribute('loading')).toBe('lazy')
    expect(image.classList.contains('photo-class')).toBe(true)
  })

  it('renders error state when backend response is not ok', async () => {
    vi.mocked(readAuthSession).mockReturnValue({
      token: 'access-token',
      sessionId: 'session-1',
      type: 'Bearer',
      roles: ['LANDLORD'],
      userId: 'user-1',
    })

    fetchMock.mockResolvedValue({
      ok: false,
      status: 404,
    } as Response)

    const container = document.createElement('div')
    document.body.appendChild(container)

    await act(async () => {
      render(
        <ListingBackendPhoto
          listingId="listing-1"
          photoId="missing-photo"
          alt="Zdjęcie pokoju"
          errorClassName="custom-error"
        />,
        container,
      )
    })

    await waitForAssertion(() => {
      const error = container.querySelector('.custom-error')

      expect(error).not.toBeNull()
      expect(error?.textContent).toBe('Nie udalo sie zaladowac zdjecia')
    })

    expect(container.querySelector('img')).toBeNull()
  })
})