import { cn } from '@/shared/lib/utils'
import type { AttemptQuestion } from '../model/types'

interface QuestionNavigatorProps {
  questions: AttemptQuestion[]
  currentIndex: number
  onSelect: (index: number) => void
}

export function QuestionNavigator({
  questions,
  currentIndex,
  onSelect,
}: QuestionNavigatorProps) {
  return (
    <nav aria-label="Savollar ro'yxati" className="flex flex-wrap gap-2">
      {questions.map((question, index) => {
        const isCurrent = index === currentIndex
        const isAnswered = question.selectedOptionId !== null

        return (
          <button
            key={question.id}
            type="button"
            onClick={() => onSelect(index)}
            aria-current={isCurrent ? 'step' : undefined}
            aria-label={`${index + 1}-savol${isAnswered ? ', javob berilgan' : ''}`}
            className={cn(
              'size-9 rounded-lg border text-sm font-medium tabular-nums transition-colors',
              'hover:border-primary/60',
              isAnswered
                ? 'border-primary/30 bg-primary/10 text-primary'
                : 'border-border text-muted-foreground',
              isCurrent && 'border-primary bg-primary text-primary-foreground',
            )}
          >
            {index + 1}
          </button>
        )
      })}
    </nav>
  )
}
