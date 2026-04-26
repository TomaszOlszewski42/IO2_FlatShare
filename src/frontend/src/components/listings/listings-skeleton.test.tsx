import { afterEach, describe, expect, it } from 'vitest'
import { render } from 'preact'
import { act } from 'preact/test-utils'

import { ListingsSkeleton } from './listings-skeleton'

describe('ListingsSkeleton', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders four skeleton cards by default', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<ListingsSkeleton />, container)
    })

    const cards = container.querySelectorAll('.card')

    expect(cards.length).toBe(4)
  })

  it('renders requested number of skeleton cards', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<ListingsSkeleton count={2} />, container)
    })

    const cards = container.querySelectorAll('.card')

    expect(cards.length).toBe(2)
  })

  it('renders empty grid when count is zero', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<ListingsSkeleton count={0} />, container)
    })

    const grid = container.firstElementChild

    expect(grid).not.toBeNull()
    expect(grid?.classList.contains('grid')).toBe(true)
    expect(grid?.classList.contains('gap-4')).toBe(true)
    expect(container.querySelectorAll('.card').length).toBe(0)
  })

  it('renders expected skeleton placeholders inside each card', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<ListingsSkeleton count={1} />, container)
    })

    const card = container.querySelector('.card')
    const body = container.querySelector('.card-body')
    const skeletons = container.querySelectorAll('.skeleton')

    expect(card).not.toBeNull()
    expect(card?.classList.contains('border')).toBe(true)
    expect(card?.classList.contains('border-base-300')).toBe(true)
    expect(card?.classList.contains('bg-base-100')).toBe(true)
    expect(card?.classList.contains('shadow-sm')).toBe(true)

    expect(body).not.toBeNull()
    expect(body?.classList.contains('gap-3')).toBe(true)

    expect(skeletons.length).toBe(4)
    expect(skeletons[0]?.classList.contains('h-5')).toBe(true)
    expect(skeletons[1]?.classList.contains('h-4')).toBe(true)
    expect(skeletons[2]?.classList.contains('h-28')).toBe(true)
    expect(skeletons[3]?.classList.contains('h-4')).toBe(true)
  })

  it('renders responsive grid classes', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<ListingsSkeleton count={1} />, container)
    })

    const grid = container.firstElementChild

    expect(grid?.classList.contains('grid')).toBe(true)
    expect(grid?.classList.contains('gap-4')).toBe(true)
    expect(grid?.classList.contains('md:grid-cols-2')).toBe(true)
  })
})