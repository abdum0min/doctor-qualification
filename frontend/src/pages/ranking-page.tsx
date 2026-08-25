import { useMemo, useState } from 'react'
import { Trophy } from 'lucide-react'

import { QualificationBadge } from '@/features/attempts'
import { useIsAdmin } from '@/features/auth'
import {
  RankBadge,
  RANKING_PERIOD_LABELS,
  RANKING_PERIODS,
  useMyRanking,
  useRankings,
  type RankingPeriod,
  type RankingRow,
} from '@/features/rankings'
import { SpecialtySelect } from '@/features/specialties'
import type { ApiError } from '@/shared/api'
import { useTableQuery } from '@/shared/hooks'
import { cn } from '@/shared/lib/utils'
import { AsyncState } from '@/shared/ui/async-state'
import { Card, CardContent } from '@/shared/ui/card'
import { DataTable, type Column } from '@/shared/ui/data-table'
import { PageShell } from '@/shared/ui/page-shell'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { TablePagination } from '@/shared/ui/table-pagination'

const DASH = '—'

const columns: Column<RankingRow>[] = [
  {
    key: 'position',
    header: '#',
    className: 'w-14',
    cell: (row) => <RankBadge position={row.position} />,
  },
  {
    key: 'fullname',
    header: 'Shifokor',
    cell: (row) => (
      <div className="max-w-xs space-y-1">
        <p className="font-medium">{row.fullname}</p>
        <p className="truncate text-xs text-muted-foreground">
          {row.specialtyName ?? DASH}
          {row.workplace ? ` · ${row.workplace}` : ''}
        </p>
      </div>
    ),
  },
  {
    key: 'qualification',
    header: 'Daraja',
    cell: (row) =>
      row.qualification ? (
        <QualificationBadge qualification={row.qualification} />
      ) : (
        <span className="text-muted-foreground">{DASH}</span>
      ),
  },
  {
    key: 'attemptCount',
    header: 'Urinishlar',
    className: 'text-right tabular-nums',
    cell: (row) => `${row.passedCount} / ${row.attemptCount}`,
  },
  {
    key: 'averageScore',
    header: "O'rtacha",
    className: 'text-right tabular-nums',
    cell: (row) => `${row.averageScore}%`,
  },
  {
    key: 'bestScore',
    header: 'Eng yuqori',
    className: 'text-right tabular-nums',
    cell: (row) => `${row.bestScore}%`,
  },
  {
    key: 'certificatesCount',
    header: 'Sertifikat',
    className: 'text-right tabular-nums',
    cell: (row) => row.certificatesCount,
  },
  {
    key: 'score',
    header: 'Reyting bali',
    className: 'text-right',
    cell: (row) => (
      <span className="font-semibold tabular-nums">{row.score}</span>
    ),
  },
]

export function RankingPage() {
  const isAdmin = useIsAdmin()
  const table = useTableQuery(20)
  const [specialtyId, setSpecialtyId] = useState<number | null>(null)
  const [period, setPeriod] = useState<RankingPeriod>('all')

  const params = useMemo(
    () => ({
      ...table.params,
      period,
      ...(specialtyId ? { specialtyId } : {}),
    }),
    [table.params, period, specialtyId],
  )

  const { data, isLoading, isError, error } = useRankings(params)

  return (
    <div className="space-y-4">
      {!isAdmin && <MyRankingCard period={period} specialtyId={specialtyId} />}

      <PageShell
        title="Shifokorlar reytingi"
        description="Ball o'rtacha natija, eng yuqori natija, urinishlar soni va o'tish ulushidan hisoblanadi"
        search={table.search}
        onSearchChange={table.setSearch}
        searchPlaceholder="Shifokor ismi bo'yicha qidirish..."
        filters={
          <div className="flex flex-wrap gap-2">
            <div className="w-52">
              <SpecialtySelect
                clearable
                value={specialtyId}
                onChange={(value) => {
                  setSpecialtyId(value)
                  table.resetPage()
                }}
                placeholder="Barcha mutaxassisliklar"
              />
            </div>
            <div className="w-44">
              <Select
                value={period}
                onValueChange={(value) => {
                  setPeriod(value as RankingPeriod)
                  table.resetPage()
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RANKING_PERIODS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {RANKING_PERIOD_LABELS[item]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        }
      >
        <AsyncState
          isLoading={isLoading}
          isError={isError}
          errorMessage={(error as ApiError | null)?.message}
          isEmpty={data?.items.length === 0}
          emptyTitle="Reyting bo'sh"
          emptyDescription="Tanlangan davrda imtihon topshirgan shifokor topilmadi."
          loadingFallback={
            <DataTable data={[]} columns={columns} rowKey={(row) => row.doctorId} isLoading />
          }
        >
          <DataTable
            data={data?.items ?? []}
            columns={columns}
            rowKey={(row) => row.doctorId}
          />
        </AsyncState>

        {data && <TablePagination meta={data.meta} onPageChange={table.setPage} />}
      </PageShell>
    </div>
  )
}

function MyRankingCard({
  period,
  specialtyId,
}: {
  period: RankingPeriod
  specialtyId: number | null
}) {
  const { data } = useMyRanking({
    period,
    ...(specialtyId ? { specialtyId } : {}),
  })

  if (!data) return null

  const facts = [
    { label: "O'rtacha natija", value: data.row ? `${data.row.averageScore}%` : DASH },
    { label: 'Eng yuqori', value: data.row ? `${data.row.bestScore}%` : DASH },
    {
      label: 'Urinishlar',
      value: data.row ? `${data.row.passedCount} / ${data.row.attemptCount}` : DASH,
    },
    { label: 'Reyting bali', value: data.row ? String(data.row.score) : DASH },
  ]

  return (
    <Card>
      <CardContent className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'flex size-12 items-center justify-center rounded-xl',
              data.position ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
            )}
          >
            <Trophy className="size-6" />
          </span>

          <div>
            <p className="text-xs text-muted-foreground">Sizning o'rningiz</p>
            <p className="text-2xl font-semibold tabular-nums">
              {data.position ? `${data.position}` : DASH}
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                / {data.totalDoctors}
              </span>
            </p>
          </div>
        </div>

        <dl className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-4">
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt className="text-xs text-muted-foreground">{fact.label}</dt>
              <dd className="text-sm font-medium tabular-nums">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  )
}
