import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

import type { ApiError } from '@/shared/api'
import { queryClient } from '@/shared/lib/query-client'
import { statisticsKeys } from '@/features/statistics'
import { adminApi } from './admin-api'
import type { AdminAttemptParams, AdminDoctorParams } from '../model/types'

export const adminKeys = {
  all: ['admin'] as const,
  doctors: (params: AdminDoctorParams) => [...adminKeys.all, 'doctors', params] as const,
  doctor: (id: number) => [...adminKeys.all, 'doctor', id] as const,
  attempts: (params: AdminAttemptParams) =>
    [...adminKeys.all, 'attempts', params] as const,
}

export function useAdminDoctors(params: AdminDoctorParams) {
  return useQuery({
    queryKey: adminKeys.doctors(params),
    queryFn: () => adminApi.doctors(params),
  })
}

export function useAdminDoctor(id: number) {
  return useQuery({
    queryKey: adminKeys.doctor(id),
    queryFn: () => adminApi.doctorById(id),
    enabled: Number.isFinite(id) && id > 0,
  })
}

export function useAdminAttempts(params: AdminAttemptParams) {
  return useQuery({
    queryKey: adminKeys.attempts(params),
    queryFn: () => adminApi.attempts(params),
  })
}

export function useUpdateDoctorStatus() {
  return useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      adminApi.updateDoctorStatus(id, isActive),
    onSuccess: (doctor) => {
      void queryClient.invalidateQueries({ queryKey: adminKeys.all })
      void queryClient.invalidateQueries({ queryKey: statisticsKeys.all })
      toast.success(doctor.isActive ? 'Hisob faollashtirildi' : 'Hisob bloklandi')
    },
    onError: (error: ApiError) => toast.error(error.message),
  })
}
