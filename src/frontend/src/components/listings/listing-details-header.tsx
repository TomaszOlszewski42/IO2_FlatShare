import { AppButton } from '../ui/app-button'
import { RoleBoundary } from '../auth/role-boundary'
import { UserRole } from '../../types/user'

type ListingDetailsHeaderProps = {
  title: string
  onBack: () => void
  onEdit: () => void
  onArchive: () => void
  onReportViolation: () => void
}

export function ListingDetailsHeader({
  title,
  onBack,
  onEdit,
  onArchive,
  onReportViolation,
}: ListingDetailsHeaderProps) {
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

        <RoleBoundary requiredRole={UserRole.Landlord}>
          <AppButton variant="outline" onClick={onArchive}>
            Archive
          </AppButton>
          <AppButton onClick={onEdit}>Edit listing</AppButton>
        </RoleBoundary>
      </div>
    </header>
  )
}