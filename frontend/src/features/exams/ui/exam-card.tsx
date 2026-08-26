import { Clock, FileText, Target } from 'lucide-react'

import { useStartAttempt } from '@/features/attempts'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import { Spinner } from '@/shared/ui/spinner'
import type { Exam } from '../model/types'

/** Imtihonlar sahifasida ham, boshqaruv panelida ham ishlatiladi. */
export function ExamCard({ exam }: { exam: Exam }) {
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
