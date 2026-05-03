import type { ListingStatus } from '../types/listing-status'

const statusLabels: Record<ListingStatus, string> = {
  DRAFT: 'Draft',
  UNDER_REVIEW: 'Under review',
  AWAITING_REVIEW: 'Awaiting review',
  AWAITING_FIXES: 'Awaiting fixes',
  ACTIVE: 'Active',
  HIDDEN: 'Hidden',
  ARCHIVED: 'Archived',
  HIDDEN_BY_MODERATION: 'Hidden by moderation',
}

export function formatStatusLabel(status: ListingStatus): string {
  return statusLabels[status]
}
