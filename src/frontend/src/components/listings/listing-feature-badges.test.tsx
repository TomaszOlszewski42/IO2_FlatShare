import { afterEach, describe, expect, it } from 'vitest'
import { render } from 'preact'
import { act } from 'preact/test-utils'

import { ListingFeatureBadges } from './listing-feature-badges'

describe('ListingFeatureBadges', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders one badge for each feature', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ListingFeatureBadges
          features={[
            { label: 'Umeblowane', value: true },
            { label: 'Zwierzęta', value: false },
            { label: 'Palenie', value: true },
          ]}
        />,
        container,
      )
    })

    const badges = container.querySelectorAll('.badge')

    expect(badges.length).toBe(3)
    expect(container.textContent).toContain('Umeblowane')
    expect(container.textContent).toContain('Zwierzęta')
    expect(container.textContent).toContain('Palenie')
  })

  it('renders positive feature with success mark', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<ListingFeatureBadges features={[{ label: 'Umeblowane', value: true }]} />, container)
    })

    const mark = container.querySelector('.text-success')

    expect(mark).not.toBeNull()
    expect(mark?.textContent).toBe('✓')
    expect(mark?.getAttribute('aria-hidden')).toBe('true')
  })

  it('renders negative feature with error mark', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<ListingFeatureBadges features={[{ label: 'Zwierzęta', value: false }]} />, container)
    })

    const mark = container.querySelector('.text-error')

    expect(mark).not.toBeNull()
    expect(mark?.textContent).toBe('✕')
    expect(mark?.getAttribute('aria-hidden')).toBe('true')
  })

  it('renders empty container when feature list is empty', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<ListingFeatureBadges features={[]} />, container)
    })

    expect(container.querySelectorAll('.badge').length).toBe(0)
    expect(container.querySelector('.flex.flex-wrap.gap-2')).not.toBeNull()
  })
})