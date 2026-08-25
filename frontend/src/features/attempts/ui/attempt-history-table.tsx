import { useMemo } from 'react'
import { Link } from 'react-router-dom'

import type { ApiError } from '@/shared/api'
import { buildRoute } from '@/shared/config'
import { useTableQuery } from '@/shared/hooks'
import { formatDate } from '@/shared/lib/format'
import { AsyncState } from '@/shared/ui/async-state'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { DataTable, type Column } from '@/shared/ui/data-table'
import { TablePagination } from '@/shared/ui/table-pagination'
import { useAttemptHistory } from '../api/attempts-queries'
import type { AttemptStatus, AttemptSummary } from '../model/types'
import { QualificationBadge } from './qualification-badge'

const STATUS_LABELS: Record<AttemptSummary['status'], string> = {
  IN_PROGRESS: 'Davom etmoqda',
  SUBMITTED: 'Yakunlangan',
  EXPIRED: 'Vaqti tugagan',
}

const columns: Column<AttemptSummary>[] = [
  {
    key: 'exam',
    header: 'Imtihon',
    cell: (row) => (
      <div className="max-w-xs space-y-1">
        <p className="font-medium">{row.exam.title}</p>
        <p className="text-xs text-muted-foreground">{row.exam.specialty.name}</p>
      </div>
    ),
  },
  {
    key: 'startedAt',
    header: 'Sana',
    cell: (row) => formatDate(row.completedAt ?? row.startedAt),
  },
  {
    key: 'score',
    header: 'Natija',
    className: 'text-right',
    cell: (row) =>
      row.score === null ? (
        <span className="text-muted-foreground">—</span>
      ) : (
        <span className="font-medium tabular-nums">{row.score}%</span>
      ),
  },
  {
    key: 'qualification',
    header: 'Daraja',
    cell: (row) =>
      row.qualification ? (
        <QualificationBadge qualification={row.qualification} />
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    key: 'status',
    header: 'Holat',
    cell: (row) => (
      <Badge
        variant={
          row.status === 'IN_PROGRESS'
            ? 'info'
            : row.passed
              ? 'success'
              : 'secondary'
        }
      >
        {row.status === 'SUBMITTED' && row.passed
          ? "O'tdi"
          : row.status === 'SUBMITTED'
            ? "O'tmadi"
            : STATUS_LABELS[row.status]}
      </Badge>
    ),
  },
  {
    key: 'actions',
    header: '',
    className: 'w-24 text-right',
    cell: (row) => (
      <Button asChild variant="ghost" size="sm">
        <Link to={buildRoute.attempt(row.id)}>
          {row.status === 'IN_PROGRESS' ? 'Davom etish' : "Ko'rish"}
        </Link>
      </Button>
    ),
  },
]

interface AttemptHistoryTableProps {
  limit?: number
  /** Imtihon yoki holat bo'yicha cheklov — "Natijalarim" sahifasi uzatadi. */
  filters?: { examId?: number; status?: AttemptStatus }
}

export function AttemptHistoryTable({
  limit = 10,
  filters,
}: AttemptHistoryTableProps) {
  const table = useTableQuery(limit)
  const params = useMemo(
    () => ({ ...table.params, ...filters }),
    [table.params, filters],
  )

  const { data, isLoading, isError, error } = useAttemptHistory(params)

  return (
    <div className="space-y-4">
      <AsyncState
        isLoading={isLoading}
        isError={isError}
        errorMessage={(error as ApiError | null)?.message}
        isEmpty={data?.items.length === 0}
        emptyTitle="Hali imtihon topshirmagansiz"
        emptyDescription="Birinchi imtihonni boshlash uchun Imtihonlar bo'limiga o'ting."
        loadingFallback={
          <DataTable data={[]} columns={columns} rowKey={(row) => row.id} isLoading />
        }
      >
        <DataTable data={data?.items ?? []} columns={columns} rowKey={(row) => row.id} />
      </AsyncState>

      {data && (
        <TablePagination meta={data.meta} onPageChange={table.setPage} />
      )}
    </div>
  )
}
