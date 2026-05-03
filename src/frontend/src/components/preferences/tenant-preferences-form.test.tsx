import { afterEach, describe, expect, it, vi } from 'vitest'
import { render } from 'preact'
import { act } from 'preact/test-utils'

import type { TenantPreferences } from '../../types/tenant-preferences'
import { TenantPreferencesForm } from './tenant-preferences-form'

const initialPreferences: TenantPreferences = {
  maxPrice: 1500,
  currency: 'PLN',
  smokingAllowed: false,
  petsAllowed: true,
  preferredDistricts: ['Mokotow', 'Wola'],
}

describe('TenantPreferencesForm', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    vi.clearAllMocks()
  })

  it('renders initial preference values', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <TenantPreferencesForm
          initialValues={initialPreferences}
          onSubmit={vi.fn()}
        />,
        container,
      )
    })

    const maxPriceInput = container.querySelector('#tenant-preferences-max-price') as HTMLInputElement
    const currencySelect = container.querySelector('#tenant-preferences-currency') as HTMLSelectElement
    const smokingSelect = container.querySelector('#tenant-preferences-smoking') as HTMLSelectElement
    const petsSelect = container.querySelector('#tenant-preferences-pets') as HTMLSelectElement
    const districtsInput = container.querySelector('#tenant-preferences-districts') as HTMLInputElement

    expect(container.textContent).toContain('Maximum monthly budget')
    expect(maxPriceInput.value).toBe('1500')
    expect(currencySelect.value).toBe('PLN')
    expect(smokingSelect.value).toBe('false')
    expect(petsSelect.value).toBe('true')
    expect(districtsInput.value).toBe('Mokotow, Wola')
    expect(container.textContent).toContain('Save preferences')
  })

  it('submits normalized values and removes duplicated districts', async () => {
    const handleSubmit = vi.fn().mockResolvedValue(undefined)
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <TenantPreferencesForm
          initialValues={{
            maxPrice: null,
            currency: 'PLN',
            smokingAllowed: null,
            petsAllowed: null,
            preferredDistricts: [],
          }}
          onSubmit={handleSubmit}
        />,
        container,
      )
    })

    const maxPriceInput = container.querySelector('#tenant-preferences-max-price') as HTMLInputElement
    const smokingSelect = container.querySelector('#tenant-preferences-smoking') as HTMLSelectElement
    const petsSelect = container.querySelector('#tenant-preferences-pets') as HTMLSelectElement
    const districtsInput = container.querySelector('#tenant-preferences-districts') as HTMLInputElement
    const form = container.querySelector('form') as HTMLFormElement

    act(() => {
      maxPriceInput.value = '1750'
      maxPriceInput.dispatchEvent(new Event('input', { bubbles: true }))

      smokingSelect.value = 'false'
      smokingSelect.dispatchEvent(new Event('change', { bubbles: true }))

      petsSelect.value = 'true'
      petsSelect.dispatchEvent(new Event('change', { bubbles: true }))

      districtsInput.value = 'Mokotow, Wola, Mokotow, '
      districtsInput.dispatchEvent(new Event('input', { bubbles: true }))
    })

    await act(async () => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
      await Promise.resolve()
    })

    expect(handleSubmit).toHaveBeenCalledTimes(1)
    expect(handleSubmit).toHaveBeenCalledWith({
      maxPrice: 1750,
      currency: 'PLN',
      smokingAllowed: false,
      petsAllowed: true,
      preferredDistricts: ['Mokotow', 'Wola'],
    })
  })

  it('blocks submit and shows local validation error for negative max price', async () => {
    const handleSubmit = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <TenantPreferencesForm
          initialValues={{
            maxPrice: null,
            currency: 'PLN',
            smokingAllowed: null,
            petsAllowed: null,
            preferredDistricts: [],
          }}
          onSubmit={handleSubmit}
        />,
        container,
      )
    })

    const maxPriceInput = container.querySelector('#tenant-preferences-max-price') as HTMLInputElement
    const form = container.querySelector('form') as HTMLFormElement

    act(() => {
      maxPriceInput.value = '-1'
      maxPriceInput.dispatchEvent(new Event('input', { bubbles: true }))
    })

    await act(async () => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
      await Promise.resolve()
    })

    expect(handleSubmit).not.toHaveBeenCalled()
    expect(container.textContent).toContain('Maximum price must be a number greater than or equal to 0.')
  })

  it('renders server field errors and unbound errors', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <TenantPreferencesForm
          initialValues={initialPreferences}
          fieldErrors={{
            '$.maxPrice': ['Budget is too high.'],
            unexpectedField: ['Unexpected validation error.'],
          }}
          onSubmit={vi.fn()}
        />,
        container,
      )
    })

    expect(container.textContent).toContain('Budget is too high.')
    expect(container.textContent).toContain('Some fields require correction:')
    expect(container.textContent).toContain('Unexpected validation error.')
  })

  it('clears form and calls onReset after reset button click', () => {
    const handleReset = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <TenantPreferencesForm
          initialValues={initialPreferences}
          onReset={handleReset}
          onSubmit={vi.fn()}
        />,
        container,
      )
    })

    const resetButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Clear form',
    ) as HTMLButtonElement

    act(() => {
      resetButton.click()
    })

    const maxPriceInput = container.querySelector('#tenant-preferences-max-price') as HTMLInputElement
    const smokingSelect = container.querySelector('#tenant-preferences-smoking') as HTMLSelectElement
    const petsSelect = container.querySelector('#tenant-preferences-pets') as HTMLSelectElement
    const districtsInput = container.querySelector('#tenant-preferences-districts') as HTMLInputElement

    expect(handleReset).toHaveBeenCalledTimes(1)
    expect(maxPriceInput.value).toBe('')
    expect(smokingSelect.value).toBe('null')
    expect(petsSelect.value).toBe('null')
    expect(districtsInput.value).toBe('')
  })

  it('disables inputs and shows loading submit button while submitting', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <TenantPreferencesForm
          initialValues={initialPreferences}
          isSubmitting
          onSubmit={vi.fn()}
        />,
        container,
      )
    })

    const maxPriceInput = container.querySelector('#tenant-preferences-max-price') as HTMLInputElement
    const submitButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent?.includes('Save preferences'),
    ) as HTMLButtonElement

    expect(maxPriceInput.disabled).toBe(true)
    expect(submitButton.disabled).toBe(true)
    expect(submitButton.getAttribute('aria-busy')).toBe('true')
  })
})