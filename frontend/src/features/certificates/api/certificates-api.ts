import { api, ENDPOINTS, http, type PaginationParams } from '@/shared/api'
import type { Certificate, CertificateVerification } from '../model/types'

export const certificatesApi = {
  list: (params: PaginationParams) =>
    http.list<Certificate>(ENDPOINTS.certificates.root, params),
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
