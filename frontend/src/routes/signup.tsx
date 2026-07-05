import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { AuthShell } from '../components/layouts/auth-shell'
import { signupSchema } from '../features/auth/auth.schemas'
import type { SignupFormValues } from '../features/auth/auth.schemas'
import { useAuth } from '../hooks/use-auth'

export const Route = createFileRoute('/signup')({ component: SignupPage })

function SignupPage() {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
    },
  })

  async function handleSubmit(values: SignupFormValues) {
    setError(null)

    try {
      await signup(values)
      navigate({ to: '/app', replace: true })
    } catch (signupError) {
      setError(signupError instanceof Error ? signupError.message : 'Unable to sign up.')
    }
  }

  const { register, handleSubmit: handleFormSubmit, formState } = form
  const isSubmitting = formState.isSubmitting

  return (
    <AuthShell
      eyebrow="Create your workspace"
      title="Set up Expense Tracker in a few seconds"
      description="The account service is mock-backed for now, but the route, state, and form boundaries match the final backend integration path."
    >
      <form className="space-y-5" onSubmit={handleFormSubmit(handleSubmit)} noValidate>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-(--sea-ink)" htmlFor="fullName">
            Full name
          </label>
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            placeholder="Alex Morgan"
            className="w-full rounded-2xl border border-(--line) bg-white/70 px-4 py-3 text-sm text-(--sea-ink) outline-none transition focus:border-(--lagoon-deep) focus:ring-2 focus:ring-[rgba(79,184,178,0.18)]"
            {...register('fullName')}
          />
          {formState.errors.fullName ? (
            <p className="m-0 text-sm text-[rgb(138,36,36)]">
              {formState.errors.fullName.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-(--sea-ink)" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            className="w-full rounded-2xl border border-(--line) bg-white/70 px-4 py-3 text-sm text-(--sea-ink) outline-none transition focus:border-(--lagoon-deep) focus:ring-2 focus:ring-[rgba(79,184,178,0.18)]"
            {...register('email')}
          />
          {formState.errors.email ? (
            <p className="m-0 text-sm text-[rgb(138,36,36)]">
              {formState.errors.email.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-(--sea-ink)" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="Create a strong password"
            className="w-full rounded-2xl border border-(--line) bg-white/70 px-4 py-3 text-sm text-(--sea-ink) outline-none transition focus:border-(--lagoon-deep) focus:ring-2 focus:ring-[rgba(79,184,178,0.18)]"
            {...register('password')}
          />
          {formState.errors.password ? (
            <p className="m-0 text-sm text-[rgb(138,36,36)]">
              {formState.errors.password.message}
            </p>
          ) : null}
        </div>

        {error ? (
          <p className="rounded-2xl border border-[rgba(180,65,65,0.2)] bg-[rgba(180,65,65,0.08)] px-4 py-3 text-sm text-[rgb(138,36,36)]">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-full bg-(--lagoon) px-5 py-3 text-sm font-semibold text-white transition hover:bg-(--lagoon-deep) disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>

        <p className="text-sm text-(--sea-ink-soft)">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-(--lagoon-deep)">
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  )
}