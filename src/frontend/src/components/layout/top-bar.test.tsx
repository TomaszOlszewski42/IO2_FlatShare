import { describe, expect, it, vi } from 'vitest'
import { render } from 'preact'
import { act } from 'preact/test-utils'

import { appConfig } from '../../config/app-config'
import { TopBar } from './top-bar'

vi.mock('./current-user-badge', () => ({
  CurrentUserBadge: () => <div data-test-id="current-user-badge" />,
}))

vi.mock('./auth-controls', () => ({
  AuthControls: () => <div data-test-id="auth-controls" />,
}))

vi.mock('../../hooks/use-auth', () => ({
  useAuth: vi.fn(() => ({
    isLandlord: false,
    isAuthenticated: false,
    hasRole: () => false,
  })),
}))

describe('TopBar', () => {
  it('renders brand link with app name', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<TopBar />, container)
    })

    const brandLink = container.querySelector('a[href="/"]')

    expect(brandLink).not.toBeNull()
    expect(brandLink?.textContent).toBe(appConfig.name)
  })

  it('renders the user badge and auth controls areas', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<TopBar />, container)
    })

    expect(container.querySelector('[data-test-id="current-user-badge"]')).not.toBeNull()
    expect(container.querySelector('[data-test-id="auth-controls"]')).not.toBeNull()
  })
})
