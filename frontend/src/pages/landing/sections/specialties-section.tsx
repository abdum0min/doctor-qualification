import { Stethoscope } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useActiveExams } from '@/features/exams'
import { useActiveSpecialties } from '@/features/specialties'
import type { ApiError } from '@/shared/api'
import { ROUTES } from '@/shared/config'
import { AsyncState } from '@/shared/ui/async-state'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'

export function SpecialtiesSection() {
  const specialties = useActiveSpecialties()
  const exams = useActiveExams()

  const examCountBySpecialty = new Map<number, number>()
  for (const exam of exams.data ?? []) {
    examCountBySpecialty.set(
      exam.specialty.id,
      (examCountBySpecialty.get(exam.specialty.id) ?? 0) + 1,
    )
  }

  return (
    <section
      id="specialties"
      className="mx-auto max-w-6xl scroll-mt-20 px-4 py-14 sm:px-6"
    >
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">Mutaxassisliklar</h2>
          <p className="text-sm text-muted-foreground">
            Har bir yo'nalish uchun alohida savol bazasi va imtihonlar
          </p>
        </div>

        <Button asChild variant="outline">
          <Link to={ROUTES.register}>Yo'nalishni tanlash</Link>
        </Button>
      </div>

      <AsyncState
        isLoading={specialties.isLoading}
        isError={specialties.isError}
        errorMessage={(specialties.error as ApiError | null)?.message}
        isEmpty={specialties.data?.length === 0}
        emptyTitle="Mutaxassislik yo'q"
        emptyDescription="Yo'nalishlar tez orada qo'shiladi."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {specialties.data?.map((specialty) => (
            <Card key={specialty.id}>
              <CardContent className="flex gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Stethoscope className="size-5" />
                </span>

                <div className="min-w-0 space-y-1">
                  <p className="font-medium">{specialty.name}</p>
                  {specialty.description && (
                    <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {specialty.description}
                    </p>
                  )}
                  <Badge variant="secondary" className="mt-1">
                    {examCountBySpecialty.get(specialty.id) ?? 0} ta imtihon
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </AsyncState>
    </section>
  )
}
