import { afterEach, describe, expect, it, vi } from 'vitest'
import { render } from 'preact'
import { act } from 'preact/test-utils'
import type { ComponentChildren } from 'preact'

import { ListingsEmptyState } from './listings-empty-state'

const roleBoundaryState = vi.hoisted(() => ({
  allowRole: true,
}))

vi.mock('../auth/role-boundary', () => ({
  RoleBoundary: ({
    children,
    fallback = null,
  }: {
    children: ComponentChildren
    fallback?: ComponentChildren
  }) => <>{roleBoundaryState.allowRole ? children : fallback}</>,
}))

describe('ListingsEmptyState', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    roleBoundaryState.allowRole = true
    vi.clearAllMocks()
  })

  it('renders common empty state heading', () => {
    const handleClearFilters = vi.fn()
    const handleCreateListing = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ListingsEmptyState
          hasFilters={false}
          onClearFilters={handleClearFilters}
          onCreateListing={handleCreateListing}
        />,
        container,
      )
    })

    const heading = container.querySelector('h2')

    expect(heading).not.toBeNull()
    expect(heading?.textContent).toBe('Brak ogłoszeń do wyświetlenia')
  })

  it('renders landlord message and create button when there are no filters', () => {
    const handleClearFilters = vi.fn()
    const handleCreateListing = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ListingsEmptyState
          hasFilters={false}
          onClearFilters={handleClearFilters}
          onCreateListing={handleCreateListing}
        />,
        container,
      )
    })

    const createButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Dodaj pierwsze ogłoszenie',
    )

    expect(container.textContent).toContain(
      'Kiedy dodasz pierwsze ogłoszenie, pojawi się ono tutaj razem ze statusem i kluczowymi metadanami.',
    )
    expect(container.textContent).not.toContain('Wyczyść filtry')
    expect(createButton).not.toBeUndefined()

    act(() => {
      createButton?.click()
    })

    expect(handleCreateListing).toHaveBeenCalledTimes(1)
    expect(handleClearFilters).not.toHaveBeenCalled()
  })

  it('renders tenant fallback message and hides create button when role is not allowed', () => {
    roleBoundaryState.allowRole = false

    const handleClearFilters = vi.fn()
    const handleCreateListing = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ListingsEmptyState
          hasFilters={false}
          onClearFilters={handleClearFilters}
          onCreateListing={handleCreateListing}
        />,
        container,
      )
    })

    expect(container.textContent).toContain(
      'Currently there are no active listings available. Check back later!',
    )
    expect(container.textContent).not.toContain('Dodaj pierwsze ogłoszenie')
  })

  it('renders clear filters action when filters are active', () => {
    const handleClearFilters = vi.fn()
    const handleCreateListing = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ListingsEmptyState
          hasFilters
          onClearFilters={handleClearFilters}
          onCreateListing={handleCreateListing}
        />,
        container,
      )
    })

    const clearButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Wyczyść filtry',
    )

    expect(container.textContent).toContain(
      'Zmień filtry lub frazę wyszukiwania, aby zobaczyć więcej wyników.',
    )
    expect(clearButton).not.toBeUndefined()

    act(() => {
      clearButton?.click()
    })

    expect(handleClearFilters).toHaveBeenCalledTimes(1)
  })

  it('uses dashed and translucent surface styling', () => {
    const handleClearFilters = vi.fn()
    const handleCreateListing = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ListingsEmptyState
          hasFilters={false}
          onClearFilters={handleClearFilters}
          onCreateListing={handleCreateListing}
        />,
        container,
      )
    })

    const section = container.querySelector('section')

    expect(section?.classList.contains('border-dashed')).toBe(true)
    expect(section?.classList.contains('bg-base-100/75')).toBe(true)
  })
})