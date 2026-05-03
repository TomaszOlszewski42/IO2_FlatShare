import { afterEach, describe, expect, it, vi } from 'vitest'
import { render } from 'preact'
import { act } from 'preact/test-utils'
import { route } from 'preact-router'
import type { ComponentChildren } from 'preact'

import { ListingOwnerActionsPanel } from './listing-owner-actions-panel'

const roleBoundaryState = vi.hoisted(() => ({
  allowRole: true,
}))

vi.mock('preact-router', () => ({
  route: vi.fn(),
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

vi.mock('./hide-listing-button', () => ({
  HideListingButton: ({
    listingId,
    disabled,
    onSuccess,
  }: {
    listingId: string
    disabled?: boolean
    onSuccess?: () => void | Promise<void>
  }) => (
    <button
      type="button"
      data-testid="hide-listing-button"
      data-listing-id={listingId}
      disabled={disabled}
      onClick={() => void onSuccess?.()}
    >
      Hide listing
    </button>
  ),
}))

vi.mock('./archive-listing-button', () => ({
  ArchiveListingButton: ({
    listingId,
    disabled,
    onSuccess,
  }: {
    listingId: string
    disabled?: boolean
    onSuccess?: () => void | Promise<void>
  }) => (
    <button
      type="button"
      data-testid="archive-listing-button"
      data-listing-id={listingId}
      disabled={disabled}
      onClick={() => void onSuccess?.()}
    >
      Archive listing
    </button>
  ),
}))

describe('ListingOwnerActionsPanel', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    roleBoundaryState.allowRole = true
    vi.clearAllMocks()
  })

  it('renders nothing when landlord role is not allowed', () => {
    roleBoundaryState.allowRole = false

    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ListingOwnerActionsPanel
          listingId="listing-1"
          status="ACTIVE"
        />,
        container,
      )
    })

    expect(container.textContent).toBe('')
    expect(container.querySelector('section')).toBeNull()
  })

  it('renders owner management title, description and current status', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ListingOwnerActionsPanel
          listingId="listing-1"
          status="ACTIVE"
        />,
        container,
      )
    })

    expect(container.textContent).toContain('Listing management')
    expect(container.textContent).toContain('Manage the visibility and life cycle of this listing.')
    expect(container.textContent).toContain('Current status:')
    expect(container.textContent).toContain('ACTIVE')
  })

  it('routes to edit page after edit button click', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ListingOwnerActionsPanel
          listingId="listing-123"
          status="ACTIVE"
        />,
        container,
      )
    })

    const editButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Edit',
    ) as HTMLButtonElement

    act(() => {
      editButton.click()
    })

    expect(route).toHaveBeenCalledTimes(1)
    expect(route).toHaveBeenCalledWith('/listings/listing-123/edit')
  })

  it('enables hide and archive actions for active listing', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ListingOwnerActionsPanel
          listingId="listing-1"
          status="ACTIVE"
        />,
        container,
      )
    })

    const hideButton = container.querySelector('[data-testid="hide-listing-button"]') as HTMLButtonElement
    const archiveButton = container.querySelector('[data-testid="archive-listing-button"]') as HTMLButtonElement

    expect(hideButton.disabled).toBe(false)
    expect(archiveButton.disabled).toBe(false)
    expect(hideButton.getAttribute('data-listing-id')).toBe('listing-1')
    expect(archiveButton.getAttribute('data-listing-id')).toBe('listing-1')
  })

  it('disables hide action but keeps archive action enabled for hidden listing', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ListingOwnerActionsPanel
          listingId="listing-1"
          status="HIDDEN"
        />,
        container,
      )
    })

    const hideButton = container.querySelector('[data-testid="hide-listing-button"]') as HTMLButtonElement
    const archiveButton = container.querySelector('[data-testid="archive-listing-button"]') as HTMLButtonElement

    expect(hideButton.disabled).toBe(true)
    expect(archiveButton.disabled).toBe(false)
  })

  it('disables hide and archive actions for archived listing', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ListingOwnerActionsPanel
          listingId="listing-1"
          status="ARCHIVED"
        />,
        container,
      )
    })

    const hideButton = container.querySelector('[data-testid="hide-listing-button"]') as HTMLButtonElement
    const archiveButton = container.querySelector('[data-testid="archive-listing-button"]') as HTMLButtonElement

    expect(hideButton.disabled).toBe(true)
    expect(archiveButton.disabled).toBe(true)
  })

  it('disables all actions while busy', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ListingOwnerActionsPanel
          listingId="listing-1"
          status="ACTIVE"
          isBusy
        />,
        container,
      )
    })

    const editButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Edit',
    ) as HTMLButtonElement
    const hideButton = container.querySelector('[data-testid="hide-listing-button"]') as HTMLButtonElement
    const archiveButton = container.querySelector('[data-testid="archive-listing-button"]') as HTMLButtonElement

    expect(editButton.disabled).toBe(true)
    expect(hideButton.disabled).toBe(true)
    expect(archiveButton.disabled).toBe(true)
  })
})