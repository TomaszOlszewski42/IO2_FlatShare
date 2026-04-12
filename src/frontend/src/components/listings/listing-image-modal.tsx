import { AppButton } from '../ui/app-button'

type ListingImageModalProps = {
  isOpen: boolean
  src: string
  alt: string
  onClose: () => void
}

export function ListingImageModal({ isOpen, src, alt, onClose }: ListingImageModalProps) {
  if (!isOpen) {
    return null
  }

  return (
    <dialog class="modal modal-open" aria-modal="true" role="dialog">
      <div class="modal-box max-w-4xl bg-base-100 p-3">
        <img src={src} alt={alt} class="max-h-[80vh] w-full rounded-box object-contain" />
        <div class="modal-action mt-3">
          <AppButton variant="ghost" onClick={onClose}>
            Zamknij
          </AppButton>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop" onSubmit={onClose}>
        <button aria-label="Zamknij podglad">close</button>
      </form>
    </dialog>
  )
}
