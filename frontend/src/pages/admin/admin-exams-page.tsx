import { useMemo, useState } from 'react'
import { FileQuestion, Pencil, Plus, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'

import { ExamDialog, useAdminExams, type AdminExam } from '@/features/exams'
import { SpecialtySelect } from '@/features/specialties'
import type { ApiError } from '@/shared/api'
import { buildRoute } from '@/shared/config'
import { useDebounce } from '@/shared/hooks'
import { AsyncState } from '@/shared/ui/async-state'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { DataTable, type Column } from '@/shared/ui/data-table'
import { PageShell } from '@/shared/ui/page-shell'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

const columns: Column<AdminExam>[] = [
  {
    key: 'title',
    header: 'Imtihon',
    cell: (row) => (
      <div className="max-w-sm space-y-1">
        <p className="font-medium">{row.title}</p>
        <p className="text-xs text-muted-foreground">{row.specialty.name}</p>
      </div>
    ),
  },
  {
    key: 'config',
    header: 'Sozlama',
    cell: (row) => (
      <div className="space-y-1 text-sm">
        <p className="tabular-nums">
          {row.questionCount} savol · {row.timeLimitMinutes} daqiqa
        </p>
        <p className="text-xs text-muted-foreground tabular-nums">
          O'tish bali: {row.passingScore}%
        </p>
      </div>
    ),
  },
  {
    key: 'availableQuestions',
    header: 'Savollar',
    className: 'text-right',
    cell: (row) =>
      row.availableQuestions < row.questionCount ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center gap-1 text-destructive tabular-nums">
              <TriangleAlert className="size-3.5" />
              {row.availableQuestions}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            Savollar yetarli emas — imtihon boshlanmaydi
          </TooltipContent>
        </Tooltip>
      ) : (
        <span className="tabular-nums">{row.availableQuestions}</span>
      ),
  },
  {
    key: 'attemptsCount',
    header: 'Urinishlar',
    className: 'text-right tabular-nums',
    cell: (row) => row.attemptsCount,
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
        <Button asChild variant="ghost" size="icon" aria-label="Savollar">
          <Link to={buildRoute.examQuestions(row.id)}>
            <FileQuestion />
          </Link>
        </Button>

        <ExamDialog exam={row}>
          <Button variant="ghost" size="icon" aria-label="Tahrirlash">
            <Pencil />
          </Button>
        </ExamDialog>
      </div>
    ),
  },
]

export function AdminExamsPage() {
  const [specialtyId, setSpecialtyId] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 400)

  const params = useMemo(
    () => ({
      ...(specialtyId ? { specialtyId } : {}),
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    }),
    [specialtyId, debouncedSearch],
  )

  const { data, isLoading, isError, error } = useAdminExams(params)

  return (
    <PageShell
      title="Imtihonlar"
      description="Har bir imtihon savollar soni, vaqt chegarasi va o'tish balini belgilaydi"
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="Imtihon nomi bo'yicha qidirish..."
      filters={
        <div className="w-56">
          <SpecialtySelect
            clearable
            value={specialtyId}
            onChange={setSpecialtyId}
            placeholder="Barcha mutaxassisliklar"
            clearLabel="Barcha mutaxassisliklar"
          />
        </div>
      }
      action={
        <ExamDialog>
          <Button>
            <Plus />
            Imtihon qo'shish
          </Button>
        </ExamDialog>
      }
    >
      <AsyncState
        isLoading={isLoading}
        isError={isError}
        errorMessage={(error as ApiError | null)?.message}
        isEmpty={data?.length === 0}
        emptyTitle="Imtihon topilmadi"
        emptyDescription={
          debouncedSearch
            ? `"${debouncedSearch}" bo'yicha imtihon topilmadi.`
            : 'Tanlangan mutaxassislik uchun imtihon sozlamasi yaratilmagan.'
        }
        loadingFallback={
          <DataTable data={[]} columns={columns} rowKey={(row) => row.id} isLoading />
        }
      >
        <DataTable data={data ?? []} columns={columns} rowKey={(row) => row.id} />
      </AsyncState>
    </PageShell>
  )
}
