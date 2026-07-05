import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'

import { Search } from 'lucide-react'

import { ExpenseForm, createExpenseDefaults } from '../../features/expenses/expense-form'
import { ExpenseTable } from '../../features/expenses/expense-table'
import { expenseCategories } from '../../features/expenses/expense.types'
import type { ExpenseCategory, ExpenseFilters, ExpenseItem } from '../../features/expenses/expense.types'
import { useCreateExpense, useDeleteExpense, useExpenses, useUpdateExpense } from '../../features/expenses/expense-queries'
import { useAuth } from '../../hooks/use-auth'
import type { ExpenseFormValues } from '../../features/expenses/expense.schemas'

export const Route = createFileRoute('/app/expenses')({ component: ExpensesPage })

function ExpensesPage() {
  const { user } = useAuth()
  const { data: expenses = [], isLoading } = useExpenses(user?.id)
  const createExpense = useCreateExpense(user?.id ?? 'anonymous')
  const updateExpense = useUpdateExpense(user?.id ?? 'anonymous')
  const deleteExpense = useDeleteExpense(user?.id ?? 'anonymous')

  const [filters, setFilters] = useState<ExpenseFilters>({
    search: '',
    category: 'all',
    month: 'all',
  })
  const [selectedExpense, setSelectedExpense] = useState<ExpenseItem | null>(null)

  const currentCurrency = user?.currency ?? 'USD'
  const money = useMemo(
    () =>
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currentCurrency,
        maximumFractionDigits: 2,
      }),
    [currentCurrency],
  )

  const visibleExpenses = useMemo(() => {
    const normalizedSearch = filters.search.trim().toLowerCase()

    return expenses.filter((expense) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        [expense.title, expense.merchant, expense.notes, expense.category]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(normalizedSearch))

      const matchesCategory = filters.category === 'all' || expense.category === filters.category
      const matchesMonth =
        filters.month === 'all' || expense.expenseDate.slice(0, 7) === filters.month

      return matchesSearch && matchesCategory && matchesMonth
    })
  }, [expenses, filters])

  const categoryTotals = useMemo(() => {
    return expenseCategories
      .map((category) => ({
        category,
        total: visibleExpenses
          .filter((expense) => expense.category === category)
          .reduce((sum, expense) => sum + expense.amount, 0),
      }))
      .filter((entry) => entry.total > 0)
      .sort((left, right) => right.total - left.total)
  }, [visibleExpenses])

  const monthlyTotals = useMemo(() => {
    const buckets = new Map<string, number>()

    visibleExpenses.forEach((expense) => {
      const monthKey = expense.expenseDate.slice(0, 7)
      buckets.set(monthKey, (buckets.get(monthKey) ?? 0) + expense.amount)
    })

    return [...buckets.entries()]
      .sort(([left], [right]) => right.localeCompare(left))
      .map(([month, total]) => ({ month, total }))
  }, [visibleExpenses])

  const totalSpent = visibleExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const transactionCount = visibleExpenses.length
  const averageTransaction = transactionCount > 0 ? totalSpent / transactionCount : 0
  const largestExpense = visibleExpenses.reduce<ExpenseItem | null>(
    (largest, expense) => (!largest || expense.amount > largest.amount ? expense : largest),
    null,
  )

  async function handleSave(values: ExpenseFormValues) {
    if (!user?.id) {
      return
    }

    if (selectedExpense) {
      await updateExpense.mutateAsync({ expenseId: selectedExpense.id, values })
      setSelectedExpense(null)
      return
    }

    await createExpense.mutateAsync(values)
  }

  async function handleDelete(expense: ExpenseItem) {
    if (!user?.id) {
      return
    }

    const confirmed = window.confirm(`Delete ${expense.title}?`)
    if (!confirmed) {
      return
    }

    await deleteExpense.mutateAsync(expense.id)

    if (selectedExpense?.id === expense.id) {
      setSelectedExpense(null)
    }
  }

  const initialFormValues = selectedExpense
    ? {
        title: selectedExpense.title,
        merchant: selectedExpense.merchant,
        category: selectedExpense.category,
        amount: selectedExpense.amount,
        expenseDate: selectedExpense.expenseDate,
        notes: selectedExpense.notes ?? '',
      }
    : createExpenseDefaults()

  return (
    <main className="page-wrap px-4 py-8 sm:py-10">
      <section className="island-shell rounded-4xl p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="island-kicker mb-2">Expenses</p>
            <h1 className="display-title text-4xl font-bold text-(--sea-ink) sm:text-5xl">
              Track, filter, and manage every expense
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-(--sea-ink-soft)">
              Create, edit, delete, search, and filter expenses with a mock data
              source that can later be swapped to Spring Boot endpoints without
              changing this UI.
            </p>
          </div>

          <div className="rounded-2xl border border-(--line) bg-orange-600/50  px-5 py-4 text-sm text-(--sea-ink-soft)">
            <p className="m-0  text-(--sea-ink)">Selected currency</p>
            <p className="m-0 mt-1 text-base font-extrabold">{currentCurrency}</p>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Total spent', money.format(totalSpent), `${transactionCount} transactions`],
          ['Average ticket', money.format(averageTransaction), 'Across visible expenses'],
          ['Largest expense', largestExpense ? money.format(largestExpense.amount) : money.format(0), largestExpense?.title ?? 'No data yet'],
          ['Month buckets', String(monthlyTotals.length), 'With spending in the current filter'],
        ].map(([label, value, description]) => (
          <article key={label} className="island-shell rounded-2xl p-5">
            <p className="m-0 text-sm font-semibold text-(--sea-ink-soft)">{label}</p>
            <p className="mt-3 mb-1 text-3xl font-bold tracking-tight text-(--sea-ink)">{value}</p>
            <p className="m-0 text-sm text-(--sea-ink-soft)">{description}</p>
          </article>
        ))}
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="island-shell rounded-2xl p-6 sm:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="island-kicker mb-1">Search & filters</p>
              <h2 className="m-0 text-xl font-bold text-(--sea-ink)">Expense ledger</h2>
            </div>

            <div className="flex flex-wrap gap-3">
              <label className="relative min-w-64 flex-1">
                <span className="sr-only">Search expenses</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--sea-ink-soft)" />
                <input
                  value={filters.search}
                  onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
                  placeholder="Search expenses"
                  className="w-full rounded-full border border-(--line) bg-white/70 py-3 pl-10 pr-4 text-sm text-(--sea-ink) outline-none transition focus:border-(--lagoon-deep) focus:ring-2 focus:ring-[rgba(79,184,178,0.18)]"
                />
              </label>

              <select
                value={filters.category}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    category: event.target.value as ExpenseCategory | 'all',
                  }))
                }
                className="rounded-full border border-(--line)  px-4 py-3 text-sm text-(--sea-ink) outline-none transition focus:border-(--lagoon-deep) focus:ring-2 focus:ring-[rgba(79,184,178,0.18)]"
              >
                <option value="all">All categories</option>
                {expenseCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <select
                value={filters.month}
                onChange={(event) => setFilters((current) => ({ ...current, month: event.target.value }))}
                className="rounded-full border border-(--line) px-4 py-3 text-sm text-(--sea-ink) outline-none transition focus:border-(--lagoon-deep) focus:ring-2 focus:ring-[rgba(79,184,178,0.18)]"
              >
                <option value="all">All months</option>
                {[...new Set(expenses.map((expense) => expense.expenseDate.slice(0, 7)))].map(
                  (month) => (
                    <option key={month} value={month}>
                      {formatMonthLabel(month)}
                    </option>
                  ),
                )}
              </select>
            </div>
          </div>

          <div className="mt-5">
            {isLoading ? (
              <div className="rounded-2xl border border-dashed border-(--line)  px-6 py-12 text-center text-sm text-(--sea-ink-soft)">
                Loading expenses...
              </div>
            ) : (
              <ExpenseTable
                expenses={visibleExpenses}
                currency={currentCurrency}
                onEdit={setSelectedExpense}
                onDelete={handleDelete}
                isDeleting={deleteExpense.isPending}
              />
            )}
          </div>
        </article>

        <div className="space-y-6">
          <article className="island-shell rounded-2xl p-6 sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="island-kicker mb-1">{selectedExpense ? 'Edit expense' : 'New expense'}</p>
                <h2 className="m-0 text-xl font-bold text-(--sea-ink)">
                  {selectedExpense ? 'Update entry' : 'Add a new entry'}
                </h2>
              </div>
              {selectedExpense ? (
                <button
                  type="button"
                  onClick={() => setSelectedExpense(null)}
                  className="rounded-full border border-(--chip-line) bg-(--chip-bg) px-3 py-2 text-xs font-semibold text-(--sea-ink) transition hover:bg-(--link-bg-hover)"
                >
                  Create new
                </button>
              ) : null}
            </div>

            <div className="mt-5">
              <ExpenseForm
                key={selectedExpense?.id ?? 'create'}
                mode={selectedExpense ? 'edit' : 'create'}
                initialValues={initialFormValues}
                isSaving={createExpense.isPending || updateExpense.isPending}
                onSubmit={handleSave}
                onCancel={selectedExpense ? () => setSelectedExpense(null) : undefined}
              />
            </div>
          </article>

          <article className="island-shell rounded-2xl p-6 sm:p-7">
            <p className="island-kicker mb-2">Category totals</p>
            <h3 className="m-0 text-xl font-bold text-(--sea-ink)">Current filter breakdown</h3>
            <div className="mt-4 space-y-3">
              {categoryTotals.length > 0 ? (
                categoryTotals.map((entry) => (
                  <div key={entry.category} className="rounded-2xl border border-(--line) bg-orange-600/40 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-(--sea-ink)">{entry.category}</span>
                      <span className="text-sm font-semibold text-(--sea-ink)">{money.format(entry.total)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="m-0 text-sm text-(--sea-ink-soft)">No categories match the current filters.</p>
              )}
            </div>
          </article>

          <article className="island-shell rounded-2xl p-6 sm:p-7">
            <p className="island-kicker mb-2">Monthly summary</p>
            <h3 className="m-0 text-xl font-bold text-(--sea-ink)">Spending by month</h3>
            <div className="mt-4 space-y-3">
              {monthlyTotals.length > 0 ? (
                monthlyTotals.map((entry) => (
                  <div key={entry.month} className="rounded-2xl border border-(--line) bg-teal-600/40 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-(--sea-ink)">{formatMonthLabel(entry.month)}</span>
                      <span className="text-sm font-semibold text-(--sea-ink)">{money.format(entry.total)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="m-0 text-sm text-(--sea-ink-soft)">No monthly totals match the current filters.</p>
              )}
            </div>
          </article>
        </div>
      </section>
    </main>
  )
}

function formatMonthLabel(month: string) {
  const [year, monthNumber] = month.split('-').map(Number)
  const date = new Date(year, monthNumber - 1, 1)

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(date)
}