import { useState, type ReactNode } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

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
import { Spinner } from '@/shared/ui/spinner'
import { Textarea } from '@/shared/ui/textarea'
import { useRevokeCertificate } from '../api/certificates-queries'

const revokeSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(3, 'Kamida 3 ta belgi')
    .max(300, 'Ko`pi bilan 300 ta belgi'),
})

type RevokeValues = z.infer<typeof revokeSchema>

interface RevokeCertificateDialogProps {
  certificateId: string
  children: ReactNode
}

export function RevokeCertificateDialog({
  certificateId,
  children,
}: RevokeCertificateDialogProps) {
  const [open, setOpen] = useState(false)
  const revoke = useRevokeCertificate()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RevokeValues>({
    resolver: zodResolver(revokeSchema),
    defaultValues: { reason: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    await revoke.mutateAsync({ certificateId, reason: values.reason })
    reset()
    setOpen(false)
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) reset()
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sertifikatni bekor qilish</DialogTitle>
          <DialogDescription>
            {certificateId} bekor qilinadi va ommaviy tekshiruvda darhol
            "Bekor qilingan" holatida ko'rinadi. Yozuv o'chirilmaydi.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-5">
          <FormField
            id="reason"
            label="Sabab"
            error={errors.reason?.message}
            hint="Ichki yozuv — ommaviy tekshiruv sahifasida ko'rsatilmaydi"
            required
          >
            <Textarea
              id="reason"
              rows={3}
              placeholder="Imtihon natijasi qayta ko'rib chiqildi"
              aria-invalid={Boolean(errors.reason)}
              {...register('reason')}
            />
          </FormField>

          <DialogFooter>
            <Button type="submit" variant="destructive" disabled={revoke.isPending}>
              {revoke.isPending && <Spinner />}
              Bekor qilish
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
