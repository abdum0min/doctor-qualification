import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

import type { ApiError } from '@/shared/api'
import { queryClient } from '@/shared/lib/query-client'
import type { ExamPayload } from '../model/schemas'
import { examsApi } from './exams-api'

export const examKeys = {
  all: ['exams'] as const,
  active: (specialtyId?: number) => [...examKeys.all, 'active', specialtyId ?? 0] as const,
  admin: (specialtyId?: number) => [...examKeys.all, 'admin', specialtyId ?? 0] as const,
  detail: (id: number) => [...examKeys.all, 'detail', id] as const,
}

export function useActiveExams(specialtyId?: number) {
  return useQuery({
    queryKey: examKeys.active(specialtyId),
    queryFn: () => examsApi.active(specialtyId ? { specialtyId } : undefined),
  })
}

export function useAdminExams(specialtyId?: number) {
  return useQuery({
    queryKey: examKeys.admin(specialtyId),
    queryFn: () => examsApi.all(specialtyId ? { specialtyId } : undefined),
  })
}

export function useExam(id: number) {
  return useQuery({
    queryKey: examKeys.detail(id),
    queryFn: () => examsApi.byId(id),
    enabled: Number.isFinite(id) && id > 0,
  })
}

function invalidateExams() {
  void queryClient.invalidateQueries({ queryKey: examKeys.all })
}

export function useCreateExam() {
  return useMutation({
    mutationFn: (body: ExamPayload) => examsApi.create(body),
    onSuccess: () => {
      invalidateExams()
      toast.success("Imtihon qo'shildi")
    },
    onError: (error: ApiError) => toast.error(error.message),
  })
}

export function useUpdateExam() {
  return useMutation({
    mutationFn: ({ id, ...body }: Partial<ExamPayload> & { id: number }) =>
      examsApi.update(id, body),
    onSuccess: () => {
      invalidateExams()
      toast.success('Imtihon yangilandi')
    },
    onError: (error: ApiError) => toast.error(error.message),
  })
}
