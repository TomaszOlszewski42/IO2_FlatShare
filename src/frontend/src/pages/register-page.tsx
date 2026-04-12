import type { RoutableProps } from 'preact-router'
import { route } from 'preact-router'
import { useState } from 'preact/hooks'

import { AppButton } from '../components/ui/app-button'
import { TextInput } from '../components/ui/text-input'
import { ApiHttpError, register } from '../services/auth-api'

export function RegisterPage(_: RoutableProps) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  async function onSubmit(event: SubmitEvent) {
    event.preventDefault()

    setIsSubmitting(true)
    setErrorMessage(null)
    setFieldErrors({})

    try {
      await register({ firstName, lastName, email, password })
      route('/login')
    } catch (error) {
      if (error instanceof ApiHttpError) {
        const mappedErrors = Object.fromEntries(
          (error.response?.fieldErrors ?? []).map((entry) => [entry.field.toLowerCase(), entry.message]),
        )

        setFieldErrors(mappedErrors)
        setErrorMessage(error.response?.message ?? 'Registration failed. Please fix the form and try again.')
      } else {
        setErrorMessage('Unexpected error while creating your account. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section class="flex w-full flex-1 items-center justify-center py-6">
      <div class="card w-full max-w-md border border-base-300 bg-base-100/85 shadow-lg">
        <div class="card-body">
          <h1 class="card-title text-2xl">Create account</h1>
          <p class="text-sm text-base-content/70">Start your FlatShare journey.</p>

          <form class="mt-4 flex flex-col gap-4" onSubmit={onSubmit}>
            <TextInput
              id="register-first-name"
              name="firstName"
              label="First name"
              type="text"
              value={firstName}
              placeholder="Alex"
              autoComplete="given-name"
              required
              disabled={isSubmitting}
              error={fieldErrors.firstname ?? fieldErrors.firstName}
              onInput={(event) => setFirstName((event.currentTarget as HTMLInputElement).value)}
            />

            <TextInput
              id="register-last-name"
              name="lastName"
              label="Last name"
              type="text"
              value={lastName}
              placeholder="Roommate"
              autoComplete="family-name"
              required
              disabled={isSubmitting}
              error={fieldErrors.lastname ?? fieldErrors.lastName}
              onInput={(event) => setLastName((event.currentTarget as HTMLInputElement).value)}
            />

            <TextInput
              id="register-email"
              name="email"
              label="Email"
              type="email"
              value={email}
              placeholder="you@example.com"
              autoComplete="email"
              required
              disabled={isSubmitting}
              error={fieldErrors.email}
              onInput={(event) => setEmail((event.currentTarget as HTMLInputElement).value)}
            />

            <TextInput
              id="register-password"
              name="password"
              label="Password"
              type="password"
              value={password}
              placeholder="Create a strong password"
              autoComplete="new-password"
              required
              disabled={isSubmitting}
              error={fieldErrors.password}
              onInput={(event) => setPassword((event.currentTarget as HTMLInputElement).value)}
            />

            {errorMessage ? <div class="alert alert-error text-sm">{errorMessage}</div> : null}

            <AppButton className="mt-2" type="submit" loading={isSubmitting}>
              Register
            </AppButton>
          </form>

          <p class="mt-3 text-sm text-base-content/70">
            Already registered?{' '}
            <a class="link link-primary" href="/login">
              Log in
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
