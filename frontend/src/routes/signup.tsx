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
      username: '',
      password: '',
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: undefined as unknown as number,
    },
  })

  async function handleSubmit(values: SignupFormValues) {
    setError(null)

    try {
      await signup(values)
      navigate({ to: '/app', replace: true })
    } catch (signupError) {
      if (signupError instanceof Error) {
        setError(signupError.message)
      } else {
        setError('Unable to create account. Please try again.')
      }
    }
  }

  const { register, handleSubmit: handleFormSubmit, formState } = form
  const isSubmitting = formState.isSubmitting

  return (
    <AuthShell
      eyebrow="Create your workspace"
      title="Set up your Expense Tracker account"
      description="Register through the Spring Boot AuthService. Your profile data is published to the UserService via Kafka."
    >
      <form className="space-y-5" onSubmit={handleFormSubmit(handleSubmit)} noValidate>
        {/* ── Identity ─────────────────────────────────────── */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-(--sea-ink)" htmlFor="firstName">
              First name
            </label>
            <input
              id="firstName"
              type="text"
              autoComplete="given-name"
              placeholder="Alex"
              className="w-full rounded-2xl border border-(--line) bg-white/70 px-4 py-3 text-sm text-(--sea-ink) outline-none transition focus:border-(--lagoon-deep) focus:ring-2 focus:ring-[rgba(79,184,178,0.18)]"
              {...register('firstName')}
            />
            {formState.errors.firstName ? (
              <p className="m-0 text-sm text-[rgb(138,36,36)]">
                {formState.errors.firstName.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-(--sea-ink)" htmlFor="lastName">
              Last name
            </label>
            <input
              id="lastName"
              type="text"
              autoComplete="family-name"
              placeholder="Morgan"
              className="w-full rounded-2xl border border-(--line) bg-white/70 px-4 py-3 text-sm text-(--sea-ink) outline-none transition focus:border-(--lagoon-deep) focus:ring-2 focus:ring-[rgba(79,184,178,0.18)]"
              {...register('lastName')}
            />
            {formState.errors.lastName ? (
              <p className="m-0 text-sm text-[rgb(138,36,36)]">
                {formState.errors.lastName.message}
              </p>
            ) : null}
          </div>
        </div>

        {/* ── Credentials ──────────────────────────────────── */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-(--sea-ink)" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            placeholder="alexmorgan"
            className="w-full rounded-2xl border border-(--line) bg-white/70 px-4 py-3 text-sm text-(--sea-ink) outline-none transition focus:border-(--lagoon-deep) focus:ring-2 focus:ring-[rgba(79,184,178,0.18)]"
            {...register('username')}
          />
          {formState.errors.username ? (
            <p className="m-0 text-sm text-[rgb(138,36,36)]">
              {formState.errors.username.message}
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

        {/* ── Contact ──────────────────────────────────────── */}
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
          <label className="text-sm font-semibold text-(--sea-ink)" htmlFor="phoneNumber">
            Phone number
          </label>
          <input
            id="phoneNumber"
            type="tel"
            autoComplete="tel"
            placeholder="9876543210"
            className="w-full rounded-2xl border border-(--line) bg-white/70 px-4 py-3 text-sm text-(--sea-ink) outline-none transition focus:border-(--lagoon-deep) focus:ring-2 focus:ring-[rgba(79,184,178,0.18)]"
            {...register('phoneNumber', { valueAsNumber: true })}
          />
          {formState.errors.phoneNumber ? (
            <p className="m-0 text-sm text-[rgb(138,36,36)]">
              {formState.errors.phoneNumber.message}
            </p>
          ) : null}
        </div>

        {/* ── Submit ───────────────────────────────────────── */}
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