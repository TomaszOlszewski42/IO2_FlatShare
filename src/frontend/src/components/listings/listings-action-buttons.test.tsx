import { afterEach, describe, expect, it, vi } from 'vitest'
import { render } from 'preact'
import { act } from 'preact/test-utils'

import { ClearFiltersButton, CreateListingButton } from './listings-action-buttons'

describe('CreateListingButton', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders default label', () => {
    const handleClick = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<CreateListingButton onClick={handleClick} />, container)
    })

    const button = container.querySelector('button')

    expect(button).not.toBeNull()
    expect(button?.textContent).toBe('Dodaj ogłoszenie')
    expect(button?.classList.contains('btn')).toBe(true)
    expect(button?.classList.contains('btn-primary')).toBe(true)
  })

  it('renders custom label and class name', () => {
    const handleClick = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <CreateListingButton
          text="Dodaj pierwsze ogłoszenie"
          className="w-full"
          onClick={handleClick}
        />,
        container,
      )
    })

    const button = container.querySelector('button')

    expect(button?.textContent).toBe('Dodaj pierwsze ogłoszenie')
    expect(button?.classList.contains('w-full')).toBe(true)
  })

  it('calls onClick after click', () => {
    const handleClick = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<CreateListingButton onClick={handleClick} />, container)
    })

    const button = container.querySelector('button') as HTMLButtonElement

    act(() => {
      button.click()
    })

    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})

describe('ClearFiltersButton', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders clear filters label with outline variant', () => {
    const handleClick = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<ClearFiltersButton onClick={handleClick} />, container)
    })

    const button = container.querySelector('button')

    expect(button).not.toBeNull()
    expect(button?.textContent).toBe('Wyczyść filtry')
    expect(button?.classList.contains('btn')).toBe(true)
    expect(button?.classList.contains('btn-outline')).toBe(true)
  })

  it('passes custom class name', () => {
    const handleClick = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<ClearFiltersButton className="mt-4" onClick={handleClick} />, container)
    })

    const button = container.querySelector('button')

    expect(button?.classList.contains('mt-4')).toBe(true)
  })

  it('calls onClick after click', () => {
    const handleClick = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<ClearFiltersButton onClick={handleClick} />, container)
    })

    const button = container.querySelector('button') as HTMLButtonElement

    act(() => {
      button.click()
    })

    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})