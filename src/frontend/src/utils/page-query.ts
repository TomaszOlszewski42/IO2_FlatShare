export function getPageFromSearch(search: string): number {
  const params = new URLSearchParams(search)
  const pageParam = params.get('page')

  if (!pageParam) {
    return 1
  }

  const page = Number(pageParam)

  if (!Number.isFinite(page)) {
    return 1
  }

  return Math.max(1, Math.floor(page))
}

export function withPageInSearch(search: string, page: number): string {
  const params = new URLSearchParams(search)
  const safePage = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1

  if (safePage <= 1) {
    params.delete('page')
  } else {
    params.set('page', String(safePage))
  }

  const nextSearch = params.toString()

  return nextSearch ? `?${nextSearch}` : ''
}