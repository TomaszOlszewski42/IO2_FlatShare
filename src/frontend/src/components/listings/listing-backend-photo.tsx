import { useEffect, useState } from 'preact/hooks'

import { readAuthSession } from '../../services/auth-session'

type ListingBackendPhotoProps = {
  listingId: string
  photoId: string
  alt: string
  className?: string
  loadingClassName?: string
  errorClassName?: string
}

export function ListingBackendPhoto({
  listingId,
  photoId,
  alt,
  className = '',
  loadingClassName = 'skeleton h-48 w-full rounded-box',
  errorClassName = 'flex h-48 w-full items-center justify-center rounded-box border border-base-300 bg-base-200 text-sm text-base-content/60',
}: ListingBackendPhotoProps) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const session = readAuthSession()

    if (!session) {
      setIsLoading(false)
      setHasError(true)
      setPhotoUrl(null)
      return
    }

    const controller = new AbortController()
    let objectUrl: string | null = null

    setIsLoading(true)
    setHasError(false)

    void fetch(`/api/v1/listings/${listingId}/photos/${photoId}`, {
      method: 'GET',
      headers: {
        Authorization: `${session.type} ${session.token}`,
      },
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }

        const blob = await response.blob()
        objectUrl = URL.createObjectURL(blob)
        setPhotoUrl(objectUrl)
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }

        setPhotoUrl(null)
        setHasError(true)
      })
      .finally(() => {
        setIsLoading(false)
      })

    return () => {
      controller.abort()

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [listingId, photoId])

  if (isLoading) {
    return <div class={loadingClassName} aria-hidden="true" />
  }

  if (!photoUrl || hasError) {
    return <div class={errorClassName}>Nie udalo sie zaladowac zdjecia</div>
  }

  return <img src={photoUrl} alt={alt} class={className} loading="lazy" />
}