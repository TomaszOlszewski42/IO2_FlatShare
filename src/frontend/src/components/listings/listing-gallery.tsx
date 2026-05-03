import { useState } from 'preact/hooks'

import { ListingBackendPhoto } from './listing-backend-photo'
import { ListingSection } from './listing-section'

type ListingGalleryProps = {
  listingId: string
  photoIds: string[]
  title: string
}

export function ListingGallery({ listingId, photoIds, title }: ListingGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (photoIds.length === 0) {
    return null
  }

  const selectedPhotoId = photoIds[selectedIndex]

  if (!selectedPhotoId) {
    return null
  }

  return (
    <>
      <ListingSection title="Gallery">
        <div class="space-y-3">
          <button
            type="button"
            class="relative w-full overflow-hidden rounded-box border border-base-300"
            onClick={() => setIsModalOpen(true)}
          >
            <ListingBackendPhoto
              listingId={listingId}
              photoId={selectedPhotoId}
              alt={`Photo ${selectedIndex + 1} for the ${title} listing`}
              className="h-72 w-full object-cover md:h-96"
              loadingClassName="skeleton h-72 w-full md:h-96"
              errorClassName="flex h-72 w-full items-center justify-center bg-base-200 text-sm text-base-content/60 md:h-96"
            />
            <span class="absolute bottom-2 right-2 badge badge-neutral badge-sm">Click to enlarge</span>
          </button>

          <div class="grid grid-cols-4 gap-2 md:grid-cols-6">
            {photoIds.map((photoId, index) => (
              <button
                key={photoId}
                type="button"
                onClick={() => setSelectedIndex(index)}
                class={`aspect-square overflow-hidden rounded-box border transition ${index === selectedIndex ? 'border-primary shadow-sm' : 'border-base-300 opacity-80 hover:opacity-100'}`}
                aria-label={`Select photo ${index + 1}`}
              >
                <ListingBackendPhoto
                  listingId={listingId}
                  photoId={photoId}
                  alt={`Thumbnail ${index + 1} for the ${title} listing`}
                  className="h-full w-full object-cover"
                  loadingClassName="skeleton h-full w-full"
                  errorClassName="flex h-full w-full items-center justify-center bg-base-200 text-xs text-base-content/60"
                />
              </button>
            ))}
          </div>
        </div>
      </ListingSection>

      {isModalOpen ? (
        <dialog class="modal modal-open" aria-modal="true" role="dialog">
          <div class="modal-box max-w-5xl bg-base-100 p-3">
            <ListingBackendPhoto
              listingId={listingId}
              photoId={selectedPhotoId}
              alt={`Preview of photo ${selectedIndex + 1} for the ${title} listing`}
              className="max-h-[80vh] w-full rounded-box object-contain"
              loadingClassName="skeleton h-[60vh] w-full rounded-box"
              errorClassName="flex h-[60vh] w-full items-center justify-center rounded-box bg-base-200 text-sm text-base-content/60"
            />

            <div class="modal-action mt-3">
              <button type="button" class="btn btn-ghost" onClick={() => setIsModalOpen(false)}>
                Close
              </button>
            </div>
        </div>
          <form method="dialog" class="modal-backdrop" onSubmit={() => setIsModalOpen(false)}>
            <button aria-label="Close preview">close</button>
          </form>
        </dialog>
      ) : null}
    </>
  )
}
