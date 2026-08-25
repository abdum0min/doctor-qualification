import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

import type { ApiError, PaginationParams } from '@/shared/api'
import { certificatesApi } from './certificates-api'

export const certificateKeys = {
  all: ['certificates'] as const,
  list: (params: PaginationParams) => [...certificateKeys.all, 'list', params] as const,
  verify: (certificateId: string) =>
    [...certificateKeys.all, 'verify', certificateId] as const,
}

export function useCertificates(params: PaginationParams) {
  return useQuery({
    queryKey: certificateKeys.list(params),
    queryFn: () => certificatesApi.list(params),
  })
}

export function useVerifyCertificate(certificateId: string) {
  return useQuery({
    queryKey: certificateKeys.verify(certificateId),
    queryFn: () => certificatesApi.verify(certificateId),
    enabled: certificateId.length > 0,
    retry: false,
  })
}

/** PDF blob sifatida keladi — brauzerda vaqtinchalik havola orqali saqlanadi. */
export function useDownloadCertificate() {
  return useMutation({
    mutationFn: (certificateId: string) => certificatesApi.download(certificateId),
    onSuccess: (blob, certificateId) => {
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')

      link.href = url
      link.download = `${certificateId}.pdf`
      document.body.append(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    },
    onError: (error: ApiError) =>
      toast.error(error.message || "Sertifikatni yuklab bo'lmadi"),
  })
}
