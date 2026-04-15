import { useState, useEffect } from 'preact/hooks'
import { AppButton } from '../ui/app-button'
import { ListingBackendPhoto } from './listing-backend-photo'
import { getListingPhotoIds, uploadPhoto, deletePhoto } from '../../services/listings-api'
import { readAuthSession } from '../../services/auth-session'

type ListingPhotoUploadProps = {
  listingId: string
  onPhotosChange?: () => void
}

export function ListingPhotoUpload({ listingId, onPhotosChange }: ListingPhotoUploadProps) {
  const [photoIds, setPhotoIds] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPhotos = async () => {
    const session = readAuthSession()
    if (!session) return

    try {
      const ids = await getListingPhotoIds(listingId, session.token, session.type)
      setPhotoIds(ids)
    } catch (err) {
      console.error('Failed to fetch photos:', err)
      setError('Nie udało się pobrać zdjęć.')
    }
  }

  useEffect(() => {
    fetchPhotos()
  }, [listingId])

  const handleFileChange = async (e: Event) => {
    const target = e.target as HTMLInputElement
    const files = target.files
    if (!files || files.length === 0) return

    const session = readAuthSession()
    if (!session) return

    setIsUploading(true)
    setError(null)

    try {
      for (let i = 0; i < files.length; i++) {
        await uploadPhoto(listingId, files[i], session.token, session.type)
      }
      await fetchPhotos()
      onPhotosChange?.()
    } catch (err) {
      console.error('Failed to upload photo:', err)
      setError('Nie udało się przesłać niektórych zdjęć.')
    } finally {
      setIsUploading(false)
      target.value = '' // Reset input
    }
  }

  const handleDelete = async (photoId: string) => {
    const session = readAuthSession()
    if (!session) return

    try {
      await deletePhoto(listingId, photoId, session.token, session.type)
      await fetchPhotos()
      onPhotosChange?.()
    } catch (err) {
      console.error('Failed to delete photo:', err)
      setError('Nie udało się usunąć zdjęcia.')
    }
  }

  return (
    <div class="space-y-4 card-body">
      <div>
        <h2 class="text-xl font-semibold">Zdjęcia</h2>
        <p class="text-sm text-base-content/65">Dodaj zdjęcia swojego mieszkania, aby przyciągnąć więcej zainteresowanych.</p>
      </div>

      {error && (
        <div class="alert alert-error text-sm">
          <span>{error}</span>
        </div>
      )}

      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {photoIds.map((id) => (
          <div key={id} class="relative group aspect-square rounded-lg overflow-hidden border border-base-300">
            <ListingBackendPhoto
              listingId={listingId}
              photoId={id}
              alt="Zdjęcie nieruchomości"
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => handleDelete(id)}
              class="absolute top-1 right-1 btn btn-circle btn-xs btn-error opacity-0 group-hover:opacity-100 transition-opacity"
              title="Usuń zdjęcie"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
        
        <label class={`flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-base-300 hover:border-primary hover:bg-base-200 cursor-pointer transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
          <div class="flex flex-col items-center justify-center pt-5 pb-6">
            {isUploading ? (
              <span class="loading loading-spinner loading-md text-primary"></span>
            ) : (
              <>
                <svg class="w-8 h-8 mb-4 text-base-content/50" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                </svg>
                <p class="text-xs text-base-content/60 px-2 text-center">Kliknij, aby dodać</p>
              </>
            )}
          </div>
          <input
            type="file"
            class="hidden"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
      </div>
    </div>
  )
}
