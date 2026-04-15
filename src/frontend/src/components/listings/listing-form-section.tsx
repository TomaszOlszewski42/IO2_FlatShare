import type { ComponentChildren } from 'preact'

type ListingFormSectionProps = {
  title: string
  description: string
  children: ComponentChildren
  className?: string
}

export function ListingFormSection({
  title,
  description,
  children,
  className = '',
}: ListingFormSectionProps) {
  return (
    <div class={`space-y-6 card-body ${className}`.trim()}>
      <div>
        <h2 class="text-xl font-semibold">{title}</h2>
        <p class="text-sm text-base-content/65">{description}</p>
      </div>

      {children}
    </div>
  )
}