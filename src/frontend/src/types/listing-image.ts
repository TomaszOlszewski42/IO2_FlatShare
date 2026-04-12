export interface ListingImage {
  id: string
  url: string
  alt?: string | null
  fileName?: string | null
  order?: number
  isPrimary?: boolean
}