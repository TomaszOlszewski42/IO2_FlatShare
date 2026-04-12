import { AppButton } from '../ui/app-button'

type ListingDetailsHeaderProps = {
  title: string
  onBack: () => void
  onEdit: () => void
  onArchive: () => void
}

export function ListingDetailsHeader({ title, onBack, onEdit, onArchive }: ListingDetailsHeaderProps) {
  return (
    <header class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div class="space-y-2">
        <AppButton variant="ghost" className="btn-sm" onClick={onBack}>
          Wróć do listy
        </AppButton>
        <h1 class="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
      </div>

      <div class="flex flex-wrap gap-2">
        <AppButton variant="outline" onClick={onArchive}>
          Archiwizuj
        </AppButton>
        <AppButton onClick={onEdit}>Edytuj ogłoszenie</AppButton>
      </div>
    </header>
  )
}
