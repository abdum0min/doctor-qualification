import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '@/shared/ui/button'
import { FormField } from '@/shared/ui/form-field'
import { Input } from '@/shared/ui/input'
import { Spinner } from '@/shared/ui/spinner'
import { useUpdateDoctorProfile } from '../api/doctors-queries'
import {
  doctorProfileSchema,
  toProfilePayload,
  type DoctorProfileValues,
} from '../model/schemas'
import type { DoctorProfile } from '../model/types'

export function DoctorProfileForm({ profile }: { profile: DoctorProfile }) {
  const update = useUpdateDoctorProfile()

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<DoctorProfileValues>({
    resolver: zodResolver(doctorProfileSchema),
    defaultValues: {
      fullname: profile.fullname,
      phone: profile.phone ?? '',
      workplace: profile.workplace ?? '',
      experienceYears: profile.experienceYears?.toString() ?? '',
    },
  })

  return (
    <form
      onSubmit={handleSubmit((values) => update.mutate(toProfilePayload(values)))}
      className="space-y-5"
    >
      <FormField id="fullname" label="F.I.Sh." error={errors.fullname?.message} required>
        <Input
          id="fullname"
          autoComplete="name"
          aria-invalid={Boolean(errors.fullname)}
          {...register('fullname')}
        />
      </FormField>

      <FormField
        id="phone"
        label="Telefon"
        error={errors.phone?.message}
        hint="Ixtiyoriy"
      >
        <Input
          id="phone"
          type="tel"
          autoComplete="tel"
          placeholder="+998901234567"
          aria-invalid={Boolean(errors.phone)}
          {...register('phone')}
        />
      </FormField>

      <FormField
        id="workplace"
        label="Ish joyi"
        error={errors.workplace?.message}
        hint="Ixtiyoriy"
      >
        <Input
          id="workplace"
          placeholder="1-sonli shahar klinik shifoxonasi"
          aria-invalid={Boolean(errors.workplace)}
          {...register('workplace')}
        />
      </FormField>

      <FormField
        id="experienceYears"
        label="Ish tajribasi (yil)"
        error={errors.experienceYears?.message}
        hint="Ixtiyoriy"
      >
        <Input
          id="experienceYears"
          inputMode="numeric"
          placeholder="8"
          aria-invalid={Boolean(errors.experienceYears)}
          {...register('experienceYears')}
        />
      </FormField>

      <Button type="submit" disabled={update.isPending || !isDirty}>
        {update.isPending && <Spinner />}
        Saqlash
      </Button>
    </form>
  )
}
