import { useEffect, useState } from 'preact/hooks'

import { useAuth } from '../../hooks/use-auth'
import { getListingPhotoIds } from '../../services/listings-api'
import { ListingBackendPhoto } from './listing-backend-photo'

type ListingCardPhotoProps = {
  listingId: string
  title: string
}

export function ListingCardPhoto({ listingId, title }: ListingCardPhotoProps) {
  const { session } = useAuth()
  const [photoId, setPhotoId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!session) {
      setPhotoId(null)
      setIsLoading(false)
      return
    }

    let isMounted = true

    setIsLoading(true)

    void getListingPhotoIds(listingId, session.token, session.type)
      .then((photoIds) => {
        if (isMounted) {
          setPhotoId(photoIds[0] ?? null)
        }
      })
      .catch(() => {
        if (isMounted) {
          setPhotoId(null)
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [listingId, session])

  if (isLoading) {
    return <div class="skeleton h-44 w-full" aria-hidden="true" />
  }

  if (!photoId) {
    return (
      <div class="flex h-44 w-full flex-col items-center justify-center gap-2 bg-base-200 text-base-content/55">
        <span class="text-3xl" aria-hidden="true">
          🏠
        </span>
        <span class="text-sm">No photo available</span>
      </div>
    )
  }

  return (
    <ListingBackendPhoto
      listingId={listingId}
      photoId={photoId}
      alt={`Photo of ${title}`}
      className="h-44 w-full object-cover"
      loadingClassName="skeleton h-44 w-full"
      errorClassName="flex h-44 w-full items-center justify-center bg-base-200 text-sm text-base-content/60"
    />
  )
}