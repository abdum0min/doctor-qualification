import type { QualificationLevel } from '@/features/attempts'
import type { PaginationParams } from '@/shared/api'

export type CertificateStatus = 'ACTIVE' | 'REVOKED'

export type VerificationStatus = 'VALID' | 'EXPIRED' | 'REVOKED' | 'NOT_FOUND'

export interface Certificate {
  id: number
  certificateId: string
  attemptId: number
  doctorFullname: string
  specialtyName: string
  examTitle: string
  score: number
  qualification: QualificationLevel
  status: CertificateStatus
  issuedAt: string
  expiresAt: string
  revokedAt: string | null
  revokedReason: string | null
}

export interface PublicCertificate {
  certificateId: string
  doctorFullname: string
  specialtyName: string
  examTitle: string
  score: number
  qualification: QualificationLevel
  issuedAt: string
  expiresAt: string
  revokedAt: string | null
}

export interface CertificateVerification {
  status: VerificationStatus
  certificate: PublicCertificate | null
}

export type AdminCertificateParams = PaginationParams & {
  status?: CertificateStatus
}
