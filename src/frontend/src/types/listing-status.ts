export const LISTING_STATUSES = [
  'DRAFT',
  'UNDER_REVIEW',
  'AWAITING_REVIEW',
  'AWAITING_FIXES',
  'ACTIVE',
  'HIDDEN',
  'ARCHIVED',
  'HIDDEN_BY_MODERATION',
] as const

export type ListingStatus = (typeof LISTING_STATUSES)[number]