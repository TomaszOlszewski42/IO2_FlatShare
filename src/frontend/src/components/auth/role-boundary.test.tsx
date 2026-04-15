import { mount } from 'enzyme'
import { expect, it, describe, vi, beforeEach } from 'vitest'
import { RoleBoundary } from './role-boundary'
import * as useAuthHook from '../../hooks/use-auth'
import { UserRole } from '../../types/user'

vi.mock('../../hooks/use-auth', () => ({
  useAuth: vi.fn(),
}))

describe('RoleBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render children when user has required role', () => {
    vi.mocked(useAuthHook.useAuth).mockReturnValue({
      isAuthenticated: true,
      hasRole: (role: string) => role === UserRole.Landlord,
      isLandlord: true,
      isTenant: false,
      isAdmin: false,
      session: null as any,
    })

    const wrapper = mount(
      <RoleBoundary requiredRole={UserRole.Landlord}>
        <div id="content">Visible</div>
      </RoleBoundary>
    )

    expect(wrapper.find('#content').exists()).toBe(true)
    expect(wrapper.text()).toBe('Visible')
  })

  it('should not render children when user does not have required role', () => {
    vi.mocked(useAuthHook.useAuth).mockReturnValue({
      isAuthenticated: true,
      hasRole: (role: string) => role === UserRole.Tenant,
      isLandlord: false,
      isTenant: true,
      isAdmin: false,
      session: null as any,
    })

    const wrapper = mount(
      <RoleBoundary requiredRole={UserRole.Landlord}>
        <div id="content">Hidden</div>
      </RoleBoundary>
    )

    expect(wrapper.find('#content').exists()).toBe(false)
    expect(wrapper.text()).toBe('')
  })

  it('should render fallback when user does not have required role', () => {
    vi.mocked(useAuthHook.useAuth).mockReturnValue({
      isAuthenticated: true,
      hasRole: (role: string) => role === UserRole.Tenant,
      isLandlord: false,
      isTenant: true,
      isAdmin: false,
      session: null as any,
    })

    const wrapper = mount(
      <RoleBoundary 
        requiredRole={UserRole.Landlord} 
        fallback={<div id="fallback">Fallback</div>}
      >
        <div id="content">Hidden</div>
      </RoleBoundary>
    )

    expect(wrapper.find('#content').exists()).toBe(false)
    expect(wrapper.find('#fallback').exists()).toBe(true)
    expect(wrapper.text()).toBe('Fallback')
  })

  it('should support multiple required roles', () => {
     vi.mocked(useAuthHook.useAuth).mockReturnValue({
      isAuthenticated: true,
      hasRole: (role: string) => role === UserRole.Admin,
      isLandlord: false,
      isTenant: false,
      isAdmin: true,
      session: null as any,
    })

    const wrapper = mount(
      <RoleBoundary requiredRole={[UserRole.Landlord, UserRole.Admin]}>
        <div id="content">Visible</div>
      </RoleBoundary>
    )

    expect(wrapper.find('#content').exists()).toBe(true)
  })
})
