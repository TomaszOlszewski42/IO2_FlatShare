import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'preact'
import { act } from 'preact/test-utils'
import { route } from 'preact-router'

import { LoginPage } from './login-page'
import { login } from '../services/auth-api'
import { persistAuthSession } from '../services/auth-session'
import { usePageErrorHandler } from '../hooks/use-page-error-handler'

vi.mock('preact-router', () => ({
  route: vi.fn(),
}))

vi.mock('../services/auth-api', () => ({
  login: vi.fn(),
}))

vi.mock('../services/auth-session', () => ({
  persistAuthSession: vi.fn(),
}))

vi.mock('../hooks/use-page-error-handler', () => ({
  usePageErrorHandler: vi.fn(),
}))

describe('LoginPage', () => {
  const clearErrors = vi.fn()
  const handleError = vi.fn()

  beforeEach(() => {
    vi.mocked(usePageErrorHandler).mockReturnValue({
      errorMessage: null,
      fieldErrors: {},
      clearErrors,
      handleError,
    })
  })

  afterEach(() => {
    document.body.innerHTML = ''
    vi.clearAllMocks()
  })

  it('renders login form fields and navigation actions', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<LoginPage path="/login" />, container)
    })

    expect(container.textContent).toContain('Log in')
    expect(container.textContent).toContain('Access your FlatShare account.')
    expect(container.querySelector('#login-email')).not.toBeNull()
    expect(container.querySelector('#login-password')).not.toBeNull()
    expect(container.textContent).toContain('Forgot password?')
    expect(container.textContent).toContain('Register')
  })

  it('submits credentials, persists session and redirects to listings', async () => {
    vi.mocked(login).mockResolvedValue({
      token: 'access-token',
      sessionId: 'session-1',
      type: 'Bearer',
      expiresIn: 3600,
      roles: ['TENANT'],
    })

    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<LoginPage path="/login" />, container)
    })

    const emailInput = container.querySelector('#login-email') as HTMLInputElement
    const passwordInput = container.querySelector('#login-password') as HTMLInputElement
    const form = container.querySelector('form') as HTMLFormElement

    act(() => {
      emailInput.value = 'tenant@example.com'
      emailInput.dispatchEvent(new Event('input', { bubbles: true }))

      passwordInput.value = 'secret-password'
      passwordInput.dispatchEvent(new Event('input', { bubbles: true }))
    })

    await act(async () => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
      await Promise.resolve()
    })

    expect(clearErrors).toHaveBeenCalledTimes(1)
    expect(login).toHaveBeenCalledTimes(1)
    expect(login).toHaveBeenCalledWith({
      email: 'tenant@example.com',
      password: 'secret-password',
    })

    expect(persistAuthSession).toHaveBeenCalledTimes(1)
    expect(persistAuthSession).toHaveBeenCalledWith({
      token: 'access-token',
      sessionId: 'session-1',
      type: 'Bearer',
      roles: ['TENANT'],
    })

    expect(route).toHaveBeenCalledWith('/listings')
    expect(handleError).not.toHaveBeenCalled()
  })

  it('reports login error and does not persist session when request fails', async () => {
    const loginError = new Error('Invalid credentials')
    vi.mocked(login).mockRejectedValue(loginError)

    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<LoginPage path="/login" />, container)
    })

    const form = container.querySelector('form') as HTMLFormElement

    await act(async () => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
      await Promise.resolve()
    })

    expect(login).toHaveBeenCalledTimes(1)
    expect(persistAuthSession).not.toHaveBeenCalled()
    expect(route).not.toHaveBeenCalledWith('/listings')
    expect(handleError).toHaveBeenCalledWith(
      loginError,
      'Login failed. Check your credentials and try again.',
    )
  })

  it('routes to password reset request page after clicking forgot password', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<LoginPage path="/login" />, container)
    })

    const forgotPasswordButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Forgot password?',
    ) as HTMLButtonElement

    act(() => {
      forgotPasswordButton.click()
    })

    expect(route).toHaveBeenCalledWith('/password-reset/request')
  })
})