import { afterEach, describe, expect, it, vi } from 'vitest'
import { render } from 'preact'
import { act } from 'preact/test-utils'

import { ListingsResultsSummary } from './listings-results-summary'

describe('ListingsResultsSummary', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    vi.clearAllMocks()
  })

  it('renders paginated range for tenant offers', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ListingsResultsSummary
          visibleCount={23}
          totalCount={23}
          hasFilters={false}
          isLandlord={false}
          pageStart={7}
          pageEnd={12}
          onClearFilters={vi.fn()}
        />,
        container,
      )
    })

    expect(container.textContent).toContain('Showing 7-12 of 23 offers')
    expect(container.textContent).toContain('Use filters to quickly find the best matching room.')
  })

  it('renders paginated range for landlord listings', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ListingsResultsSummary
          visibleCount={11}
          totalCount={11}
          hasFilters={false}
          isLandlord
          pageStart={1}
          pageEnd={6}
          onClearFilters={vi.fn()}
        />,
        container,
      )
    })

    expect(container.textContent).toContain('Showing 1-6 of 11 listings')
    expect(container.textContent).toContain('Use filters to manage your listings faster.')
  })

  it('shows how many results were filtered from total count', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ListingsResultsSummary
          visibleCount={4}
          totalCount={20}
          hasFilters
          isLandlord={false}
          pageStart={1}
          pageEnd={4}
          onClearFilters={vi.fn()}
        />,
        container,
      )
    })

    expect(container.textContent).toContain('Showing 1-4 of 4 offers')
    expect(container.textContent).toContain('Filtered from 20 offers.')
  })

  it('calls onClearFilters when clear button is clicked', () => {
    const handleClearFilters = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ListingsResultsSummary
          visibleCount={4}
          totalCount={20}
          hasFilters
          isLandlord={false}
          pageStart={1}
          pageEnd={4}
          onClearFilters={handleClearFilters}
        />,
        container,
      )
    })

    const clearButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Clear filters',
    )

    act(() => {
      clearButton?.click()
    })

    expect(handleClearFilters).toHaveBeenCalledOnce()
  })

  it('keeps old zero results text when there are no matching listings', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ListingsResultsSummary
          visibleCount={0}
          totalCount={8}
          hasFilters
          isLandlord={false}
          onClearFilters={vi.fn()}
        />,
        container,
      )
    })

    expect(container.textContent).toContain('Showing 0 of 8 offers')
    expect(container.textContent).toContain('Filtered from 8 offers.')
  })
})