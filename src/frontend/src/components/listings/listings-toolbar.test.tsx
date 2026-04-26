import { afterEach, describe, expect, it, vi } from 'vitest'
import { render } from 'preact'
import { act } from 'preact/test-utils'
import type { ComponentChildren } from 'preact'

import { ListingsToolbar } from './listings-toolbar'

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

describe('ListingsToolbar', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    roleBoundaryState.allowRole = true
    vi.clearAllMocks()
  })

  it('renders landlord title, description and create button when role is allowed', () => {
    const handleQueryChange = vi.fn()
    const handleStatusChange = vi.fn()
    const handleCreateListing = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ListingsToolbar
          query=""
          selectedStatus="ALL"
          totalCount={5}
          activeCount={2}
          onQueryChange={handleQueryChange}
          onStatusChange={handleStatusChange}
          onCreateListing={handleCreateListing}
        />,
        container,
      )
    })

    expect(container.textContent).toContain('Twoje ogłoszenia')
    expect(container.textContent).toContain('Zarządzaj publikacją i widocznością ofert.')

    const createButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Dodaj ogłoszenie',
    )

    expect(createButton).not.toBeUndefined()

    act(() => {
      createButton?.click()
    })

    expect(handleCreateListing).toHaveBeenCalledTimes(1)
  })

  it('renders tenant fallback title and hides create button when role is not allowed', () => {
    roleBoundaryState.allowRole = false

    const handleQueryChange = vi.fn()
    const handleStatusChange = vi.fn()
    const handleCreateListing = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ListingsToolbar
          query=""
          selectedStatus="ALL"
          totalCount={3}
          activeCount={1}
          onQueryChange={handleQueryChange}
          onStatusChange={handleStatusChange}
          onCreateListing={handleCreateListing}
        />,
        container,
      )
    })

    expect(container.textContent).toContain('Available Listings')
    expect(container.textContent).toContain('Browse and find your next flat.')
    expect(container.textContent).not.toContain('Dodaj ogłoszenie')
  })

  it('renders total and active counters', () => {
    const handleQueryChange = vi.fn()
    const handleStatusChange = vi.fn()
    const handleCreateListing = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ListingsToolbar
          query="warszawa"
          selectedStatus="ACTIVE"
          totalCount={12}
          activeCount={7}
          onQueryChange={handleQueryChange}
          onStatusChange={handleStatusChange}
          onCreateListing={handleCreateListing}
        />,
        container,
      )
    })

    expect(container.textContent).toContain('Wszystkie: 12')
    expect(container.textContent).toContain('Aktywne: 7')
  })

  it('renders query input with provided value and calls onQueryChange after input', () => {
    const handleQueryChange = vi.fn()
    const handleStatusChange = vi.fn()
    const handleCreateListing = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ListingsToolbar
          query="kraków"
          selectedStatus="ALL"
          totalCount={0}
          activeCount={0}
          onQueryChange={handleQueryChange}
          onStatusChange={handleStatusChange}
          onCreateListing={handleCreateListing}
        />,
        container,
      )
    })

    const input = container.querySelector('#listings-query') as HTMLInputElement

    expect(input).not.toBeNull()
    expect(input.value).toBe('kraków')
    expect(input.placeholder).toBe('Tytuł, miasto, dzielnica')

    act(() => {
      input.value = 'warszawa'
      input.dispatchEvent(new Event('input', { bubbles: true }))
    })

    expect(handleQueryChange).toHaveBeenCalledTimes(1)
    expect(handleQueryChange).toHaveBeenCalledWith('warszawa')
  })

  it('renders status select with options and calls onStatusChange after change', () => {
    const handleQueryChange = vi.fn()
    const handleStatusChange = vi.fn()
    const handleCreateListing = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ListingsToolbar
          query=""
          selectedStatus="ALL"
          totalCount={0}
          activeCount={0}
          onQueryChange={handleQueryChange}
          onStatusChange={handleStatusChange}
          onCreateListing={handleCreateListing}
        />,
        container,
      )
    })

    const select = container.querySelector('#listings-status') as HTMLSelectElement
    const options = container.querySelectorAll('option')

    expect(select).not.toBeNull()
    expect(select.value).toBe('ALL')
    expect(options.length).toBeGreaterThan(1)
    expect(options[0]?.textContent).toBe('Wszystkie statusy')

    act(() => {
      select.value = 'ACTIVE'
      select.dispatchEvent(new Event('change', { bubbles: true }))
    })

    expect(handleStatusChange).toHaveBeenCalledTimes(1)
    expect(handleStatusChange).toHaveBeenCalledWith('ACTIVE')
  })
})