import { useMemo, useState } from 'react'
import { ClipboardCheck, Target, TrendingUp, Trophy } from 'lucide-react'

import {
  AttemptHistoryTable,
  type AttemptStatus,
} from '@/features/attempts'
import { useDoctorOverview } from '@/features/doctors'
import { useActiveExams } from '@/features/exams'
import type { ApiError } from '@/shared/api'
import { AsyncState } from '@/shared/ui/async-state'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { StatCard } from '@/shared/ui/stat-card'

const ALL = 'all'
const DASH = '—'

const STATUS_OPTIONS: { value: AttemptStatus; label: string }[] = [
  { value: 'SUBMITTED', label: 'Yakunlangan' },
  { value: 'IN_PROGRESS', label: 'Davom etmoqda' },
  { value: 'EXPIRED', label: 'Vaqti tugagan' },
]

export function ResultsPage() {
  const { data, isLoading, isError, error } = useDoctorOverview()
  const { data: exams } = useActiveExams()

  const [examId, setExamId] = useState<number | null>(null)
  const [status, setStatus] = useState<AttemptStatus | null>(null)

  const stats = data?.stats

  const filters = useMemo(
    () => ({
      ...(examId ? { examId } : {}),
      ...(status ? { status } : {}),
    }),
    [examId, status],
  )

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">Natijalarim</h2>
        <p className="text-sm text-muted-foreground">
          Barcha imtihon urinishlaringiz va ular bo'yicha ko'rsatkichlar
        </p>
      </div>

      <AsyncState
        isLoading={isLoading}
        isError={isError}
        errorMessage={(error as ApiError | null)?.message}
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={ClipboardCheck}
            tone="blue"
            label="Jami urinishlar"
            value={stats?.totalAttempts ?? 0}
            hint={`${stats?.completedAttempts ?? 0} tasi yakunlangan`}
          />
          <StatCard
            icon={Target}
            tone="emerald"
            label="Muvaffaqiyatli"
            value={stats?.passedAttempts ?? 0}
            hint="O'tish balidan yuqori natijalar"
          />
          <StatCard
            icon={Trophy}
            tone="violet"
            label="Eng yuqori natija"
            value={
              stats?.bestScore === null || stats?.bestScore === undefined
                ? DASH
                : `${stats.bestScore}%`
            }
            hint="Barcha urinishlar bo'yicha"
          />
          <StatCard
            icon={TrendingUp}
            tone="amber"
            label="O'rtacha natija"
            value={
              stats?.averageScore === null || stats?.averageScore === undefined
                ? DASH
                : `${stats.averageScore}%`
            }
            hint="Yakunlangan urinishlar bo'yicha"
          />
        </div>
      </AsyncState>

      <Card>
        <CardHeader className="gap-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="text-base">Urinishlar tarixi</CardTitle>
              <CardDescription>
                Har bir urinishni ochib javoblar tahlilini ko'rishingiz mumkin
              </CardDescription>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="w-56">
                <Select
                  value={examId ? String(examId) : ALL}
                  onValueChange={(value) =>
                    setExamId(value === ALL ? null : Number(value))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Barcha imtihonlar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>Barcha imtihonlar</SelectItem>
                    {exams?.map((exam) => (
                      <SelectItem key={exam.id} value={String(exam.id)}>
                        {exam.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-44">
                <Select
                  value={status ?? ALL}
                  onValueChange={(value) =>
                    setStatus(value === ALL ? null : (value as AttemptStatus))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Barcha holatlar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>Barcha holatlar</SelectItem>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* `key` — filtr o'zgarganda sahifalash 1-sahifadan boshlanadi. */}
          <AttemptHistoryTable
            key={`${examId ?? 0}-${status ?? 'all'}`}
            limit={10}
            filters={filters}
          />
        </CardContent>
      </Card>
    </div>
  )
}
