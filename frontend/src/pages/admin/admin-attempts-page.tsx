import { useMemo, useState } from 'react'

import { useAdminAttempts, type AdminAttempt } from '@/features/admin'
import { QualificationBadge, type AttemptStatus } from '@/features/attempts'
import { SpecialtySelect } from '@/features/specialties'
import type { ApiError } from '@/shared/api'
import { useTableQuery } from '@/shared/hooks'
import { formatDate } from '@/shared/lib/format'
import { AsyncState } from '@/shared/ui/async-state'
import { Badge } from '@/shared/ui/badge'
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

const ALL = 'all'
const DASH = '—'

const STATUS_LABELS: Record<AttemptStatus, string> = {
  IN_PROGRESS: 'Davom etmoqda',
  SUBMITTED: 'Yakunlangan',
  EXPIRED: 'Vaqti tugagan',
}

const columns: Column<AdminAttempt>[] = [
  {
    key: 'doctor',
    header: 'Shifokor',
    cell: (row) => (
      <div className="max-w-xs space-y-1">
        <p className="font-medium">{row.doctorFullname}</p>
        <p className="truncate text-xs text-muted-foreground">{row.specialtyName}</p>
      </div>
    ),
  },
  {
    key: 'exam',
    header: 'Imtihon',
    cell: (row) => <span className="text-sm">{row.examTitle}</span>,
  },
  {
    key: 'result',
    header: 'Natija',
    className: 'text-right',
    cell: (row) =>
      row.score === null ? (
        <span className="text-muted-foreground">{DASH}</span>
      ) : (
        <div className="space-y-0.5">
          <p className="font-medium tabular-nums">{row.score}%</p>
          <p className="text-xs text-muted-foreground tabular-nums">
            {row.correctCount} / {row.questionCount}
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
    key: 'certificateId',
    header: 'Sertifikat',
    cell: (row) =>
      row.certificateId ? (
        <span className="font-mono text-xs">{row.certificateId}</span>
      ) : (
        <span className="text-muted-foreground">{DASH}</span>
      ),
  },
  {
    key: 'startedAt',
    header: 'Sana',
    cell: (row) => formatDate(row.completedAt ?? row.startedAt),
  },
  {
    key: 'status',
    header: 'Holat',
    cell: (row) => (
      <Badge
        variant={
          row.status === 'IN_PROGRESS' ? 'info' : row.passed ? 'success' : 'secondary'
        }
      >
        {row.status === 'SUBMITTED'
          ? row.passed
            ? "O'tdi"
            : "O'tmadi"
          : STATUS_LABELS[row.status]}
      </Badge>
    ),
  },
]

export function AdminAttemptsPage() {
  const table = useTableQuery(10)
  const [specialtyId, setSpecialtyId] = useState<number | null>(null)
  const [status, setStatus] = useState<AttemptStatus | null>(null)

  const params = useMemo(
    () => ({
      ...table.params,
      ...(specialtyId ? { specialtyId } : {}),
      ...(status ? { status } : {}),
    }),
    [table.params, specialtyId, status],
  )

  const { data, isLoading, isError, error } = useAdminAttempts(params)

  return (
    <PageShell
      title="Imtihon natijalari"
      description="Barcha urinishlar, natijalar va berilgan sertifikatlar"
      search={table.search}
      onSearchChange={table.setSearch}
      searchPlaceholder="Shifokor ismi yoki email..."
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
              value={status ?? ALL}
              onValueChange={(value) => {
                setStatus(value === ALL ? null : (value as AttemptStatus))
                table.resetPage()
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Barcha holatlar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Barcha holatlar</SelectItem>
                <SelectItem value="SUBMITTED">Yakunlangan</SelectItem>
                <SelectItem value="IN_PROGRESS">Davom etmoqda</SelectItem>
                <SelectItem value="EXPIRED">Vaqti tugagan</SelectItem>
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
        emptyTitle="Natija topilmadi"
        emptyDescription="Filtrlarni o'zgartiring yoki shifokorlar imtihon topshirishini kuting."
        loadingFallback={
          <DataTable data={[]} columns={columns} rowKey={(row) => row.id} isLoading />
        }
      >
        <DataTable data={data?.items ?? []} columns={columns} rowKey={(row) => row.id} />
      </AsyncState>

      {data && (
        <TablePagination meta={data.meta} onPageChange={table.setPage} />
      )}
    </PageShell>
  )
}
