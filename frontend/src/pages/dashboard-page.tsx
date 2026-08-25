import { Award, ClipboardCheck, Target, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'

import { AttemptHistoryTable, QualificationBadge } from '@/features/attempts'
import { useCurrentUser } from '@/features/auth'
import { useDoctorOverview, type DoctorLatestAttempt } from '@/features/doctors'
import type { ApiError } from '@/shared/api'
import { buildRoute, ROUTES } from '@/shared/config'
import { formatDate } from '@/shared/lib/format'
import { AsyncState } from '@/shared/ui/async-state'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/shared/ui/empty'
import { StatCard } from '@/shared/ui/stat-card'

const DASH = '—'

export function DashboardPage() {
  const user = useCurrentUser()
  const { data, isLoading, isError, error } = useDoctorOverview()

  const stats = data?.stats
  const profile = data?.profile

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight">
            Salom, {profile?.fullname ?? user?.fullname ?? 'shifokor'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {profile?.specialty
              ? `${profile.specialty.name} yo'nalishi bo'yicha malaka ko'rsatkichlaringiz`
              : "Imtihon topshirish uchun avval mutaxassislikni tanlang"}
          </p>
        </div>

        <Button asChild>
          <Link to={ROUTES.exams}>Imtihonga kirish</Link>
        </Button>
      </div>

      <AsyncState
        isLoading={isLoading}
        isError={isError}
        errorMessage={(error as ApiError | null)?.message}
      >
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={Target}
              tone="blue"
              label="Oxirgi natija"
              value={stats?.latestAttempt ? `${stats.latestAttempt.score}%` : DASH}
              hint={
                stats?.latestAttempt
                  ? formatDate(stats.latestAttempt.completedAt)
                  : 'Hali imtihon topshirilmagan'
              }
            />
            <StatCard
              icon={Award}
              tone="violet"
              label="Malaka darajasi"
              value={stats?.bestScore !== null && stats?.bestScore !== undefined ? `${stats.bestScore}%` : DASH}
              hint="Eng yuqori natijangiz"
            />
            <StatCard
              icon={ClipboardCheck}
              tone="emerald"
              label="Muvaffaqiyatli imtihonlar"
              value={`${stats?.passedAttempts ?? 0} / ${stats?.completedAttempts ?? 0}`}
              hint="O'tgan / yakunlangan"
            />
            <StatCard
              icon={TrendingUp}
              tone="amber"
              label="O'rtacha natija"
              value={stats?.averageScore !== null && stats?.averageScore !== undefined ? `${stats.averageScore}%` : DASH}
              hint="Barcha urinishlar bo'yicha"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Oxirgi natija</CardTitle>
                <CardDescription>
                  So'nggi yakunlangan imtihoningiz haqida ma'lumot
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats?.latestAttempt ? (
                  <LatestAttemptPanel attempt={stats.latestAttempt} />
                ) : (
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <ClipboardCheck />
                      </EmptyMedia>
                      <EmptyTitle>Natija yo'q</EmptyTitle>
                      <EmptyDescription>
                        Birinchi imtihonni topshiring — natijangiz shu yerda
                        ko'rinadi.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Profil</CardTitle>
                <CardDescription>Sertifikatda ko'rinadigan ma'lumotlar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Mutaxassislik</dt>
                    <dd className="text-right font-medium">
                      {profile?.specialty?.name ?? DASH}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Daraja</dt>
                    <dd className="text-right">
                      {stats?.currentQualification ? (
                        <QualificationBadge
                          qualification={stats.currentQualification}
                        />
                      ) : (
                        DASH
                      )}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Ish joyi</dt>
                    <dd className="truncate text-right font-medium">
                      {profile?.workplace ?? DASH}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Tajriba</dt>
                    <dd className="text-right font-medium">
                      {profile?.experienceYears
                        ? `${profile.experienceYears} yil`
                        : DASH}
                    </dd>
                  </div>
                </dl>

                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link to={ROUTES.profile}>Profilni tahrirlash</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </AsyncState>

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

function LatestAttemptPanel({ attempt }: { attempt: DoctorLatestAttempt }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="font-medium">{attempt.examTitle}</p>
          <p className="text-sm text-muted-foreground">{attempt.specialtyName}</p>
        </div>
        <div className="flex items-center gap-2">
          <QualificationBadge qualification={attempt.qualification} />
          <Badge variant={attempt.passed ? 'success' : 'secondary'}>
            {attempt.passed ? "O'tdi" : "O'tmadi"}
          </Badge>
        </div>
      </div>

      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-3xl font-semibold tabular-nums">{attempt.score}%</p>
          <p className="text-xs text-muted-foreground">
            {formatDate(attempt.completedAt)}
          </p>
        </div>

        <Button asChild variant="outline" size="sm">
          <Link to={buildRoute.attempt(attempt.id)}>Natijani ko'rish</Link>
        </Button>
      </div>
    </div>
  )
}
