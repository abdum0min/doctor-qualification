import {
  Award,
  CircleCheck,
  CircleX,
  ClipboardList,
  TrendingUp,
  Trophy,
  Users,
} from 'lucide-react'

import {
  usePlatformOverview,
  useSpecialtyStatistics,
  type SpecialtyStatistics,
} from '@/features/statistics'
import type { ApiError } from '@/shared/api'
import { AsyncState } from '@/shared/ui/async-state'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/shared/ui/chart'
import { DataTable, type Column } from '@/shared/ui/data-table'
import { Progress } from '@/shared/ui/progress'
import { StatCard } from '@/shared/ui/stat-card'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

const DASH = '—'

const CHART_CONFIG = {
  attemptsCount: { label: 'Urinishlar', color: 'var(--chart-1)' },
  passedCount: { label: "O'tganlar", color: 'var(--chart-3)' },
}

const specialtyColumns: Column<SpecialtyStatistics>[] = [
  {
    key: 'name',
    header: 'Mutaxassislik',
    cell: (row) => <span className="font-medium">{row.name}</span>,
  },
  {
    key: 'doctorsCount',
    header: 'Shifokorlar',
    className: 'text-right tabular-nums',
    cell: (row) => row.doctorsCount,
  },
  {
    key: 'questionsCount',
    header: 'Savollar',
    className: 'text-right tabular-nums',
    cell: (row) => row.questionsCount,
  },
  {
    key: 'examsCount',
    header: 'Imtihonlar',
    className: 'text-right tabular-nums',
    cell: (row) => row.examsCount,
  },
  {
    key: 'attemptsCount',
    header: 'Urinishlar',
    className: 'text-right tabular-nums',
    cell: (row) => row.attemptsCount,
  },
  {
    key: 'passRate',
    header: "O'tish ulushi",
    cell: (row) => {
      if (row.attemptsCount === 0) {
        return <span className="text-muted-foreground">{DASH}</span>
      }

      const rate = Math.round((row.passedCount / row.attemptsCount) * 100)

      return (
        <div className="flex items-center gap-2">
          <Progress value={rate} className="h-1.5 w-16" />
          <span className="text-xs tabular-nums">{rate}%</span>
        </div>
      )
    },
  },
  {
    key: 'averageScore',
    header: "O'rtacha",
    className: 'text-right tabular-nums',
    cell: (row) => (row.averageScore === null ? DASH : `${row.averageScore}%`),
  },
]

export function AdminDashboardPage() {
  const overview = usePlatformOverview()
  const specialties = useSpecialtyStatistics()

  const data = overview.data
  const chartData = (specialties.data ?? []).filter((row) => row.attemptsCount > 0)

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">Boshqaruv paneli</h2>
        <p className="text-sm text-muted-foreground">
          Platforma bo'yicha umumiy ko'rsatkichlar
        </p>
      </div>

      <AsyncState
        isLoading={overview.isLoading}
        isError={overview.isError}
        errorMessage={(overview.error as ApiError | null)?.message}
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={Users}
            tone="blue"
            label="Jami shifokorlar"
            value={data?.totalDoctors ?? 0}
            hint={`${data?.activeDoctors ?? 0} ta faol hisob`}
          />
          <StatCard
            icon={ClipboardList}
            tone="violet"
            label="Imtihon topshirganlar"
            value={data?.doctorsWithAttempts ?? 0}
            hint={`${data?.completedAttempts ?? 0} ta yakunlangan urinish`}
          />
          <StatCard
            icon={CircleCheck}
            tone="emerald"
            label="Testdan o'tganlar"
            value={data?.passedAttempts ?? 0}
            hint="O'tish balidan yuqori natijalar"
          />
          <StatCard
            icon={CircleX}
            tone="red"
            label="O'ta olmaganlar"
            value={data?.failedAttempts ?? 0}
            hint="Qayta urinish mumkin"
          />
          <StatCard
            icon={Award}
            tone="violet"
            label="Sertifikat olganlar"
            value={data?.certificatesIssued ?? 0}
            hint={`${data?.revokedCertificates ?? 0} ta bekor qilingan`}
          />
          <StatCard
            icon={TrendingUp}
            tone="amber"
            label="O'rtacha natija"
            value={data?.averageScore === null || data?.averageScore === undefined ? DASH : `${data.averageScore}%`}
            hint="Yakunlangan urinishlar bo'yicha"
          />
          <StatCard
            icon={Trophy}
            tone="emerald"
            label="Eng yuqori natija"
            value={data?.highestScore === null || data?.highestScore === undefined ? DASH : `${data.highestScore}%`}
            hint="Platformadagi rekord"
          />
          <StatCard
            icon={Award}
            tone="blue"
            label="Amaldagi sertifikatlar"
            value={data?.activeCertificates ?? 0}
            hint="Bekor qilinmagan va muddati bor"
          />
        </div>
      </AsyncState>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Mutaxassisliklar bo'yicha natijalar</CardTitle>
          <CardDescription>
            Har bir yo'nalishdagi urinishlar va muvaffaqiyatli natijalar
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <AsyncState
            isLoading={specialties.isLoading}
            isError={specialties.isError}
            errorMessage={(specialties.error as ApiError | null)?.message}
            isEmpty={specialties.data?.length === 0}
            emptyTitle="Ma'lumot yo'q"
            emptyDescription="Mutaxassislik qo'shilgach statistika shu yerda ko'rinadi."
          >
            <div className="space-y-6">
              {chartData.length > 0 && (
                <ChartContainer config={CHART_CONFIG} className="h-64 w-full">
                  <BarChart data={chartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                    <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="attemptsCount"
                      fill="var(--color-attemptsCount)"
                      radius={4}
                    />
                    <Bar
                      dataKey="passedCount"
                      fill="var(--color-passedCount)"
                      radius={4}
                    />
                  </BarChart>
                </ChartContainer>
              )}

              <DataTable
                data={specialties.data ?? []}
                columns={specialtyColumns}
                rowKey={(row) => row.specialtyId}
              />
            </div>
          </AsyncState>
        </CardContent>
      </Card>
    </div>
  )
}
