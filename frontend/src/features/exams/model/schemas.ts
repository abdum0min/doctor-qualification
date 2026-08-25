import { z } from 'zod'

import { EXAM_LIMITS } from './types'

/** Raqamli maydonlar formada matn bo'lib turadi — `<input>` doim string qaytaradi. */
function numericField({ min, max }: { min: number; max: number }, unit: string) {
  return z
    .string()
    .trim()
    .refine((value) => /^\d+$/.test(value), 'Butun son kiriting')
    .refine(
      (value) => Number(value) >= min && Number(value) <= max,
      `${min}–${max} ${unit} oralig\`ida bo\`lsin`,
    )
}

export const examSchema = z.object({
  specialtyId: z
    .number({ message: 'Mutaxassislikni tanlang' })
    .int()
    .positive('Mutaxassislikni tanlang'),
  title: z
    .string()
    .trim()
    .min(5, 'Kamida 5 ta belgi')
    .max(160, 'Ko`pi bilan 160 ta belgi'),
  description: z.string().trim().max(500, 'Ko`pi bilan 500 ta belgi'),
  questionCount: numericField(EXAM_LIMITS.questionCount, 'ta savol'),
  timeLimitMinutes: numericField(EXAM_LIMITS.timeLimitMinutes, 'daqiqa'),
  passingScore: numericField(EXAM_LIMITS.passingScore, 'foiz'),
  isActive: z.boolean(),
})

export type ExamValues = z.infer<typeof examSchema>

export interface ExamPayload {
  specialtyId: number
  title: string
  description: string | null
  questionCount: number
  timeLimitMinutes: number
  passingScore: number
  isActive: boolean
}

export function toExamPayload(values: ExamValues): ExamPayload {
  return {
    specialtyId: values.specialtyId,
    title: values.title,
    description: values.description || null,
    questionCount: Number(values.questionCount),
    timeLimitMinutes: Number(values.timeLimitMinutes),
    passingScore: Number(values.passingScore),
    isActive: values.isActive,
  }
}
