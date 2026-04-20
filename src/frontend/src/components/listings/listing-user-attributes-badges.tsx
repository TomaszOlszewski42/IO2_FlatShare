import type { ListingAttributes } from '../../types/listing'
import { getListingUserAttributeBadges } from '../../utils/listing-user-attributes'

type ListingUserAttributesBadgesProps = {
  attributes?: ListingAttributes
}

export function ListingUserAttributesBadges({ attributes }: ListingUserAttributesBadgesProps) {
  const badges = getListingUserAttributeBadges(attributes)

  if (badges.length === 0) {
    return null
  }

  return (
    <div class="flex flex-wrap gap-2">
      {badges.map((badge) => (
        <span key={badge} class="badge badge-secondary badge-sm badge-outline">
          {badge}
        </span>
      ))}
    </div>
  )
}