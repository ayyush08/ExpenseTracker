import type { ExpenseCategory, ExpenseItem } from '../../features/expenses/expense.types'
import type { ExpenseFormValues } from '../../features/expenses/expense.schemas'

type ExpenseStore = Record<string, ExpenseItem[]>

const STORAGE_KEY = 'expense-tracker.expenses'

const DEFAULT_EXPENSES: ExpenseItem[] = [
  {
    id: 'expense-1',
    userId: 'user-demo',
    title: 'Apartment rent',
    merchant: 'Home',
    category: 'Housing',
    amount: 1250,
    expenseDate: '2026-07-01',
    notes: 'Monthly apartment payment',
    createdAt: '2026-07-01T08:00:00.000Z',
    updatedAt: '2026-07-01T08:00:00.000Z',
  },
  {
    id: 'expense-2',
    userId: 'user-demo',
    title: 'Groceries at Market Hall',
    merchant: 'Market Hall',
    category: 'Groceries',
    amount: 84.12,
    expenseDate: '2026-07-02',
    notes: 'Weekly pantry restock',
    createdAt: '2026-07-02T13:15:00.000Z',
    updatedAt: '2026-07-02T13:15:00.000Z',
  },
  {
    id: 'expense-3',
    userId: 'user-demo',
    title: 'Metro pass',
    merchant: 'Transit Authority',
    category: 'Transport',
    amount: 58,
    expenseDate: '2026-07-03',
    notes: 'Monthly commuter pass',
    createdAt: '2026-07-03T09:30:00.000Z',
    updatedAt: '2026-07-03T09:30:00.000Z',
  },
  {
    id: 'expense-4',
    userId: 'user-demo',
    title: 'Dinner with friends',
    merchant: 'Harbor Bistro',
    category: 'Dining',
    amount: 67.45,
    expenseDate: '2026-06-29',
    notes: 'Team dinner after project review',
    createdAt: '2026-06-29T20:40:00.000Z',
    updatedAt: '2026-06-29T20:40:00.000Z',
  },
  {
    id: 'expense-5',
    userId: 'user-demo',
    title: 'Internet bill',
    merchant: 'FiberNet',
    category: 'Utilities',
    amount: 89.99,
    expenseDate: '2026-06-28',
    notes: 'Home internet plan',
    createdAt: '2026-06-28T11:00:00.000Z',
    updatedAt: '2026-06-28T11:00:00.000Z',
  },
  {
    id: 'expense-6',
    userId: 'user-demo',
    title: 'Movie night',
    merchant: 'Cineplex',
    category: 'Entertainment',
    amount: 24,
    expenseDate: '2026-06-24',
    notes: 'Weekend plan',
    createdAt: '2026-06-24T19:15:00.000Z',
    updatedAt: '2026-06-24T19:15:00.000Z',
  },
  {
    id: 'expense-7',
    userId: 'user-demo',
    title: 'Pharmacy refill',
    merchant: 'WellCare Pharmacy',
    category: 'Health',
    amount: 31.5,
    expenseDate: '2026-06-20',
    notes: 'Prescription refill',
    createdAt: '2026-06-20T15:05:00.000Z',
    updatedAt: '2026-06-20T15:05:00.000Z',
  },
  {
    id: 'expense-8',
    userId: 'user-demo',
    title: 'Work laptop sleeve',
    merchant: 'Desk & Co',
    category: 'Shopping',
    amount: 42.75,
    expenseDate: '2026-06-18',
    notes: 'Accessory for new laptop',
    createdAt: '2026-06-18T16:25:00.000Z',
    updatedAt: '2026-06-18T16:25:00.000Z',
  },
]

function getStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage
}

function buildStore(): ExpenseStore {
  return {
    'user-demo': DEFAULT_EXPENSES.filter((expense) => expense.userId === 'user-demo'),
  }
}

function readStore(): ExpenseStore {
  const storage = getStorage()
  if (!storage) {
    return buildStore()
  }

  const rawStore = storage.getItem(STORAGE_KEY)
  if (!rawStore) {
    const initialStore = buildStore()
    storage.setItem(STORAGE_KEY, JSON.stringify(initialStore))
    return initialStore
  }

  try {
    const parsedStore = JSON.parse(rawStore) as unknown
    if (!parsedStore || typeof parsedStore !== 'object' || Array.isArray(parsedStore)) {
      return buildStore()
    }

    return parsedStore as ExpenseStore
  } catch {
    const initialStore = buildStore()
    storage.setItem(STORAGE_KEY, JSON.stringify(initialStore))
    return initialStore
  }
}

function writeStore(store: ExpenseStore) {
  const storage = getStorage()
  if (!storage) {
    return
  }

  storage.setItem(STORAGE_KEY, JSON.stringify(store))
}

function persistUserExpenses(userId: string, expenses: ExpenseItem[]) {
  const store = readStore()
  const nextStore = {
    ...store,
    [userId]: expenses,
  }

  writeStore(nextStore)
}

function generateId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `expense-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function sortExpenses(expenses: ExpenseItem[]) {
  return [...expenses].sort(
    (left, right) =>
      new Date(right.expenseDate).getTime() - new Date(left.expenseDate).getTime(),
  )
}

function applyExpenseUpdate(
  expense: ExpenseItem,
  values: ExpenseFormValues,
  updatedAt: string,
): ExpenseItem {
  return {
    ...expense,
    title: values.title.trim(),
    merchant: values.merchant.trim(),
    category: values.category,
    amount: values.amount,
    expenseDate: values.expenseDate,
    notes: values.notes?.trim() || undefined,
    updatedAt,
  }
}

export const expenseApi = {
  listExpenses: async (userId: string): Promise<ExpenseItem[]> => {
    const store = readStore()
    return sortExpenses(store[userId] ?? [])
  },
  createExpense: async (
    userId: string,
    values: ExpenseFormValues,
  ): Promise<ExpenseItem> => {
    const store = readStore()
    const currentExpenses = store[userId] ?? []
    const now = new Date().toISOString()

    const nextExpense: ExpenseItem = {
      id: generateId(),
      userId,
      title: values.title.trim(),
      merchant: values.merchant.trim(),
      category: values.category,
      amount: values.amount,
      expenseDate: values.expenseDate,
      notes: values.notes?.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    }

    persistUserExpenses(userId, sortExpenses([...currentExpenses, nextExpense]))

    return nextExpense
  },
  updateExpense: async (
    userId: string,
    expenseId: string,
    values: ExpenseFormValues,
  ): Promise<ExpenseItem> => {
    const store = readStore()
    const currentExpenses = store[userId] ?? []
    const now = new Date().toISOString()

    const nextExpenses = currentExpenses.map((expense) =>
      expense.id === expenseId
        ? applyExpenseUpdate(expense, values, now)
        : expense,
    )

    const updatedExpense = nextExpenses.find((expense) => expense.id === expenseId)
    if (!updatedExpense) {
      throw new Error('Expense not found.')
    }

    persistUserExpenses(userId, sortExpenses(nextExpenses))

    return updatedExpense
  },
  deleteExpense: async (userId: string, expenseId: string): Promise<void> => {
    const store = readStore()
    const currentExpenses = store[userId] ?? []
    const nextExpenses = currentExpenses.filter((expense) => expense.id !== expenseId)

    persistUserExpenses(userId, nextExpenses)
  },
}