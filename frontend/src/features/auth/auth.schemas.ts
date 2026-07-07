import { z } from 'zod'

// ── Login ────────────────────────────────────────────────────
export const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required.')
    .min(3, 'Username must be at least 3 characters.'),
  password: z
    .string()
    .min(1, 'Password is required.')
    .min(6, 'Password must be at least 6 characters long.'),
})

export type LoginFormValues = z.infer<typeof loginSchema>

// ── Signup ───────────────────────────────────────────────────
export const signupSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters.')
    .max(30, 'Username must be at most 30 characters.')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores.'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long.')
    .regex(/[A-Z]/, 'Password must include an uppercase letter.')
    .regex(/[0-9]/, 'Password must include a number.'),
  firstName: z.string().trim().min(1, 'First name is required.'),
  lastName: z.string().trim().min(1, 'Last name is required.'),
  email: z.email('Enter a valid email address.'),
  phoneNumber: z
    .number({ message: 'Enter a valid phone number.' })
    .int('Phone number must be a whole number.')
    .positive('Phone number must be positive.'),
})

export type SignupFormValues = z.infer<typeof signupSchema>