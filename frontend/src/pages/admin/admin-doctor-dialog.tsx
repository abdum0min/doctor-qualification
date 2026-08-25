import { useState, type ReactNode } from 'react'

import { useAdminDoctor } from '@/features/admin'
import { QualificationBadge } from '@/features/attempts'
import { certificateStatus, VERIFICATION_PRESENTATION } from '@/features/certificates'
import type { ApiError } from '@/shared/api'
import { formatDate } from '@/shared/lib/format'
import { AsyncState } from '@/shared/ui/async-state'
import { Badge } from '@/shared/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'
import { Separator } from '@/shared/ui/separator'

const DASH = '—'

interface AdminDoctorDialogProps {
  doctorId: number
  children: ReactNode
}

export function AdminDoctorDialog({ doctorId, children }: AdminDoctorDialogProps) {
  const [open, setOpen] = useState(false)
  const { data, isLoading, isError, error } = useAdminDoctor(open ? doctorId : 0)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{data?.fullname ?? 'Shifokor'}</DialogTitle>
          <DialogDescription>
            Profil ma'lumotlari, imtihon tarixi va sertifikatlar
          </DialogDescription>
        </DialogHeader>

        <AsyncState
          isLoading={isLoading}
          isError={isError}
          errorMessage={(error as ApiError | null)?.message}
        >
          {data && (
            <div className="space-y-5">
              <dl className="grid gap-3 sm:grid-cols-2">
                <Field label="Email" value={data.email} />
                <Field label="Mutaxassislik" value={data.specialtyName} />
                <Field label="Telefon" value={data.phone} />
                <Field label="Ish joyi" value={data.workplace} />
                <Field
                  label="Tajriba"
                  value={data.experienceYears ? `${data.experienceYears} yil` : null}
                />
                <Field
                  label="Holat"
                  value={data.isActive ? 'Faol' : 'Bloklangan'}
                />
              </dl>

              <Separator />

              <section className="space-y-2">
                <h3 className="text-sm font-medium">
                  Imtihon urinishlari ({data.attempts.length})
                </h3>

                {data.attempts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Hali imtihon topshirilmagan.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {data.attempts.map((attempt) => (
                      <li
                        key={attempt.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3 text-sm"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium">{attempt.examTitle}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(attempt.completedAt ?? attempt.startedAt)}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {attempt.qualification && (
                            <QualificationBadge qualification={attempt.qualification} />
                          )}
                          <span className="tabular-nums">
                            {attempt.score === null ? DASH : `${attempt.score}%`}
                          </span>
                          <Badge
                            variant={
                              attempt.status === 'IN_PROGRESS'
                                ? 'info'
                                : attempt.passed
                                  ? 'success'
                                  : 'secondary'
                            }
                          >
                            {attempt.status === 'IN_PROGRESS'
                              ? 'Davom etmoqda'
                              : attempt.passed
                                ? "O'tdi"
                                : "O'tmadi"}
                          </Badge>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <Separator />

              <section className="space-y-2">
                <h3 className="text-sm font-medium">
                  Sertifikatlar ({data.certificates.length})
                </h3>

                {data.certificates.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Sertifikat berilmagan.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {data.certificates.map((certificate) => {
                      const state =
                        VERIFICATION_PRESENTATION[certificateStatus(certificate)]

                      return (
                        <li
                          key={certificate.certificateId}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3 text-sm"
                        >
                          <span className="font-mono">{certificate.certificateId}</span>
                          <div className="flex items-center gap-2">
                            <span className="tabular-nums">{certificate.score}%</span>
                            <Badge variant={state.variant}>{state.label}</Badge>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </section>
            </div>
          )}
        </AsyncState>
      </DialogContent>
    </Dialog>
  )
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="truncate text-sm font-medium">{value || DASH}</dd>
    </div>
  )
}
