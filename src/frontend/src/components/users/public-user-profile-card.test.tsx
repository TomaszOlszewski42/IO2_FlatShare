import { afterEach, describe, expect, it } from 'vitest'
import { render } from 'preact'
import { act } from 'preact/test-utils'

import { UserRole, type User } from '../../types/user'
import { PublicUserProfileCard } from './public-user-profile-card'

function renderCard(user: User) {
  const container = document.createElement('div')
  document.body.appendChild(container)

  act(() => {
    render(<PublicUserProfileCard user={user} />, container)
  })

  return container
}

describe('PublicUserProfileCard', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders user name, role and email', () => {
    const container = renderCard({
      id: 'user-1',
      firstName: 'Anna',
      lastName: 'Nowak',
      email: 'anna.nowak@example.com',
      role: UserRole.Landlord,
    })

    expect(container.textContent).toContain('Anna Nowak')
    expect(container.textContent).toContain('Landlord')
    expect(container.textContent).toContain('anna.nowak@example.com')
    expect(container.textContent).toContain('This user can publish room listings and manage rental offers.')
  })

  it('renders mailto links when email is available', () => {
    const container = renderCard({
      id: 'user-1',
      firstName: 'Anna',
      lastName: 'Nowak',
      email: 'anna.nowak@example.com',
      role: UserRole.Tenant,
    })

    const mailLinks = Array.from(container.querySelectorAll('a[href="mailto:anna.nowak@example.com"]'))

    expect(mailLinks).toHaveLength(2)
    expect(container.textContent).toContain('Send email')
  })

  it('renders fallback when email is empty', () => {
    const container = renderCard({
      id: 'user-1',
      firstName: 'Anna',
      lastName: 'Nowak',
      email: '',
      role: UserRole.Tenant,
    })

    expect(container.textContent).toContain('Email is not available.')
    expect(container.querySelector('a[href^="mailto:"]')).toBeNull()
  })

  it('renders fallback initials when user has no visible name', () => {
    const container = renderCard({
      id: 'user-1',
      firstName: '',
      lastName: '',
      email: '',
      role: UserRole.Tenant,
    })

    expect(container.textContent).toContain('FlatShare user')
    expect(container.textContent).toContain('FS')
  })
})