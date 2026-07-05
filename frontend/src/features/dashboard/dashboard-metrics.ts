import type { ExpenseCategory, ExpenseItem } from '../expenses/expense.types'

export type DashboardCategoryBreakdown = {
  category: ExpenseCategory
  total: number
  fill: string
}

export type DashboardMonthlyPoint = {
  month: string
  total: number
  label: string
}

export function sortExpensesByDate(expenses: ExpenseItem[]) {
  return [...expenses].sort(
    (left, right) =>
      new Date(right.expenseDate).getTime() - new Date(left.expenseDate).getTime(),
  )
}

export function calculateTotalSpent(expenses: ExpenseItem[]) {
  return expenses.reduce((sum, expense) => sum + expense.amount, 0)
}

export function calculateCategoryBreakdown(
  expenses: ExpenseItem[],
  palette: string[],
): DashboardCategoryBreakdown[] {
  const byCategory = new Map<ExpenseCategory, number>()

  expenses.forEach((expense) => {
    byCategory.set(expense.category, (byCategory.get(expense.category) ?? 0) + expense.amount)
  })

  return [...byCategory.entries()]
    .map(([category, total], index) => ({
      category,
      total,
      fill: palette[index % palette.length],
    }))
    .filter((entry) => entry.total > 0)
    .sort((left, right) => right.total - left.total)
}

export function calculateMonthlyChartData(expenses: ExpenseItem[]): DashboardMonthlyPoint[] {
  const buckets = new Map<string, number>()

  expenses.forEach((expense) => {
    const monthKey = expense.expenseDate.slice(0, 7)
    buckets.set(monthKey, (buckets.get(monthKey) ?? 0) + expense.amount)
  })

  return [...buckets.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([month, total]) => ({
      month,
      total,
      label: formatMonthLabel(month),
    }))
}

export function formatMonthLabel(month: string) {
  const [year, monthNumber] = month.split('-').map(Number)

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
  }).format(new Date(year, monthNumber - 1, 1))
}