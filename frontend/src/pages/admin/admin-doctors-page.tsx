import { useMemo, useState } from 'react'
import { Eye, ShieldBan, ShieldCheck } from 'lucide-react'

import {
  useAdminDoctors,
  useUpdateDoctorStatus,
  type AdminDoctor,
  type DoctorAccountStatus,
} from '@/features/admin'
import { SpecialtySelect } from '@/features/specialties'
import type { ApiError } from '@/shared/api'
import { useTableQuery } from '@/shared/hooks'
import { formatDate } from '@/shared/lib/format'
import { AsyncState } from '@/shared/ui/async-state'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'
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
import { AdminDoctorDialog } from './admin-doctor-dialog'

const ALL = 'all'
const DASH = '—'

export function AdminDoctorsPage() {
  const table = useTableQuery(10)
  const [specialtyId, setSpecialtyId] = useState<number | null>(null)
  const [status, setStatus] = useState<DoctorAccountStatus | null>(null)
  const updateStatus = useUpdateDoctorStatus()

  const params = useMemo(
    () => ({
      ...table.params,
      ...(specialtyId ? { specialtyId } : {}),
      ...(status ? { status } : {}),
    }),
    [table.params, specialtyId, status],
  )

  const { data, isLoading, isError, error } = useAdminDoctors(params)

  const columns: Column<AdminDoctor>[] = [
    {
      key: 'fullname',
      header: 'Shifokor',
      cell: (row) => (
        <div className="max-w-xs space-y-1">
          <p className="font-medium">{row.fullname}</p>
          <p className="truncate text-xs text-muted-foreground">{row.email}</p>
        </div>
      ),
    },
    {
      key: 'specialtyName',
      header: 'Mutaxassislik',
      cell: (row) => row.specialtyName ?? <span className="text-muted-foreground">{DASH}</span>,
    },
    {
      key: 'attemptsCount',
      header: 'Urinishlar',
      className: 'text-right tabular-nums',
      cell: (row) => row.attemptsCount,
    },
    {
      key: 'certificatesCount',
      header: 'Sertifikatlar',
      className: 'text-right tabular-nums',
      cell: (row) => row.certificatesCount,
    },
    {
      key: 'bestScore',
      header: 'Eng yaxshi',
      className: 'text-right tabular-nums',
      cell: (row) => (row.bestScore === null ? DASH : `${row.bestScore}%`),
    },
    {
      key: 'createdAt',
      header: "Ro'yxatdan o'tgan",
      cell: (row) => formatDate(row.createdAt),
    },
    {
      key: 'isActive',
      header: 'Holat',
      cell: (row) => (
        <Badge variant={row.isActive ? 'success' : 'destructive'}>
          {row.isActive ? 'Faol' : 'Bloklangan'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-24 text-right',
      cell: (row) => (
        <div className="flex justify-end gap-1">
          <AdminDoctorDialog doctorId={row.id}>
            <Button variant="ghost" size="icon" aria-label="Batafsil">
              <Eye />
            </Button>
          </AdminDoctorDialog>

          <ConfirmDialog
            title={row.isActive ? 'Hisobni bloklash' : 'Hisobni faollashtirish'}
            description={
              row.isActive
                ? "Shifokor tizimga kira olmaydi. Natijalari va sertifikatlari saqlanib qoladi."
                : 'Shifokor yana tizimga kira oladi.'
            }
            confirmText={row.isActive ? 'Bloklash' : 'Faollashtirish'}
            onConfirm={() =>
              updateStatus.mutate({ id: row.id, isActive: !row.isActive })
            }
          >
            <Button
              variant="ghost"
              size="icon"
              aria-label={row.isActive ? 'Bloklash' : 'Faollashtirish'}
            >
              {row.isActive ? <ShieldBan /> : <ShieldCheck />}
            </Button>
          </ConfirmDialog>
        </div>
      ),
    },
  ]

  return (
    <PageShell
      title="Shifokorlar"
      description="Ro'yxatdan o'tgan shifokorlar, natijalari va hisob holati"
      search={table.search}
      onSearchChange={table.setSearch}
      searchPlaceholder="Ism yoki email bo'yicha qidirish..."
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
              clearLabel="Barcha mutaxassisliklar"
            />
          </div>
          <div className="w-40">
            <Select
              value={status ?? ALL}
              onValueChange={(value) => {
                setStatus(value === ALL ? null : (value as DoctorAccountStatus))
                table.resetPage()
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Barcha holatlar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Barcha holatlar</SelectItem>
                <SelectItem value="active">Faol</SelectItem>
                <SelectItem value="blocked">Bloklangan</SelectItem>
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
        emptyTitle="Shifokor topilmadi"
        emptyDescription="Qidiruv yoki filtrlarni o'zgartirib ko'ring."
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
