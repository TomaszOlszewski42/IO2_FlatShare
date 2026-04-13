import { useState } from 'preact/hooks'

import { ListingSection } from './listing-section'
import { ListingGalleryThumbnail } from './listing-gallery-thumbnail'
import { ListingImageModal } from './listing-image-modal'

type ListingGalleryProps = {
  images: Array<{
    src: string
    alt: string
  }>
}

export function ListingGallery({ images }: ListingGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const selectedImage = images[selectedIndex]

  return (
    <>
      <ListingSection title="Galeria">
        <button
          type="button"
          class="relative overflow-hidden rounded-box border border-base-300"
          onClick={() => setIsModalOpen(true)}
        >
          <img src={selectedImage.src} alt={selectedImage.alt} class="h-72 w-full object-cover md:h-96" />
          <span class="absolute bottom-2 right-2 badge badge-neutral badge-sm">Kliknij, aby powiekszyc</span>
        </button>

        <div class="grid grid-cols-4 gap-2 md:grid-cols-6">
          {images.map((image, index) => (
            <ListingGalleryThumbnail
              key={image.src}
              src={image.src}
              alt={image.alt}
              active={index === selectedIndex}
              onClick={() => setSelectedIndex(index)}
            />
          ))}
        </div>
      </ListingSection>

      <ListingImageModal
        isOpen={isModalOpen}
        src={selectedImage.src}
        alt={selectedImage.alt}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}
