import { useMemo, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'

import {
  DifficultyBadge,
  DifficultySelect,
  QuestionDialog,
  useDeleteQuestion,
  useQuestions,
  type Difficulty,
  type Question,
} from '@/features/questions'
import { SpecialtySelect } from '@/features/specialties'
import type { ApiError } from '@/shared/api'
import { useTableQuery } from '@/shared/hooks'
import { AsyncState } from '@/shared/ui/async-state'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'
import { DataTable, type Column } from '@/shared/ui/data-table'
import { PageShell } from '@/shared/ui/page-shell'
import { TablePagination } from '@/shared/ui/table-pagination'

export function AdminQuestionsPage() {
  const table = useTableQuery(10)
  const [specialtyId, setSpecialtyId] = useState<number | null>(null)
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null)
  const remove = useDeleteQuestion()

  const params = useMemo(
    () => ({
      ...table.params,
      ...(specialtyId ? { specialtyId } : {}),
      ...(difficulty ? { difficulty } : {}),
    }),
    [table.params, specialtyId, difficulty],
  )

  const { data, isLoading, isError, error } = useQuestions(params)

  const columns: Column<Question>[] = [
    {
      key: 'text',
      header: 'Savol',
      cell: (row) => (
        <div className="max-w-md space-y-1">
          <p className="font-medium">{row.text}</p>
          <p className="text-xs text-muted-foreground">
            {row.options.length} ta variant
          </p>
        </div>
      ),
    },
    {
      key: 'specialty',
      header: 'Mutaxassislik',
      cell: (row) => row.specialty.name,
    },
    {
      key: 'difficulty',
      header: 'Daraja',
      cell: (row) => <DifficultyBadge difficulty={row.difficulty} />,
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
      className: 'w-24 text-right',
      cell: (row) => (
        <div className="flex justify-end gap-1">
          <QuestionDialog question={row}>
            <Button variant="ghost" size="icon" aria-label="Tahrirlash">
              <Pencil />
            </Button>
          </QuestionDialog>

          <ConfirmDialog
            title="Savolni o'chirish"
            description="Savol butunlay o'chiriladi. Topshirilgan urinishlar savol matnini o'zida saqlagani uchun tarixiy natijalar o'zgarmaydi."
            onConfirm={() => remove.mutate(row.id)}
          >
            <Button variant="ghost" size="icon" aria-label="O'chirish">
              <Trash2 />
            </Button>
          </ConfirmDialog>
        </div>
      ),
    },
  ]

  return (
    <PageShell
      title="Savollar bazasi"
      description="Imtihon savollari mutaxassislik va daraja bo'yicha guruhlanadi"
      search={table.search}
      onSearchChange={table.setSearch}
      searchPlaceholder="Savol matni bo'yicha qidirish..."
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
            <DifficultySelect
              clearable
              value={difficulty}
              onChange={(value) => {
                setDifficulty(value)
                table.resetPage()
              }}
              placeholder="Barcha darajalar"
            />
          </div>
        </div>
      }
      action={
        <QuestionDialog>
          <Button>
            <Plus />
            Savol qo'shish
          </Button>
        </QuestionDialog>
      }
    >
      <AsyncState
        isLoading={isLoading}
        isError={isError}
        errorMessage={(error as ApiError | null)?.message}
        isEmpty={data?.items.length === 0}
        emptyTitle="Savol topilmadi"
        emptyDescription="Filtrlarni o'zgartiring yoki yangi savol qo'shing."
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
