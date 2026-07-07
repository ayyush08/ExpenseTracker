import { Link, useNavigate } from '@tanstack/react-router'
import { LogOut, Menu } from 'lucide-react'

import { useAuth } from '../hooks/use-auth'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate({ to: '/login', replace: true })
  }

  return (
    <header className="sticky top-0 z-50 border-b border-(--line) bg-(--header-bg) px-4 backdrop-blur-lg">
      <nav className="page-wrap flex flex-wrap items-center gap-x-3 gap-y-2 py-3 sm:py-4">
        <h2 className="m-0 shrink-0 text-base font-semibold tracking-tight">
          <Link
            to="/app"
            className="inline-flex items-center gap-2 rounded-full border border-(--chip-line) bg-(--chip-bg) px-3 py-1.5 text-sm text-(--sea-ink) no-underline shadow-[0_8px_24px_rgba(30,90,72,0.08)] sm:px-4 sm:py-2"
          >
            <span className="h-2 w-2 rounded-full bg-[linear-gradient(90deg,#56c6be,#7ed3bf)]" />
            Expense Tracker
          </Link>
        </h2>

        <div className="order-3 flex w-full flex-wrap items-center gap-x-4 gap-y-1 pb-1 text-sm font-semibold sm:order-0 sm:w-auto sm:flex-nowrap sm:pb-0">
          <Link to="/app" className="nav-link" activeProps={{ className: 'nav-link is-active' }}>
            Dashboard
          </Link>
          <Link
            to="/app/expenses"
            className="nav-link"
            activeProps={{ className: 'nav-link is-active' }}
          >
            Expenses
          </Link>
          <Link to="/app/profile" className="nav-link" activeProps={{ className: 'nav-link is-active' }}>
            Profile
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <div className="hidden items-center gap-2 rounded-full border border-(--chip-line) bg-(--chip-bg) px-3 py-1.5 text-xs font-semibold text-(--sea-ink-soft) sm:flex">
            <Menu className="h-4 w-4" />
            <span>{user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.username ?? 'Guest'}</span>
          </div>
          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-full border border-(--chip-line) bg-(--chip-bg) px-3 py-1.5 text-sm font-semibold text-(--sea-ink) shadow-[0_8px_22px_rgba(30,90,72,0.08)] transition hover:-translate-y-0.5"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          ) : null}
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
