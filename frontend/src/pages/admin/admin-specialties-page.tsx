import { useState } from 'react'
import { Pencil, Plus } from 'lucide-react'

import {
  SpecialtyDialog,
  useAdminSpecialties,
  type AdminSpecialty,
} from '@/features/specialties'
import type { ApiError } from '@/shared/api'
import { useDebounce } from '@/shared/hooks'
import { AsyncState } from '@/shared/ui/async-state'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { DataTable, type Column } from '@/shared/ui/data-table'
import { PageShell } from '@/shared/ui/page-shell'

const columns: Column<AdminSpecialty>[] = [
  {
    key: 'name',
    header: 'Nomi',
    cell: (row) => <span className="font-medium">{row.name}</span>,
  },
  {
    key: 'description',
    header: 'Tavsif',
    cell: (row) => (
      <span className="text-muted-foreground">{row.description ?? '—'}</span>
    ),
  },
  {
    key: 'doctorsCount',
    header: 'Shifokorlar',
    className: 'text-right tabular-nums',
    cell: (row) => row.doctorsCount,
  },
  {
    key: 'isActive',
    header: 'Holat',
    cell: (row) => (
      <Badge variant={row.isActive ? 'success' : 'secondary'}>
        {row.isActive ? 'Faol' : 'Nofaol'}
      </Badge>
    ),
  },
  {
    key: 'actions',
    header: '',
    className: 'w-12 text-right',
    cell: (row) => (
      <SpecialtyDialog specialty={row}>
        <Button variant="ghost" size="icon" aria-label="Tahrirlash">
          <Pencil />
        </Button>
      </SpecialtyDialog>
    ),
  },
]

export function AdminSpecialtiesPage() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 400)
  const { data, isLoading, isError, error } = useAdminSpecialties(debouncedSearch)

  return (
    <PageShell
      title="Mutaxassisliklar"
      description="Savol bazasi va imtihonlar shu yo'nalishlar bo'yicha ajratiladi"
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="Mutaxassislik qidirish..."
      action={
        <SpecialtyDialog>
          <Button>
            <Plus />
            Qo'shish
          </Button>
        </SpecialtyDialog>
      }
    >
      <AsyncState
        isLoading={isLoading}
        isError={isError}
        errorMessage={(error as ApiError | null)?.message}
        isEmpty={data?.length === 0}
        emptyTitle="Mutaxassislik topilmadi"
        emptyDescription="Qidiruvni o'zgartiring yoki yangi mutaxassislik qo'shing."
        loadingFallback={
          <DataTable data={[]} columns={columns} rowKey={(row) => row.id} isLoading />
        }
      >
        <DataTable data={data ?? []} columns={columns} rowKey={(row) => row.id} />
      </AsyncState>
    </PageShell>
  )
}
