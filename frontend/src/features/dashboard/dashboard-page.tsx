import { useMemo } from 'react'

import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'

import { ChartContainer, ChartLegend, ChartTooltip } from '../../components/ui/chart'
import { useExpenses } from '../expenses/expense-queries'
import { useAuth } from '../../hooks/use-auth'
import {
  calculateCategoryBreakdown,
  calculateMonthlyChartData,
  calculateTotalSpent,
  sortExpensesByDate,
} from './dashboard-metrics'

const chartPalette = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]

export function DashboardPage() {
  const { user } = useAuth()
  const { data: expenses = [], isLoading } = useExpenses(user?.id)

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

  const sortedExpenses = useMemo(() => sortExpensesByDate(expenses), [expenses])

  const totalSpent = useMemo(() => calculateTotalSpent(sortedExpenses), [sortedExpenses])

  const remainingBudget = Math.max((user?.monthlyBudget ?? 0) - totalSpent, 0)
  const expenseCount = sortedExpenses.length
  const averageExpense = expenseCount > 0 ? totalSpent / expenseCount : 0

  const categoryBreakdown = useMemo(
    () => calculateCategoryBreakdown(sortedExpenses, chartPalette),
    [sortedExpenses],
  )

  const monthlyChartData = useMemo(
    () => calculateMonthlyChartData(sortedExpenses),
    [sortedExpenses],
  )

  const recentExpenses = sortedExpenses.slice(0, 5)
  const topCategoryLabel =
    categoryBreakdown.length > 0 ? categoryBreakdown[0].category : 'No categories yet'
  const topCategorySummary =
    categoryBreakdown.length > 0
      ? `${categoryBreakdown[0].category} · ${money.format(categoryBreakdown[0].total)}`
      : 'No category data yet'

  const categoryChartConfig = useMemo(
    () =>
      Object.fromEntries(
        categoryBreakdown.map((entry) => [entry.category, { label: entry.category, color: entry.fill }]),
      ),
    [categoryBreakdown],
  )

  const monthlyChartConfig = {
    total: {
      label: 'Spending',
      color: 'var(--chart-1)',
    },
  }

  return (
    <main className="page-wrap px-4 py-8 sm:py-10">
      <section className="island-shell overflow-hidden rounded-4xl p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="island-kicker mb-3">Dashboard</p>
            <h1 className="display-title mb-3 text-4xl font-bold text-(--sea-ink) sm:text-5xl">
              Welcome back, {user?.fullName.split(' ')[0] ?? 'there'}.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-(--sea-ink-soft) sm:text-lg">
              See your current spend, biggest categories, and recent activity at a glance.
              The data comes from the same mock expense store that powers CRUD and filters.
            </p>
          </div>

          <div className="rounded-2xl border border-(--line) bg-orange-700/70 px-5 py-4 text-sm text-(--sea-ink-soft)">
            <p className="m-0 font-semibold text-(--sea-ink)">Monthly budget</p>
            <p className="m-0 mt-1 text-base">
              {money.format(user?.monthlyBudget ?? 0)} budgeted
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Monthly spend', money.format(totalSpent), 'All visible expenses'],
          ['Budget left', money.format(remainingBudget), 'After current month spend'],
          ['Transactions', String(expenseCount), 'Records in the ledger'],
          ['Average expense', money.format(averageExpense), 'Per transaction'],
        ].map(([label, value, description]) => (
          <article key={label} className="island-shell rounded-2xl p-5">
            <p className="m-0 text-sm font-semibold text-(--sea-ink-soft)">{label}</p>
            <p className="mt-3 mb-1 text-3xl font-bold tracking-tight text-(--sea-ink)">{value}</p>
            <p className="m-0 text-sm text-(--sea-ink-soft)">{description}</p>
          </article>
        ))}
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <article className="island-shell rounded-2xl p-6 sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="island-kicker mb-1">Monthly spending</p>
              <h2 className="m-0 text-xl font-bold text-(--sea-ink)">Trend over time</h2>
            </div>
            <span className="rounded-full border border-(--chip-line) bg-(--chip-bg) px-3 py-1 text-xs font-semibold text-(--sea-ink-soft)">
              Last months in view
            </span>
          </div>

          <div className="mt-5 h-85 rounded-2xl border border-(--line)  p-4">
            {isLoading ? (
              <div className="flex h-full items-center justify-center text-sm text-(--sea-ink-soft)">
                Loading chart data...
              </div>
            ) : monthlyChartData.length > 0 ? (
              <ChartContainer config={monthlyChartConfig} className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyChartData} margin={{ top: 10, right: 18, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} width={42} tickFormatter={(value) => `$${value}`} />
                    <ChartTooltip labelFormatter={(label) => `Month: ${label}`} />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="var(--chart-1)"
                      fill="var(--chart-1)"
                      fillOpacity={0.22}
                      strokeWidth={2.5}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-(--sea-ink-soft)">
                Add expenses to reveal monthly spending.
              </div>
            )}
          </div>
        </article>

        <article className="island-shell rounded-2xl p-6 sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="island-kicker mb-1">Category breakdown</p>
              <h2 className="m-0 text-xl font-bold text-(--sea-ink)">Where money is going</h2>
            </div>
            <span className="rounded-full border border-(--chip-line) bg-(--chip-bg) px-3 py-1 text-xs font-semibold text-(--sea-ink-soft)">
              Top: {topCategoryLabel}
            </span>
          </div>

          <div className="mt-5 h-85 rounded-2xl border border-(--line)  p-4">
            {isLoading ? (
              <div className="flex h-full items-center justify-center text-sm text-(--sea-ink-soft)">
                Loading chart data...
              </div>
            ) : categoryBreakdown.length > 0 ? (
              <ChartContainer config={categoryChartConfig} className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      dataKey="total"
                      nameKey="category"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={3}
                    >
                      {categoryBreakdown.map((entry) => (
                        <Cell key={entry.category} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip labelFormatter={(label) => `${label}`} />
                    <ChartLegend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-(--sea-ink-soft)">
                Add expenses to reveal category distribution.
              </div>
            )}
          </div>
        </article>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="island-shell rounded-2xl p-6 sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="island-kicker mb-1">Recent transactions</p>
              <h2 className="m-0 text-xl font-bold text-(--sea-ink)">Latest entries</h2>
            </div>
            <span className="rounded-full border border-(--chip-line) bg-(--chip-bg) px-3 py-1 text-xs font-semibold text-(--sea-ink-soft)">
              Top 5
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {(recentExpenses.length > 0 )? (
              recentExpenses.map((expense) => (
                <article key={expense.id} className="rounded-2xl border border-(--line) bg-orange-500/20  p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="m-0 font-semibold text-(--sea-ink)">{expense.title}</p>
                      <p className="m-0 mt-1 text-sm text-(--sea-ink-soft)">{expense.merchant}</p>
                      <p className="m-0 mt-1 text-xs text-(--sea-ink-soft)">{expense.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="m-0 font-semibold text-(--sea-ink)">{money.format(expense.amount)}</p>
                      <p className="m-0 mt-1 text-xs text-(--sea-ink-soft)">{formatExpenseDate(expense.expenseDate)}</p>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-2xl  px-6 py-10 text-center text-sm text-(--sea-ink-soft)">
                No recent transactions yet.
              </div>
            )}
          </div>
        </article>

        <article className="island-shell rounded-2xl p-6 sm:p-7">
          <p className="island-kicker mb-2">Expense summary</p>
          <h2 className="m-0 text-xl font-bold text-(--sea-ink)">Snapshot</h2>
          <div className="mt-5 space-y-4 text-sm text-(--sea-ink-soft)">
            <div className="rounded-2xl border border-(--line) bg-orange-700/70 p-4">
              <p className="m-0 font-semibold text-(--sea-ink)">Top category</p>
              <p className="m-0 mt-1">{topCategorySummary}</p>
            </div>
            <div className="rounded-2xl border border-(--line) bg-orange-700/70 p-4">
              <p className="m-0 font-semibold text-(--sea-ink)">Chart source</p>
              <p className="m-0 mt-1">Derived from the same mock expense records used in CRUD.</p>
            </div>
            <div className="rounded-2xl border border-(--line) bg-orange-700/70 p-4">
              <p className="m-0 font-semibold text-(--sea-ink)">Next step</p>
              <p className="m-0 mt-1">Wire these same metrics to Spring Boot analytics endpoints later.</p>
            </div>
          </div>
        </article>
      </section>
    </main>
  )
}

function formatExpenseDate(dateValue: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${dateValue}T00:00:00`))
}