import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

import { authKeys } from '@/features/auth'
import { doctorKeys } from '@/features/doctors'
import type { ApiError } from '@/shared/api'
import { queryClient } from '@/shared/lib/query-client'
import { uploadsApi } from './uploads-api'

/** Rasm sarlavhada, profilda va ommaviy profilda ko'rinadi. */
function invalidateProfiles() {
  void queryClient.invalidateQueries({ queryKey: authKeys.me })
  void queryClient.invalidateQueries({ queryKey: doctorKeys.all })
}

export function useUploadAvatar() {
  return useMutation({
    mutationFn: (file: File) => uploadsApi.uploadAvatar(file),
    onSuccess: () => {
      invalidateProfiles()
      toast.success('Rasm yangilandi')
    },
    onError: (error: ApiError) => toast.error(error.message),
  })
}

export function useRemoveAvatar() {
  return useMutation({
    mutationFn: () => uploadsApi.removeAvatar(),
    onSuccess: () => {
      invalidateProfiles()
      toast.success("Rasm o'chirildi")
    },
    onError: (error: ApiError) => toast.error(error.message),
  })
}
