import { useCallback, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useParams } from 'react-router-dom'

import {
  AttemptResultSummary,
  ExamTimer,
  QuestionCard,
  QuestionNavigator,
  useAttempt,
  useSaveAnswer,
  useSubmitAttempt,
} from '@/features/attempts'
import type { ApiError } from '@/shared/api'
import { AsyncState } from '@/shared/ui/async-state'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'
import { Progress } from '@/shared/ui/progress'
import { Spinner } from '@/shared/ui/spinner'

export function AttemptPage() {
  const { attemptId } = useParams()
  const id = Number(attemptId)
  const [index, setIndex] = useState(0)

  const { data: attempt, isLoading, isError, error } = useAttempt(id)
  const saveAnswer = useSaveAnswer()
  const submit = useSubmitAttempt()

  const isFinished = attempt ? attempt.status !== 'IN_PROGRESS' : false

  // Vaqt tugaganda server allaqachon urinishni yopadi — mijoz shunchaki
  // yakuniy holatni so'raydi.
  const handleExpire = useCallback(() => {
    if (!submit.isPending && attempt?.status === 'IN_PROGRESS') {
      submit.mutate(id)
    }
  }, [attempt?.status, id, submit])

  return (
    <AsyncState
      isLoading={isLoading}
      isError={isError}
      errorMessage={(error as ApiError | null)?.message}
    >
      {attempt && (isFinished ? (
        <AttemptResultSummary attempt={attempt} />
      ) : (
        <div className="mx-auto max-w-3xl space-y-4">
          <Card>
            <CardHeader className="gap-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <CardTitle className="text-base">{attempt.exam.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {attempt.exam.specialty.name}
                  </p>
                </div>
                <ExamTimer deadlineAt={attempt.deadlineAt} onExpire={handleExpire} />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
                  <span>
                    {attempt.answeredCount} / {attempt.questionCount} javob berildi
                  </span>
                  <span>O'tish bali: {attempt.passingScore}%</span>
                </div>
                <Progress
                  value={(attempt.answeredCount / attempt.questionCount) * 100}
                />
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <QuestionCard
                question={attempt.questions[index]}
                index={index}
                total={attempt.questions.length}
                disabled={saveAnswer.isPending || submit.isPending}
                onSelect={(optionId) =>
                  saveAnswer.mutate({
                    attemptId: id,
                    attemptQuestionId: attempt.questions[index].id,
                    attemptOptionId: optionId,
                  })
                }
              />

              <div className="flex items-center justify-between gap-2 border-t border-border pt-4">
                <Button
                  variant="outline"
                  disabled={index === 0}
                  onClick={() => setIndex((value) => value - 1)}
                >
                  <ChevronLeft />
                  Oldingi
                </Button>

                {index < attempt.questions.length - 1 ? (
                  <Button onClick={() => setIndex((value) => value + 1)}>
                    Keyingi
                    <ChevronRight />
                  </Button>
                ) : (
                  <SubmitDialog
                    answered={attempt.answeredCount}
                    total={attempt.questionCount}
                    isPending={submit.isPending}
                    onConfirm={() => submit.mutate(id)}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <QuestionNavigator
                questions={attempt.questions}
                currentIndex={index}
                onSelect={setIndex}
              />
            </CardContent>
          </Card>
        </div>
      ))}
    </AsyncState>
  )
}

interface SubmitDialogProps {
  answered: number
  total: number
  isPending: boolean
  onConfirm: () => void
}

function SubmitDialog({ answered, total, isPending, onConfirm }: SubmitDialogProps) {
  const unanswered = total - answered

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button disabled={isPending}>
          {isPending && <Spinner />}
          Yakunlash
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Imtihonni yakunlashni tasdiqlang</DialogTitle>
          <DialogDescription>
            {unanswered > 0
              ? `${unanswered} ta savol javobsiz qoladi va noto'g'ri deb hisoblanadi.`
              : 'Barcha savollarga javob berdingiz.'}{' '}
            Yakunlangandan so'ng javoblarni o'zgartirib bo'lmaydi.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button onClick={onConfirm} disabled={isPending}>
            {isPending && <Spinner />}
            Yakunlash
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
