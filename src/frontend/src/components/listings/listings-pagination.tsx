import { AppButton } from '../ui/app-button'
import { ListingsSurface } from './listings-surface'

type ListingsPaginationProps = {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

type PaginationItem = number | string

function createPageRange(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, index) => start + index)
}

function getVisiblePageItems(currentPage: number, totalPages: number): PaginationItem[] {
  if (totalPages <= 7) {
    return createPageRange(1, totalPages)
  }

  const selectedPages = new Set<number>([
    1,
    totalPages,
    currentPage - 1,
    currentPage,
    currentPage + 1,
  ])

  if (currentPage <= 4) {
    createPageRange(2, 5).forEach((page) => selectedPages.add(page))
  }

  if (currentPage >= totalPages - 3) {
    createPageRange(totalPages - 4, totalPages - 1).forEach((page) => selectedPages.add(page))
  }

  const sortedPages = Array.from(selectedPages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((first, second) => first - second)

  const items: PaginationItem[] = []

  sortedPages.forEach((page, index) => {
    const previousPage = sortedPages[index - 1]

    if (previousPage !== undefined) {
      const gap = page - previousPage

      if (gap === 2) {
        items.push(previousPage + 1)
      }

      if (gap > 2) {
        items.push(`ellipsis-${previousPage}-${page}`)
      }
    }

    items.push(page)
  })

  return items
}

export function ListingsPagination({
  currentPage,
  totalPages,
  onPageChange,
}: ListingsPaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  const visibleItems = getVisiblePageItems(currentPage, totalPages)

  const goToPage = (page: number) => {
    const safePage = Math.min(Math.max(page, 1), totalPages)
    onPageChange(safePage)
  }

  return (
    <ListingsSurface translucent>
      <nav
        class="card-body flex-row flex-wrap items-center justify-between gap-3 py-4"
        aria-label="Listings pagination"
      >
        <p class="text-sm text-base-content/65">
          Page {currentPage} of {totalPages}
        </p>

        <div class="flex flex-wrap items-center gap-2">
          <AppButton
            variant="ghost"
            className="btn-sm"
            disabled={currentPage === 1}
            aria-label="Go to previous listings page"
            onClick={() => goToPage(currentPage - 1)}
          >
            Previous
          </AppButton>

          {visibleItems.map((item) => {
            if (typeof item === 'string') {
              return (
                <span
                  key={item}
                  class="flex min-w-8 items-center justify-center text-sm text-base-content/50"
                  aria-hidden="true"
                >
                  ...
                </span>
              )
            }

            const isCurrentPage = item === currentPage

            return (
              <AppButton
                key={item}
                variant={isCurrentPage ? 'primary' : 'outline'}
                className="btn-sm min-w-10"
                disabled={isCurrentPage}
                aria-current={isCurrentPage ? 'page' : undefined}
                aria-label={
                  isCurrentPage
                    ? `Current page, page ${item}`
                    : `Go to listings page ${item}`
                }
                onClick={() => goToPage(item)}
              >
                {item}
              </AppButton>
            )
          })}

          <AppButton
            variant="ghost"
            className="btn-sm"
            disabled={currentPage === totalPages}
            aria-label="Go to next listings page"
            onClick={() => goToPage(currentPage + 1)}
          >
            Next
          </AppButton>
        </div>
      </nav>
    </ListingsSurface>
  )
}