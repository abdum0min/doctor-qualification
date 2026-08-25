export interface PlatformOverview {
  totalDoctors: number
  activeDoctors: number
  doctorsWithAttempts: number
  totalAttempts: number
  completedAttempts: number
  passedAttempts: number
  failedAttempts: number
  certificatesIssued: number
  activeCertificates: number
  revokedCertificates: number
  averageScore: number | null
  highestScore: number | null
}

export interface SpecialtyStatistics {
  specialtyId: number
  name: string
  doctorsCount: number
  questionsCount: number
  examsCount: number
  attemptsCount: number
  passedCount: number
  averageScore: number | null
}

export interface PublicStatistics {
  totalDoctors: number
  completedAttempts: number
  certificatesIssued: number
  averageScore: number | null
  topSpecialties: { name: string; doctorsCount: number }[]
}
