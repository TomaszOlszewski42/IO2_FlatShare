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

  it('renders landlord title, counters, status filter and create button when role is allowed', () => {
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

    expect(container.textContent).toContain('Your listings')
    expect(container.textContent).toContain('Manage publication and visibility of your offers.')
    expect(container.textContent).toContain('Total: 5')
    expect(container.textContent).toContain('Active: 2')
    expect(container.textContent).toContain('Status')
    expect(container.textContent).not.toContain('Price from')
    expect(container.textContent).not.toContain('Quick filters')

    const createButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Add listing',
    )

    expect(createButton).not.toBeUndefined()

    act(() => {
      createButton?.click()
    })

    expect(handleCreateListing).toHaveBeenCalledTimes(1)
  })

  it('renders tenant title, available offers counter and tenant filters when role is not allowed', () => {
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

    expect(container.textContent).toContain('Find a room')
    expect(container.textContent).toContain('Browse available listings and find a place that matches your needs.')
    expect(container.textContent).toContain('Available offers: 3')
    expect(container.textContent).toContain('Price from')
    expect(container.textContent).toContain('Price to')
    expect(container.textContent).toContain('Sort')
    expect(container.textContent).toContain('Quick filters')
    expect(container.textContent).toContain('Pets allowed')
    expect(container.textContent).toContain('Furnished')
    expect(container.textContent).toContain('Non-smoking')
    expect(container.textContent).not.toContain('Add listing')
    expect(container.querySelector('#listings-status')).toBeNull()
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
          query="krakow"
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
    expect(input.value).toBe('krakow')
    expect(input.placeholder).toBe('Search by title, city or district')

    act(() => {
      input.value = 'warsaw'
      input.dispatchEvent(new Event('input', { bubbles: true }))
    })

    expect(handleQueryChange).toHaveBeenCalledTimes(1)
    expect(handleQueryChange).toHaveBeenCalledWith('warsaw')
  })

  it('renders status select for landlord and calls onStatusChange after change', () => {
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
    const options = select.querySelectorAll('option')

    expect(select).not.toBeNull()
    expect(select.value).toBe('ALL')
    expect(options.length).toBeGreaterThan(1)
    expect(options[0]?.textContent).toBe('All statuses')

    act(() => {
      select.value = 'ACTIVE'
      select.dispatchEvent(new Event('change', { bubbles: true }))
    })

    expect(handleStatusChange).toHaveBeenCalledTimes(1)
    expect(handleStatusChange).toHaveBeenCalledWith('ACTIVE')
  })

  it('calls tenant price and sort handlers', () => {
    roleBoundaryState.allowRole = false

    const handleQueryChange = vi.fn()
    const handleStatusChange = vi.fn()
    const handlePriceMinChange = vi.fn()
    const handlePriceMaxChange = vi.fn()
    const handleSortChange = vi.fn()
    const handleCreateListing = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ListingsToolbar
          query=""
          selectedStatus="ALL"
          priceMin=""
          priceMax=""
          selectedSort="NEWEST"
          totalCount={0}
          activeCount={0}
          onQueryChange={handleQueryChange}
          onStatusChange={handleStatusChange}
          onPriceMinChange={handlePriceMinChange}
          onPriceMaxChange={handlePriceMaxChange}
          onSortChange={handleSortChange}
          onCreateListing={handleCreateListing}
        />,
        container,
      )
    })

    const priceMinInput = container.querySelector('#listings-price-min') as HTMLInputElement
    const priceMaxInput = container.querySelector('#listings-price-max') as HTMLInputElement
    const sortSelect = container.querySelector('#listings-sort') as HTMLSelectElement

    act(() => {
      priceMinInput.value = '1000'
      priceMinInput.dispatchEvent(new Event('input', { bubbles: true }))
    })

    act(() => {
      priceMaxInput.value = '2500'
      priceMaxInput.dispatchEvent(new Event('input', { bubbles: true }))
    })

    act(() => {
      sortSelect.value = 'PRICE_ASC'
      sortSelect.dispatchEvent(new Event('change', { bubbles: true }))
    })

    expect(handlePriceMinChange).toHaveBeenCalledWith(1000)
    expect(handlePriceMaxChange).toHaveBeenCalledWith(2500)
    expect(handleSortChange).toHaveBeenCalledWith('PRICE_ASC')
  })

  it('calls tenant quick filter handler', () => {
    roleBoundaryState.allowRole = false

    const handleQueryChange = vi.fn()
    const handleStatusChange = vi.fn()
    const handleFeatureFiltersChange = vi.fn()
    const handleCreateListing = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ListingsToolbar
          query=""
          selectedStatus="ALL"
          featureFilters={{
            petsAllowed: false,
            furnished: false,
            nonSmoking: false,
          }}
          totalCount={0}
          activeCount={0}
          onQueryChange={handleQueryChange}
          onStatusChange={handleStatusChange}
          onFeatureFiltersChange={handleFeatureFiltersChange}
          onCreateListing={handleCreateListing}
        />,
        container,
      )
    })

    const petsCheckbox = container.querySelector('#listings-filter-pets') as HTMLInputElement

    act(() => {
      petsCheckbox.checked = true
      petsCheckbox.dispatchEvent(new Event('change', { bubbles: true }))
    })

    expect(handleFeatureFiltersChange).toHaveBeenCalledWith({
      petsAllowed: true,
      furnished: false,
      nonSmoking: false,
    })
  })
})