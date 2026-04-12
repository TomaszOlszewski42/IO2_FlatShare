import type { ComponentChildren } from 'preact'

type AuthCardProps = {
  title: string
  subtitle: string
  children: ComponentChildren
  footer?: ComponentChildren
}

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <section class="flex w-full flex-1 items-center justify-center py-6">
      <div class="card w-full max-w-md border border-base-300 bg-base-100/85 shadow-lg">
        <div class="card-body">
          <h1 class="card-title text-2xl">{title}</h1>
          <p class="text-sm text-base-content/70">{subtitle}</p>

          {children}

          {footer ? <div class="card-actions mt-3 text-sm text-base-content/70">{footer}</div> : null}
        </div>
      </div>
    </section>
  )
}