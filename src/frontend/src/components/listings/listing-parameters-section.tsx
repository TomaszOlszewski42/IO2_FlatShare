import { ListingSection } from './listing-section'
import { ListingMetaRow } from './listing-meta-row'

type ListingParametersSectionProps = {
  rows: Array<{
    label: string
    value: string
    icon?: string
  }>
}

export function ListingParametersSection({ rows }: ListingParametersSectionProps) {
  return (
    <ListingSection title="Parameters">
      <div class="rounded-box border border-base-300/70 bg-base-100 px-4">
        {rows.map((row) => (
          <ListingMetaRow key={row.label} label={row.label} value={row.value} icon={row.icon} />
        ))}
      </div>
    </ListingSection>
  )
}
