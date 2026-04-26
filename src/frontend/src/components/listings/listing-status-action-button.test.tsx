import { afterEach, describe, expect, it, vi } from 'vitest'
import { render } from 'preact'
import { act } from 'preact/test-utils'

import { readAuthSession } from '../../services/auth-session'
import { ListingStatusActionButton } from './listing-status-action-button'

vi.mock('../../services/auth-session', () => ({
  readAuthSession: vi.fn(),
}))

describe('ListingStatusActionButton', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    vi.clearAllMocks()
  })

  function findButton(container: HTMLElement, text: string): HTMLButtonElement {
    const button = Array.from(container.querySelectorAll('button')).find(
      (element) => element.textContent === text,
    )

    if (!button) {
      throw new Error(`Button "${text}" was not found`)
    }

    return button
  }

  it('renders action button with provided label and variant', () => {
    const action = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ListingStatusActionButton
          listingId="listing-1"
          buttonLabel="Hide listing"
          buttonVariant="outline"
          dialogTitle="Hide listing"
          dialogMessage="Are you sure?"
          confirmLabel="Hide"
          action={action}
        />,
        container,
      )
    })

    const button = findButton(container, 'Hide listing')

    expect(button.classList.contains('btn')).toBe(true)
    expect(button.classList.contains('btn-outline')).toBe(true)
    expect(button.disabled).toBe(false)
  })

  it('opens confirmation dialog after action button click', () => {
    const action = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ListingStatusActionButton
          listingId="listing-1"
          buttonLabel="Archive listing"
          buttonVariant="ghost"
          dialogTitle="Archive listing"
          dialogMessage="Archived listings are closed."
          confirmLabel="Archive"
          action={action}
        />,
        container,
      )
    })

    act(() => {
      findButton(container, 'Archive listing').click()
    })

    const dialog = container.querySelector('[role="dialog"]')

    expect(dialog).not.toBeNull()
    expect(container.textContent).toContain('Archive listing')
    expect(container.textContent).toContain('Archived listings are closed.')
    expect(findButton(container, 'Archive')).not.toBeNull()
  })

  it('closes confirmation dialog after cancel click', () => {
    const action = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ListingStatusActionButton
          listingId="listing-1"
          buttonLabel="Hide listing"
          dialogTitle="Hide listing"
          dialogMessage="Are you sure?"
          confirmLabel="Hide"
          action={action}
        />,
        container,
      )
    })

    act(() => {
      findButton(container, 'Hide listing').click()
    })

    expect(container.querySelector('[role="dialog"]')).not.toBeNull()

    act(() => {
      findButton(container, 'Cancel').click()
    })

    expect(container.querySelector('[role="dialog"]')).toBeNull()
  })

  it('does not call action when auth session is missing', async () => {
    vi.mocked(readAuthSession).mockReturnValue(null)

    const action = vi.fn().mockResolvedValue(undefined)
    const onSuccess = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ListingStatusActionButton
          listingId="listing-1"
          buttonLabel="Hide listing"
          dialogTitle="Hide listing"
          dialogMessage="Are you sure?"
          confirmLabel="Hide"
          action={action}
          onSuccess={onSuccess}
        />,
        container,
      )
    })

    act(() => {
      findButton(container, 'Hide listing').click()
    })

    await act(async () => {
      findButton(container, 'Hide').click()
      await Promise.resolve()
    })

    expect(readAuthSession).toHaveBeenCalledTimes(1)
    expect(action).not.toHaveBeenCalled()
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('calls action with listing id and auth data after confirm click', async () => {
    vi.mocked(readAuthSession).mockReturnValue({
      token: 'access-token',
      sessionId: 'session-1',
      type: 'Bearer',
      roles: ['LANDLORD'],
      userId: 'user-1',
    })

    const action = vi.fn().mockResolvedValue(undefined)
    const onSuccess = vi.fn().mockResolvedValue(undefined)
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ListingStatusActionButton
          listingId="listing-1"
          buttonLabel="Archive listing"
          dialogTitle="Archive listing"
          dialogMessage="Are you sure?"
          confirmLabel="Archive"
          action={action}
          onSuccess={onSuccess}
        />,
        container,
      )
    })

    act(() => {
      findButton(container, 'Archive listing').click()
    })

    await act(async () => {
      findButton(container, 'Archive').click()
      await Promise.resolve()
    })

    expect(action).toHaveBeenCalledTimes(1)
    expect(action).toHaveBeenCalledWith('listing-1', 'access-token', 'Bearer')
    expect(onSuccess).toHaveBeenCalledTimes(1)
    expect(container.querySelector('[role="dialog"]')).toBeNull()
  })

  it('disables action button when disabled prop is set', () => {
    const action = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ListingStatusActionButton
          listingId="listing-1"
          disabled
          buttonLabel="Hide listing"
          dialogTitle="Hide listing"
          dialogMessage="Are you sure?"
          confirmLabel="Hide"
          action={action}
        />,
        container,
      )
    })

    const button = findButton(container, 'Hide listing')

    expect(button.disabled).toBe(true)
  })
})