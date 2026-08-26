import type { QualificationLevel } from '@/features/attempts'
import type { CertificateStatus } from '@/features/certificates'

export interface DoctorSpecialty {
  id: number
  name: string
}

export interface DoctorProfile {
  id: number
  userId: number
  fullname: string
  email: string
  avatarUrl: string | null
  specialty: DoctorSpecialty | null
  phone: string | null
  workplace: string | null
  experienceYears: number | null
  createdAt: string
  updatedAt: string
}

export interface DoctorLatestAttempt {
  id: number
  examTitle: string
  specialtyName: string
  score: number
  qualification: QualificationLevel
  passed: boolean
  completedAt: string | null
}

export interface DoctorCertificateSummary {
  certificateId: string
  status: CertificateStatus
  issuedAt: string
  expiresAt: string
}

export interface DoctorStats {
  totalAttempts: number
  completedAttempts: number
  passedAttempts: number
  bestScore: number | null
  averageScore: number | null
  currentQualification: QualificationLevel | null
  latestAttempt: DoctorLatestAttempt | null
  certificatesCount: number
  latestCertificate: DoctorCertificateSummary | null
}

export interface DoctorOverview {
  profile: DoctorProfile
  stats: DoctorStats
}

export interface PublicCertificate {
  certificateId: string
  examTitle: string
  qualification: QualificationLevel
  score: number
  status: CertificateStatus
  issuedAt: string
  expiresAt: string
}

export interface DoctorPublicProfile {
  id: number
  fullname: string
  avatarUrl: string | null
  specialty: { id: number; name: string } | null
  workplace: string | null
  experienceYears: number | null
  joinedAt: string
  completedAttempts: number
  passedAttempts: number
  averageScore: number | null
  bestScore: number | null
  currentQualification: QualificationLevel | null
  ranking: {
    position: number | null
    totalDoctors: number
    score: number | null
  }
  certificates: PublicCertificate[]
}
