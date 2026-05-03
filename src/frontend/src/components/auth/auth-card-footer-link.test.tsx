import { afterEach, describe, expect, it, vi } from 'vitest'
import { render } from 'preact'
import { act } from 'preact/test-utils'
import { route } from 'preact-router'

import { AuthCardFooterLink } from './auth-card-footer-link'

vi.mock('preact-router', () => ({
  route: vi.fn(),
}))

describe('AuthCardFooterLink', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    vi.clearAllMocks()
  })

  it('renders prompt and action label', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <AuthCardFooterLink
          prompt="No account?"
          actionLabel="Sign up"
          href="/register"
        />,
        container,
      )
    })

    expect(container.textContent).toContain('No account?')
    expect(container.textContent).toContain('Sign up')
  })

  it('renders action as button with link styling', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <AuthCardFooterLink
          prompt="Already have an account?"
          actionLabel="Log in"
          href="/login"
        />,
        container,
      )
    })

    const button = container.querySelector('button')

    expect(button).not.toBeNull()
    expect(button?.getAttribute('type')).toBe('button')
    expect(button?.classList.contains('link')).toBe(true)
    expect(button?.classList.contains('link-primary')).toBe(true)
    expect(button?.textContent).toBe('Log in')
  })

  it('routes to provided href after clicking action button', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <AuthCardFooterLink
          prompt="No account?"
          actionLabel="Sign up"
          href="/register"
        />,
        container,
      )
    })

    const button = container.querySelector('button') as HTMLButtonElement

    act(() => {
      button.click()
    })

    expect(route).toHaveBeenCalledTimes(1)
    expect(route).toHaveBeenCalledWith('/register')
  })
})