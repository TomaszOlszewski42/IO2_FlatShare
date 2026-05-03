import { afterEach, describe, expect, it, vi } from 'vitest'
import { render } from 'preact'
import { act } from 'preact/test-utils'

import { ListingGallery } from './listing-gallery'

vi.mock('./listing-backend-photo', () => ({
  ListingBackendPhoto: ({
    listingId,
    photoId,
    alt,
    className,
  }: {
    listingId: string
    photoId: string
    alt: string
    className?: string
  }) => (
    <img
      data-testid="backend-photo"
      data-listing-id={listingId}
      data-photo-id={photoId}
      alt={alt}
      class={className}
    />
  ),
}))

describe('ListingGallery', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    vi.clearAllMocks()
  })

  it('renders nothing when listing has no photos', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<ListingGallery listingId="listing-1" photoIds={[]} title="Room" />, container)
    })

    expect(container.textContent).toBe('')
    expect(container.querySelector('[data-testid="backend-photo"]')).toBeNull()
  })

  it('renders selected main photo and thumbnails', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ListingGallery
          listingId="listing-1"
          photoIds={['photo-1', 'photo-2', 'photo-3']}
          title="Bright room"
        />,
        container,
      )
    })

    const photos = container.querySelectorAll('[data-testid="backend-photo"]')
    const thumbnailButtons = container.querySelectorAll('button[aria-label^="Select photo"]')

    expect(container.textContent).toContain('Gallery')
    expect(photos.length).toBe(4)
    expect(photos[0]?.getAttribute('data-photo-id')).toBe('photo-1')
    expect(photos[0]?.getAttribute('alt')).toBe('Photo 1 for the Bright room listing')
    expect(thumbnailButtons.length).toBe(3)
  })

  it('changes selected photo after clicking thumbnail', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ListingGallery
          listingId="listing-1"
          photoIds={['photo-1', 'photo-2']}
          title="Bright room"
        />,
        container,
      )
    })

    const secondThumbnail = container.querySelector(
      'button[aria-label="Select photo 2"]',
    ) as HTMLButtonElement

    act(() => {
      secondThumbnail.click()
    })

    const photos = container.querySelectorAll('[data-testid="backend-photo"]')

    expect(photos[0]?.getAttribute('data-photo-id')).toBe('photo-2')
    expect(photos[0]?.getAttribute('alt')).toBe('Photo 2 for the Bright room listing')
  })

  it('opens and closes photo preview modal', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ListingGallery
          listingId="listing-1"
          photoIds={['photo-1']}
          title="Bright room"
        />,
        container,
      )
    })

    const mainPhotoButton = container.querySelector('button.relative') as HTMLButtonElement

    act(() => {
      mainPhotoButton.click()
    })

    const dialog = container.querySelector('[role="dialog"]')

    expect(dialog).not.toBeNull()
    expect(dialog?.classList.contains('modal-open')).toBe(true)
    expect(container.textContent).toContain('Close')

    const previewPhoto = Array.from(container.querySelectorAll('[data-testid="backend-photo"]')).find(
      (photo) => photo.getAttribute('alt') === 'Preview of photo 1 for the Bright room listing',
    )

    expect(previewPhoto).not.toBeUndefined()

    const closeButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Close',
    ) as HTMLButtonElement

    act(() => {
      closeButton.click()
    })

    expect(container.querySelector('[role="dialog"]')).toBeNull()
  })
})