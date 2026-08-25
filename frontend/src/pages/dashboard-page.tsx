import { Briefcase, CalendarClock, Mail, Phone, Stethoscope } from 'lucide-react'

import { AttemptHistoryTable } from '@/features/attempts'
import { useCurrentUser } from '@/features/auth'
import { useDoctorProfile } from '@/features/doctors'
import type { ApiError } from '@/shared/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { AsyncState } from '@/shared/ui/async-state'

const DASH = '—'

export function DashboardPage() {
  const user = useCurrentUser()
  const { data: profile, isLoading, isError, error } = useDoctorProfile()

  const details = [
    { icon: Mail, label: 'Email', value: profile?.email },
    { icon: Stethoscope, label: 'Mutaxassislik', value: profile?.specialty?.name },
    { icon: Phone, label: 'Telefon', value: profile?.phone },
    { icon: Briefcase, label: 'Ish joyi', value: profile?.workplace },
    {
      icon: CalendarClock,
      label: 'Ish tajribasi',
      value: profile?.experienceYears ? `${profile.experienceYears} yil` : null,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">
          Salom, {user?.fullname ?? 'shifokor'}
        </h2>
        <p className="text-sm text-muted-foreground">
          Bilim darajangizni baholash uchun shaxsiy kabinetingiz.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profil ma'lumotlari</CardTitle>
          <CardDescription>Hisobingizga biriktirilgan asosiy ma'lumotlar</CardDescription>
        </CardHeader>

        <CardContent>
          <AsyncState
            isLoading={isLoading}
            isError={isError}
            errorMessage={(error as ApiError | null)?.message}
          >
            <dl className="grid gap-4 sm:grid-cols-2">
              {details.map((detail) => (
                <div key={detail.label} className="flex items-start gap-3">
                  <detail.icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <dt className="text-xs text-muted-foreground">{detail.label}</dt>
                    <dd className="truncate text-sm font-medium">{detail.value || DASH}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </AsyncState>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Oldingi urinishlar</CardTitle>
          <CardDescription>Topshirilgan imtihonlar tarixi</CardDescription>
        </CardHeader>
        <CardContent>
          <AttemptHistoryTable limit={5} />
        </CardContent>
      </Card>
    </div>
  )
}
