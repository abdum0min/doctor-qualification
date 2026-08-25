import { CircleCheck, CircleX, Clock, Link as LinkIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

import { ROUTES } from '@/shared/config'
import { formatDate } from '@/shared/lib/format'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { QualificationBadge } from './qualification-badge'
import type { Attempt } from '../model/types'

export function AttemptResultSummary({ attempt }: { attempt: Attempt }) {
  const expired = attempt.status === 'EXPIRED'
  const passed = attempt.passed === true

  const stats = [
    { label: 'Natija', value: `${attempt.score ?? 0}%` },
    {
      label: "To'g'ri javoblar",
      value: `${attempt.correctCount ?? 0} / ${attempt.questionCount}`,
    },
    {
      label: 'Noto`g`ri javoblar',
      value: `${attempt.questionCount - (attempt.correctCount ?? 0)}`,
    },
    { label: "O'tish bali", value: `${attempt.passingScore}%` },
  ]

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Card>
        <CardHeader className="items-center gap-3 text-center">
          {passed ? (
            <CircleCheck className="size-12 text-success" />
          ) : (
            <CircleX className="size-12 text-muted-foreground" />
          )}
          <CardTitle className="text-xl">
            {passed ? "Imtihon muvaffaqiyatli yakunlandi" : 'Imtihon yakunlandi'}
          </CardTitle>
          <CardDescription>
            {attempt.exam.title} · {attempt.exam.specialty.name}
          </CardDescription>
          {attempt.qualification && (
            <QualificationBadge qualification={attempt.qualification} />
          )}
        </CardHeader>

        <CardContent className="space-y-5">
          {expired && (
            <Alert variant="destructive">
              <Clock />
              <AlertTitle>Vaqt tugadi</AlertTitle>
              <AlertDescription>
                Urinish belgilangan vaqt ichida yakunlanmagani uchun sertifikat
                berilmaydi. Natija tarixda saqlanib qoladi.
              </AlertDescription>
            </Alert>
          )}

          <dl className="grid grid-cols-2 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border border-border p-3 text-center"
              >
                <dt className="text-xs text-muted-foreground">{stat.label}</dt>
                <dd className="mt-1 text-lg font-semibold tabular-nums">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>

          <p className="text-center text-xs text-muted-foreground">
            Topshirilgan sana: {formatDate(attempt.completedAt)}
          </p>

          <div className="flex flex-wrap justify-center gap-2">
            <Button asChild variant="outline">
              <Link to={ROUTES.exams}>
                <LinkIcon />
                Imtihonlar
              </Link>
            </Button>
            <Button asChild>
              <Link to={ROUTES.dashboard}>Boshqaruv paneliga</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
