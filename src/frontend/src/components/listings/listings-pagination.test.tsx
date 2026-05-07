import { afterEach, describe, expect, it, vi } from 'vitest'
import { render } from 'preact'
import { act } from 'preact/test-utils'

import { ListingsPagination } from './listings-pagination'

function renderPagination({
  currentPage,
  totalPages,
  onPageChange = vi.fn(),
}: {
  currentPage: number
  totalPages: number
  onPageChange?: (page: number) => void
}) {
  const container = document.createElement('div')
  document.body.appendChild(container)

  act(() => {
    render(
      <ListingsPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />,
      container,
    )
  })

  return container
}

function getButtonTexts(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll('button')).map((button) =>
    button.textContent?.trim() ?? '',
  )
}

describe('ListingsPagination', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    vi.clearAllMocks()
  })

  it('does not render when there is only one page', () => {
    const container = renderPagination({
      currentPage: 1,
      totalPages: 1,
    })

    expect(container.textContent).toBe('')
  })

  it('renders current page information', () => {
    const container = renderPagination({
      currentPage: 2,
      totalPages: 5,
    })

    expect(container.textContent).toContain('Page 2 of 5')
  })

  it('renders pagination navigation landmark', () => {
    const container = renderPagination({
      currentPage: 2,
      totalPages: 5,
    })

    const nav = container.querySelector('nav[aria-label="Listings pagination"]')

    expect(nav).not.toBeNull()
  })

  it('marks current page with aria-current', () => {
    const container = renderPagination({
      currentPage: 3,
      totalPages: 5,
    })

    const currentPageButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === '3',
    )

    expect(currentPageButton?.getAttribute('aria-current')).toBe('page')
    expect(currentPageButton?.getAttribute('aria-label')).toBe('Current page, page 3')
  })

  it('adds accessible labels to previous and next buttons', () => {
    const container = renderPagination({
      currentPage: 2,
      totalPages: 5,
    })

    const previousButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Previous',
    )
    const nextButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Next',
    )

    expect(previousButton?.getAttribute('aria-label')).toBe('Go to previous listings page')
    expect(nextButton?.getAttribute('aria-label')).toBe('Go to next listings page')
  })

  it('calls onPageChange when next page is selected', () => {
    const handlePageChange = vi.fn()

    const container = renderPagination({
      currentPage: 2,
      totalPages: 5,
      onPageChange: handlePageChange,
    })

    const nextButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Next',
    )

    act(() => {
      nextButton?.click()
    })

    expect(handlePageChange).toHaveBeenCalledWith(3)
  })

  it('calls onPageChange when previous page is selected', () => {
    const handlePageChange = vi.fn()

    const container = renderPagination({
      currentPage: 3,
      totalPages: 5,
      onPageChange: handlePageChange,
    })

    const previousButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Previous',
    )

    act(() => {
      previousButton?.click()
    })

    expect(handlePageChange).toHaveBeenCalledWith(2)
  })

  it('calls onPageChange when specific page is selected', () => {
    const handlePageChange = vi.fn()

    const container = renderPagination({
      currentPage: 2,
      totalPages: 5,
      onPageChange: handlePageChange,
    })

    const pageFourButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === '4',
    )

    act(() => {
      pageFourButton?.click()
    })

    expect(handlePageChange).toHaveBeenCalledWith(4)
  })

  it('disables previous button on first page', () => {
    const container = renderPagination({
      currentPage: 1,
      totalPages: 3,
    })

    const previousButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Previous',
    )

    expect(previousButton?.disabled).toBe(true)
  })

  it('disables next button on last page', () => {
    const container = renderPagination({
      currentPage: 3,
      totalPages: 3,
    })

    const nextButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Next',
    )

    expect(nextButton?.disabled).toBe(true)
  })

  it('renders every page when there are only a few pages', () => {
    const container = renderPagination({
      currentPage: 3,
      totalPages: 5,
    })

    expect(getButtonTexts(container)).toEqual([
      'Previous',
      '1',
      '2',
      '3',
      '4',
      '5',
      'Next',
    ])
    expect(container.textContent).not.toContain('...')
  })

  it('collapses middle pages when there are many pages', () => {
    const container = renderPagination({
      currentPage: 10,
      totalPages: 20,
    })

    expect(getButtonTexts(container)).toEqual([
      'Previous',
      '1',
      '9',
      '10',
      '11',
      '20',
      'Next',
    ])
    expect(container.textContent).toContain('...')
  })

  it('shows more pages near the beginning', () => {
    const container = renderPagination({
      currentPage: 2,
      totalPages: 20,
    })

    expect(getButtonTexts(container)).toEqual([
      'Previous',
      '1',
      '2',
      '3',
      '4',
      '5',
      '20',
      'Next',
    ])
    expect(container.textContent).toContain('...')
  })

  it('shows more pages near the end', () => {
    const container = renderPagination({
      currentPage: 19,
      totalPages: 20,
    })

    expect(getButtonTexts(container)).toEqual([
      'Previous',
      '1',
      '16',
      '17',
      '18',
      '19',
      '20',
      'Next',
    ])
    expect(container.textContent).toContain('...')
  })
})