import { z } from 'zod'

import { DIFFICULTIES } from './types'

export const MIN_OPTIONS = 2
export const MAX_OPTIONS = 6

export const questionSchema = z.object({
  text: z
    .string()
    .trim()
    .min(10, 'Kamida 10 ta belgi')
    .max(1000, 'Ko`pi bilan 1000 ta belgi'),
  difficulty: z.enum(DIFFICULTIES),
  isActive: z.boolean(),
  correctIndex: z.number().int().min(0),
  options: z
    .array(
      z.object({
        text: z.string().trim().min(1, 'Variant matni bo`sh bo`lmasin').max(500),
      }),
    )
    .min(MIN_OPTIONS, `Kamida ${MIN_OPTIONS} ta variant`)
    .max(MAX_OPTIONS, `Ko\`pi bilan ${MAX_OPTIONS} ta variant`),
})

export type QuestionValues = z.infer<typeof questionSchema>

export interface QuestionPayload {
  text: string
  difficulty: QuestionValues['difficulty']
  isActive: boolean
  options: { text: string; isCorrect: boolean }[]
}

export function toQuestionPayload(values: QuestionValues): QuestionPayload {
  return {
    text: values.text,
    difficulty: values.difficulty,
    isActive: values.isActive,
    options: values.options.map((option, index) => ({
      text: option.text,
      isCorrect: index === values.correctIndex,
    })),
  }
}
