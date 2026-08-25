import { useEffect, useState, type ReactNode } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Trash2 } from 'lucide-react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'

import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'
import { FormField } from '@/shared/ui/form-field'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { RadioGroup, RadioGroupItem } from '@/shared/ui/radio-group'
import { Spinner } from '@/shared/ui/spinner'
import { Switch } from '@/shared/ui/switch'
import { Textarea } from '@/shared/ui/textarea'
import { useCreateQuestion, useUpdateQuestion } from '../api/questions-queries'
import {
  MAX_OPTIONS,
  MIN_OPTIONS,
  questionSchema,
  toQuestionPayload,
  type QuestionValues,
} from '../model/schemas'
import type { Question } from '../model/types'
import { DifficultySelect } from './difficulty-select'

const EMPTY_VALUES: QuestionValues = {
  text: '',
  difficulty: 'BEGINNER',
  isActive: true,
  correctIndex: 0,
  options: [{ text: '' }, { text: '' }],
}

function toFormValues(question: Question): QuestionValues {
  return {
    text: question.text,
    difficulty: question.difficulty,
    isActive: question.isActive,
    correctIndex: Math.max(
      question.options.findIndex((option) => option.isCorrect),
      0,
    ),
    options: question.options.map((option) => ({ text: option.text })),
  }
}

interface QuestionDialogProps {
  examId: number
  question?: Question
  children: ReactNode
}

export function QuestionDialog({ examId, question, children }: QuestionDialogProps) {
  const [open, setOpen] = useState(false)
  const create = useCreateQuestion(examId)
  const update = useUpdateQuestion(examId)
  const isPending = create.isPending || update.isPending

  const {
    register,
    control,
    handleSubmit,
    reset,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<QuestionValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: EMPTY_VALUES,
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'options' })

  useEffect(() => {
    if (!open) return

    reset(question ? toFormValues(question) : EMPTY_VALUES)
  }, [open, question, reset])

  const removeOption = (index: number) => {
    const correctIndex = getValues('correctIndex')

    remove(index)

    // To'g'ri javob o'chirilsa yoki undan yuqoridagi variant ketsa, indeks suriladi.
    if (index === correctIndex) {
      setValue('correctIndex', 0)
    } else if (index < correctIndex) {
      setValue('correctIndex', correctIndex - 1)
    }
  }

  const onSubmit = handleSubmit(async (values) => {
    const payload = toQuestionPayload(values)

    if (question) {
      await update.mutateAsync({ id: question.id, ...payload })
    } else {
      await create.mutateAsync(payload)
    }

    setOpen(false)
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{question ? 'Savolni tahrirlash' : 'Yangi savol'}</DialogTitle>
          <DialogDescription>
            Aynan bitta variant to'g'ri javob sifatida belgilanishi kerak.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-5">
          <FormField id="text" label="Savol matni" error={errors.text?.message} required>
            <Textarea
              id="text"
              rows={3}
              placeholder="Miokard infarktining asosiy belgisi qaysi?"
              aria-invalid={Boolean(errors.text)}
              {...register('text')}
            />
          </FormField>

          <FormField
            id="difficulty"
            label="Daraja"
            error={errors.difficulty?.message}
            required
          >
            <Controller
              control={control}
              name="difficulty"
              render={({ field }) => (
                <DifficultySelect
                  id="difficulty"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </FormField>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Javob variantlari</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={fields.length >= MAX_OPTIONS}
                onClick={() => append({ text: '' })}
              >
                Variant qo'shish
              </Button>
            </div>

            <Controller
              control={control}
              name="correctIndex"
              render={({ field }) => (
                <RadioGroup
                  value={String(field.value)}
                  onValueChange={(value) => field.onChange(Number(value))}
                  className="space-y-2"
                >
                  {fields.map((item, index) => (
                    <div key={item.id} className="flex items-start gap-2">
                      <RadioGroupItem
                        value={String(index)}
                        id={`correct-${index}`}
                        className="mt-2.5"
                        aria-label={`${index + 1}-variant to'g'ri javob`}
                      />
                      <div className="flex-1 space-y-1">
                        <Input
                          placeholder={`${index + 1}-variant`}
                          aria-invalid={Boolean(errors.options?.[index]?.text)}
                          {...register(`options.${index}.text`)}
                        />
                        {errors.options?.[index]?.text && (
                          <p className="text-xs text-destructive">
                            {errors.options[index]?.text?.message}
                          </p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={fields.length <= MIN_OPTIONS}
                        onClick={() => removeOption(index)}
                        aria-label={`${index + 1}-variantni o'chirish`}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  ))}
                </RadioGroup>
              )}
            />

            {errors.options?.message && (
              <p className="text-xs text-destructive">{errors.options.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Radio tugma bilan to'g'ri javobni belgilang. Bu ma'lumot shifokorga
              hech qachon yuborilmaydi.
            </p>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="isActive">Faol</Label>
              <p className="text-xs text-muted-foreground">
                Nofaol savol imtihonga tanlanmaydi.
              </p>
            </div>
            <Controller
              control={control}
              name="isActive"
              render={({ field }) => (
                <Switch
                  id="isActive"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending && <Spinner />}
              {question ? 'Saqlash' : "Qo'shish"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
