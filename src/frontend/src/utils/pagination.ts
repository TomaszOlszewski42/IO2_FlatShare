export type PaginatedItemsResult<TItem> = {
  currentPage: number
  totalPages: number
  pageStart: number
  pageEnd: number
  items: TItem[]
}

function getSafePositiveInteger(value: number, fallback: number): number {
  if (!Number.isFinite(value)) {
    return fallback
  }

  return Math.max(1, Math.floor(value))
}

export function getPaginatedItems<TItem>(
  items: TItem[],
  currentPage: number,
  itemsPerPage: number,
): PaginatedItemsResult<TItem> {
  const safeItemsPerPage = getSafePositiveInteger(itemsPerPage, 1)
  const totalPages = Math.max(1, Math.ceil(items.length / safeItemsPerPage))
  const safeCurrentPage = Math.min(
    getSafePositiveInteger(currentPage, 1),
    totalPages,
  )

  const startIndex = (safeCurrentPage - 1) * safeItemsPerPage
  const endIndex = startIndex + safeItemsPerPage

  return {
    currentPage: safeCurrentPage,
    totalPages,
    pageStart: items.length === 0 ? 0 : startIndex + 1,
    pageEnd: Math.min(endIndex, items.length),
    items: items.slice(startIndex, endIndex),
  }
}