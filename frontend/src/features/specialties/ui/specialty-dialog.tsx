import { useEffect, useState, type ReactNode } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'

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
import { useCreateSpecialty, useUpdateSpecialty } from '../api/specialties-queries'
import {
  specialtySchema,
  toSpecialtyPayload,
  type SpecialtyValues,
} from '../model/schemas'
import type { AdminSpecialty } from '../model/types'

const EMPTY_VALUES: SpecialtyValues = { name: '', description: '', isActive: true }

interface SpecialtyDialogProps {
  specialty?: AdminSpecialty
  children: ReactNode
}

export function SpecialtyDialog({ specialty, children }: SpecialtyDialogProps) {
  const [open, setOpen] = useState(false)
  const create = useCreateSpecialty()
  const update = useUpdateSpecialty()
  const isEditing = Boolean(specialty)
  const isPending = create.isPending || update.isPending

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SpecialtyValues>({
    resolver: zodResolver(specialtySchema),
    defaultValues: EMPTY_VALUES,
  })

  useEffect(() => {
    if (!open) return

    reset(
      specialty
        ? {
            name: specialty.name,
            description: specialty.description ?? '',
            isActive: specialty.isActive,
          }
        : EMPTY_VALUES,
    )
  }, [open, specialty, reset])

  const onSubmit = handleSubmit(async (values) => {
    const payload = toSpecialtyPayload(values)

    if (specialty) {
      await update.mutateAsync({ id: specialty.id, ...payload })
    } else {
      await create.mutateAsync(payload)
    }

    setOpen(false)
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Mutaxassislikni tahrirlash' : 'Yangi mutaxassislik'}
          </DialogTitle>
          <DialogDescription>
            Mutaxassislik savol bazasi va imtihonlarni guruhlash uchun ishlatiladi.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-5">
          <FormField id="name" label="Nomi" error={errors.name?.message} required>
            <Input
              id="name"
              placeholder="Kardiolog"
              aria-invalid={Boolean(errors.name)}
              {...register('name')}
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
              rows={3}
              placeholder="Yurak va qon tomir kasalliklari"
              aria-invalid={Boolean(errors.description)}
              {...register('description')}
            />
          </FormField>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="isActive">Faol</Label>
              <p className="text-xs text-muted-foreground">
                Nofaol mutaxassislik shifokorlarga ko'rinmaydi.
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
              {isEditing ? 'Saqlash' : "Qo'shish"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
