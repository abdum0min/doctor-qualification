import { api, ENDPOINTS, http, type PaginationParams } from '@/shared/api'
import type {
  AdminCertificateParams,
  Certificate,
  CertificateVerification,
} from '../model/types'

export const certificatesApi = {
  list: (params: PaginationParams) =>
    http.list<Certificate>(ENDPOINTS.certificates.root, params),
  all: (params: AdminCertificateParams) =>
    http.list<Certificate>(ENDPOINTS.certificates.all, params),
  revoke: (certificateId: string, reason: string) =>
    http.patch<Certificate>(ENDPOINTS.certificates.revoke(certificateId), { reason }),
  verify: (certificateId: string) =>
    http.get<CertificateVerification>(ENDPOINTS.certificates.verify(certificateId)),
  download: async (certificateId: string): Promise<Blob> => {
    const response = await api.get<Blob>(
      ENDPOINTS.certificates.download(certificateId),
      { responseType: 'blob' },
    )

    return response.data
  },
}
