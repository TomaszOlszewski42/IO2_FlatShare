import type { ComponentChildren } from 'preact'

type EmptyStateContentProps = {
  title: string
  description: string
  icon?: string
  titleAs?: 'h1' | 'h2'
  children?: ComponentChildren
}

export function EmptyStateContent({
  title,
  description,
  icon,
  titleAs = 'h2',
  children,
}: EmptyStateContentProps) {
  const HeadingTag = titleAs

  return (
    <div class="flex flex-col items-center gap-6 text-center">
      <div class="space-y-3">
        {icon ? <div class="text-6xl">{icon}</div> : null}
        <HeadingTag class={titleAs === 'h1' ? 'text-2xl font-bold' : 'text-xl font-semibold'}>
          {title}
        </HeadingTag>
        <p class="max-w-lg text-sm text-base-content/65">{description}</p>
      </div>

      {children ? <div class="flex flex-wrap justify-center gap-2">{children}</div> : null}
    </div>
  )
}