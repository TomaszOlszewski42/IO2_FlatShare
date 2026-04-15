import { mount } from 'enzyme'
import { describe, expect, it, vi } from 'vitest'

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
    const wrapper = mount(<TopBar />)

    const brandLink = wrapper.find('a[href="/"]').first()

    expect(brandLink.exists()).toBe(true)
    expect(brandLink.text()).toBe(appConfig.name)
  })

  it('renders the user badge and auth controls areas', () => {
    const wrapper = mount(<TopBar />)

    expect(wrapper.find('[data-test-id="current-user-badge"]').exists()).toBe(true)
    expect(wrapper.find('[data-test-id="auth-controls"]').exists()).toBe(true)
  })
})
