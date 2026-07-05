import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { ExpenseFormValues } from './expense.schemas'
import { expenseApi } from '../../services/expenses/expense-api'

export const expenseQueryKeys = {
  all: ['expenses'] as const,
  lists: () => [...expenseQueryKeys.all, 'list'] as const,
  list: (userId: string) => [...expenseQueryKeys.lists(), userId] as const,
}

export function useExpenses(userId?: string) {
  return useQuery({
    queryKey: expenseQueryKeys.list(userId ?? 'anonymous'),
    queryFn: () => expenseApi.listExpenses(userId ?? 'anonymous'),
    enabled: Boolean(userId),
  })
}

export function useCreateExpense(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: ExpenseFormValues) => expenseApi.createExpense(userId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseQueryKeys.list(userId) })
    },
  })
}

export function useUpdateExpense(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ expenseId, values }: { expenseId: string; values: ExpenseFormValues }) =>
      expenseApi.updateExpense(userId, expenseId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseQueryKeys.list(userId) })
    },
  })
}

export function useDeleteExpense(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (expenseId: string) => expenseApi.deleteExpense(userId, expenseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseQueryKeys.list(userId) })
    },
  })
}