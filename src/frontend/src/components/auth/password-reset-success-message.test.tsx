import { afterEach, describe, expect, it } from 'vitest'
import { render } from 'preact'
import { act } from 'preact/test-utils'

import { PasswordResetSuccessMessage } from './password-reset-success-message'

describe('PasswordResetSuccessMessage', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders nothing when message is missing', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<PasswordResetSuccessMessage />, container)
    })

    expect(container.textContent).toBe('')
    expect(container.querySelector('.alert')).toBeNull()
  })

  it('renders nothing when message is null', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<PasswordResetSuccessMessage message={null} />, container)
    })

    expect(container.textContent).toBe('')
    expect(container.querySelector('.alert')).toBeNull()
  })

  it('renders nothing when message is empty', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<PasswordResetSuccessMessage message="" />, container)
    })

    expect(container.textContent).toBe('')
    expect(container.querySelector('.alert')).toBeNull()
  })

  it('renders success alert when message is provided', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <PasswordResetSuccessMessage message="Link do resetu hasła został wysłany." />,
        container,
      )
    })

    const alert = container.querySelector('.alert')

    expect(alert).not.toBeNull()
    expect(alert?.textContent).toBe('Link do resetu hasła został wysłany.')
    expect(alert?.classList.contains('alert-success')).toBe(true)
    expect(alert?.classList.contains('text-sm')).toBe(true)
  })
})