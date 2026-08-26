import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

import type { ApiError } from '@/shared/api'
import { queryClient } from '@/shared/lib/query-client'
import { authKeys } from '@/features/auth'
import type { DoctorProfilePayload } from '../model/schemas'
import { doctorsApi } from './doctors-api'

export const doctorKeys = {
  all: ['doctors'] as const,
  me: ['doctors', 'me'] as const,
  overview: ['doctors', 'overview'] as const,
  publicProfile: (doctorId: number) =>
    ['doctors', 'public', doctorId] as const,
}

export function useDoctorOverview() {
  return useQuery({
    queryKey: doctorKeys.overview,
    queryFn: () => doctorsApi.overview(),
  })
}

export function useDoctorPublicProfile(doctorId: number) {
  return useQuery({
    queryKey: doctorKeys.publicProfile(doctorId),
    queryFn: () => doctorsApi.publicProfile(doctorId),
    enabled: Number.isFinite(doctorId) && doctorId > 0,
  })
}

export function useDoctorProfile() {
  return useQuery({
    queryKey: doctorKeys.me,
    queryFn: () => doctorsApi.me(),
  })
}

export function useUpdateDoctorProfile() {
  return useMutation({
    mutationFn: (values: DoctorProfilePayload) => doctorsApi.updateMe(values),
    onSuccess: () => {
      // Ism `User` yozuvida ham o'zgaradi — sessiya keshi eskirmasligi kerak.
      queryClient.invalidateQueries({ queryKey: doctorKeys.all })
      queryClient.invalidateQueries({ queryKey: authKeys.me })
      toast.success('Profil yangilandi')
    },
    onError: (error: ApiError) => toast.error(error.message),
  })
}
