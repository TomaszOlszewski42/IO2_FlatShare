type ListingFeature = {
  label: string
  value: boolean
}

type ListingFeatureBadgesProps = {
  features: ListingFeature[]
}

export function ListingFeatureBadges({ features }: ListingFeatureBadgesProps) {
  return (
    <div class="flex flex-wrap gap-2">
      {features.map((feature) => (
        <span
          key={feature.label}
          class="badge badge-outline badge-sm gap-1.5 bg-base-100 text-base-content"
        >
          <span class={feature.value ? 'text-success' : 'text-error'} aria-hidden="true">
            {feature.value ? '✓' : '✕'}
          </span>
          <span>{feature.label}</span>
        </span>
      ))}
    </div>
  )
}