import { afterEach, describe, expect, it } from 'vitest'
import { render } from 'preact'
import { act } from 'preact/test-utils'

import { ListingFormShell } from './listing-form-shell'

describe('ListingFormShell', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders children inside shell wrapper', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ListingFormShell>
          <form>
            <input name="title" />
          </form>
        </ListingFormShell>,
        container,
      )
    })

    const wrapper = container.firstElementChild
    const input = container.querySelector('input[name="title"]')

    expect(wrapper).not.toBeNull()
    expect(input).not.toBeNull()
  })

  it('uses card styling classes', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ListingFormShell>
          <div>Form</div>
        </ListingFormShell>,
        container,
      )
    })

    const wrapper = container.firstElementChild

    expect(wrapper?.classList.contains('card')).toBe(true)
    expect(wrapper?.classList.contains('border')).toBe(true)
    expect(wrapper?.classList.contains('border-base-300')).toBe(true)
    expect(wrapper?.classList.contains('bg-base-100')).toBe(true)
    expect(wrapper?.classList.contains('shadow-sm')).toBe(true)
  })
})