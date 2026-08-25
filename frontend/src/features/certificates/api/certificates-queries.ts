import { useMutation, useQuery } from '@tanstack/react-query'

import type { ApiError, PaginationParams } from '@/shared/api'
import { queryClient } from '@/shared/lib/query-client'
import { toast } from 'sonner'
import type { AdminCertificateParams } from '../model/types'
import { certificatesApi } from './certificates-api'

export const certificateKeys = {
  all: ['certificates'] as const,
  list: (params: PaginationParams) => [...certificateKeys.all, 'list', params] as const,
  admin: (params: AdminCertificateParams) =>
    [...certificateKeys.all, 'admin', params] as const,
  verify: (certificateId: string) =>
    [...certificateKeys.all, 'verify', certificateId] as const,
}

export function useCertificates(params: PaginationParams) {
  return useQuery({
    queryKey: certificateKeys.list(params),
    queryFn: () => certificatesApi.list(params),
  })
}

export function useAdminCertificates(params: AdminCertificateParams) {
  return useQuery({
    queryKey: certificateKeys.admin(params),
    queryFn: () => certificatesApi.all(params),
  })
}

export function useRevokeCertificate() {
  return useMutation({
    mutationFn: ({ certificateId, reason }: { certificateId: string; reason: string }) =>
      certificatesApi.revoke(certificateId, reason),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: certificateKeys.all })
      toast.success('Sertifikat bekor qilindi')
    },
    onError: (error: ApiError) => toast.error(error.message),
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
