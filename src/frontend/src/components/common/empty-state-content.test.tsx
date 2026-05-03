import { afterEach, describe, expect, it } from 'vitest'
import { render } from 'preact'
import { act } from 'preact/test-utils'

import { EmptyStateContent } from './empty-state-content'

describe('EmptyStateContent', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders title and description', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <EmptyStateContent
          title="No listings"
          description="No listings found matching the criteria."
        />,
        container,
      )
    })

    const heading = container.querySelector('h2')
    const paragraph = container.querySelector('p')

    expect(heading).not.toBeNull()
    expect(heading?.textContent).toBe('No listings')
    expect(paragraph?.textContent).toBe('No listings found matching the criteria.')
  })

  it('uses h2 heading by default', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<EmptyStateContent title="Empty" description="No data." />, container)
    })

    expect(container.querySelector('h2')).not.toBeNull()
    expect(container.querySelector('h1')).toBeNull()
  })

  it('can render title as h1', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<EmptyStateContent title="Empty page" description="No data." titleAs="h1" />, container)
    })

    const heading = container.querySelector('h1')

    expect(heading).not.toBeNull()
    expect(heading?.textContent).toBe('Empty page')
    expect(heading?.classList.contains('text-2xl')).toBe(true)
  })

  it('renders optional icon', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<EmptyStateContent title="No results" description="Try changing the filters." icon="🏠" />, container)
    })

    expect(container.textContent).toContain('🏠')
  })

  it('renders optional action children', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <EmptyStateContent title="No listings" description="Add your first listing.">
          <a href="/listings/create">Add listing</a>
        </EmptyStateContent>,
        container,
      )
    })

    const actionLink = container.querySelector('a[href="/listings/create"]')

    expect(actionLink).not.toBeNull()
    expect(actionLink?.textContent).toBe('Add listing')
  })

  it('does not render actions container when children are not provided', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<EmptyStateContent title="No data" description="No items yet." />, container)
    })

    expect(container.querySelector('.flex.flex-wrap.justify-center.gap-2')).toBeNull()
  })
})