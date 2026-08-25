import { Check, X } from 'lucide-react'

import { cn } from '@/shared/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import type { Attempt, AttemptOption, AttemptQuestion } from '../model/types'

/** Yakunlangan urinishda har bir savol bo'yicha xatolarni ko'rsatadi. */
export function AttemptReview({ attempt }: { attempt: Attempt }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Javoblar tahlili</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {attempt.questions.map((question, index) => (
          <ReviewQuestion key={question.id} question={question} index={index} />
        ))}
      </CardContent>
    </Card>
  )
}

function ReviewQuestion({
  question,
  index,
}: {
  question: AttemptQuestion
  index: number
}) {
  const isCorrect = question.isCorrect === true

  return (
    <div className="space-y-3 border-b border-border pb-5 last:border-0 last:pb-0">
      <div className="flex items-start gap-2">
        <span
          className={cn(
            'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full',
            isCorrect ? 'bg-success/15 text-success-foreground' : 'bg-destructive/15 text-destructive',
          )}
          aria-label={isCorrect ? "To'g'ri" : "Noto'g'ri"}
        >
          {isCorrect ? <Check className="size-3" /> : <X className="size-3" />}
        </span>
        <p className="text-sm leading-relaxed font-medium">
          <span className="text-muted-foreground tabular-nums">{index + 1}. </span>
          {question.questionText}
        </p>
      </div>

      <ul className="space-y-1.5 pl-7">
        {question.options.map((option) => (
          <ReviewOption
            key={option.id}
            option={option}
            isSelected={question.selectedOptionId === option.id}
          />
        ))}
      </ul>

      {question.selectedOptionId === null && (
        <p className="pl-7 text-xs text-muted-foreground">Javob berilmagan</p>
      )}
    </div>
  )
}

function ReviewOption({
  option,
  isSelected,
}: {
  option: AttemptOption
  isSelected: boolean
}) {
  const isCorrect = option.isCorrect === true

  return (
    <li
      className={cn(
        'flex items-start gap-2 rounded-md px-2 py-1.5 text-sm',
        isCorrect && 'bg-success/10',
        isSelected && !isCorrect && 'bg-destructive/10',
      )}
    >
      <span className="flex-1 leading-relaxed">{option.text}</span>

      {isCorrect && (
        <span className="shrink-0 text-xs font-medium text-success-foreground">
          To'g'ri javob
        </span>
      )}
      {isSelected && !isCorrect && (
        <span className="shrink-0 text-xs font-medium text-destructive">
          Sizning javobingiz
        </span>
      )}
    </li>
  )
}
