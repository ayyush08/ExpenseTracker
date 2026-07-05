export const expenseCategories = [
  'Housing',
  'Groceries',
  'Transport',
  'Dining',
  'Utilities',
  'Entertainment',
  'Health',
  'Shopping',
  'Travel',
] as const

export type ExpenseCategory = (typeof expenseCategories)[number]

export type ExpenseItem = {
  id: string
  userId: string
  title: string
  merchant: string
  category: ExpenseCategory
  amount: number
  expenseDate: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export type ExpenseFilters = {
  search: string
  category: ExpenseCategory | 'all'
  month: string | 'all'
}