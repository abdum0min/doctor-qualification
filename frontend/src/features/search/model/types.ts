import type { QualificationLevel } from '@/features/attempts'
import type { CertificateStatus } from '@/features/certificates'

export interface SearchSpecialty {
  id: number
  name: string
}

export interface SearchExam {
  id: number
  title: string
  questionCount: number
  isActive: boolean
  specialty: SearchSpecialty
}

export interface SearchDoctor {
  id: number
  fullname: string
  specialtyName: string | null
  workplace: string | null
}

export interface SearchCertificate {
  certificateId: string
  doctorFullname: string
  examTitle: string
  qualification: QualificationLevel
  status: CertificateStatus
}

export interface SearchResult {
  exams: SearchExam[]
  specialties: SearchSpecialty[]
  doctors: SearchDoctor[]
  certificates: SearchCertificate[]
}
