import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

import type { ApiError } from '@/shared/api'
import { queryClient } from '@/shared/lib/query-client'
import type { ExamPayload } from '../model/schemas'
import { examsApi, type ExamListParams } from './exams-api'

export const examKeys = {
  all: ['exams'] as const,
  active: (specialtyId?: number) => [...examKeys.all, 'active', specialtyId ?? 0] as const,
  admin: (params: ExamListParams) => [...examKeys.all, 'admin', params] as const,
  detail: (id: number) => [...examKeys.all, 'detail', id] as const,
  adminDetail: (id: number) => [...examKeys.all, 'admin', 'detail', id] as const,
}

export function useActiveExams(specialtyId?: number) {
  return useQuery({
    queryKey: examKeys.active(specialtyId),
    queryFn: () => examsApi.active(specialtyId ? { specialtyId } : undefined),
  })
}

export function useAdminExams(params: ExamListParams = {}) {
  return useQuery({
    queryKey: examKeys.admin(params),
    queryFn: () => examsApi.all(params),
  })
}

export function useAdminExam(id: number) {
  return useQuery({
    queryKey: examKeys.adminDetail(id),
    queryFn: async () => {
      const exams = await examsApi.all()
      return exams.find((exam) => exam.id === id) ?? null
    },
    enabled: Number.isFinite(id) && id > 0,
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
