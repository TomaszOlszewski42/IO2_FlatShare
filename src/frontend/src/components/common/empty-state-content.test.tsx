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
          title="Brak ogłoszeń"
          description="Nie znaleziono żadnych ogłoszeń spełniających kryteria."
        />,
        container,
      )
    })

    const heading = container.querySelector('h2')
    const paragraph = container.querySelector('p')

    expect(heading).not.toBeNull()
    expect(heading?.textContent).toBe('Brak ogłoszeń')
    expect(paragraph?.textContent).toBe('Nie znaleziono żadnych ogłoszeń spełniających kryteria.')
  })

  it('uses h2 heading by default', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<EmptyStateContent title="Pusto" description="Brak danych." />, container)
    })

    expect(container.querySelector('h2')).not.toBeNull()
    expect(container.querySelector('h1')).toBeNull()
  })

  it('can render title as h1', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<EmptyStateContent title="Strona pusta" description="Brak danych." titleAs="h1" />, container)
    })

    const heading = container.querySelector('h1')

    expect(heading).not.toBeNull()
    expect(heading?.textContent).toBe('Strona pusta')
    expect(heading?.classList.contains('text-2xl')).toBe(true)
  })

  it('renders optional icon', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<EmptyStateContent title="Brak wyników" description="Spróbuj zmienić filtry." icon="🏠" />, container)
    })

    expect(container.textContent).toContain('🏠')
  })

  it('renders optional action children', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <EmptyStateContent title="Brak ogłoszeń" description="Dodaj pierwsze ogłoszenie.">
          <a href="/listings/create">Dodaj ogłoszenie</a>
        </EmptyStateContent>,
        container,
      )
    })

    const actionLink = container.querySelector('a[href="/listings/create"]')

    expect(actionLink).not.toBeNull()
    expect(actionLink?.textContent).toBe('Dodaj ogłoszenie')
  })

  it('does not render actions container when children are not provided', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<EmptyStateContent title="Brak danych" description="Nie ma jeszcze żadnych elementów." />, container)
    })

    expect(container.querySelector('.flex.flex-wrap.justify-center.gap-2')).toBeNull()
  })
})