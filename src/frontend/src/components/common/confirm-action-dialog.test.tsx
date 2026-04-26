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
          title="Ukryj ogłoszenie"
          message="Czy na pewno chcesz ukryć to ogłoszenie?"
          confirmLabel="Ukryj"
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
          title="Archiwizuj ogłoszenie"
          message="Po archiwizacji ogłoszenie nie będzie widoczne dla lokatorów."
          confirmLabel="Archiwizuj"
          cancelLabel="Wróć"
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
    expect(title?.textContent).toBe('Archiwizuj ogłoszenie')
    expect(container.textContent).toContain('Po archiwizacji ogłoszenie nie będzie widoczne dla lokatorów.')

    expect(buttons.length).toBe(2)
    expect(buttons[0]?.textContent).toBe('Wróć')
    expect(buttons[1]?.textContent).toBe('Archiwizuj')
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
          title="Potwierdź akcję"
          message="Czy chcesz kontynuować?"
          confirmLabel="Tak"
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />,
        container,
      )
    })

    const buttons = container.querySelectorAll('button')

    expect(buttons[0]?.textContent).toBe('Cancel')
    expect(buttons[1]?.textContent).toBe('Tak')
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
          title="Potwierdź akcję"
          message="Czy chcesz kontynuować?"
          confirmLabel="Potwierdź"
          cancelLabel="Anuluj"
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
          title="Potwierdź akcję"
          message="Czy chcesz kontynuować?"
          confirmLabel="Potwierdź"
          cancelLabel="Anuluj"
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
          title="Ukrywanie ogłoszenia"
          message="Trwa zapisywanie zmian."
          confirmLabel="Ukryj"
          cancelLabel="Anuluj"
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