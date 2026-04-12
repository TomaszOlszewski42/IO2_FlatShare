type ListingMetaRowProps = {
  label: string
  value: string
  icon?: string
}

export function ListingMetaRow({ label, value, icon }: ListingMetaRowProps) {
  return (
    <div class="flex items-center justify-between gap-3 border-b border-base-300/70 py-2 text-sm last:border-b-0">
      <span class="text-base-content/65">
        {icon ? `${icon} ` : ''}
        {label}
      </span>
      <span class="font-medium text-base-content">{value}</span>
    </div>
  )
}
