import type { ComponentChildren } from 'preact'

type InfoAlertProps = {
  children: ComponentChildren
}

export function InfoAlert({ children }: InfoAlertProps) {
  return (
    <div class="alert alert-info text-sm">
      <svg class="h-5 w-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <path
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <div>{children}</div>
    </div>
  )
}