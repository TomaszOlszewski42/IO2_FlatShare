import type { RoutableProps } from 'preact-router'
import { route } from 'preact-router'
import { useState } from 'preact/hooks'

import { FormErrorSummary } from '../components/forms/form-error-summary'
import { AppButton } from '../components/ui/app-button'
import { TextInput } from '../components/ui/text-input'
import { usePageErrorHandler } from '../hooks/use-page-error-handler'
import { register } from '../services/auth-api'
import { ApiHttpError } from '../services/api-client'

export function RegisterPage(_: RoutableProps) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { errorMessage, fieldErrors, clearErrors, handleError } = usePageErrorHandler()

  async function onSubmit(event: SubmitEvent) {
    event.preventDefault()

    setIsSubmitting(true)
    clearErrors()

    try {
      await register({ firstName, lastName, email, password })
      route('/login')
    } catch (error) {
      if (error instanceof ApiHttpError) {
        handleError(error, 'Registration failed. Please fix the form and try again.')
      } else {
        handleError(error, 'Unexpected error while creating your account. Please try again.')
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
              errors={fieldErrors.firstName}
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
              errors={fieldErrors.lastName}
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
              errors={fieldErrors.email}
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
              errors={fieldErrors.password}
              onInput={(event) => setPassword((event.currentTarget as HTMLInputElement).value)}
            />

            <FormErrorSummary error={errorMessage} />

        {generalError ? <div class="alert alert-soft alert-error text-sm">{generalError}</div> : null}

          <p class="mt-3 text-sm text-base-content/70">
            Already registered?{' '}
            <button
              class="link link-primary"
              type="button"
              onClick={() => route('/login')}
            >
              Log in
            </button>
          </p>
        </div>
      </div>
    </section>
  )
}