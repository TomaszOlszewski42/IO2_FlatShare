export type ListingStatus = 'DRAFT' | 'UNDER_REVIEW' | 'ACTIVE' | 'HIDDEN' | 'ARCHIVED'

const statusLabels: Record<ListingStatus, string> = {
  DRAFT: 'Szkic',
  UNDER_REVIEW: 'W moderacji',
  ACTIVE: 'Aktywne',
  HIDDEN: 'Ukryte',
  ARCHIVED: 'Zarchiwizowane',
}

export function formatStatusLabel(status: ListingStatus): string {
  return statusLabels[status]
}
