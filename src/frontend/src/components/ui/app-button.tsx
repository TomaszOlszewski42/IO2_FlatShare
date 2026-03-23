import type { ComponentChildren } from 'preact'
import type { JSX } from 'preact'

type ButtonVariant = 'primary' | 'outline' | 'ghost'

type AppButtonProps = {
  type?: 'button' | 'submit' | 'reset'
  variant?: ButtonVariant
  loading?: boolean
  disabled?: boolean
  className?: string
  onClick?: JSX.MouseEventHandler<HTMLButtonElement>
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
  onClick,
  children,
}: AppButtonProps) {
  return (
    <button
      class={`btn ${variantClass[variant]} ${className}`.trim()}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading}
      onClick={onClick}
    >
      {loading ? <span class="loading loading-spinner loading-sm" aria-hidden="true" /> : null}
      <span>{children}</span>
    </button>
  )
}
