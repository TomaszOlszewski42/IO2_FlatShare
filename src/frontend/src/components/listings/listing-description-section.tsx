import { ListingSection } from './listing-section'

type ListingDescriptionSectionProps = {
  description: string
}

export function ListingDescriptionSection({ description }: ListingDescriptionSectionProps) {
  return (
    <ListingSection title="Opis">
      <p class="leading-relaxed text-base-content/80">{description}</p>
    </ListingSection>
  )
}
