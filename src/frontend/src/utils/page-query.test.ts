import { describe, expect, it } from 'vitest'

import { getPageFromSearch, withPageInSearch } from './page-query'

describe('page-query utils', () => {
  describe('getPageFromSearch', () => {
    it('returns first page when search is empty', () => {
      expect(getPageFromSearch('')).toBe(1)
    })

    it('returns page from query string', () => {
      expect(getPageFromSearch('?page=3')).toBe(3)
    })

    it('handles query strings without leading question mark', () => {
      expect(getPageFromSearch('page=4')).toBe(4)
    })

    it('rounds decimal page down', () => {
      expect(getPageFromSearch('?page=4.8')).toBe(4)
    })

    it('returns first page for invalid page', () => {
      expect(getPageFromSearch('?page=abc')).toBe(1)
    })

    it('returns first page for page lower than one', () => {
      expect(getPageFromSearch('?page=0')).toBe(1)
      expect(getPageFromSearch('?page=-5')).toBe(1)
    })
  })

  describe('withPageInSearch', () => {
    it('adds page parameter when page is greater than one', () => {
      expect(withPageInSearch('', 3)).toBe('?page=3')
    })

    it('updates existing page parameter', () => {
      expect(withPageInSearch('?page=2', 5)).toBe('?page=5')
    })

    it('keeps other query parameters', () => {
      expect(withPageInSearch('?status=ACTIVE', 4)).toBe('?status=ACTIVE&page=4')
    })

    it('removes page parameter for first page', () => {
      expect(withPageInSearch('?page=3', 1)).toBe('')
    })

    it('keeps other query parameters when removing page', () => {
      expect(withPageInSearch('?status=ACTIVE&page=3', 1)).toBe('?status=ACTIVE')
    })

    it('handles invalid page safely', () => {
      expect(withPageInSearch('?page=3', Number.NaN)).toBe('')
    })
  })
})