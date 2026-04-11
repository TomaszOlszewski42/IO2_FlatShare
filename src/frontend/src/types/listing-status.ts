export const LISTING_STATUSES = [
  'DRAFT',
  'UNDER_REVIEW',
  'ACTIVE',
  'HIDDEN',
  'ARCHIVED',
  'HIDDEN_BY_MODERATION',
] as const

export type ListingStatus = (typeof LISTING_STATUSES)[number]