import type { ListingStatus } from '../types/listing-status'

const statusLabels: Record<ListingStatus, string> = {
  DRAFT: 'Szkic',
  UNDER_REVIEW: 'W moderacji',
  AWAITING_REVIEW: 'W oczekiwaniu na akceptacje',
  AWAITING_FIXES: 'Wymaga poprawek',
  ACTIVE: 'Aktywne',
  HIDDEN: 'Ukryte',
  ARCHIVED: 'Zarchiwizowane',
  HIDDEN_BY_MODERATION: 'Ukryte przez moderacje',
}

export function formatStatusLabel(status: ListingStatus): string {
  return statusLabels[status]
}
