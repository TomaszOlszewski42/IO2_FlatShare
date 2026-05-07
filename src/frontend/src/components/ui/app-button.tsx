import type { ComponentChildren } from 'preact'
import type { JSX } from 'preact'

type ButtonVariant = 'primary' | 'outline' | 'ghost'

type AppButtonProps = Omit<
  JSX.HTMLAttributes<HTMLButtonElement>,
  'class' | 'className' | 'type'
> & {
  type?: 'button' | 'submit' | 'reset'
  variant?: ButtonVariant
  loading?: boolean
  disabled?: boolean
  className?: string
  children: ComponentChildren
}

const variantClass: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  outline: 'btn-outline',
  ghost: 'btn-ghost',
}

export function AppButton({
  type = 'button',
  variant = 'primary',
  loading = false,
  disabled = false,
  className = '',
  children,
  ...buttonProps
}: AppButtonProps) {
  return (
    <button
      {...buttonProps}
      class={`btn ${variantClass[variant]} ${className}`.trim()}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading}
    >
      {loading ? <span class="loading loading-spinner loading-sm" aria-hidden="true" /> : null}
      <span>{children}</span>
    </button>
  )
}