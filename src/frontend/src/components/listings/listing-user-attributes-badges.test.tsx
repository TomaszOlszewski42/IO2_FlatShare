import { afterEach, describe, expect, it } from 'vitest'
import { render } from 'preact'
import { act } from 'preact/test-utils'

import { ListingUserAttributesBadges } from './listing-user-attributes-badges'

describe('ListingUserAttributesBadges', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders nothing when attributes are not provided', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<ListingUserAttributesBadges />, container)
    })

    expect(container.querySelector('.badge')).toBeNull()
    expect(container.textContent).toBe('')
  })

  it('renders nothing when attributes do not produce badges', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<ListingUserAttributesBadges attributes={{}} />, container)
    })

    expect(container.querySelector('.badge')).toBeNull()
    expect(container.textContent).toBe('')
  })

  it('renders badge for pets allowed', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<ListingUserAttributesBadges attributes={{ petsAllowed: true }} />, container)
    })

    const badge = container.querySelector('.badge')

    expect(badge).not.toBeNull()
    expect(badge?.textContent).toBe('Akceptowane zwierzęta')
    expect(badge?.classList.contains('badge-secondary')).toBe(true)
    expect(badge?.classList.contains('badge-outline')).toBe(true)
  })

  it('renders badge for pets not allowed', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<ListingUserAttributesBadges attributes={{ petsAllowed: false }} />, container)
    })

    expect(container.textContent).toContain('Bez zwierząt')
  })

  it('renders badge for non-smoking requirement', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<ListingUserAttributesBadges attributes={{ nonSmokingOnly: true }} />, container)
    })

    expect(container.textContent).toContain('Tylko niepalący')
  })

  it('renders translated preferred tenant profile badges', () => {
    const studentContainer = document.createElement('div')
    const workingContainer = document.createElement('div')
    document.body.appendChild(studentContainer)
    document.body.appendChild(workingContainer)

    act(() => {
      render(
        <ListingUserAttributesBadges attributes={{ preferredTenantProfile: 'student' }} />,
        studentContainer,
      )
      render(
        <ListingUserAttributesBadges attributes={{ preferredTenantProfile: 'working' }} />,
        workingContainer,
      )
    })

    expect(studentContainer.textContent).toContain('Student')
    expect(workingContainer.textContent).toContain('Osoba pracująca')
  })

  it('renders all available user attribute badges', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ListingUserAttributesBadges
          attributes={{
            petsAllowed: true,
            nonSmokingOnly: true,
            preferredTenantProfile: 'working',
          }}
        />,
        container,
      )
    })

    const badges = container.querySelectorAll('.badge')

    expect(badges.length).toBe(3)
    expect(container.textContent).toContain('Akceptowane zwierzęta')
    expect(container.textContent).toContain('Tylko niepalący')
    expect(container.textContent).toContain('Osoba pracująca')
  })
})