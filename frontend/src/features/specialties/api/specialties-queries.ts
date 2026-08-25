import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

import type { ApiError } from '@/shared/api'
import { queryClient } from '@/shared/lib/query-client'
import type { SpecialtyPayload } from '../model/schemas'
import { specialtiesApi } from './specialties-api'

export const specialtyKeys = {
  all: ['specialties'] as const,
  active: (search?: string) => [...specialtyKeys.all, 'active', search ?? ''] as const,
  admin: (search?: string) => [...specialtyKeys.all, 'admin', search ?? ''] as const,
}

export function useActiveSpecialties(search?: string) {
  return useQuery({
    queryKey: specialtyKeys.active(search),
    queryFn: () => specialtiesApi.active(search ? { search } : undefined),
  })
}

export function useAdminSpecialties(search?: string) {
  return useQuery({
    queryKey: specialtyKeys.admin(search),
    queryFn: () => specialtiesApi.all(search ? { search } : undefined),
  })
}

function invalidateSpecialties() {
  return queryClient.invalidateQueries({ queryKey: specialtyKeys.all })
}

export function useCreateSpecialty() {
  return useMutation({
    mutationFn: (body: SpecialtyPayload) => specialtiesApi.create(body),
    onSuccess: () => {
      void invalidateSpecialties()
      toast.success('Mutaxassislik qo`shildi')
    },
    onError: (error: ApiError) => toast.error(error.message),
  })
}

export function useUpdateSpecialty() {
  return useMutation({
    mutationFn: ({ id, ...body }: Partial<SpecialtyPayload> & { id: number }) =>
      specialtiesApi.update(id, body),
    onSuccess: () => {
      void invalidateSpecialties()
      toast.success('Mutaxassislik yangilandi')
    },
    onError: (error: ApiError) => toast.error(error.message),
  })
}
