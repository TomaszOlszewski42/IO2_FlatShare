import { afterEach, describe, expect, it } from 'vitest'
import { render } from 'preact'
import { act } from 'preact/test-utils'

import { AuthCard } from './auth-card'

describe('AuthCard', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders title, subtitle and children', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <AuthCard title="Logowanie" subtitle="Zaloguj się do FlatShare">
          <form>
            <input name="email" />
          </form>
        </AuthCard>,
        container,
      )
    })

    const title = container.querySelector('h1')
    const subtitle = container.querySelector('p')
    const input = container.querySelector('input[name="email"]')

    expect(title).not.toBeNull()
    expect(title?.textContent).toBe('Logowanie')
    expect(title?.classList.contains('card-title')).toBe(true)
    expect(title?.classList.contains('text-2xl')).toBe(true)

    expect(subtitle).not.toBeNull()
    expect(subtitle?.textContent).toBe('Zaloguj się do FlatShare')

    expect(input).not.toBeNull()
  })

  it('renders card structure with expected styling classes', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <AuthCard title="Rejestracja" subtitle="Utwórz konto">
          <div>Formularz</div>
        </AuthCard>,
        container,
      )
    })

    const section = container.querySelector('section')
    const card = container.querySelector('.card')
    const body = container.querySelector('.card-body')

    expect(section).not.toBeNull()
    expect(section?.classList.contains('flex')).toBe(true)
    expect(section?.classList.contains('justify-center')).toBe(true)

    expect(card).not.toBeNull()
    expect(card?.classList.contains('max-w-md')).toBe(true)
    expect(card?.classList.contains('shadow-lg')).toBe(true)

    expect(body).not.toBeNull()
  })

  it('renders footer when provided', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <AuthCard
          title="Reset hasła"
          subtitle="Podaj adres email"
          footer={<button type="button">Wróć do logowania</button>}
        >
          <form>Formularz resetu</form>
        </AuthCard>,
        container,
      )
    })

    const footer = container.querySelector('.card-actions')
    const button = container.querySelector('button')

    expect(footer).not.toBeNull()
    expect(footer?.classList.contains('mt-3')).toBe(true)
    expect(button).not.toBeNull()
    expect(button?.textContent).toBe('Wróć do logowania')
  })

  it('does not render footer container when footer is missing', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <AuthCard title="Logowanie" subtitle="Zaloguj się">
          <form>Formularz</form>
        </AuthCard>,
        container,
      )
    })

    expect(container.querySelector('.card-actions')).toBeNull()
  })
})