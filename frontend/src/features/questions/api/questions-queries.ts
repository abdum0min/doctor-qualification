import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

import { examKeys } from '@/features/exams'
import type { ApiError } from '@/shared/api'
import { queryClient } from '@/shared/lib/query-client'
import { questionsApi, type QuestionListParams } from './questions-api'
import type { QuestionPayload } from '../model/schemas'

export const questionKeys = {
  all: ['questions'] as const,
  list: (examId: number, params: QuestionListParams) =>
    [...questionKeys.all, examId, params] as const,
}

export function useQuestions(examId: number, params: QuestionListParams) {
  return useQuery({
    queryKey: questionKeys.list(examId, params),
    queryFn: () => questionsApi.list(examId, params),
    enabled: Number.isFinite(examId) && examId > 0,
  })
}

/** Savollar soni imtihon kartasida ko'rinadi — u ham yangilanishi kerak. */
function invalidateQuestions() {
  void queryClient.invalidateQueries({ queryKey: questionKeys.all })
  void queryClient.invalidateQueries({ queryKey: examKeys.all })
}

export function useCreateQuestion(examId: number) {
  return useMutation({
    mutationFn: (body: QuestionPayload) => questionsApi.create(examId, body),
    onSuccess: () => {
      invalidateQuestions()
      toast.success("Savol qo'shildi")
    },
    onError: (error: ApiError) => toast.error(error.message),
  })
}

export function useUpdateQuestion(examId: number) {
  return useMutation({
    mutationFn: ({ id, ...body }: QuestionPayload & { id: number }) =>
      questionsApi.update(examId, id, body),
    onSuccess: () => {
      invalidateQuestions()
      toast.success('Savol yangilandi')
    },
    onError: (error: ApiError) => toast.error(error.message),
  })
}

export function useDeleteQuestion(examId: number) {
  return useMutation({
    mutationFn: (id: number) => questionsApi.remove(examId, id),
    onSuccess: () => {
      invalidateQuestions()
      toast.success("Savol o'chirildi")
    },
    onError: (error: ApiError) => toast.error(error.message),
  })
}
