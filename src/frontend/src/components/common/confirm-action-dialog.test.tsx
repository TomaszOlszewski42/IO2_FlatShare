import { afterEach, describe, expect, it, vi } from 'vitest'
import { render } from 'preact'
import { act } from 'preact/test-utils'

import { ConfirmActionDialog } from './confirm-action-dialog'

describe('ConfirmActionDialog', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders nothing when dialog is closed', () => {
    const handleConfirm = vi.fn()
    const handleCancel = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ConfirmActionDialog
          isOpen={false}
          title="Hide listing"
          message="Are you sure you want to hide this listing?"
          confirmLabel="Hide"
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />,
        container,
      )
    })

    expect(container.textContent).toBe('')
    expect(container.querySelector('[role="dialog"]')).toBeNull()
  })

  it('renders dialog title, message and action buttons when open', () => {
    const handleConfirm = vi.fn()
    const handleCancel = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ConfirmActionDialog
          isOpen
          title="Archive listing"
          message="After archiving, the listing will not be visible to tenants."
          confirmLabel="Archive"
          cancelLabel="Back"
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />,
        container,
      )
    })

    const dialog = container.querySelector('[role="dialog"]')
    const title = container.querySelector('#confirm-action-dialog-title')
    const buttons = container.querySelectorAll('button')

    expect(dialog).not.toBeNull()
    expect(dialog?.getAttribute('aria-modal')).toBe('true')
    expect(dialog?.getAttribute('aria-labelledby')).toBe('confirm-action-dialog-title')

    expect(title).not.toBeNull()
    expect(title?.textContent).toBe('Archive listing')
    expect(container.textContent).toContain('After archiving, the listing will not be visible to tenants.')

    expect(buttons.length).toBe(2)
    expect(buttons[0]?.textContent).toBe('Back')
    expect(buttons[1]?.textContent).toBe('Archive')
  })

  it('uses default cancel label when cancelLabel is not provided', () => {
    const handleConfirm = vi.fn()
    const handleCancel = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ConfirmActionDialog
          isOpen
          title="Confirm action"
          message="Do you want to continue?"
          confirmLabel="Yes"
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />,
        container,
      )
    })

    const buttons = container.querySelectorAll('button')

    expect(buttons[0]?.textContent).toBe('Cancel')
    expect(buttons[1]?.textContent).toBe('Yes')
  })

  it('calls cancel handler after clicking cancel button', () => {
    const handleConfirm = vi.fn()
    const handleCancel = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ConfirmActionDialog
          isOpen
          title="Confirm action"
          message="Do you want to continue?"
          confirmLabel="Confirm"
          cancelLabel="Cancel"
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />,
        container,
      )
    })

    const cancelButton = container.querySelectorAll('button')[0] as HTMLButtonElement

    act(() => {
      cancelButton.click()
    })

    expect(handleCancel).toHaveBeenCalledTimes(1)
    expect(handleConfirm).not.toHaveBeenCalled()
  })

  it('calls confirm handler after clicking confirm button', () => {
    const handleConfirm = vi.fn()
    const handleCancel = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ConfirmActionDialog
          isOpen
          title="Confirm action"
          message="Do you want to continue?"
          confirmLabel="Confirm"
          cancelLabel="Cancel"
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />,
        container,
      )
    })

    const confirmButton = container.querySelectorAll('button')[1] as HTMLButtonElement

    act(() => {
      confirmButton.click()
    })

    expect(handleConfirm).toHaveBeenCalledTimes(1)
    expect(handleCancel).not.toHaveBeenCalled()
  })

  it('disables actions and shows loading state while loading', () => {
    const handleConfirm = vi.fn()
    const handleCancel = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ConfirmActionDialog
          isOpen
          isLoading
          title="Hiding the listing"
          message="Trwa zapisywanie zmian."
          confirmLabel="Hide"
          cancelLabel="Cancel"
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />,
        container,
      )
    })

    const buttons = container.querySelectorAll('button')
    const cancelButton = buttons[0] as HTMLButtonElement
    const confirmButton = buttons[1] as HTMLButtonElement

    expect(cancelButton.disabled).toBe(true)
    expect(confirmButton.disabled).toBe(true)
    expect(confirmButton.getAttribute('aria-busy')).toBe('true')
    expect(container.querySelector('.loading-spinner')).not.toBeNull()
  })
})