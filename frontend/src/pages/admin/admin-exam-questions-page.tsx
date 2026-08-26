import { useMemo, useState } from 'react'
import { ArrowLeft, Pencil, Plus, TriangleAlert, Trash2, Upload } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { useAdminExam } from '@/features/exams'
import {
  DifficultyBadge,
  DifficultySelect,
  QuestionDialog,
  QuestionImportDialog,
  useDeleteQuestion,
  useQuestions,
  type Difficulty,
  type Question,
} from '@/features/questions'
import type { ApiError } from '@/shared/api'
import { ROUTES } from '@/shared/config'
import { useTableQuery } from '@/shared/hooks'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { AsyncState } from '@/shared/ui/async-state'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'
import { DataTable, type Column } from '@/shared/ui/data-table'
import { PageShell } from '@/shared/ui/page-shell'
import { TablePagination } from '@/shared/ui/table-pagination'

export function AdminExamQuestionsPage() {
  const { examId } = useParams()
  const id = Number(examId)

  const table = useTableQuery(10)
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null)
  const exam = useAdminExam(id)
  const remove = useDeleteQuestion(id)

  const params = useMemo(
    () => ({ ...table.params, ...(difficulty ? { difficulty } : {}) }),
    [table.params, difficulty],
  )

  const { data, isLoading, isError, error } = useQuestions(id, params)

  const columns: Column<Question>[] = [
    {
      key: 'position',
      header: '#',
      className: 'w-10 text-muted-foreground tabular-nums',
      cell: (row) => row.position + 1,
    },
    {
      key: 'text',
      header: 'Savol',
      cell: (row) => (
        <div className="max-w-md space-y-1">
          <p className="font-medium">{row.text}</p>
          <p className="text-xs text-muted-foreground">
            {row.options.length} ta variant · to'g'ri javob:{' '}
            {row.options.find((option) => option.isCorrect)?.text ?? '—'}
          </p>
        </div>
      ),
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
          <QuestionDialog examId={id} question={row}>
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

  const shortage =
    exam.data && exam.data.availableQuestions < exam.data.questionCount
      ? exam.data.questionCount - exam.data.availableQuestions
      : 0

  return (
    <div className="space-y-4">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to={ROUTES.adminExams}>
          <ArrowLeft />
          Imtihonlarga qaytish
        </Link>
      </Button>

      {shortage > 0 && (
        <Alert variant="destructive">
          <TriangleAlert />
          <AlertTitle>Savollar yetarli emas</AlertTitle>
          <AlertDescription>
            Imtihon bitta urinishda {exam.data?.questionCount} ta savol so'raydi,
            hozir esa {exam.data?.availableQuestions} ta faol savol bor. Yana{' '}
            {shortage} ta savol qo'shing yoki savollar sonini kamaytiring.
          </AlertDescription>
        </Alert>
      )}

      <PageShell
        title={exam.data ? exam.data.title : 'Imtihon savollari'}
        description={
          exam.data
            ? `${exam.data.specialty.name} · har urinishda ${exam.data.questionCount} ta savol tasodifiy tanlanadi`
            : undefined
        }
        search={table.search}
        onSearchChange={table.setSearch}
        searchPlaceholder="Savol matni bo'yicha qidirish..."
        filters={
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
        }
        action={
          <div className="flex flex-wrap gap-2">
            <QuestionImportDialog examId={id}>
              <Button variant="outline">
                <Upload />
                Fayldan import
              </Button>
            </QuestionImportDialog>

            <QuestionDialog examId={id}>
              <Button>
                <Plus />
                Savol qo'shish
              </Button>
            </QuestionDialog>
          </div>
        }
      >
        <AsyncState
          isLoading={isLoading}
          isError={isError}
          errorMessage={(error as ApiError | null)?.message}
          isEmpty={data?.items.length === 0}
          emptyTitle="Savol yo'q"
          emptyDescription="Bu imtihonga hali savol biriktirilmagan — birinchisini qo'shing."
          loadingFallback={
            <DataTable data={[]} columns={columns} rowKey={(row) => row.id} isLoading />
          }
        >
          <DataTable
            data={data?.items ?? []}
            columns={columns}
            rowKey={(row) => row.id}
          />
        </AsyncState>

        {data && <TablePagination meta={data.meta} onPageChange={table.setPage} />}
      </PageShell>
    </div>
  )
}
