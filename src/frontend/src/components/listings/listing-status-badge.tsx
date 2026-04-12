import { formatStatusLabel } from '../../utils/format-status-label'
import type { ListingStatus } from '../../types/listing-status'

type ListingStatusBadgeProps = {
  status: ListingStatus
}

const statusClassMap: Record<ListingStatus, string> = {
  DRAFT: 'badge-ghost',
  UNDER_REVIEW: 'badge-info',
  AWAITING_REVIEW: 'badge-info',
  AWAITING_FIXES: 'badge-warning',
  ACTIVE: 'badge-success',
  HIDDEN: 'badge-warning',
  ARCHIVED: 'badge-neutral',
  HIDDEN_BY_MODERATION: 'badge-error',
}

export function ListingStatusBadge({ status }: ListingStatusBadgeProps) {
  return <span class={`badge badge-soft ${statusClassMap[status]}`}>{formatStatusLabel(status)}</span>
}
