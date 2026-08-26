import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

import { rankingKeys } from '@/features/rankings'
import type { ApiError } from '@/shared/api'
import { queryClient } from '@/shared/lib/query-client'
import type { SettingsPayload } from '../model/types'
import { settingsApi } from './settings-api'

export const settingsKeys = {
  all: ['settings'] as const,
  examDefaults: () => [...settingsKeys.all, 'exam-defaults'] as const,
}

export function useSettings() {
  return useQuery({
    queryKey: settingsKeys.all,
    queryFn: () => settingsApi.find(),
  })
}

/** Yangi imtihon formasi shu qiymatlar bilan to'ldiriladi. */
export function useExamDefaults(enabled = true) {
  return useQuery({
    queryKey: settingsKeys.examDefaults(),
    queryFn: () => settingsApi.examDefaults(),
    enabled,
  })
}

export function useUpdateSettings() {
  return useMutation({
    mutationFn: (body: SettingsPayload) => settingsApi.update(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: settingsKeys.all })
      // Vaznlar o'zgarsa reyting ballari qayta hisoblanadi.
      void queryClient.invalidateQueries({ queryKey: rankingKeys.all })
      toast.success('Sozlamalar saqlandi')
    },
    onError: (error: ApiError) => toast.error(error.message),
  })
}
