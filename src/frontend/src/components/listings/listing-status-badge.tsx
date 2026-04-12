import { formatStatusLabel, type ListingStatus } from '../../utils/format-status-label'

type ListingStatusBadgeProps = {
  status: ListingStatus
}

const statusClassMap: Record<ListingStatus, string> = {
  DRAFT: 'badge-ghost',
  UNDER_REVIEW: 'badge-info',
  ACTIVE: 'badge-success',
  HIDDEN: 'badge-warning',
  ARCHIVED: 'badge-neutral',
}

export function ListingStatusBadge({ status }: ListingStatusBadgeProps) {
  return <span class={`badge badge-soft ${statusClassMap[status]}`}>{formatStatusLabel(status)}</span>
}
