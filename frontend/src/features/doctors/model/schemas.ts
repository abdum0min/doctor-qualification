import { z } from 'zod'

const PHONE_PATTERN = /^\+?[\d\s()-]{7,}$/

export const doctorProfileSchema = z.object({
  fullname: z
    .string()
    .trim()
    .min(3, 'Kamida 3 ta belgi')
    .max(100, 'Ko`pi bilan 100 ta belgi'),
  phone: z
    .string()
    .trim()
    .max(32, 'Ko`pi bilan 32 ta belgi')
    .refine((value) => !value || PHONE_PATTERN.test(value), 'Telefon raqami noto`g`ri'),
  specialtyId: z.number().int().positive().nullable(),
  workplace: z.string().trim().max(160, 'Ko`pi bilan 160 ta belgi'),
  experienceYears: z
    .string()
    .trim()
    .refine(
      (value) => value === '' || (/^\d{1,2}$/.test(value) && Number(value) <= 70),
      'Ko`pi bilan 70 yil',
    ),
})

export type DoctorProfileValues = z.infer<typeof doctorProfileSchema>

export interface DoctorProfilePayload {
  fullname: string
  specialtyId: number | null
  phone: string | null
  workplace: string | null
  experienceYears: number | null
}

/** Bo'sh maydon `null` sifatida yuboriladi — backend uni tozalaydi. */
export function toProfilePayload(values: DoctorProfileValues): DoctorProfilePayload {
  return {
    fullname: values.fullname,
    specialtyId: values.specialtyId,
    phone: values.phone || null,
    workplace: values.workplace || null,
    experienceYears: values.experienceYears ? Number(values.experienceYears) : null,
  }
}
