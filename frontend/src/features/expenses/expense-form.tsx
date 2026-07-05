import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { expenseFormSchema } from './expense.schemas'
import type { ExpenseFormValues } from './expense.schemas'
import { expenseCategories } from './expense.types'
import type { ExpenseCategory } from './expense.types'

type ExpenseFormProps = {
  mode: 'create' | 'edit'
  initialValues: ExpenseFormValues
  isSaving?: boolean
  onSubmit: (values: ExpenseFormValues) => Promise<void>
  onCancel?: () => void
}

export function ExpenseForm({
  mode,
  initialValues,
  isSaving,
  onSubmit,
  onCancel,
}: ExpenseFormProps) {
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: initialValues,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form

  useEffect(() => {
    reset(initialValues)
  }, [initialValues, reset])

  async function handleFormSubmit(values: ExpenseFormValues) {
    await onSubmit(values)
    if (mode === 'create') {
      reset(initialValues)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-(--sea-ink)" htmlFor="title">
          Expense title
        </label>
        <input
          id="title"
          placeholder="Electric bill"
          className="w-full rounded-2xl border border-(--line) bg-white/70 px-4 py-3 text-sm text-(--sea-ink) outline-none transition focus:border-(--lagoon-deep) focus:ring-2 focus:ring-[rgba(79,184,178,0.18)]"
          {...register('title')}
        />
        {errors.title ? <p className="m-0 text-sm text-[rgb(138,36,36)]">{errors.title.message}</p> : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-(--sea-ink)" htmlFor="merchant">
          Merchant / payee
        </label>
        <input
          id="merchant"
          placeholder="City Utilities"
          className="w-full rounded-2xl border border-(--line) bg-white/70 px-4 py-3 text-sm text-(--sea-ink) outline-none transition focus:border-(--lagoon-deep) focus:ring-2 focus:ring-[rgba(79,184,178,0.18)]"
          {...register('merchant')}
        />
        {errors.merchant ? (
          <p className="m-0 text-sm text-[rgb(138,36,36)]">{errors.merchant.message}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-(--sea-ink)" htmlFor="category">
            Category
          </label>
          <select
            id="category"
            className="w-full rounded-2xl border border-(--line) bg-white/70 px-4 py-3 text-sm text-(--sea-ink) outline-none transition focus:border-(--lagoon-deep) focus:ring-2 focus:ring-[rgba(79,184,178,0.18)]"
            {...register('category')}
          >
            {expenseCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category ? (
            <p className="m-0 text-sm text-[rgb(138,36,36)]">{errors.category.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-(--sea-ink)" htmlFor="amount">
            Amount
          </label>
          <input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            className="w-full rounded-2xl border border-(--line) bg-white/70 px-4 py-3 text-sm text-(--sea-ink) outline-none transition focus:border-(--lagoon-deep) focus:ring-2 focus:ring-[rgba(79,184,178,0.18)]"
            {...register('amount')}
          />
          {errors.amount ? <p className="m-0 text-sm text-[rgb(138,36,36)]">{errors.amount.message}</p> : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-(--sea-ink)" htmlFor="expenseDate">
            Date
          </label>
          <input
            id="expenseDate"
            type="date"
            className="w-full rounded-2xl border border-(--line) bg-white/70 px-4 py-3 text-sm text-(--sea-ink) outline-none transition focus:border-(--lagoon-deep) focus:ring-2 focus:ring-[rgba(79,184,178,0.18)]"
            {...register('expenseDate')}
          />
          {errors.expenseDate ? (
            <p className="m-0 text-sm text-[rgb(138,36,36)]">{errors.expenseDate.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-(--sea-ink)" htmlFor="notes">
            Notes
          </label>
          <input
            id="notes"
            placeholder="Optional details"
            className="w-full rounded-2xl border border-(--line) bg-white/70 px-4 py-3 text-sm text-(--sea-ink) outline-none transition focus:border-(--lagoon-deep) focus:ring-2 focus:ring-[rgba(79,184,178,0.18)]"
            {...register('notes')}
          />
          {errors.notes ? <p className="m-0 text-sm text-[rgb(138,36,36)]">{errors.notes.message}</p> : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          disabled={isSaving || isSubmitting}
          className="inline-flex items-center justify-center rounded-full bg-(--lagoon) px-5 py-3 text-sm font-semibold text-white transition hover:bg-(--lagoon-deep) disabled:cursor-not-allowed disabled:opacity-70"
        >
          {mode === 'create' ? 'Add expense' : 'Save changes'}
        </button>
        {mode === 'edit' && onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center justify-center rounded-full border border-(--chip-line) bg-(--chip-bg) px-5 py-3 text-sm font-semibold text-(--sea-ink) transition hover:bg-(--link-bg-hover)"
          >
            Cancel edit
          </button>
        ) : null}
      </div>
    </form>
  )
}

export function createExpenseDefaults(): ExpenseFormValues {
  return {
    title: '',
    merchant: '',
    category: expenseCategories[0] satisfies ExpenseCategory,
    amount: 0,
    expenseDate: new Date().toISOString().slice(0, 10),
    notes: '',
  }
}