import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import type { ApiError } from '@/shared/api'
import { buildRoute } from '@/shared/config'
import { queryClient } from '@/shared/lib/query-client'
import { attemptsApi, type SaveAnswerInput } from './attempts-api'
import type { Attempt } from '../model/types'

export const attemptKeys = {
  all: ['attempts'] as const,
  detail: (id: number) => [...attemptKeys.all, 'detail', id] as const,
}

export function useAttempt(id: number) {
  return useQuery({
    queryKey: attemptKeys.detail(id),
    queryFn: () => attemptsApi.byId(id),
    enabled: Number.isFinite(id) && id > 0,
    // Imtihon holati faqat shu mijoz orqali o'zgaradi — ortiqcha so'rov shart emas.
    staleTime: Infinity,
  })
}

export function useStartAttempt() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (examId: number) => attemptsApi.start(examId),
    onSuccess: (attempt) => {
      queryClient.setQueryData(attemptKeys.detail(attempt.id), attempt)
      navigate(buildRoute.attempt(attempt.id))
    },
    onError: (error: ApiError) => toast.error(error.message),
  })
}

export function useSaveAnswer() {
  return useMutation({
    mutationFn: (input: SaveAnswerInput) => attemptsApi.saveAnswer(input),
    onSuccess: (question, input) => {
      queryClient.setQueryData<Attempt>(
        attemptKeys.detail(input.attemptId),
        (attempt) =>
          attempt && {
            ...attempt,
            questions: attempt.questions.map((item) =>
              item.id === question.id ? { ...item, ...question } : item,
            ),
            answeredCount: attempt.questions.filter((item) =>
              item.id === question.id
                ? question.selectedOptionId !== null
                : item.selectedOptionId !== null,
            ).length,
          },
      )
    },
    onError: (error: ApiError) => toast.error(error.message),
  })
}

export function useSubmitAttempt() {
  return useMutation({
    mutationFn: (attemptId: number) => attemptsApi.submit(attemptId),
    onSuccess: (attempt) => {
      queryClient.setQueryData(attemptKeys.detail(attempt.id), attempt)
      void queryClient.invalidateQueries({ queryKey: attemptKeys.all })
    },
    onError: (error: ApiError) => toast.error(error.message),
  })
}
