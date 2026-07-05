import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <main className="page-wrap px-4 py-8 sm:py-12">
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="island-shell overflow-hidden rounded-4xl p-6 sm:p-8 lg:p-10">
          <p className="island-kicker mb-3">{eyebrow}</p>
          <h1 className="display-title mb-4 max-w-xl text-4xl leading-[1.02] font-bold text-(--sea-ink) sm:text-5xl">
            {title}
          </h1>
          <p className="max-w-xl text-base leading-8 text-(--sea-ink-soft) sm:text-lg">
            {description}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              ['Session persistence', 'The app remembers the current user in local storage.'],
              ['Protected routes', 'Unauthorized visitors are redirected out of the workspace.'],
              ['Mock API layer', 'Auth flows are isolated behind a service boundary.'],
              ['Router-friendly', 'The structure is ready for later server integration.'],
            ].map(([label, value]) => (
              <article key={label} className="rounded-2xl border border-(--line) bg-orange-800/50 p-4">
                <p className="m-0 text-sm font-semibold text-(--sea-ink)">{label}</p>
                <p className="mt-2 m-0 text-sm leading-6 text-(--sea-ink-soft)">{value}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3 text-sm font-semibold">
            <Link
              to="/app"
              className="rounded-full bg-(--lagoon-deep) px-5 py-2.5 text-white! no-underline transition hover:-translate-y-0.5 hover:bg-(--lagoon-deep)"
            >
              Open dashboard
            </Link>
            <Link
              to="/about"
              className="rounded-full border border-(--chip-line) bg-(--chip-bg) px-5 py-2.5 text-(--sea-ink) no-underline transition hover:-translate-y-0.5 hover:bg-(--link-bg-hover)"
            >
              View stack notes
            </Link>
          </div>
        </div>

        <div className="island-shell rounded-4xl p-5 sm:p-7 lg:p-8">
          {children}
        </div>
      </section>
    </main>
  )
}