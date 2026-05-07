import { describe, expect, it } from 'vitest'

import { getPaginatedItems } from './pagination'

describe('getPaginatedItems', () => {
  it('returns first page items', () => {
    const result = getPaginatedItems([1, 2, 3, 4, 5], 1, 2)

    expect(result).toEqual({
      currentPage: 1,
      totalPages: 3,
      pageStart: 1,
      pageEnd: 2,
      items: [1, 2],
    })
  })

  it('returns middle page items', () => {
    const result = getPaginatedItems([1, 2, 3, 4, 5], 2, 2)

    expect(result).toEqual({
      currentPage: 2,
      totalPages: 3,
      pageStart: 3,
      pageEnd: 4,
      items: [3, 4],
    })
  })

  it('returns last page items when page has fewer elements', () => {
    const result = getPaginatedItems([1, 2, 3, 4, 5], 3, 2)

    expect(result).toEqual({
      currentPage: 3,
      totalPages: 3,
      pageStart: 5,
      pageEnd: 5,
      items: [5],
    })
  })

  it('keeps empty list on page one', () => {
    const result = getPaginatedItems([], 1, 6)

    expect(result).toEqual({
      currentPage: 1,
      totalPages: 1,
      pageStart: 0,
      pageEnd: 0,
      items: [],
    })
  })

  it('moves too high page number to last page', () => {
    const result = getPaginatedItems([1, 2, 3, 4, 5], 99, 2)

    expect(result.currentPage).toBe(3)
    expect(result.items).toEqual([5])
  })

  it('moves invalid low page number to first page', () => {
    const result = getPaginatedItems([1, 2, 3, 4, 5], 0, 2)

    expect(result.currentPage).toBe(1)
    expect(result.items).toEqual([1, 2])
  })

  it('handles invalid page size safely', () => {
    const result = getPaginatedItems([1, 2, 3], 2, 0)

    expect(result).toEqual({
      currentPage: 2,
      totalPages: 3,
      pageStart: 2,
      pageEnd: 2,
      items: [2],
    })
  })
})