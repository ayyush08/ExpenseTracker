import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '../../hooks/use-auth'
import { User, Mail, Phone, AtSign } from 'lucide-react'

export const Route = createFileRoute('/app/profile')({ component: ProfilePage })

function ProfilePage() {
  const { user } = useAuth()

  const displayName =
    user?.firstName || user?.lastName
      ? `${user.firstName} ${user.lastName}`.trim()
      : user?.username ?? 'Unknown'

  const fields = [
    { icon: User, label: 'Full name', value: displayName },
    { icon: AtSign, label: 'Username', value: user?.username ?? '—' },
    { icon: Mail, label: 'Email', value: user?.email || '—' },
    { icon: Phone, label: 'Phone', value: user?.phoneNumber ? String(user.phoneNumber) : '—' },
  ]

  return (
    <main className="page-wrap px-4 py-8 sm:py-10">
      <section className="island-shell rounded-4xl p-6 sm:p-8">
        <p className="island-kicker mb-2">Profile</p>
        <h1 className="display-title text-4xl font-bold text-(--sea-ink) sm:text-5xl">
          Account details
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-(--sea-ink-soft)">
          Your profile information from the AuthService. Profile editing will be
          available once the backend exposes update endpoints.
        </p>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        {fields.map(({ icon: Icon, label, value }) => (
          <article key={label} className="island-shell rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-(--line) bg-(--chip-bg)">
                <Icon className="h-5 w-5 text-(--sea-ink-soft)" />
              </div>
              <div className="min-w-0">
                <p className="m-0 text-sm font-semibold text-(--sea-ink-soft)">{label}</p>
                <p className="m-0 mt-1 truncate text-base font-bold text-(--sea-ink)">{value}</p>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-8">
        <article className="island-shell rounded-2xl p-6 sm:p-7">
          <p className="island-kicker mb-2">Coming soon</p>
          <h2 className="m-0 text-xl font-bold text-(--sea-ink)">Profile editing &amp; security</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-(--sea-ink-soft)">
            The backend currently does not expose profile update or password change
            endpoints. Once those are added to the UserService, this page will show
            editable forms for your name, email, phone, and password — with no
            changes needed in the route or component structure.
          </p>
        </article>
      </section>
    </main>
  )
}