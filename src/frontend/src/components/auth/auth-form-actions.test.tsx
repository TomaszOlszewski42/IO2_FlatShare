import { afterEach, describe, expect, it, vi } from 'vitest'
import { render } from 'preact'
import { act } from 'preact/test-utils'
import { route } from 'preact-router'

import { AuthFormActions } from './auth-form-actions'

vi.mock('preact-router', () => ({
  route: vi.fn(),
}))

describe('AuthFormActions', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    vi.clearAllMocks()
  })

  it('renders submit button with idle label by default', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <AuthFormActions
          idleLabel="Wyślij"
          loadingLabel="Wysyłanie..."
        />,
        container,
      )
    })

    const submitButton = container.querySelector('button[type="submit"]') as HTMLButtonElement

    expect(submitButton).not.toBeNull()
    expect(submitButton.textContent).toBe('Wyślij')
    expect(submitButton.disabled).toBe(false)
    expect(submitButton.classList.contains('btn')).toBe(true)
    expect(submitButton.classList.contains('btn-primary')).toBe(true)
  })

  it('renders submit button with loading label and disables it while submitting', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <AuthFormActions
          isSubmitting
          idleLabel="Wyślij"
          loadingLabel="Wysyłanie..."
        />,
        container,
      )
    })

    const submitButton = container.querySelector('button[type="submit"]') as HTMLButtonElement

    expect(submitButton.textContent).toBe('Wysyłanie...')
    expect(submitButton.disabled).toBe(true)
  })

  it('renders back to login button', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <AuthFormActions
          idleLabel="Zapisz"
          loadingLabel="Zapisywanie..."
        />,
        container,
      )
    })

    const buttons = Array.from(container.querySelectorAll('button'))
    const backButton = buttons.find((button) => button.textContent === 'Back to login')

    expect(backButton).not.toBeUndefined()
    expect(backButton?.getAttribute('type')).toBe('button')
    expect(backButton?.classList.contains('btn')).toBe(true)
    expect(backButton?.classList.contains('btn-ghost')).toBe(true)
  })

  it('routes back to login after clicking back button', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <AuthFormActions
          idleLabel="Zapisz"
          loadingLabel="Zapisywanie..."
        />,
        container,
      )
    })

    const buttons = Array.from(container.querySelectorAll('button'))
    const backButton = buttons.find((button) => button.textContent === 'Back to login') as HTMLButtonElement

    act(() => {
      backButton.click()
    })

    expect(route).toHaveBeenCalledTimes(1)
    expect(route).toHaveBeenCalledWith('/login')
  })
})