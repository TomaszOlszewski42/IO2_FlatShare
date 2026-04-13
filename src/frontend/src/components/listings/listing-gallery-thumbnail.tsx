type ListingGalleryThumbnailProps = {
  src: string
  alt: string
  active: boolean
  onClick: () => void
}

export function ListingGalleryThumbnail({ src, alt, active, onClick }: ListingGalleryThumbnailProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      class={`aspect-square overflow-hidden rounded-box border transition ${active ? 'border-primary shadow-sm' : 'border-base-300 opacity-80 hover:opacity-100'}`}
      aria-label={`Podglad: ${alt}`}
    >
      <img src={src} alt={alt} class="h-full w-full object-cover" loading="lazy" />
    </button>
  )
}
