import { Pencil, Trash2 } from 'lucide-react'

import type { ExpenseItem } from './expense.types'

type ExpenseTableProps = {
  expenses: ExpenseItem[]
  currency: string
  onEdit: (expense: ExpenseItem) => void
  onDelete: (expense: ExpenseItem) => void
  isDeleting?: boolean
}

export function ExpenseTable({ expenses, currency, onEdit, onDelete, isDeleting }: ExpenseTableProps) {
  const money = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  })

  if (expenses.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-(--line)  px-6 py-12 text-center text-sm text-(--sea-ink-soft)">
        No expenses match the current filters.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-(--line) ">
      <table className="w-full border-collapse text-left">
        <thead className=" text-xs uppercase tracking-[0.16em] text-(--sea-ink-soft)">
          <tr>
            <th className="px-4 py-3 font-semibold">Expense</th>
            <th className="px-4 py-3 font-semibold">Category</th>
            <th className="px-4 py-3 font-semibold">Date</th>
            <th className="px-4 py-3 font-semibold text-right">Amount</th>
            <th className="px-4 py-3 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense.id} className="border-t border-(--line)">
              <td className="px-4 py-4 align-top">
                <p className="m-0 font-semibold text-(--sea-ink)">{expense.title}</p>
                <p className="m-0 mt-1 text-sm text-(--sea-ink-soft)">{expense.merchant}</p>
                {expense.notes ? <p className="m-0 mt-1 text-xs text-(--sea-ink-soft)">{expense.notes}</p> : null}
              </td>
              <td className="px-4 py-4 align-top text-sm text-(--sea-ink-soft)">{expense.category}</td>
              <td className="px-4 py-4 align-top text-sm text-(--sea-ink-soft)">{formatExpenseDate(expense.expenseDate)}</td>
              <td className="px-4 py-4 align-top text-right text-sm font-semibold text-(--sea-ink)">
                {money.format(expense.amount)}
              </td>
              <td className="px-4 py-4 align-top">
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(expense)}
                    className="inline-flex items-center gap-1 rounded-full border border-(--chip-line) bg-(--chip-bg) px-3 py-2 text-xs font-semibold text-(--sea-ink) transition hover:bg-(--link-bg-hover)"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => onDelete(expense)}
                    className="inline-flex items-center gap-1 rounded-full border border-[rgba(180,65,65,0.2)] bg-[rgba(180,65,65,0.08)] px-3 py-2 text-xs font-semibold text-[rgb(138,36,36)] transition hover:bg-[rgba(180,65,65,0.14)] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function formatExpenseDate(dateValue: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${dateValue}T00:00:00`))
}