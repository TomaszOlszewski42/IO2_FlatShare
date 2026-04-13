import type { ComponentChildren } from 'preact'

import { ListingsSurface } from './listings-surface'

type ListingSectionProps = {
  title: string
  children: ComponentChildren
  className?: string
  dashed?: boolean
  translucent?: boolean
}

export function ListingSection({ title, children, className = '', dashed = false, translucent = false }: ListingSectionProps) {
  return (
    <ListingsSurface className={className} dashed={dashed} translucent={translucent}>
      <div class="card-body gap-3">
        <h2 class="card-title text-lg">{title}</h2>
        {children}
      </div>
    </ListingsSurface>
  )
}