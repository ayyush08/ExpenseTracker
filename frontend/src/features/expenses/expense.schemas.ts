import { z } from 'zod'

import { expenseCategories } from './expense.types'

export const expenseFormSchema = z.object({
  title: z.string().trim().min(2, 'Enter an expense title.'),
  merchant: z.string().trim().min(2, 'Enter a merchant or payee.'),
  category: z.enum(expenseCategories),
  amount: z.coerce.number().positive('Amount must be greater than zero.'),
  expenseDate: z.string().min(1, 'Choose a date.'),
  notes: z.string().trim().max(240, 'Notes must be 240 characters or fewer.').optional(),
})

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>