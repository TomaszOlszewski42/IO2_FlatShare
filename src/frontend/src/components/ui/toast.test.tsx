import { afterEach, describe, expect, it, vi } from 'vitest'
import { render } from 'preact'
import { act } from 'preact/test-utils'

import { Toast } from './toast'

describe('Toast', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders error toast with message and role alert', () => {
    const handleRemove = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <Toast
          toast={{
            id: 'toast-1',
            type: 'error',
            message: 'Nie udało się zapisać danych',
          }}
          onRemove={handleRemove}
        />,
        container,
      )
    })

    const alert = container.querySelector('[role="alert"]')

    expect(alert).not.toBeNull()
    expect(alert?.classList.contains('alert')).toBe(true)
    expect(alert?.classList.contains('alert-soft')).toBe(true)
    expect(alert?.classList.contains('alert-error')).toBe(true)
    expect(alert?.textContent).toContain('Nie udało się zapisać danych')
  })

  it('renders success toast with success styling', () => {
    const handleRemove = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <Toast
          toast={{
            id: 'toast-2',
            type: 'success',
            message: 'Dane zostały zapisane',
          }}
          onRemove={handleRemove}
        />,
        container,
      )
    })

    const alert = container.querySelector('[role="alert"]')

    expect(alert?.classList.contains('alert-success')).toBe(true)
    expect(alert?.textContent).toContain('Dane zostały zapisane')
  })

  it('renders warning toast with warning styling', () => {
    const handleRemove = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <Toast
          toast={{
            id: 'toast-3',
            type: 'warning',
            message: 'Sprawdź dane formularza',
          }}
          onRemove={handleRemove}
        />,
        container,
      )
    })

    const alert = container.querySelector('[role="alert"]')

    expect(alert?.classList.contains('alert-warning')).toBe(true)
    expect(alert?.textContent).toContain('Sprawdź dane formularza')
  })

  it('renders info toast with info styling', () => {
    const handleRemove = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <Toast
          toast={{
            id: 'toast-4',
            type: 'info',
            message: 'Trwa ładowanie danych',
          }}
          onRemove={handleRemove}
        />,
        container,
      )
    })

    const alert = container.querySelector('[role="alert"]')

    expect(alert?.classList.contains('alert-info')).toBe(true)
    expect(alert?.textContent).toContain('Trwa ładowanie danych')
  })

  it('calls onRemove with toast id after close button click', () => {
    const handleRemove = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <Toast
          toast={{
            id: 'toast-to-remove',
            type: 'success',
            message: 'Zamknij mnie',
          }}
          onRemove={handleRemove}
        />,
        container,
      )
    })

    const button = container.querySelector('button') as HTMLButtonElement

    expect(button).not.toBeNull()
    expect(button.getAttribute('type')).toBe('button')
    expect(button.getAttribute('aria-label')).toBe('Close notification')
    expect(button.textContent).toBe('✕')

    act(() => {
      button.click()
    })

    expect(handleRemove).toHaveBeenCalledTimes(1)
    expect(handleRemove).toHaveBeenCalledWith('toast-to-remove')
  })
})