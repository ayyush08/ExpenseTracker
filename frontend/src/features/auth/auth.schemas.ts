import { z } from 'zod'

export const loginSchema = z.object({
  email: z.email('Enter a valid email address.'),
  password: z
    .string()
    .min(1, 'Password is required.')
    .min(8, 'Password must be at least 8 characters long.'),
})

export const signupSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter your full name.'),
  email: z.email('Enter a valid email address.'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long.')
    .regex(/[A-Z]/, 'Password must include an uppercase letter.')
    .regex(/[0-9]/, 'Password must include a number.'),
})

export const profileSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter your full name.'),
  email: z.email('Enter a valid email address.'),
  currency: z.string().trim().min(3, 'Enter a currency code.'),
  monthlyBudget: z.coerce.number().positive('Monthly budget must be greater than zero.'),
})

export const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required.'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters long.')
    .regex(/[A-Z]/, 'Password must include an uppercase letter.')
    .regex(/[0-9]/, 'Password must include a number.'),
})

export type LoginFormValues = z.infer<typeof loginSchema>
export type SignupFormValues = z.infer<typeof signupSchema>
export type ProfileFormValues = z.infer<typeof profileSchema>
export type PasswordFormValues = z.infer<typeof passwordSchema>