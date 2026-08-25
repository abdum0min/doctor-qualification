import { DifficultyBadge } from '@/features/questions'
import { cn } from '@/shared/lib/utils'
import { Label } from '@/shared/ui/label'
import { RadioGroup, RadioGroupItem } from '@/shared/ui/radio-group'
import type { AttemptQuestion } from '../model/types'

interface QuestionCardProps {
  question: AttemptQuestion
  index: number
  total: number
  disabled?: boolean
  onSelect: (optionId: number) => void
}

export function QuestionCard({
  question,
  index,
  total,
  disabled,
  onSelect,
}: QuestionCardProps) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground tabular-nums">
            {index + 1} / {total}
          </span>
          <DifficultyBadge difficulty={question.difficulty} />
        </div>
        <h3 className="text-base leading-relaxed font-medium text-balance">
          {question.questionText}
        </h3>
      </div>

      <RadioGroup
        value={question.selectedOptionId ? String(question.selectedOptionId) : ''}
        onValueChange={(value) => onSelect(Number(value))}
        disabled={disabled}
        className="space-y-2"
      >
        {question.options.map((option) => {
          const isSelected = question.selectedOptionId === option.id
          const inputId = `option-${option.id}`

          return (
            <Label
              key={option.id}
              htmlFor={inputId}
              className={cn(
                'flex cursor-pointer items-start gap-3 rounded-lg border p-3 font-normal transition-colors',
                'hover:bg-muted/60',
                isSelected ? 'border-primary bg-primary/5' : 'border-border',
                disabled && 'cursor-not-allowed opacity-70',
              )}
            >
              <RadioGroupItem
                id={inputId}
                value={String(option.id)}
                className="mt-0.5"
              />
              <span className="text-sm leading-relaxed">{option.text}</span>
            </Label>
          )
        })}
      </RadioGroup>
    </div>
  )
}
