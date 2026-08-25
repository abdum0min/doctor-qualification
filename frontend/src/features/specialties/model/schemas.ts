import { z } from 'zod'

export const specialtySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Kamida 2 ta belgi')
    .max(100, 'Ko`pi bilan 100 ta belgi'),
  description: z.string().trim().max(300, 'Ko`pi bilan 300 ta belgi'),
  isActive: z.boolean(),
})

export type SpecialtyValues = z.infer<typeof specialtySchema>

export interface SpecialtyPayload {
  name: string
  description: string | null
  isActive: boolean
}

export function toSpecialtyPayload(values: SpecialtyValues): SpecialtyPayload {
  return {
    name: values.name,
    description: values.description || null,
    isActive: values.isActive,
  }
}
