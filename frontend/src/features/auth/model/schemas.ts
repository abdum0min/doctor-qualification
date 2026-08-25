import { z } from 'zod'

export const loginSchema = z.object({
  email: z.email('Email formati noto`g`ri'),
  password: z.string().min(1, 'Parolni kiriting'),
})

export const registerSchema = z.object({
  fullname: z.string().min(3, 'Kamida 3 ta belgi'),
  email: z.email('Email formati noto`g`ri'),
  password: z
    .string()
    .min(8, 'Kamida 8 ta belgi')
    .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, 'Kamida bitta harf va bitta raqam bo`lsin'),
})

export type LoginValues = z.infer<typeof loginSchema>
export type RegisterValues = z.infer<typeof registerSchema>
