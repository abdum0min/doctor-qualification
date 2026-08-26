import { z } from 'zod'

export const announcementSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Sarlavha kamida 3 ta belgi')
    .max(200, 'Sarlavha 200 ta belgidan oshmasin'),
  body: z
    .string()
    .trim()
    .min(3, 'Matn kamida 3 ta belgi')
    .max(500, 'Matn 500 ta belgidan oshmasin'),
  link: z
    .string()
    .trim()
    .max(255, 'Havola 255 ta belgidan oshmasin')
    .refine((value) => !value || value.startsWith('/'), {
      message: 'Havola ilova ichidagi manzil bo`lishi kerak, masalan /exams',
    })
    .optional(),
})

export type AnnouncementFormValues = z.infer<typeof announcementSchema>
