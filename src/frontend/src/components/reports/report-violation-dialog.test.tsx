import { afterEach, describe, expect, it, vi } from 'vitest'
import { render } from 'preact'
import { act } from 'preact/test-utils'

import { ReportViolationDialog } from './report-violation-dialog'

async function waitForAssertion(assertion: () => void) {
  const timeout = Date.now() + 1000
  let lastError: unknown

  while (Date.now() < timeout) {
    try {
      assertion()
      return
    } catch (error) {
      lastError = error

      await act(async () => {
        await new Promise((resolve) => {
          setTimeout(resolve, 10)
        })
      })
    }
  }

  throw lastError
}

describe('ReportViolationDialog', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    vi.clearAllMocks()
  })

  it('renders nothing when dialog is closed', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ReportViolationDialog
          isOpen={false}
          targetId="listing-1"
          onClose={vi.fn()}
          onSubmit={vi.fn()}
        />,
        container,
      )
    })

    expect(container.textContent).toBe('')
    expect(container.querySelector('[role="dialog"]')).toBeNull()
  })

  it('renders dialog content and target label when open', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ReportViolationDialog
          isOpen
          targetId="listing-1"
          targetLabel="Jasny pokój blisko centrum"
          onClose={vi.fn()}
          onSubmit={vi.fn()}
        />,
        container,
      )
    })

    const dialog = container.querySelector('[role="dialog"]')
    const reasonSelect = container.querySelector('#report-violation-reason') as HTMLSelectElement
    const detailsTextarea = container.querySelector('#report-violation-details') as HTMLTextAreaElement

    expect(dialog).not.toBeNull()
    expect(dialog?.getAttribute('aria-modal')).toBe('true')
    expect(container.textContent).toContain('Zgłoś naruszenie')
    expect(container.textContent).toContain('Dotyczy:')
    expect(container.textContent).toContain('Jasny pokój blisko centrum')
    expect(reasonSelect).not.toBeNull()
    expect(detailsTextarea).not.toBeNull()
    expect(container.textContent).toContain('Podejrzenie oszustwa')
  })

  it('shows validation error and blocks submit when reason is missing', async () => {
    const handleSubmit = vi.fn()
    const handleClose = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ReportViolationDialog
          isOpen
          targetId="listing-1"
          onClose={handleClose}
          onSubmit={handleSubmit}
        />,
        container,
      )
    })

    const form = container.querySelector('form') as HTMLFormElement

    await act(async () => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
      await Promise.resolve()
    })

    expect(handleSubmit).not.toHaveBeenCalled()
    expect(handleClose).not.toHaveBeenCalled()
    expect(container.textContent).toContain('Wybierz powód zgłoszenia.')
  })

  it('submits trimmed payload and closes dialog on success', async () => {
    const handleSubmit = vi.fn().mockResolvedValue(undefined)
    const handleClose = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ReportViolationDialog
          isOpen
          targetId="listing-1"
          targetType="LISTING"
          onClose={handleClose}
          onSubmit={handleSubmit}
        />,
        container,
      )
    })

    const reasonSelect = container.querySelector('#report-violation-reason') as HTMLSelectElement
    const detailsTextarea = container.querySelector('#report-violation-details') as HTMLTextAreaElement
    const form = container.querySelector('form') as HTMLFormElement

    act(() => {
      reasonSelect.value = 'Spam'
      reasonSelect.dispatchEvent(new Event('change', { bubbles: true }))

      detailsTextarea.value = '  Powtarzające się ogłoszenie.  '
      detailsTextarea.dispatchEvent(new Event('input', { bubbles: true }))
    })

    await act(async () => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
      await Promise.resolve()
    })

    await waitForAssertion(() => {
      expect(handleSubmit).toHaveBeenCalledTimes(1)
      expect(handleClose).toHaveBeenCalledTimes(1)
    })

    expect(handleSubmit).toHaveBeenCalledWith({
      type: 'LISTING',
      targetId: 'listing-1',
      reason: 'Spam',
      details: 'Powtarzające się ogłoszenie.',
    })
  })

  it('submits null details when details field is empty', async () => {
    const handleSubmit = vi.fn().mockResolvedValue(undefined)
    const handleClose = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ReportViolationDialog
          isOpen
          targetId="user-1"
          targetType="USER"
          onClose={handleClose}
          onSubmit={handleSubmit}
        />,
        container,
      )
    })

    const reasonSelect = container.querySelector('#report-violation-reason') as HTMLSelectElement
    const form = container.querySelector('form') as HTMLFormElement

    act(() => {
      reasonSelect.value = 'Inny powód'
      reasonSelect.dispatchEvent(new Event('change', { bubbles: true }))
    })

    await act(async () => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
      await Promise.resolve()
    })

    await waitForAssertion(() => {
      expect(handleSubmit).toHaveBeenCalledTimes(1)
    })

    expect(handleSubmit).toHaveBeenCalledWith({
      type: 'USER',
      targetId: 'user-1',
      reason: 'Inny powód',
      details: null,
    })
  })

  it('blocks submit when details exceed max length', async () => {
    const handleSubmit = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ReportViolationDialog
          isOpen
          targetId="listing-1"
          onClose={vi.fn()}
          onSubmit={handleSubmit}
        />,
        container,
      )
    })

    const reasonSelect = container.querySelector('#report-violation-reason') as HTMLSelectElement
    const detailsTextarea = container.querySelector('#report-violation-details') as HTMLTextAreaElement
    const form = container.querySelector('form') as HTMLFormElement

    act(() => {
      reasonSelect.value = 'Spam'
      reasonSelect.dispatchEvent(new Event('change', { bubbles: true }))

      detailsTextarea.value = 'a'.repeat(1001)
      detailsTextarea.dispatchEvent(new Event('input', { bubbles: true }))
    })

    await act(async () => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
      await Promise.resolve()
    })

    expect(handleSubmit).not.toHaveBeenCalled()
    expect(container.textContent).toContain('Opis może mieć maksymalnie 1000 znaków.')
  })

  it('renders submit error when submit handler rejects', async () => {
    const handleSubmit = vi.fn().mockRejectedValue(new Error('Nie można wysłać zgłoszenia.'))
    const handleClose = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ReportViolationDialog
          isOpen
          targetId="listing-1"
          onClose={handleClose}
          onSubmit={handleSubmit}
        />,
        container,
      )
    })

    const reasonSelect = container.querySelector('#report-violation-reason') as HTMLSelectElement
    const form = container.querySelector('form') as HTMLFormElement

    act(() => {
      reasonSelect.value = 'Spam'
      reasonSelect.dispatchEvent(new Event('change', { bubbles: true }))
    })

    await act(async () => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
      await Promise.resolve()
    })

    await waitForAssertion(() => {
      expect(container.textContent).toContain('Nie można wysłać zgłoszenia.')
    })

    expect(handleClose).not.toHaveBeenCalled()
  })

  it('calls onClose after cancel click', () => {
    const handleClose = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ReportViolationDialog
          isOpen
          targetId="listing-1"
          onClose={handleClose}
          onSubmit={vi.fn()}
        />,
        container,
      )
    })

    const cancelButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Anuluj',
    ) as HTMLButtonElement

    act(() => {
      cancelButton.click()
    })

    expect(handleClose).toHaveBeenCalledTimes(1)
  })
})