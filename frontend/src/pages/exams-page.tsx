import { useState } from 'react'
import { Clock, FileText, Target } from 'lucide-react'

import { useStartAttempt } from '@/features/attempts'
import { useDoctorProfile } from '@/features/doctors'
import { useActiveExams, type Exam } from '@/features/exams'
import { SpecialtySelect } from '@/features/specialties'
import type { ApiError } from '@/shared/api'
import { AsyncState } from '@/shared/ui/async-state'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Spinner } from '@/shared/ui/spinner'

export function ExamsPage() {
  const { data: profile } = useDoctorProfile()
  // `undefined` — shifokor hali tanlamagan, `null` — "Barcha mutaxassisliklar".
  // Ikkisi farqlanmasa, hammasini tanlash o'z yo'nalishiga qaytib ketadi.
  const [specialtyId, setSpecialtyId] = useState<number | null | undefined>()

  // Standart holatda shifokorning o'z yo'nalishi ko'rsatiladi.
  const activeSpecialtyId =
    specialtyId === undefined ? (profile?.specialty?.id ?? null) : specialtyId
  const { data, isLoading, isError, error } = useActiveExams(
    activeSpecialtyId ?? undefined,
  )

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight">Imtihonlar</h2>
          <p className="text-sm text-muted-foreground">
            Mutaxassisligingiz bo'yicha imtihon tanlang va bilimingizni sinang.
          </p>
        </div>

        <div className="w-56">
          <SpecialtySelect
            clearable
            value={activeSpecialtyId}
            onChange={setSpecialtyId}
            placeholder="Barcha mutaxassisliklar"
            clearLabel="Barcha mutaxassisliklar"
          />
        </div>
      </div>

      <AsyncState
        isLoading={isLoading}
        isError={isError}
        errorMessage={(error as ApiError | null)?.message}
        isEmpty={data?.length === 0}
        emptyTitle="Imtihon topilmadi"
        emptyDescription="Tanlangan yo'nalish bo'yicha hozircha faol imtihon yo'q."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data?.map((exam) => <ExamCard key={exam.id} exam={exam} />)}
        </div>
      </AsyncState>
    </div>
  )
}

function ExamCard({ exam }: { exam: Exam }) {
  const start = useStartAttempt()

  const facts = [
    { icon: FileText, text: `${exam.questionCount} ta savol` },
    { icon: Clock, text: `${exam.timeLimitMinutes} daqiqa` },
    { icon: Target, text: `O'tish bali ${exam.passingScore}%` },
  ]

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-1 gap-2">
        <Badge variant="outline" className="w-fit">
          {exam.specialty.name}
        </Badge>
        <CardTitle className="text-base leading-snug">{exam.title}</CardTitle>
        {exam.description && (
          <CardDescription className="line-clamp-3">{exam.description}</CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <ul className="space-y-1.5">
          {facts.map((fact) => (
            <li
              key={fact.text}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <fact.icon className="size-4 shrink-0" />
              {fact.text}
            </li>
          ))}
        </ul>

        <Button
          className="w-full"
          disabled={start.isPending}
          onClick={() => start.mutate(exam.id)}
        >
          {start.isPending && <Spinner />}
          Imtihonni boshlash
        </Button>
      </CardContent>
    </Card>
  )
}
