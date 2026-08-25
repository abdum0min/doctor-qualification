export interface DoctorProfile {
  id: number
  userId: number
  fullname: string
  email: string
  phone: string | null
  workplace: string | null
  experienceYears: number | null
  createdAt: string
  updatedAt: string
}
