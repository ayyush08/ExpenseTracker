import { describe, expect, it } from 'vitest'

import type { ExpenseItem } from '../expenses/expense.types'
import {
  calculateCategoryBreakdown,
  calculateMonthlyChartData,
  calculateTotalSpent,
  sortExpensesByDate,
} from './dashboard-metrics'

const sampleExpenses: ExpenseItem[] = [
  {
    id: 'expense-1',
    userId: 'user-demo',
    title: 'Rent',
    merchant: 'Home Co',
    category: 'Housing',
    amount: 40,
    expenseDate: '2026-02-10',
    createdAt: '2026-02-10T10:00:00.000Z',
    updatedAt: '2026-02-10T10:00:00.000Z',
  },
  {
    id: 'expense-2',
    userId: 'user-demo',
    title: 'Groceries',
    merchant: 'Market',
    category: 'Groceries',
    amount: 15,
    expenseDate: '2026-01-20',
    createdAt: '2026-01-20T10:00:00.000Z',
    updatedAt: '2026-01-20T10:00:00.000Z',
  },
  {
    id: 'expense-3',
    userId: 'user-demo',
    title: 'Bus pass',
    merchant: 'Transit',
    category: 'Transport',
    amount: 5,
    expenseDate: '2026-02-01',
    createdAt: '2026-02-01T10:00:00.000Z',
    updatedAt: '2026-02-01T10:00:00.000Z',
  },
  {
    id: 'expense-4',
    userId: 'user-demo',
    title: 'Snacks',
    merchant: 'Cafe',
    category: 'Groceries',
    amount: 10,
    expenseDate: '2026-02-05',
    createdAt: '2026-02-05T10:00:00.000Z',
    updatedAt: '2026-02-05T10:00:00.000Z',
  },
]

describe('dashboard metrics', () => {
  it('sorts expenses newest first', () => {
    expect(sortExpensesByDate(sampleExpenses).map((expense) => expense.id)).toEqual([
      'expense-1',
      'expense-4',
      'expense-3',
      'expense-2',
    ])
  })

  it('calculates totals, category breakdown, and monthly series', () => {
    expect(calculateTotalSpent(sampleExpenses)).toBe(70)

    expect(calculateCategoryBreakdown(sampleExpenses, ['red', 'blue', 'green'])).toEqual([
      { category: 'Housing', total: 40, fill: 'red' },
      { category: 'Groceries', total: 25, fill: 'blue' },
      { category: 'Transport', total: 5, fill: 'green' },
    ])

    expect(calculateMonthlyChartData(sampleExpenses)).toEqual([
      { month: '2026-01', total: 15, label: 'Jan 2026' },
      { month: '2026-02', total: 55, label: 'Feb 2026' },
    ])
  })
})