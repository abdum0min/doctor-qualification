import { useEffect, useState, type ReactNode } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'

import { useExamDefaults } from '@/features/settings'
import { SpecialtySelect } from '@/features/specialties'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'
import { FormField } from '@/shared/ui/form-field'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Spinner } from '@/shared/ui/spinner'
import { Switch } from '@/shared/ui/switch'
import { Textarea } from '@/shared/ui/textarea'
import { useCreateExam, useUpdateExam } from '../api/exams-queries'
import { examSchema, toExamPayload, type ExamValues } from '../model/schemas'
import type { AdminExam } from '../model/types'

const EMPTY_VALUES: ExamValues = {
  specialtyId: 0,
  title: '',
  description: '',
  questionCount: '20',
  timeLimitMinutes: '30',
  passingScore: '70',
  isActive: true,
}

function toFormValues(exam: AdminExam): ExamValues {
  return {
    specialtyId: exam.specialty.id,
    title: exam.title,
    description: exam.description ?? '',
    questionCount: String(exam.questionCount),
    timeLimitMinutes: String(exam.timeLimitMinutes),
    passingScore: String(exam.passingScore),
    isActive: exam.isActive,
  }
}

interface ExamDialogProps {
  exam?: AdminExam
  children: ReactNode
}

export function ExamDialog({ exam, children }: ExamDialogProps) {
  const [open, setOpen] = useState(false)
  const create = useCreateExam()
  const update = useUpdateExam()
  const isPending = create.isPending || update.isPending

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExamValues>({
    resolver: zodResolver(examSchema),
    defaultValues: EMPTY_VALUES,
  })

  // Yangi imtihon formasi administrator sozlagan standartlar bilan ochiladi.
  const { data: defaults } = useExamDefaults(open && !exam)

  useEffect(() => {
    if (!open) return

    reset(
      exam
        ? toFormValues(exam)
        : defaults
          ? {
              ...EMPTY_VALUES,
              questionCount: String(defaults.questionCount),
              timeLimitMinutes: String(defaults.timeLimitMinutes),
              passingScore: String(defaults.passingScore),
            }
          : EMPTY_VALUES,
    )
  }, [open, exam, defaults, reset])

  const onSubmit = handleSubmit(async (values) => {
    const payload = toExamPayload(values)

    if (exam) {
      await update.mutateAsync({ id: exam.id, ...payload })
    } else {
      await create.mutateAsync(payload)
    }

    setOpen(false)
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{exam ? 'Imtihonni tahrirlash' : 'Yangi imtihon'}</DialogTitle>
          <DialogDescription>
            Savollar har bir urinishda shu sozlama asosida bazadan tanlanadi.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-5">
          <FormField id="title" label="Nomi" error={errors.title?.message} required>
            <Input
              id="title"
              placeholder="Kardiologiya — asosiy malaka imtihoni"
              aria-invalid={Boolean(errors.title)}
              {...register('title')}
            />
          </FormField>

          <FormField
            id="description"
            label="Tavsif"
            error={errors.description?.message}
            hint="Ixtiyoriy"
          >
            <Textarea
              id="description"
              rows={2}
              aria-invalid={Boolean(errors.description)}
              {...register('description')}
            />
          </FormField>

          <FormField
            id="specialtyId"
            label="Mutaxassislik"
            error={errors.specialtyId?.message}
            required
          >
            <Controller
              control={control}
              name="specialtyId"
              render={({ field }) => (
                <SpecialtySelect
                  id="specialtyId"
                  value={field.value || null}
                  onChange={(value) => field.onChange(value ?? 0)}
                  aria-invalid={Boolean(errors.specialtyId)}
                />
              )}
            />
          </FormField>

          <div className="grid gap-5 sm:grid-cols-3">
            <FormField
              id="questionCount"
              label="Savollar soni"
              error={errors.questionCount?.message}
              required
            >
              <Input
                id="questionCount"
                inputMode="numeric"
                aria-invalid={Boolean(errors.questionCount)}
                {...register('questionCount')}
              />
            </FormField>

            <FormField
              id="timeLimitMinutes"
              label="Vaqt (daqiqa)"
              error={errors.timeLimitMinutes?.message}
              required
            >
              <Input
                id="timeLimitMinutes"
                inputMode="numeric"
                aria-invalid={Boolean(errors.timeLimitMinutes)}
                {...register('timeLimitMinutes')}
              />
            </FormField>

            <FormField
              id="passingScore"
              label="O'tish bali (%)"
              error={errors.passingScore?.message}
              required
            >
              <Input
                id="passingScore"
                inputMode="numeric"
                aria-invalid={Boolean(errors.passingScore)}
                {...register('passingScore')}
              />
            </FormField>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="isActive">Faol</Label>
              <p className="text-xs text-muted-foreground">
                Savollar biriktirilgach imtihonni faollashtiring — nofaol imtihon
                shifokorlarga ko'rinmaydi.
              </p>
            </div>
            <Controller
              control={control}
              name="isActive"
              render={({ field }) => (
                <Switch
                  id="isActive"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending && <Spinner />}
              {exam ? 'Saqlash' : "Qo'shish"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
