import type { ComponentChildren } from 'preact'

type ListingFormShellProps = {
  children: ComponentChildren
}

export function ListingFormShell({ children }: ListingFormShellProps) {
  return <div class="card border border-base-300 bg-base-100 shadow-sm">{children}</div>
}
