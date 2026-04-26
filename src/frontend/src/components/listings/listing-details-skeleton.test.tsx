import { afterEach, describe, expect, it } from 'vitest'
import { render } from 'preact'
import { act } from 'preact/test-utils'

import { ListingDetailsSkeleton } from './listing-details-skeleton'

describe('ListingDetailsSkeleton', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders main skeleton section', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<ListingDetailsSkeleton />, container)
    })

    const section = container.querySelector('section')

    expect(section).not.toBeNull()
    expect(section?.classList.contains('flex')).toBe(true)
    expect(section?.classList.contains('w-full')).toBe(true)
    expect(section?.classList.contains('flex-1')).toBe(true)
    expect(section?.classList.contains('flex-col')).toBe(true)
    expect(section?.classList.contains('gap-4')).toBe(true)
  })

  it('renders all expected skeleton placeholders', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<ListingDetailsSkeleton />, container)
    })

    const skeletons = container.querySelectorAll('.skeleton')

    expect(skeletons.length).toBe(6)
    expect(skeletons[0]?.classList.contains('h-10')).toBe(true)
    expect(skeletons[1]?.classList.contains('h-12')).toBe(true)
    expect(skeletons[2]?.classList.contains('h-6')).toBe(true)
    expect(skeletons[3]?.classList.contains('h-96')).toBe(true)
    expect(skeletons[4]?.classList.contains('h-56')).toBe(true)
    expect(skeletons[5]?.classList.contains('h-56')).toBe(true)
  })

  it('renders responsive grid for lower skeleton blocks', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<ListingDetailsSkeleton />, container)
    })

    const grid = container.querySelector('.grid')

    expect(grid).not.toBeNull()
    expect(grid?.classList.contains('gap-4')).toBe(true)
    expect(grid?.classList.contains('md:grid-cols-2')).toBe(true)
  })
})