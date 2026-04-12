import type { ComponentChildren } from 'preact'

type ListingsSurfaceProps = {
  children: ComponentChildren
  className?: string
  dashed?: boolean
  translucent?: boolean
}

export function ListingsSurface({ children, className = '', dashed = false, translucent = false }: ListingsSurfaceProps) {
  const borderStyle = dashed ? 'border-dashed' : 'border-solid'
  const background = translucent ? 'bg-base-100/75' : 'bg-base-100/85'

  return <section class={`card border ${borderStyle} border-base-300 ${background} shadow-sm ${className}`.trim()}>{children}</section>
}
