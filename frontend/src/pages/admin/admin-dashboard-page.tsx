import type { ReactNode } from 'react'
import {
  Award,
  ClipboardList,
  FileQuestion,
  GraduationCap,
  Star,
  Stethoscope,
  TrendingUp,
  Users,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from 'recharts'

import {
  usePlatformOverview,
  usePlatformTrends,
  useSpecialtyStatistics,
  type SpecialtyStatistics,
  type TimePoint,
} from '@/features/statistics'
import type { ApiError } from '@/shared/api'
import { AsyncState } from '@/shared/ui/async-state'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/shared/ui/chart'
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

const COUNT_CONFIG: ChartConfig = {
  value: { label: 'Soni', color: 'var(--chart-1)' },
}

const SCORE_CONFIG: ChartConfig = {
  value: { label: "O'rtacha", color: 'var(--chart-3)' },
}

export function AdminDashboardPage() {
  const overview = usePlatformOverview()
  const trends = usePlatformTrends()
  const specialties = useSpecialtyStatistics()

  const data = overview.data
  const isLoading = overview.isLoading

  const statCards = [
    {
      icon: Users,
      tone: 'blue' as const,
      label: 'Jami shifokorlar',
      value: data?.totalDoctors ?? 0,
      hint: data ? `${data.activeDoctors} ta faol` : undefined,
    },
    {
      icon: Stethoscope,
      tone: 'violet' as const,
      label: 'Mutaxassisliklar',
      value: data?.specialtiesCount ?? 0,
    },
    {
      icon: GraduationCap,
      tone: 'emerald' as const,
      label: 'Imtihonlar',
      value: data?.examsCount ?? 0,
    },
    {
      icon: FileQuestion,
      tone: 'amber' as const,
      label: 'Savollar',
      value: data?.questionsCount ?? 0,
    },
    {
      icon: TrendingUp,
      tone: 'blue' as const,
      label: 'Bugun topshirilgan',
      value: data?.attemptsToday ?? 0,
      hint: data ? `${data.completedAttempts} ta jami` : undefined,
    },
    {
      icon: Star,
      tone: 'emerald' as const,
      label: "O'rtacha natija",
      value: data?.averageScore === null ? DASH : `${data?.averageScore}%`,
      hint: data ? `${data.activeCertificates} ta amaldagi sertifikat` : undefined,
    },
  ]

  return (
    <div className="space-y-5">
      <PageHeader
        title="Boshqaruv paneli"
        description="Platforma bo'yicha umumiy ko'rsatkichlar va statistika"
      />

      <AsyncState
        isLoading={false}
        isError={overview.isError}
        errorMessage={(overview.error as ApiError | null)?.message}
      >
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {statCards.map((stat) => (
              <StatCard key={stat.label} {...stat} isLoading={isLoading} />
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard
              title="Imtihon topshirish statistikasi"
              description="So'nggi 30 kun"
              isLoading={trends.isLoading}
              isEmpty={isFlat(trends.data?.attemptsPerDay)}
            >
              <ChartContainer config={COUNT_CONFIG} className="h-64 w-full">
                <BarChart
                  data={toChartData(trends.data?.attemptsPerDay, toDayLabel)}
                  margin={{ left: -24 }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                    allowDecimals={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="value"
                    fill="var(--color-value)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </ChartCard>

            <ChartCard
              title="O'rtacha ball dinamikasi"
              description="So'nggi 12 oy"
              isLoading={trends.isLoading}
              isEmpty={isFlat(trends.data?.averageScoreTrend)}
            >
              <ChartContainer config={SCORE_CONFIG} className="h-64 w-full">
                <LineChart
                  data={toChartData(trends.data?.averageScoreTrend, toMonthLabel)}
                  margin={{ left: -24 }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tickFormatter={(value: number) => `${value}%`}
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="var(--color-value)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ChartContainer>
            </ChartCard>

            <ChartCard
              title="Shifokorlar o'sishi"
              description="Oylar bo'yicha ro'yxatdan o'tganlar"
              isLoading={trends.isLoading}
              isEmpty={isFlat(trends.data?.doctorGrowth)}
            >
              <ChartContainer config={COUNT_CONFIG} className="h-64 w-full">
                <BarChart
                  data={toChartData(trends.data?.doctorGrowth, toMonthLabel)}
                  margin={{ left: -24 }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                    allowDecimals={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="value"
                    fill="var(--color-value)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </ChartCard>

            <ChartCard
              title="Natijalar taqsimoti"
              description="O'tgan va o'ta olmagan urinishlar"
              isLoading={isLoading}
              isEmpty={!data || data.completedAttempts === 0}
            >
              <OutcomeSummary
                passed={data?.passedAttempts ?? 0}
                failed={data?.failedAttempts ?? 0}
                certificates={data?.activeCertificates ?? 0}
                revoked={data?.revokedCertificates ?? 0}
              />
            </ChartCard>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">
                  Mutaxassisliklar bo'yicha natijalar
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  O'rtacha ball va yakunlangan urinishlar soni
                </p>
              </CardHeader>

              <CardContent>
                {specialties.isLoading ? (
                  <Skeleton className="h-48 w-full" />
                ) : (specialties.data ?? []).every(
                    (row) => row.attemptsCount === 0,
                  ) ? (
                  <EmptyChart
                    title="Natijalar yo'q"
                    description="Imtihonlar topshirilgach statistika shu yerda ko'rinadi."
                  />
                ) : (
                  <ScoreList items={specialties.data ?? []} />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </AsyncState>
    </div>
  )
}

interface ChartCardProps {
  title: string
  description?: string
  isLoading: boolean
  isEmpty?: boolean
  children: ReactNode
}

function ChartCard({
  title,
  description,
  isLoading,
  isEmpty,
  children,
}: ChartCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : isEmpty ? (
          <EmptyChart
            title="Ma'lumot yetarli emas"
            description="Natijalar to'plangach grafik shakllanadi."
          />
        ) : (
          children
        )}
      </CardContent>
    </Card>
  )
}

function EmptyChart({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <Empty className="min-h-64 border-0">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ClipboardList />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}

function OutcomeSummary({
  passed,
  failed,
  certificates,
  revoked,
}: {
  passed: number
  failed: number
  certificates: number
  revoked: number
}) {
  const total = passed + failed

  const rows = [
    { label: "O'tgan urinishlar", value: passed, total, tone: 'var(--chart-3)' },
    { label: "O'ta olmagan", value: failed, total, tone: 'var(--chart-5)' },
    {
      label: 'Amaldagi sertifikatlar',
      value: certificates,
      total: certificates + revoked,
      tone: 'var(--chart-1)',
    },
  ]

  return (
    <ul className="flex min-h-64 flex-col justify-center gap-4">
      {rows.map((row) => (
        <li key={row.label} className="space-y-1.5">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span>{row.label}</span>
            <span className="shrink-0 font-medium tabular-nums">
              {row.value}
              <span className="ml-1.5 text-xs text-muted-foreground">
                ({percent(row.value, row.total)}%)
              </span>
            </span>
          </div>
          <Bar_ value={percent(row.value, row.total)} color={row.tone} />
        </li>
      ))}

      <li className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
        <Award className="size-3.5" />
        {revoked > 0
          ? `${revoked} ta sertifikat bekor qilingan`
          : 'Bekor qilingan sertifikat yo`q'}
      </li>
    </ul>
  )
}

function ScoreList({ items }: { items: SpecialtyStatistics[] }) {
  const rows = items
    .filter((item) => item.attemptsCount > 0)
    .sort((first, second) => (second.averageScore ?? 0) - (first.averageScore ?? 0))

  return (
    <ul className="grid gap-2.5 sm:grid-cols-2">
      {rows.map((row) => (
        <li key={row.specialtyId} className="space-y-1">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate">{row.name}</span>
            <span className="shrink-0 font-medium tabular-nums">
              {row.averageScore ?? 0}%
              <span className="ml-1.5 text-xs text-muted-foreground">
                ({row.attemptsCount})
              </span>
            </span>
          </div>
          <Bar_ value={row.averageScore ?? 0} color="var(--chart-1)" />
        </li>
      ))}
    </ul>
  )
}

/** Recharts `Bar` bilan nomi to'qnashmasligi uchun pastki chiziqli nom. */
function Bar_({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full"
        style={{ width: `${Math.min(100, value)}%`, backgroundColor: color }}
      />
    </div>
  )
}

function percent(value: number, total: number): number {
  return total === 0 ? 0 : Math.round((value / total) * 100)
}

/** Barcha qiymatlar nol bo'lsa grafik o'rniga bo'sh holat ko'rsatiladi. */
function isFlat(points: TimePoint[] | undefined): boolean {
  return !points || points.every((point) => point.value === 0)
}

function toChartData(
  points: TimePoint[] | undefined,
  toLabel: (period: string) => string,
) {
  return (points ?? []).map((point) => ({
    label: toLabel(point.period),
    value: point.value,
  }))
}

const MONTHS = [
  'Yan',
  'Fev',
  'Mar',
  'Apr',
  'May',
  'Iyn',
  'Iyl',
  'Avg',
  'Sen',
  'Okt',
  'Noy',
  'Dek',
]

function toDayLabel(period: string): string {
  const [, month, day] = period.split('-')

  return `${day}.${month}`
}

function toMonthLabel(period: string): string {
  const [, month] = period.split('-')

  return MONTHS[Number(month) - 1] ?? period
}
