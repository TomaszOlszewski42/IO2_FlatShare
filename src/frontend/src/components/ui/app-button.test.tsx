import { afterEach, describe, expect, it, vi } from 'vitest'
import { render } from 'preact'
import { act } from 'preact/test-utils'

import { AppButton } from './app-button'

describe('AppButton', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders children and uses primary variant by default', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<AppButton>Save</AppButton>, container)
    })

    const button = container.querySelector('button')

    expect(button).not.toBeNull()
    expect(button?.textContent).toBe('Save')
    expect(button?.getAttribute('type')).toBe('button')
    expect(button?.classList.contains('btn')).toBe(true)
    expect(button?.classList.contains('btn-primary')).toBe(true)
  })

  it('supports outline and ghost variants', () => {
    const outlineContainer = document.createElement('div')
    const ghostContainer = document.createElement('div')
    document.body.appendChild(outlineContainer)
    document.body.appendChild(ghostContainer)

    act(() => {
      render(<AppButton variant="outline">Cancel</AppButton>, outlineContainer)
      render(<AppButton variant="ghost">Skip</AppButton>, ghostContainer)
    })

    const outlineButton = outlineContainer.querySelector('button')
    const ghostButton = ghostContainer.querySelector('button')

    expect(outlineButton?.classList.contains('btn-outline')).toBe(true)
    expect(ghostButton?.classList.contains('btn-ghost')).toBe(true)
  })

  it('passes custom type and class name to the button', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <AppButton type="submit" className="w-full">
          Send
        </AppButton>,
        container,
      )
    })

    const button = container.querySelector('button')

    expect(button?.getAttribute('type')).toBe('submit')
    expect(button?.classList.contains('w-full')).toBe(true)
  })

  it('forwards native button attributes', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <AppButton
          aria-label="Go to listings page 3"
          aria-current="page"
          data-testid="pagination-page"
        >
          3
        </AppButton>,
        container,
      )
    })

    const button = container.querySelector('button')

    expect(button?.getAttribute('aria-label')).toBe('Go to listings page 3')
    expect(button?.getAttribute('aria-current')).toBe('page')
    expect(button?.getAttribute('data-testid')).toBe('pagination-page')
  })

  it('calls onClick when the button is clicked', () => {
    const handleClick = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<AppButton onClick={handleClick}>Kliknij</AppButton>, container)
    })

    const button = container.querySelector('button') as HTMLButtonElement

    act(() => {
      button.click()
    })

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('disables the button and shows loader when loading', () => {
    const handleClick = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <AppButton loading onClick={handleClick}>
          Zapisywanie
        </AppButton>,
        container,
      )
    })

    const button = container.querySelector('button') as HTMLButtonElement
    const loader = container.querySelector('.loading-spinner')

    expect(button.disabled).toBe(true)
    expect(button.getAttribute('aria-busy')).toBe('true')
    expect(loader).not.toBeNull()

    act(() => {
      button.click()
    })

    expect(handleClick).not.toHaveBeenCalled()
  })

  it('disables the button when disabled prop is set', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<AppButton disabled>Noaktywne</AppButton>, container)
    })

    const button = container.querySelector('button') as HTMLButtonElement

    expect(button.disabled).toBe(true)
  })
})