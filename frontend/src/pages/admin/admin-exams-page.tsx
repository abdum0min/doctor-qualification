import { useState } from 'react'
import { Pencil, Plus, TriangleAlert } from 'lucide-react'

import { ExamDialog, useAdminExams, type AdminExam } from '@/features/exams'
import { DIFFICULTY_LABELS } from '@/features/questions'
import { SpecialtySelect } from '@/features/specialties'
import type { ApiError } from '@/shared/api'
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
    key: 'difficulty',
    header: 'Daraja',
    cell: (row) =>
      row.difficulty ? (
        <Badge variant="info">{DIFFICULTY_LABELS[row.difficulty]}</Badge>
      ) : (
        <span className="text-muted-foreground">Aralash</span>
      ),
  },
  {
    key: 'availableQuestions',
    header: 'Mavjud savollar',
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
      <ExamDialog exam={row}>
        <Button variant="ghost" size="icon" aria-label="Tahrirlash">
          <Pencil />
        </Button>
      </ExamDialog>
    ),
  },
]

export function AdminExamsPage() {
  const [specialtyId, setSpecialtyId] = useState<number | null>(null)
  const { data, isLoading, isError, error } = useAdminExams(specialtyId ?? undefined)

  return (
    <PageShell
      title="Imtihonlar"
      description="Har bir imtihon savollar soni, vaqt chegarasi va o'tish balini belgilaydi"
      filters={
        <div className="w-56">
          <SpecialtySelect
            clearable
            value={specialtyId}
            onChange={setSpecialtyId}
            placeholder="Barcha mutaxassisliklar"
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
        emptyDescription="Tanlangan mutaxassislik uchun imtihon sozlamasi yaratilmagan."
        loadingFallback={
          <DataTable data={[]} columns={columns} rowKey={(row) => row.id} isLoading />
        }
      >
        <DataTable data={data ?? []} columns={columns} rowKey={(row) => row.id} />
      </AsyncState>
    </PageShell>
  )
}
