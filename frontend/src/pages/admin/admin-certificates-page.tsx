import { useMemo, useState } from 'react'
import { Ban, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'

import { QualificationBadge } from '@/features/attempts'
import {
  certificateState,
  RevokeCertificateDialog,
  useAdminCertificates,
  type Certificate,
  type CertificateStatus,
} from '@/features/certificates'
import type { ApiError } from '@/shared/api'
import { buildRoute } from '@/shared/config'
import { useTableQuery } from '@/shared/hooks'
import { formatDate } from '@/shared/lib/format'
import { AsyncState } from '@/shared/ui/async-state'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
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

const columns: Column<Certificate>[] = [
  {
    key: 'certificateId',
    header: 'Certificate ID',
    cell: (row) => (
      <div className="space-y-1">
        <p className="font-mono text-sm font-medium">{row.certificateId}</p>
        <p className="text-xs text-muted-foreground">{row.examTitle}</p>
      </div>
    ),
  },
  {
    key: 'doctor',
    header: 'Shifokor',
    cell: (row) => (
      <div className="space-y-1">
        <p className="font-medium">{row.doctorFullname}</p>
        <p className="text-xs text-muted-foreground">{row.specialtyName}</p>
      </div>
    ),
  },
  {
    key: 'score',
    header: 'Natija',
    className: 'text-right',
    cell: (row) => <span className="tabular-nums">{row.score}%</span>,
  },
  {
    key: 'qualification',
    header: 'Daraja',
    cell: (row) => <QualificationBadge qualification={row.qualification} />,
  },
  {
    key: 'issuedAt',
    header: 'Berilgan',
    cell: (row) => formatDate(row.issuedAt),
  },
  {
    key: 'status',
    header: 'Holat',
    cell: (row) => {
      const state = certificateState(row)

      return <Badge variant={state.variant}>{state.label}</Badge>
    },
  },
  {
    key: 'actions',
    header: '',
    className: 'w-24 text-right',
    cell: (row) => (
      <div className="flex justify-end gap-1">
        <Button asChild variant="ghost" size="icon" aria-label="Tekshirish sahifasi">
          <Link
            to={buildRoute.verify(row.certificateId)}
            target="_blank"
            rel="noreferrer"
          >
            <ExternalLink />
          </Link>
        </Button>

        {row.status === 'ACTIVE' && (
          <RevokeCertificateDialog certificateId={row.certificateId}>
            <Button variant="ghost" size="icon" aria-label="Bekor qilish">
              <Ban />
            </Button>
          </RevokeCertificateDialog>
        )}
      </div>
    ),
  },
]

export function AdminCertificatesPage() {
  const table = useTableQuery(10)
  const [status, setStatus] = useState<CertificateStatus | null>(null)

  const params = useMemo(
    () => ({ ...table.params, ...(status ? { status } : {}) }),
    [table.params, status],
  )

  const { data, isLoading, isError, error } = useAdminCertificates(params)

  return (
    <PageShell
      title="Sertifikatlar"
      description="Berilgan sertifikatlarni ko'rish va bekor qilish"
      search={table.search}
      onSearchChange={table.setSearch}
      searchPlaceholder="Certificate ID yoki shifokor ismi..."
      filters={
        <div className="w-44">
          <Select
            value={status ?? ALL}
            onValueChange={(value) => {
              setStatus(value === ALL ? null : (value as CertificateStatus))
              table.resetPage()
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Barcha holatlar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Barcha holatlar</SelectItem>
              <SelectItem value="ACTIVE">Amaldagi</SelectItem>
              <SelectItem value="REVOKED">Bekor qilingan</SelectItem>
            </SelectContent>
          </Select>
        </div>
      }
    >
      <AsyncState
        isLoading={isLoading}
        isError={isError}
        errorMessage={(error as ApiError | null)?.message}
        isEmpty={data?.items.length === 0}
        emptyTitle="Sertifikat topilmadi"
        emptyDescription="Imtihondan o'tgan shifokorlarga sertifikat avtomatik beriladi."
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
