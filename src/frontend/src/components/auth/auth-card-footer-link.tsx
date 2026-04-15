import { route } from 'preact-router'

type AuthCardFooterLinkProps = {
  prompt: string
  actionLabel: string
  href: string
}

export function AuthCardFooterLink({
  prompt,
  actionLabel,
  href,
}: AuthCardFooterLinkProps) {
  return (
    <p>
      {prompt}{' '}
      <button
        class="link link-primary"
        type="button"
        onClick={() => route(href)}
      >
        {actionLabel}
      </button>
    </p>
  )
}