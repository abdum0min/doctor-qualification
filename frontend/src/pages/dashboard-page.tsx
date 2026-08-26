import {
  Award,
  ClipboardList,
  GraduationCap,
  Star,
  Target,
  TrendingUp,
  Trophy,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { QualificationBadge } from '@/features/attempts'
import { useCurrentUser } from '@/features/auth'
import {
  ScoreTrendChart,
  useDoctorOverview,
  type DoctorLatestAttempt,
} from '@/features/doctors'
import { ExamCard, useActiveExams } from '@/features/exams'
import { NotificationItem, useNotifications } from '@/features/notifications'
import { TopDoctors, useMyRanking } from '@/features/rankings'
import type { ApiError } from '@/shared/api'
import { ROUTES } from '@/shared/config'
import { formatDate } from '@/shared/lib/format'
import { AsyncState } from '@/shared/ui/async-state'
import { Button } from '@/shared/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty'
import { PageHeader } from '@/shared/ui/page-header'
import { Skeleton } from '@/shared/ui/skeleton'
import { StatCard } from '@/shared/ui/stat-card'

const DASH = '—'
const AVAILABLE_EXAMS = 4
const NOTIFICATION_PREVIEW = 4

export function DashboardPage() {
  const user = useCurrentUser()
  const { data, isLoading, isError, error } = useDoctorOverview()

  const profile = data?.profile
  const stats = data?.stats
  const specialtyId = profile?.specialty?.id

  const ranking = useMyRanking()
  const exams = useActiveExams(specialtyId)
  const notifications = useNotifications({
    page: 1,
    limit: NOTIFICATION_PREVIEW,
  })

  const passRate =
    stats && stats.completedAttempts > 0
      ? Math.round((stats.passedAttempts / stats.completedAttempts) * 100)
      : null

  const statCards = [
    {
      icon: Trophy,
      tone: 'blue' as const,
      label: "Reyting o'rnim",
      value: ranking.data?.position ? `${ranking.data.position}-o'rin` : DASH,
      hint: ranking.data
        ? `${ranking.data.totalDoctors} ta shifokordan`
        : undefined,
    },
    {
      icon: Star,
      tone: 'amber' as const,
      label: "O'rtacha ball",
      value: stats?.averageScore === null ? DASH : `${stats?.averageScore}%`,
      hint: describeChange(stats?.recentChange),
    },
    {
      icon: TrendingUp,
      tone: 'emerald' as const,
      label: 'Eng yuqori ball',
      value: stats?.bestScore === null ? DASH : `${stats?.bestScore}%`,
    },
    {
      icon: Target,
      tone: 'violet' as const,
      label: 'Oxirgi natija',
      value: stats?.latestAttempt ? `${stats.latestAttempt.score}%` : DASH,
      hint: stats?.latestAttempt
        ? formatDate(stats.latestAttempt.completedAt)
        : 'Hali imtihon topshirilmagan',
    },
    {
      icon: ClipboardList,
      tone: 'blue' as const,
      label: 'Imtihonlarim',
      value: stats?.completedAttempts ?? 0,
      hint: passRate === null ? undefined : `${passRate}% o'tgan`,
    },
    {
      icon: Award,
      tone: 'emerald' as const,
      label: 'Sertifikatlarim',
      value: stats?.certificatesCount ?? 0,
      hint: stats?.latestCertificate?.certificateId,
    },
  ]

  return (
    <div className="space-y-5">
      <PageHeader
        title={`Salom, ${profile?.fullname ?? user?.fullname ?? 'shifokor'}`}
        description={
          profile?.specialty
            ? `${profile.specialty.name} yo'nalishi — bilimingizni sinang va reytingda ko'tariling.`
            : 'Imtihon topshirish uchun avval profilda mutaxassislikni tanlang.'
        }
        action={
          <Button asChild>
            <Link to={ROUTES.exams}>Imtihonga kirish</Link>
          </Button>
        }
      />

      <AsyncState
        isLoading={isLoading}
        isError={isError}
        errorMessage={(error as ApiError | null)?.message}
      >
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {statCards.map((stat) => (
              <StatCard key={stat.label} {...stat} isLoading={isLoading} />
            ))}
          </div>

          {/* `items-start` — ustunlar bir-birining balandligiga cho'zilmaydi. */}
          <div className="grid items-start gap-4 xl:grid-cols-[1fr_340px]">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Natijalarim dinamikasi
                  </CardTitle>
                  <CardAction>
                    <Button asChild variant="link" size="sm" className="h-auto p-0">
                      <Link to={ROUTES.results}>Barchasini ko'rish</Link>
                    </Button>
                  </CardAction>
                </CardHeader>

                <CardContent className="grid gap-5 lg:grid-cols-[1fr_260px]">
                  {stats && stats.scoreTrend.length > 1 ? (
                    <ScoreTrendChart points={stats.scoreTrend} />
                  ) : (
                    <Empty className="min-h-64 border-0">
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <ClipboardList />
                        </EmptyMedia>
                        <EmptyTitle>Dinamika yo'q</EmptyTitle>
                        <EmptyDescription>
                          Ikkinchi imtihondan keyin natijalar grafigi shu yerda
                          ko'rinadi.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  )}

                  <div className="space-y-1">
                    <p className="pb-1 text-sm font-medium">
                      So'nggi imtihonlar
                    </p>

                    {stats?.recentAttempts.length === 0 && (
                      <p className="py-4 text-sm text-muted-foreground">
                        Hali imtihon topshirmagansiz.
                      </p>
                    )}

                    {stats?.recentAttempts.map((attempt) => (
                      <RecentAttempt key={attempt.id} attempt={attempt} />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Mavjud imtihonlar</CardTitle>
                  <CardAction>
                    <Button asChild variant="link" size="sm" className="h-auto p-0">
                      <Link to={ROUTES.exams}>Barchasini ko'rish</Link>
                    </Button>
                  </CardAction>
                </CardHeader>

                <CardContent>
                  {exams.isLoading ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {Array.from({ length: 2 }).map((_, index) => (
                        <Skeleton key={index} className="h-52 rounded-xl" />
                      ))}
                    </div>
                  ) : exams.data?.length === 0 ? (
                    <Empty className="border-0">
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <GraduationCap />
                        </EmptyMedia>
                        <EmptyTitle>Imtihon yo'q</EmptyTitle>
                        <EmptyDescription>
                          Yo'nalishingiz bo'yicha imtihon ochilganda sizga xabar
                          yuboriladi.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {exams.data?.slice(0, AVAILABLE_EXAMS).map((exam) => (
                        <ExamCard key={exam.id} exam={exam} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <TopDoctors
                specialtyId={specialtyId}
                title={
                  profile?.specialty
                    ? `TOP — ${profile.specialty.name}`
                    : 'TOP shifokorlar'
                }
              />

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    E'lonlar va yangiliklar
                  </CardTitle>
                  <CardAction>
                    <Button asChild variant="link" size="sm" className="h-auto p-0">
                      <Link to={ROUTES.notifications}>Barchasini ko'rish</Link>
                    </Button>
                  </CardAction>
                </CardHeader>

                <CardContent className="space-y-1">
                  {notifications.isLoading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <Skeleton key={index} className="h-14 w-full" />
                      ))}
                    </div>
                  ) : notifications.data?.items.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                      Hozircha xabar yo'q
                    </p>
                  ) : (
                    notifications.data?.items.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        compact
                      />
                    ))
                  )}
                </CardContent>
              </Card>

              <Card className="bg-primary/5">
                <CardContent className="flex items-start gap-3">
                  <Award className="mt-0.5 size-5 shrink-0 text-primary" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-pretty">
                      Sertifikat olish uchun imtihonni o'tish balidan yuqori
                      natija bilan topshiring
                    </p>
                    <Button asChild size="sm">
                      <Link to={ROUTES.exams}>Imtihon topshirish</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </AsyncState>
    </div>
  )
}

function RecentAttempt({ attempt }: { attempt: DoctorLatestAttempt }) {
  return (
    <Link
      to={ROUTES.results}
      className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-accent/60"
    >
      <span className="min-w-0">
        <span className="block truncate text-sm">{attempt.examTitle}</span>
        <span className="block text-xs text-muted-foreground">
          {formatDate(attempt.completedAt)}
        </span>
      </span>

      <span className="flex shrink-0 items-center gap-2">
        <QualificationBadge qualification={attempt.qualification} />
        <span
          className={
            attempt.passed
              ? 'text-sm font-semibold tabular-nums text-emerald-600 dark:text-emerald-400'
              : 'text-sm font-semibold tabular-nums text-destructive'
          }
        >
          {attempt.score}%
        </span>
      </span>
    </Link>
  )
}

/** "↑ 4% so'nggi imtihonlarda" — o'sish yoki pasayishni bir qarashda ko'rsatadi. */
function describeChange(change: number | null | undefined): string | undefined {
  if (change === null || change === undefined || change === 0) {
    return undefined
  }

  return `${change > 0 ? '↑' : '↓'} ${Math.abs(change)}% so'nggi imtihonlarda`
}
