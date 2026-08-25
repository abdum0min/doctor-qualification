import type { AttemptStatus, QualificationLevel } from '@/features/attempts'
import type { CertificateStatus } from '@/features/certificates'
import type { PaginationParams } from '@/shared/api'

export type DoctorAccountStatus = 'active' | 'blocked'

export interface AdminDoctor {
  id: number
  userId: number
  fullname: string
  email: string
  isActive: boolean
  specialtyName: string | null
  attemptsCount: number
  certificatesCount: number
  bestScore: number | null
  createdAt: string
}

export interface AdminDoctorDetail extends AdminDoctor {
  phone: string | null
  workplace: string | null
  experienceYears: number | null
  attempts: {
    id: number
    examTitle: string
    status: AttemptStatus
    score: number | null
    qualification: QualificationLevel | null
    passed: boolean | null
    startedAt: string
    completedAt: string | null
  }[]
  certificates: {
    certificateId: string
    status: CertificateStatus
    score: number
    qualification: QualificationLevel
    issuedAt: string
    expiresAt: string
  }[]
}

export interface AdminAttempt {
  id: number
  doctorId: number
  doctorFullname: string
  examTitle: string
  specialtyName: string
  status: AttemptStatus
  questionCount: number
  correctCount: number | null
  score: number | null
  qualification: QualificationLevel | null
  passed: boolean | null
  startedAt: string
  completedAt: string | null
  certificateId: string | null
}

export type AdminDoctorParams = PaginationParams & {
  specialtyId?: number
  status?: DoctorAccountStatus
}

export type AdminAttemptParams = PaginationParams & {
  status?: AttemptStatus
  examId?: number
  doctorId?: number
  specialtyId?: number
}
