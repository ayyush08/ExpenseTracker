import { useEffect, useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { useAuth } from '../../hooks/use-auth'
import { passwordSchema, profileSchema } from '../../features/auth/auth.schemas'
import type { PasswordFormValues, ProfileFormValues } from '../../features/auth/auth.schemas'

export const Route = createFileRoute('/app/profile')({ component: ProfilePage })

function ProfilePage() {
  const { user, updateUserProfile, updatePassword } = useAuth()
  const [profileError, setProfileError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName ?? '',
      email: user?.email ?? '',
      currency: user?.currency ?? 'USD',
      monthlyBudget: user?.monthlyBudget ?? 2500,
    },
  })

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
    },
  })

  const {
    register: registerProfile,
    handleSubmit: handleProfileFormSubmit,
    reset: resetProfile,
    formState: profileFormState,
  } = profileForm

  const {
    register: registerPassword,
    handleSubmit: handlePasswordFormSubmit,
    reset: resetPassword,
    formState: passwordFormState,
  } = passwordForm

  useEffect(() => {
    resetProfile({
      fullName: user?.fullName ?? '',
      email: user?.email ?? '',
      currency: user?.currency ?? 'USD',
      monthlyBudget: user?.monthlyBudget ?? 2500,
    })
  }, [resetProfile, user])

  async function handleProfileSubmit(values: ProfileFormValues) {
    setProfileError(null)
    setProfileSuccess(null)

    try {
      await updateUserProfile(values)
      setProfileSuccess('Profile updated in the mock store.')
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : 'Unable to update profile.')
    }
  }

  async function handlePasswordSubmit(values: PasswordFormValues) {
    setPasswordError(null)
    setPasswordSuccess(null)

    try {
      await updatePassword(values)
      setPasswordSuccess('Password updated in the mock store.')
      resetPassword()
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : 'Unable to change password.')
    }
  }

  return (
    <main className="page-wrap px-4 py-8 sm:py-10">
      <section className="island-shell rounded-4xl p-6 sm:p-8">
        <p className="island-kicker mb-2">Profile</p>
        <h1 className="display-title text-4xl font-bold text-(--sea-ink) sm:text-5xl">
          Account settings
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-(--sea-ink-soft)">
          The profile page already talks to the mock auth store. Later it can be
          pointed at the Spring Boot profile endpoints without changing the UI
          contract.
        </p>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-2">
        <article className="island-shell rounded-2xl p-6 sm:p-7">
          <p className="island-kicker mb-2">Profile details</p>
          <form className="space-y-4" onSubmit={handleProfileFormSubmit(handleProfileSubmit)} noValidate>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-(--sea-ink)" htmlFor="fullName">
                Full name
              </label>
              <input
                id="fullName"
                name="fullName"
                {...registerProfile('fullName')}
                className="w-full rounded-2xl border border-(--line) bg-white/70 px-4 py-3 text-sm text-(--sea-ink) outline-none focus:border-(--lagoon-deep) focus:ring-2 focus:ring-[rgba(79,184,178,0.18)]"
              />
              {profileFormState.errors.fullName ? (
                <p className="m-0 text-sm text-[rgb(138,36,36)]">
                  {profileFormState.errors.fullName.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-(--sea-ink)" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                {...registerProfile('email')}
                className="w-full rounded-2xl border border-(--line) bg-white/70 px-4 py-3 text-sm text-(--sea-ink) outline-none focus:border-(--lagoon-deep) focus:ring-2 focus:ring-[rgba(79,184,178,0.18)]"
              />
              {profileFormState.errors.email ? (
                <p className="m-0 text-sm text-[rgb(138,36,36)]">
                  {profileFormState.errors.email.message}
                </p>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-(--sea-ink)" htmlFor="currency">
                  Currency
                </label>
                <input
                  id="currency"
                  name="currency"
                  {...registerProfile('currency')}
                  className="w-full rounded-2xl border border-(--line) bg-white/70 px-4 py-3 text-sm text-(--sea-ink) outline-none focus:border-(--lagoon-deep) focus:ring-2 focus:ring-[rgba(79,184,178,0.18)]"
                />
                {profileFormState.errors.currency ? (
                  <p className="m-0 text-sm text-[rgb(138,36,36)]">
                    {profileFormState.errors.currency.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-(--sea-ink)" htmlFor="monthlyBudget">
                  Monthly budget
                </label>
                <input
                  id="monthlyBudget"
                  name="monthlyBudget"
                  type="number"
                  {...registerProfile('monthlyBudget', { valueAsNumber: true })}
                  className="w-full rounded-2xl border border-(--line) bg-white/70 px-4 py-3 text-sm text-(--sea-ink) outline-none focus:border-(--lagoon-deep) focus:ring-2 focus:ring-[rgba(79,184,178,0.18)]"
                />
                {profileFormState.errors.monthlyBudget ? (
                  <p className="m-0 text-sm text-[rgb(138,36,36)]">
                    {profileFormState.errors.monthlyBudget.message}
                  </p>
                ) : null}
              </div>
            </div>

            {profileError ? (
              <p className="rounded-2xl border border-[rgba(180,65,65,0.2)] bg-[rgba(180,65,65,0.08)] px-4 py-3 text-sm text-[rgb(138,36,36)]">
                {profileError}
              </p>
            ) : null}
            {profileSuccess ? (
              <p className="rounded-2xl border border-[rgba(47,106,74,0.2)] bg-[rgba(47,106,74,0.08)] px-4 py-3 text-sm text-[rgb(30,96,56)]">
                {profileSuccess}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={profileFormState.isSubmitting}
              className="inline-flex rounded-full bg-(--lagoon) px-5 py-3 text-sm font-semibold text-white transition hover:bg-(--lagoon-deep)"
            >
              {profileFormState.isSubmitting ? 'Saving...' : 'Save profile'}
            </button>
          </form>
        </article>

        <article className="island-shell rounded-2xl p-6 sm:p-7">
          <p className="island-kicker mb-2">Security</p>
          <form className="space-y-4" onSubmit={handlePasswordFormSubmit(handlePasswordSubmit)} noValidate>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-(--sea-ink)" htmlFor="currentPassword">
                Current password
              </label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                {...registerPassword('currentPassword')}
                className="w-full rounded-2xl border border-(--line) bg-white/70 px-4 py-3 text-sm text-(--sea-ink) outline-none focus:border-(--lagoon-deep) focus:ring-2 focus:ring-[rgba(79,184,178,0.18)]"
              />
              {passwordFormState.errors.currentPassword ? (
                <p className="m-0 text-sm text-[rgb(138,36,36)]">
                  {passwordFormState.errors.currentPassword.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-(--sea-ink)" htmlFor="newPassword">
                New password
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                {...registerPassword('newPassword')}
                className="w-full rounded-2xl border border-(--line) bg-white/70 px-4 py-3 text-sm text-(--sea-ink) outline-none focus:border-(--lagoon-deep) focus:ring-2 focus:ring-[rgba(79,184,178,0.18)]"
              />
              {passwordFormState.errors.newPassword ? (
                <p className="m-0 text-sm text-[rgb(138,36,36)]">
                  {passwordFormState.errors.newPassword.message}
                </p>
              ) : null}
            </div>

            {passwordError ? (
              <p className="rounded-2xl border border-[rgba(180,65,65,0.2)] bg-[rgba(180,65,65,0.08)] px-4 py-3 text-sm text-[rgb(138,36,36)]">
                {passwordError}
              </p>
            ) : null}
            {passwordSuccess ? (
              <p className="rounded-2xl border border-[rgba(47,106,74,0.2)] bg-[rgba(47,106,74,0.08)] px-4 py-3 text-sm text-[rgb(30,96,56)]">
                {passwordSuccess}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={passwordFormState.isSubmitting}
              className="inline-flex rounded-full border border-(--chip-line) bg-(--chip-bg) px-5 py-3 text-sm font-semibold text-(--sea-ink) transition hover:bg-(--link-bg-hover)"
            >
              {passwordFormState.isSubmitting ? 'Updating...' : 'Change password'}
            </button>
          </form>
        </article>
      </section>
    </main>
  )
}