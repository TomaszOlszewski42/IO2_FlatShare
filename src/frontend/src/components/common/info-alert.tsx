import type { ComponentChildren } from 'preact'

type InfoAlertVariant = 'info' | 'success' | 'warning' | 'error'

type InfoAlertProps = {
  children?: ComponentChildren
  title?: string
  message?: ComponentChildren
  variant?: InfoAlertVariant
}

const alertClassByVariant: Record<InfoAlertVariant, string> = {
  info: 'alert-info',
  success: 'alert-success',
  warning: 'alert-warning',
  error: 'alert-error',
}

export function InfoAlert({
  children,
  title,
  message,
  variant = 'info',
}: InfoAlertProps) {
  const alertClass = alertClassByVariant[variant]

  return (
    <div class={`alert ${alertClass} text-sm`}>
      <svg
        class="h-5 w-5 flex-shrink-0"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>

      <div>
        {children ? (
          children
        ) : (
          <>
            {title ? <div class="font-semibold">{title}</div> : null}
            {message ? <div>{message}</div> : null}
          </>
        )}
      </div>
    </div>
  )
}