import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

import type { ApiError } from '@/shared/api'
import { queryClient } from '@/shared/lib/query-client'
import { specialtyKeys } from '@/features/specialties'
import type { QuestionPayload } from '../model/schemas'
import { questionsApi, type QuestionListParams } from './questions-api'

export const questionKeys = {
  all: ['questions'] as const,
  list: (params: QuestionListParams) => [...questionKeys.all, 'list', params] as const,
}

export function useQuestions(params: QuestionListParams) {
  return useQuery({
    queryKey: questionKeys.list(params),
    queryFn: () => questionsApi.list(params),
  })
}

function invalidateQuestions() {
  void queryClient.invalidateQueries({ queryKey: questionKeys.all })
  // Mutaxassislik ro'yxati savollar sonini ko'rsatadi.
  void queryClient.invalidateQueries({ queryKey: specialtyKeys.all })
}

export function useCreateQuestion() {
  return useMutation({
    mutationFn: (body: QuestionPayload) => questionsApi.create(body),
    onSuccess: () => {
      invalidateQuestions()
      toast.success("Savol qo'shildi")
    },
    onError: (error: ApiError) => toast.error(error.message),
  })
}

export function useUpdateQuestion() {
  return useMutation({
    mutationFn: ({ id, ...body }: QuestionPayload & { id: number }) =>
      questionsApi.update(id, body),
    onSuccess: () => {
      invalidateQuestions()
      toast.success('Savol yangilandi')
    },
    onError: (error: ApiError) => toast.error(error.message),
  })
}

export function useDeleteQuestion() {
  return useMutation({
    mutationFn: (id: number) => questionsApi.remove(id),
    onSuccess: () => {
      invalidateQuestions()
      toast.success("Savol o'chirildi")
    },
    onError: (error: ApiError) => toast.error(error.message),
  })
}
