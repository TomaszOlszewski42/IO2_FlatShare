import { AppButton } from '../ui/app-button'
import { RoleBoundary } from '../auth/role-boundary'
import { UserRole } from '../../types/user'
import { useAuth } from '../../hooks/use-auth'

import type { ListingStatus } from '../../types/listing-status'

type ListingDetailsHeaderProps = {
  title: string
  status?: ListingStatus
  isOwner?: boolean
  onBack: () => void
  onEdit: () => void
  onArchive: () => void
  onHide: () => void
  onSubmitForReview: () => void
  onPublish: () => void
  onRequestFixes: () => void
  onReportViolation: () => void
}

export function ListingDetailsHeader({
  title,
  status,
  isOwner,
  onBack,
  onEdit,
  onArchive,
  onHide,
  onSubmitForReview,
  onPublish,
  onRequestFixes,
  onReportViolation,
}: ListingDetailsHeaderProps) {
  const { isLandlord, isAdmin } = useAuth()

  const isDraft = status === 'DRAFT'
  const isAwaitingReview = status === 'AWAITING_REVIEW'
  const isAwaitingFixes = status === 'AWAITING_FIXES'
  const isActive = status === 'ACTIVE' || !status
  const isHidden = status === 'HIDDEN'
  const isArchived = status === 'ARCHIVED'
  const isModerated = status === 'HIDDEN_BY_MODERATION'

  return (
    <header class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div class="space-y-2">
        <AppButton variant="ghost" className="btn-sm" onClick={onBack}>
          Back to list
        </AppButton>
        <h1 class="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
      </div>

      <div class="flex flex-wrap gap-2">
        <AppButton variant="outline" onClick={onReportViolation}>
          Report violation
        </AppButton>
        {/* Management Actions */}
        <RoleBoundary requiredRole={[UserRole.Landlord, UserRole.Admin]}>
          {(isOwner || isAdmin) && (
            <>
              {isOwner && (isActive || isAwaitingReview || isAwaitingFixes) && (
                <AppButton variant="ghost" onClick={onHide}>
                  Hide
                </AppButton>
              )}

              {(isHidden || isArchived || (isAdmin && isModerated)) && (
                <AppButton variant="primary" onClick={onPublish}>
                  {isHidden ? 'Unhide' : isArchived ? 'Restore' : 'Unmoderate'}
                </AppButton>
              )}

              {!isArchived && (
                <AppButton variant="ghost" onClick={onArchive}>
                  Archive
                </AppButton>
              )}

              {isOwner && <AppButton onClick={onEdit}>Edit listing</AppButton>}
            </>
          )}

          {isLandlord && isOwner && (isDraft || isAwaitingFixes) && (
            <AppButton variant="primary" onClick={onSubmitForReview}>
              Submit for review
            </AppButton>
          )}

          {isAdmin && isAwaitingReview && (
            <>
              <AppButton variant="warning" onClick={onRequestFixes}>
                Request fixes
              </AppButton>
              <AppButton variant="success" onClick={onPublish}>
                Publish
              </AppButton>
            </>
          )}
        </RoleBoundary>
      </div>
    </header>
  )
}